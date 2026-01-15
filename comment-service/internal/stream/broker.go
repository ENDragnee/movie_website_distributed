package stream

import "sync"

// Event represents a single SSE payload.
type Event[T any] struct {
	Type    string `json:"type"`
	Payload T      `json:"payload"`
}

// Broker maintains subscribers grouped by video ID.
type Broker[T any] struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan Event[T]]struct{}
}

// NewBroker creates a broker instance.
func NewBroker[T any]() *Broker[T] {
	return &Broker[T]{
		subscribers: make(map[string]map[chan Event[T]]struct{}),
	}
}

// Subscribe returns a channel that receives events for the given video and an unsubscribe hook.
func (b *Broker[T]) Subscribe(videoID string) (chan Event[T], func()) {
	ch := make(chan Event[T], 16)
	b.mu.Lock()
	if _, ok := b.subscribers[videoID]; !ok {
		b.subscribers[videoID] = make(map[chan Event[T]]struct{})
	}
	b.subscribers[videoID][ch] = struct{}{}
	b.mu.Unlock()

	return ch, func() {
		b.mu.Lock()
		delete(b.subscribers[videoID], ch)
		if len(b.subscribers[videoID]) == 0 {
			delete(b.subscribers, videoID)
		}
		b.mu.Unlock()
		close(ch)
	}
}

// Publish fans out the event to every subscriber listening for the video.
func (b *Broker[T]) Publish(videoID string, event Event[T]) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	for subscriber := range b.subscribers[videoID] {
		select {
		case subscriber <- event:
		default:
		}
	}
}
