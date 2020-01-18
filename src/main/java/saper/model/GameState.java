package saper.model;

public class GameState {
    public enum State {
        WAITING_FOR_PLAYERS,
        DEPLOYING,
        DEFUSING,
        LOST,WIN;
    }

    State state;
    Board board;
    Board visibleBoard;
    String bomber = "";
    String saper =  "";
    Integer flagCounter;

    public Integer getFlagCounter() {
        return flagCounter;
    }

    public void setFlagCounter(Integer flagCounter) {
        this.flagCounter = flagCounter;
    }

    public Board getVisibleBoard() {
        return visibleBoard;
    }

    public void setVisibleBoard(Board visibleBoard) {
        this.visibleBoard = visibleBoard;
    }

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
