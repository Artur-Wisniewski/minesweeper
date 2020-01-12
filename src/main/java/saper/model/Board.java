package saper.model;

public class Board {

    Field fields [];

    public Board(String roomName, Field[] fields) {

        this.fields = fields;
    }

    public Field[] getFields() {
        return fields;
    }

    public void setFields(Field[] fields) {
        this.fields = fields;
    }



}
