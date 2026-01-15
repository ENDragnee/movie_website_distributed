package kafka

import (
	"context"

	"github.com/IBM/sarama"
)

type Publisher interface {
	Publish(ctx context.Context, topic, key string, value []byte) error
	Close() error
}

type publisher struct {
	producer sarama.SyncProducer
}

// NewPublisher returns a Kafka sync producer configured for idempotent delivery.
func NewPublisher(brokers []string) (Publisher, error) {
	cfg := sarama.NewConfig()
	cfg.Producer.RequiredAcks = sarama.WaitForAll
	cfg.Producer.Retry.Max = 5
	cfg.Producer.Idempotent = true
	cfg.Net.MaxOpenRequests = 1
	cfg.Producer.Return.Successes = true
	cfg.ClientID = "comment-service"

	writer, err := sarama.NewSyncProducer(brokers, cfg)
	if err != nil {
		return nil, err
	}
	return &publisher{producer: writer}, nil
}

func (p *publisher) Publish(ctx context.Context, topic, key string, value []byte) error {
	msg := &sarama.ProducerMessage{
		Topic: topic,
		Key:   sarama.StringEncoder(key),
		Value: sarama.ByteEncoder(value),
	}
	_, _, err := p.producer.SendMessage(msg)
	return err
}

func (p *publisher) Close() error {
	return p.producer.Close()
}
