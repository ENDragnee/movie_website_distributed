package repository

import (
	"context"

	"github.com/draculastream/comment-service/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// CommentRepository defines persistence operations for comments.
type CommentRepository interface {
	Save(ctx context.Context, comment *model.Comment) error
	ByVideo(ctx context.Context, videoID string) ([]model.Comment, error)
	RepliesFor(ctx context.Context, parentID primitive.ObjectID) ([]model.Comment, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*model.Comment, error)
}

type mongoRepository struct {
	collection *mongo.Collection
}

// NewMongoRepository returns a repository backed by the provided collection.
func NewMongoRepository(collection *mongo.Collection) CommentRepository {
	return &mongoRepository{collection: collection}
}

func (r *mongoRepository) Save(ctx context.Context, comment *model.Comment) error {
	res, err := r.collection.InsertOne(ctx, comment)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		comment.ID = oid
	}
	return nil
}

func (r *mongoRepository) ByVideo(ctx context.Context, videoID string) ([]model.Comment, error) {
	filter := bson.M{"videoId": videoID, "parentId": nil}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []model.Comment
	for cursor.Next(ctx) {
		var entry model.Comment
		if err := cursor.Decode(&entry); err != nil {
			return nil, err
		}
		results = append(results, entry)
	}
	return results, cursor.Err()
}

func (r *mongoRepository) RepliesFor(ctx context.Context, parentID primitive.ObjectID) ([]model.Comment, error) {
	filter := bson.M{"parentId": parentID}
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []model.Comment
	for cursor.Next(ctx) {
		var entry model.Comment
		if err := cursor.Decode(&entry); err != nil {
			return nil, err
		}
		results = append(results, entry)
	}
	return results, cursor.Err()
}

func (r *mongoRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*model.Comment, error) {
	var comment model.Comment
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&comment)
	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &comment, nil
}
