package saper.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import saper.model.Board;
import saper.model.ChatMessage;
import saper.model.GameState;
import saper.model.RoleMessage;

import java.util.HashMap;

import static java.lang.String.format;

@Controller
public class GameController {

    HashMap<String, GameState> GamesState = new HashMap<String, GameState>();
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;


    @MessageMapping("/game/{roomId}/sendRole")
    public void sendRole(@DestinationVariable String roomId, @Payload RoleMessage roleMessage) {

        System.out.println(GamesState);
        GameState gameState = GamesState.get(roomId);

        if(roleMessage.getRole().equals(RoleMessage.Role.BOMBER) && gameState.getBomber().isEmpty()){
            gameState.setBomber(roleMessage.getSender());
        }else if(roleMessage.getRole().equals(RoleMessage.Role.SAPER) && gameState.getSaper().isEmpty()){
            gameState.setSaper(roleMessage.getSender());
        }

        if(!gameState.getSaper().isEmpty() && !gameState.getBomber().isEmpty()){
            gameState.setState(GameState.State.DEPLOYING);
        }
        messagingTemplate.convertAndSend(format("/game/%s", roomId), gameState);
    }
    @MessageMapping("/game/{roomId}/joinToTheGame")
    public void joinToTheGame(@DestinationVariable String roomId, @Payload RoleMessage roleMessage) {
        if(!GamesState.containsKey(roomId)){
            GamesState.put(roomId, new GameState());
            GameState gameState = GamesState.get(roomId);
            gameState.setState(GameState.State.WAITING_FOR_PLAYERS);
            System.out.println(GamesState.get(roomId).getBomber());
        }
        GameState gameState = GamesState.get(roomId);
        messagingTemplate.convertAndSend(format("/game/%s", roomId), gameState);
    }
    @MessageMapping("/game/{roomId}/sendBoard")
    public void sendBoard(@DestinationVariable String roomId, @Payload Board board) {

        GameState gameState = GamesState.get(roomId);

        gameState.setBoard(board);
        gameState.setState(GameState.State.DEFUSING);
        messagingTemplate.convertAndSend(format("/game/%s", roomId), gameState);
    }

}
