package com.techtack.blue.messaging;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.FixedBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

@Configuration
public class RabbitMQConfiguration {

    // Queue names as constants
    public static final String ORDER_NOTIFICATIONS_QUEUE = "order.notifications";
    public static final String MARKET_DATA_QUEUE = "market.data";
    public static final String USER_ALERTS_QUEUE = "user.alerts";
    public static final String TRADING_EVENTS_QUEUE = "trading.events";
    
    // Legacy queue for backward compatibility
    public static final String LEGACY_QUEUE = "Queue";

    // Order notification queue
    @Bean
    public Queue orderNotificationsQueue() {
        return QueueBuilder.durable(ORDER_NOTIFICATIONS_QUEUE)
                .withArgument("x-message-ttl", 86400000) // 24 hours TTL
                .build();
    }

    // Market data queue
    @Bean
    public Queue marketDataQueue() {
        return QueueBuilder.durable(MARKET_DATA_QUEUE)
                .withArgument("x-message-ttl", 3600000) // 1 hour TTL
                .build();
    }

    // User alerts queue
    @Bean
    public Queue userAlertsQueue() {
        return QueueBuilder.durable(USER_ALERTS_QUEUE)
                .withArgument("x-message-ttl", 604800000) // 7 days TTL
                .build();
    }

    // Trading events queue
    @Bean
    public Queue tradingEventsQueue() {
        return QueueBuilder.durable(TRADING_EVENTS_QUEUE)
                .withArgument("x-message-ttl", 86400000) // 24 hours TTL
                .build();
    }

    // Legacy queue for backward compatibility
    @Bean
    public Queue legacyQueue() {
        return new Queue(LEGACY_QUEUE);
    }

    // Dead letter queue for failed messages
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable("trading.dlq")
                .build();
    }

    // Exchange for trading messages
    @Bean
    public TopicExchange tradingExchange() {
        return new TopicExchange("trading.exchange");
    }

    // Bindings
    @Bean
    public Binding orderNotificationsBinding() {
        return BindingBuilder.bind(orderNotificationsQueue())
                .to(tradingExchange())
                .with("order.*");
    }

    @Bean
    public Binding marketDataBinding() {
        return BindingBuilder.bind(marketDataQueue())
                .to(tradingExchange())
                .with("market.*");
    }

    @Bean
    public Binding userAlertsBinding() {
        return BindingBuilder.bind(userAlertsQueue())
                .to(tradingExchange())
                .with("user.*");
    }

    @Bean
    public Binding tradingEventsBinding() {
        return BindingBuilder.bind(tradingEventsQueue())
                .to(tradingExchange())
                .with("trading.*");
    }
 
    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setCreateMessageIds(true);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        rabbitTemplate.setExchange("trading.exchange");
        rabbitTemplate.setMandatory(true);
        
        // Add retry mechanism
        rabbitTemplate.setRetryTemplate(retryTemplate());
        
        return rabbitTemplate;
    }

    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();
        
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(2000); // 2 seconds
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        return retryTemplate;
    }

    // Connection factory configuration for better performance
    @Bean
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        factory.setConcurrentConsumers(3);
        factory.setMaxConcurrentConsumers(10);
        factory.setPrefetchCount(5);
        return factory;
    }
}
