package saper.model;

public class GameState {
    public enum State {
        WAITING_FOR_PLAYERS, DEPLOYING, DEFUSING;
    }

    State state;
    Board board;
    String bomber = "";
    String saper =  "";
    int bombCounter = 0;
    public State getState() {
        return state;
    }

    public void setState(State state) {
        this.state = state;
    }

    public Board getBoard() {
        return board;
    }

    public void setBoard(Board board) {
        this.board = board;
    }

    public String getBomber() {
        return bomber;
    }

    public void setBomber(String bomber) {
        this.bomber = bomber;
    }

    public String getSaper() {
        return saper;
    }

    public void setSaper(String saper) {
        this.saper = saper;
    }
}
