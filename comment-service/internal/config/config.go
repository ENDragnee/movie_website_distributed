package config

import (
	"errors"
	"os"
	"strings"
)

const defaultPort = "8080"

// Config holds environment-driven settings for the comment service.
type Config struct {
	Port                     string
	MongoURI                 string
	MongoDatabase            string
	MongoCollection          string
	KafkaBrokers             []string
	KafkaTopicCommentCreated string
	KafkaTopicCommentReplied string
}

// Load validates environment variables and builds the runtime configuration.
func Load() (*Config, error) {
	get := func(key, fallback string) string {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value
		}
		return fallback
	}

	brokers := parseCSV(get("KAFKA_BROKERS", "kafka:9092"))
	cfg := &Config{
		Port:                     get("SERVICE_PORT", defaultPort),
		MongoURI:                 os.Getenv("MONGO_URI"),
		MongoDatabase:            get("MONGO_DB", "dracula_comments"),
		MongoCollection:          get("MONGO_COLLECTION", "comments"),
		KafkaBrokers:             brokers,
		KafkaTopicCommentCreated: get("KAFKA_TOPIC_COMMENT_CREATED", "comments.created"),
		KafkaTopicCommentReplied: get("KAFKA_TOPIC_COMMENT_REPLIED", "comments.replied"),
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) validate() error {
	switch {
	case c.MongoURI == "":
		return errors.New("MONGO_URI is required")
	case len(c.KafkaBrokers) == 0:
		return errors.New("KAFKA_BROKERS is required")
	case c.KafkaTopicCommentCreated == "":
		return errors.New("KAFKA_TOPIC_COMMENT_CREATED is required")
	case c.KafkaTopicCommentReplied == "":
		return errors.New("KAFKA_TOPIC_COMMENT_REPLIED is required")
	}
	return nil
}

func parseCSV(value string) []string {
	if value == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
