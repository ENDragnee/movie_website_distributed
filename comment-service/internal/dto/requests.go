package dto

// CreateCommentRequest is the payload for creating top-level comments.
type CreateCommentRequest struct {
	VideoID  string `json:"videoId"`
	AuthorID string `json:"authorId"`
	Content  string `json:"content"`
}

// CreateReplyRequest is the payload for replying to an existing comment.
type CreateReplyRequest struct {
	AuthorID string `json:"authorId"`
	Content  string `json:"content"`
}
