package saper.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import xml.XmlConfigurationParser;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  XmlConfigurationParser xmlConfig = new XmlConfigurationParser("src/main/resources/webSocketConfiguration.xml");

  public WebSocketConfig() throws Exception {

  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint(xmlConfig.getStompEndPointPath()).withSockJS();

  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.setApplicationDestinationPrefixes( xmlConfig.getMessageBrokerApplicationDestinationPrefix());
    registry.enableSimpleBroker(xmlConfig.getSimpleBrokerPrefixs().get(0), xmlConfig.getSimpleBrokerPrefixs().get(1));
  }
}
