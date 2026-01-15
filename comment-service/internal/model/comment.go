package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Comment represents either a top-level comment or a reply.
type Comment struct {
	ID        primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	VideoID   string              `bson:"videoId" json:"videoId"`
	ParentID  *primitive.ObjectID `bson:"parentId,omitempty" json:"parentId,omitempty"`
	AuthorID  string              `bson:"authorId" json:"authorId"`
	Content   string              `bson:"content" json:"content"`
	CreatedAt time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time           `bson:"updatedAt" json:"updatedAt"`
}

// NewComment builds a comment record with a creation timestamp.
func NewComment(videoID string, parentID *primitive.ObjectID, authorID, content string) *Comment {
	now := time.Now().UTC()
	return &Comment{
		VideoID:   videoID,
		ParentID:  parentID,
		AuthorID:  authorID,
		Content:   content,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
