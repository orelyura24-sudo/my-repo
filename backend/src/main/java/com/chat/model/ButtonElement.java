package com.chat.model;

public class ButtonElement extends UIElement {
    private String label;
    private String action;

    public ButtonElement(String label, String action) {
        super("button");
        this.label = label;
        this.action = action;
    }

    public String getLabel() {
        return label;
    }

    public String getAction() {
        return action;
    }
}
