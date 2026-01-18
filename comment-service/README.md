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
| `KAFKA_BROKERS` | Comma-separated list of Kafka bootstrap servers | defaults to `kafka:9092` (matches docker-compose) |
| `KAFKA_TOPIC_COMMENT_CREATED` | Topic for new comments | defaults to `comments.created` |
| `KAFKA_TOPIC_COMMENT_REPLIED` | Topic for replies | defaults to `comments.replied` |

## API Usage

### POST /comments
- **Description:** Creates a top-level comment. Requires `videoId`, `authorId`, and `content`. Returns `201 Created` with the stored comment.
- **Request:**
  ```json
  {
    "videoId": "video-123",
    "authorId": "user-abc",
    "content": "Loved the scene!"
  }
  ```
- **Response:**
  ```json
  {
    "id": "696d30cc92b21a0a350acc6b",
    "videoId": "video-123",
    "authorId": "user-abc",
    "content": "Loved the scene!",
    "createdAt": "2026-01-18T19:13:16.910Z",
    "updatedAt": "2026-01-18T19:13:16.910Z"
  }
  ```

### POST /comments/{commentId}/replies
- **Description:** Appends a reply to an existing top-level comment. The path parameter must be a valid ObjectID of a comment whose `parentId` is `null`.
- **Request:**
  ```json
  {
    "authorId": "user-reply",
    "content": "Reply to first comment"
  }
  ```
- **Response:**
  ```json
  {
    "id": "696d315892b21a0a350acc6c",
    "videoId": "video-123",
    "parentId": "696d30cc92b21a0a350acc6b",
    "authorId": "user-reply",
    "content": "Reply to first comment",
    "createdAt": "2026-01-18T19:15:36.495Z",
    "updatedAt": "2026-01-18T19:15:36.495Z"
  }
  ```

### GET /videos/{videoId}/comments
- **Description:** Lists all top-level comments for a video, sorted by creation time (oldest first).
- **Response:**
  ```json
  [
    {
      "id": "696d2f9592b21a0a350acc6a",
      "videoId": "video-test-1",
      "authorId": "user-test",
      "content": "First comment",
      "createdAt": "2026-01-18T19:08:05.254Z",
      "updatedAt": "2026-01-18T19:08:05.254Z"
    },
    {
      "id": "696d30cc92b21a0a350acc6b",
      "videoId": "video-test-1",
      "authorId": "user-test",
      "content": "First comment",
      "createdAt": "2026-01-18T19:13:16.91Z",
      "updatedAt": "2026-01-18T19:13:16.91Z"
    }
  ]
  ```

### GET /comments/{commentId}/replies
- **Description:** Retrieves replies associated with a specific comment. Replies are stored with the parent comment’s ObjectID as `parentId`.
- **Response:**
  ```json
  [
    {
      "id": "696d315892b21a0a350acc6c",
      "videoId": "video-test-1",
      "parentId": "696d30cc92b21a0a350acc6b",
      "authorId": "user-reply",
      "content": "Reply to first comment",
      "createdAt": "2026-01-18T19:15:36.495Z",
      "updatedAt": "2026-01-18T19:15:36.495Z"
    }
  ]
  ```

### GET /comments/stream?videoId=...
- **Description:** Server-sent events (SSE) stream that emits every new comment/reply for a given video. Clients must specify `videoId` as a query parameter.
- **Event payload:** Each message is a `CommentEventTransport`:
  ```json
  {
    "eventId": "696d315892b21a0a350acc6c",
    "type": "reply",
    "payload": {
      "id": "696d315892b21a0a350acc6c",
      "videoId": "video-test-1",
      "parentId": "696d30cc92b21a0a350acc6b",
      "authorId": "user-reply",
      "content": "Reply to first comment",
      "createdAt": "2026-01-18T19:15:36.495Z",
      "updatedAt": "2026-01-18T19:15:36.495Z"
    }
  }
  ```
- **Usage:** `curl -N http://localhost:8080/comments/stream?videoId=video-123`. Heartbeat events are emitted every 30 seconds when no data flows.

### GET /health
- **Description:** Liveness probe. Responds with `{ "status": "healthy" }` when the server loop is running.

### GET /ready
- **Description:** Readiness probe. Responds with `{ "status": "ready" }` once dependencies (Mongo + Kafka) are connected.

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

## Docker Compose

From the `comment-service` directory you can bring up the full stack (Mongo, ZooKeeper, Kafka, and the comment service) with the built-in compose file:

```bash
docker compose up -d
```
