package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/draculastream/comment-service/internal/api"
	"github.com/draculastream/comment-service/internal/config"
	"github.com/draculastream/comment-service/internal/dto"
	"github.com/draculastream/comment-service/internal/kafka"
	"github.com/draculastream/comment-service/internal/repository"
	"github.com/draculastream/comment-service/internal/service"
	"github.com/draculastream/comment-service/internal/stream"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}
	if err := mongoClient.Ping(ctx, nil); err != nil {
		log.Fatalf("mongo ping failed: %v", err)
	}

	collection := mongoClient.Database(cfg.MongoDatabase).Collection(cfg.MongoCollection)

	publisher, err := kafka.NewPublisher(cfg.KafkaBrokers)
	if err != nil {
		log.Fatalf("failed to create kafka publisher: %v", err)
	}
	broker := stream.NewBroker[dto.CommentEventTransport]()
	svc := service.NewCommentService(repository.NewMongoRepository(collection), publisher, broker, cfg.KafkaTopicCommentCreated, cfg.KafkaTopicCommentReplied)
	handler := api.NewHandler(svc, broker)

	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	wrapped := loggingMiddleware(mux)
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: wrapped,
	}

	go func() {
		log.Printf("comment service listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown error: %v", err)
	}
	if err := mongoClient.Disconnect(shutdownCtx); err != nil {
		log.Printf("mongo disconnect error: %v", err)
	}
	if err := publisher.Close(); err != nil {
		log.Printf("kafka publisher close error: %v", err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}
