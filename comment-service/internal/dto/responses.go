package dto

import (
	"time"

	"github.com/draculastream/comment-service/internal/model"
)

// CommentPayload is the JSON representation of a comment.
type CommentPayload struct {
	ID        string    `json:"id"`
	VideoID   string    `json:"videoId"`
	ParentID  *string   `json:"parentId,omitempty"`
	AuthorID  string    `json:"authorId"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// CommentEventTransport is used for Kafka and SSE payloads.
type CommentEventTransport struct {
	EventID string         `json:"eventId"`
	Type    string         `json:"type"`
	Payload CommentPayload `json:"payload"`
}

// NewCommentPayload converts a domain comment into its payload form.
func NewCommentPayload(c *model.Comment) CommentPayload {
	var parentID *string
	if c.ParentID != nil {
		parent := c.ParentID.Hex()
		parentID = &parent
	}
	return CommentPayload{
		ID:        c.ID.Hex(),
		VideoID:   c.VideoID,
		ParentID:  parentID,
		AuthorID:  c.AuthorID,
		Content:   c.Content,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}
