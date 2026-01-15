package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/draculastream/comment-service/internal/dto"
	"github.com/draculastream/comment-service/internal/kafka"
	"github.com/draculastream/comment-service/internal/model"
	"github.com/draculastream/comment-service/internal/repository"
	"github.com/draculastream/comment-service/internal/stream"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	ErrInvalidPayload    = errors.New("authorId, videoId, and content are required")
	ErrParentNotFound    = errors.New("parent comment not found")
	ErrParentNotTopLevel = errors.New("replies can only target top-level comments")
)

// CommentService encapsulates comment operations.
type CommentService struct {
	repo         repository.CommentRepository
	publisher    kafka.Publisher
	broker       *stream.Broker[dto.CommentEventTransport]
	topicComment string
	topicReply   string
}

// NewCommentService wires dependencies.
func NewCommentService(repo repository.CommentRepository, publisher kafka.Publisher, broker *stream.Broker[dto.CommentEventTransport], commentTopic, replyTopic string) *CommentService {
	return &CommentService{
		repo:         repo,
		publisher:    publisher,
		broker:       broker,
		topicComment: commentTopic,
		topicReply:   replyTopic,
	}
}

// CreateComment persists a top-level comment and broadcasts the event.
func (s *CommentService) CreateComment(ctx context.Context, req dto.CreateCommentRequest) (*model.Comment, error) {
	if strings.TrimSpace(req.VideoID) == "" || strings.TrimSpace(req.AuthorID) == "" || strings.TrimSpace(req.Content) == "" {
		return nil, ErrInvalidPayload
	}
	comment := model.NewComment(req.VideoID, nil, strings.TrimSpace(req.AuthorID), strings.TrimSpace(req.Content))
	if err := s.repo.Save(ctx, comment); err != nil {
		return nil, err
	}
	event := s.buildEvent(comment, "comment")
	if err := s.publish(ctx, s.topicComment, event.Payload); err != nil {
		log.Printf("failed to publish comment event: %v", err)
	}
	s.broker.Publish(comment.VideoID, event)
	return comment, nil
}

// CreateReply persists a reply and validates the parent comment.
func (s *CommentService) CreateReply(ctx context.Context, parentID primitive.ObjectID, req dto.CreateReplyRequest) (*model.Comment, error) {
	if strings.TrimSpace(req.AuthorID) == "" || strings.TrimSpace(req.Content) == "" {
		return nil, ErrInvalidPayload
	}
	parent, err := s.repo.FindByID(ctx, parentID)
	if err != nil {
		return nil, err
	}
	if parent == nil {
		return nil, ErrParentNotFound
	}
	if parent.ParentID != nil {
		return nil, ErrParentNotTopLevel
	}
	reply := model.NewComment(parent.VideoID, &parent.ID, strings.TrimSpace(req.AuthorID), strings.TrimSpace(req.Content))
	if err := s.repo.Save(ctx, reply); err != nil {
		return nil, err
	}
	event := s.buildEvent(reply, "reply")
	if err := s.publish(ctx, s.topicReply, event.Payload); err != nil {
		log.Printf("failed to publish reply event: %v", err)
	}
	s.broker.Publish(parent.VideoID, event)
	return reply, nil
}

// ListTopLevel returns comments for a video.
func (s *CommentService) ListTopLevel(ctx context.Context, videoID string) ([]model.Comment, error) {
	return s.repo.ByVideo(ctx, videoID)
}

// ListReplies returns replies for the provided comment.
func (s *CommentService) ListReplies(ctx context.Context, parentID primitive.ObjectID) ([]model.Comment, error) {
	return s.repo.RepliesFor(ctx, parentID)
}

func (s *CommentService) buildEvent(c *model.Comment, eventType string) stream.Event[dto.CommentEventTransport] {
	return stream.Event[dto.CommentEventTransport]{
		Type: eventType,
		Payload: dto.CommentEventTransport{
			EventID: c.ID.Hex(),
			Type:    eventType,
			Payload: dto.NewCommentPayload(c),
		},
	}
}

func (s *CommentService) publish(ctx context.Context, topic string, event dto.CommentEventTransport) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return err
	}
	return s.publisher.Publish(ctx, topic, event.EventID, payload)
}
