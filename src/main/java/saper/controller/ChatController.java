package saper.controller;

import static java.lang.String.format;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import saper.model.ChatMessage;
import saper.model.GameState;
import saper.model.RestartMessage;

@Controller
public class ChatController {

  private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  @MessageMapping("/chat/{roomId}/sendMessage")
  public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage chatMessage) {
    messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
  }

  @MessageMapping("/chat/{roomId}/addUser")
  public void addUser(@DestinationVariable String roomId, @Payload ChatMessage chatMessage,
      SimpMessageHeaderAccessor headerAccessor) {



    String currentRoomId = (String) headerAccessor.getSessionAttributes().put("room_id", roomId);
    //gdyby bylo cos tutaj to znaczyloby ze uzytkownik byl juz w jakims pokoju a to musimy obsluzyc
    if (currentRoomId != null) {
      System.out.println("currnet Room = " + currentRoomId);
      ChatMessage leaveMessage = new ChatMessage();
      leaveMessage.setType(ChatMessage.MessageType.LEAVE);
      leaveMessage.setSender(chatMessage.getSender());
      messagingTemplate.convertAndSend(format("/channel/%s", currentRoomId), leaveMessage);


      //why it is here, because at start we used addUser not joinToTheGame
      String username = (String) headerAccessor.getSessionAttributes().get("username");
      if( GameController.GamesState.containsKey(currentRoomId)){
        GameState gameState =  GameController.GamesState.get(currentRoomId);
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
          GameController.GamesState.remove(currentRoomId);
          messagingTemplate.convertAndSend(format("/game/%s", currentRoomId), restartMessage);
        }
      }

    }

    headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
    messagingTemplate.convertAndSend(format("/channel/%s", roomId), chatMessage);
  }
}
