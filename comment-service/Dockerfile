FROM golang:1.22-alpine AS build

WORKDIR /workspace
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o /comment-service ./cmd/server

FROM gcr.io/distroless/static
COPY --from=build /comment-service /comment-service
EXPOSE 8080
ENTRYPOINT ["/comment-service"]
