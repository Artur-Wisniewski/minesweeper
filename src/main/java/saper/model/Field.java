package saper.model;

public class Field {
    public enum FieldType {
        BOMB, EMPTY;
    }
    private int x;
    private int y;
    private FieldType type;

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public FieldType getType() {
        return type;
    }

    public void setType(FieldType type) {
        this.type = type;
    }
}
