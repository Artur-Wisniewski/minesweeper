package saper.controller;

import static java.lang.String.format;

import saper.model.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import saper.model.GameState;
import saper.model.RestartMessage;

@Component
public class WebSocketEventListener {

  private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;


  @EventListener
  public void handleWebSocketConnectListener(SessionConnectedEvent event) {
    
    logger.info("Received a new web socket connection.");
  }

  @EventListener
  public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

    String username = (String) headerAccessor.getSessionAttributes().get("username");
    String roomId = (String) headerAccessor.getSessionAttributes().get("room_id");
    if (username != null) {
      logger.info("User Disconnected: " + username);

      ChatMessage chatMessage = new ChatMessage();
      chatMessage.setType(ChatMessage.MessageType.LEAVE);
      chatMessage.setSender(username);

      messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
    }
     GameState gameState =  GameController.GamesState.get(roomId);
    RestartMessage restartMessage = new RestartMessage();
    restartMessage.setRestart(true);
    if(gameState.getState() == GameState.State.DEPLOYING &&
            gameState.getBomber().equals(username) ||
            ((gameState.getState() == GameState.State.DEFUSING ||
                    gameState.getState() == GameState.State.LOST ||
                    gameState.getState() == GameState.State.WIN)
                    && gameState.getSaper().equals(username)) ||
            ( gameState.getState() == GameState.State.WAITING_FOR_PLAYERS
                    && (gameState.getBomber().equals(username) || gameState.getSaper().equals(username)))){
      GameController.GamesState.remove(roomId);
      messagingTemplate.convertAndSend(format("/game/%s", roomId), restartMessage);
    }

  }
}
