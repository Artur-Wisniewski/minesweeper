package saper.model;

public class RoleMessage {
    public enum Role {
        OBSERVER, BOMBER, SAPER;
    }
    private Role role;
    private String sender;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }
}
