package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/draculastream/comment-service/internal/dto"
	"github.com/draculastream/comment-service/internal/service"
	"github.com/draculastream/comment-service/internal/stream"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Handler wires HTTP routes to the comment service.
type Handler struct {
	service *service.CommentService
	broker  *stream.Broker[dto.CommentEventTransport]
}

// NewHandler builds a handler with the provided service and broker.
func NewHandler(svc *service.CommentService, broker *stream.Broker[dto.CommentEventTransport]) *Handler {
	return &Handler{service: svc, broker: broker}
}

// RegisterRoutes attaches the endpoints to the provided mux.
func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/health", h.Health)
	mux.HandleFunc("/ready", h.Readiness)
	mux.HandleFunc("/comments/stream", h.Stream)
	mux.HandleFunc("/comments", h.commentsBase)
	mux.HandleFunc("/comments/", h.handleCommentSubRoutes)
	mux.HandleFunc("/videos/", h.handleVideoComments)
}

func (h *Handler) commentsBase(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/comments" {
		http.NotFound(w, r)
		return
	}
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	h.CreateComment(w, r)
}

func (h *Handler) handleCommentSubRoutes(w http.ResponseWriter, r *http.Request) {
	if !(r.Method == http.MethodPost || r.Method == http.MethodGet) {
		http.NotFound(w, r)
		return
	}
	trimmed := strings.TrimPrefix(r.URL.Path, "/comments/")
	if !strings.HasSuffix(trimmed, "/replies") {
		http.NotFound(w, r)
		return
	}
	commentID := strings.TrimSuffix(trimmed, "/replies")
	if commentID == "" {
		respondError(w, http.StatusBadRequest, "commentId is required")
		return
	}
	oid, err := primitive.ObjectIDFromHex(commentID)
	if err != nil {
		respondError(w, http.StatusBadRequest, "invalid comment id")
		return
	}
	if r.Method == http.MethodPost {
		h.createReply(w, r, oid)
		return
	}
	h.listReplies(w, r, oid)
}

func (h *Handler) handleVideoComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}
	trimmed := strings.TrimPrefix(r.URL.Path, "/videos/")
	if !strings.HasSuffix(trimmed, "/comments") {
		http.NotFound(w, r)
		return
	}
	videoID := strings.TrimSuffix(trimmed, "/comments")
	if videoID == "" {
		respondError(w, http.StatusBadRequest, "videoId is required")
		return
	}
	h.listComments(w, r, videoID)
}

func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {
	var payload dto.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	comment, err := h.service.CreateComment(r.Context(), payload)
	if err != nil {
		code := http.StatusInternalServerError
		if errors.Is(err, service.ErrInvalidPayload) {
			code = http.StatusBadRequest
		}
		respondError(w, code, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, dto.NewCommentPayload(comment))
}

func (h *Handler) createReply(w http.ResponseWriter, r *http.Request, oid primitive.ObjectID) {
	var payload dto.CreateReplyRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		respondError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	reply, err := h.service.CreateReply(r.Context(), oid, payload)
	if err != nil {
		code := http.StatusInternalServerError
		switch {
		case errors.Is(err, service.ErrInvalidPayload):
			code = http.StatusBadRequest
		case errors.Is(err, service.ErrParentNotFound):
			code = http.StatusNotFound
		case errors.Is(err, service.ErrParentNotTopLevel):
			code = http.StatusBadRequest
		}
		respondError(w, code, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, dto.NewCommentPayload(reply))
}

func (h *Handler) listComments(w http.ResponseWriter, r *http.Request, videoID string) {
	comments, err := h.service.ListTopLevel(r.Context(), videoID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	payload := make([]dto.CommentPayload, 0, len(comments))
	for i := range comments {
		payload = append(payload, dto.NewCommentPayload(&comments[i]))
	}
	respondJSON(w, http.StatusOK, payload)
}

func (h *Handler) listReplies(w http.ResponseWriter, r *http.Request, oid primitive.ObjectID) {
	replies, err := h.service.ListReplies(r.Context(), oid)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	payload := make([]dto.CommentPayload, 0, len(replies))
	for i := range replies {
		payload = append(payload, dto.NewCommentPayload(&replies[i]))
	}
	respondJSON(w, http.StatusOK, payload)
}

func (h *Handler) Stream(w http.ResponseWriter, r *http.Request) {
	videoID := r.URL.Query().Get("videoId")
	if videoID == "" {
		respondError(w, http.StatusBadRequest, "videoId query parameter is required")
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		respondError(w, http.StatusInternalServerError, "streaming unsupported")
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	events, unsubscribe := h.broker.Subscribe(videoID)
	defer unsubscribe()

	heartbeat := time.NewTicker(30 * time.Second)
	defer heartbeat.Stop()

	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			return
		case <-heartbeat.C:
			fmt.Fprintf(w, "event: heartbeat\ndata: {}\n\n")
			flusher.Flush()
		case event, ok := <-events:
			if !ok {
				return
			}
			data, err := json.Marshal(event)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "data: %s\n\n", data)
			flusher.Flush()
		}
	}
}

func (h *Handler) Health(w http.ResponseWriter, _ *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{"status": "healthy"})
}

func (h *Handler) Readiness(w http.ResponseWriter, _ *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func respondJSON(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, code int, message string) {
	respondJSON(w, code, map[string]string{"error": message})
}
