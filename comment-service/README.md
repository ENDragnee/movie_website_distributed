# Comment Service

Stateless Go microservice that powers video comments, replies, and live streams for the DraculaStream platform.

## Features

- REST endpoints to create comments/replies and read history scoped by video
- MongoDB-backed storage with parent-child constraints for a single reply level
- Kafka producer publishing `comments.created` and `comments.replied` events with the comment ID as the message key
- SSE stream for new comments and replies keyed by `videoId`
- Health and readiness probes for Kubernetes

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST /comments` | create top-level comment | |
| `POST /comments/{commentId}/replies` | reply to an existing top-level comment | |
| `GET /videos/{videoId}/comments` | list top-level comments for a video | |
| `GET /comments/{commentId}/replies` | list replies for a comment | |
| `GET /comments/stream?videoId=...` | SSE broadcast of new comments/replies for a video | |
| `GET /health` | liveness check | |
| `GET /ready` | readiness check | |

## Environment

| Variable | Description | Notes |
| --- | --- | --- |
| `SERVICE_PORT` | HTTP port | defaults to `8080` |
| `MONGO_URI` | MongoDB connection string | |
| `MONGO_DB` | Database name | defaults to `dracula_comments` |
| `MONGO_COLLECTION` | Comments collection name | defaults to `comments` |
| `KAFKA_BROKERS` | Comma-separated list of Kafka bootstrap servers | |
| `KAFKA_TOPIC_COMMENT_CREATED` | Topic for new comments | defaults to `comments.created` |
| `KAFKA_TOPIC_COMMENT_REPLIED` | Topic for replies | defaults to `comments.replied` |

## Development

```bash
cd comment-service
SERVICE_PORT=8080 MONGO_URI="mongodb://127.0.0.1:27017" \
  MONGO_DB=dracula_comments \
  MONGO_COLLECTION=comments \
  KAFKA_BROKERS="localhost:9092" \
  KAFKA_TOPIC_COMMENT_CREATED=comments.created \
  KAFKA_TOPIC_COMMENT_REPLIED=comments.replied \
  go run ./cmd/server
```
