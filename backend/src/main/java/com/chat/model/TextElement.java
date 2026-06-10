package com.chat.model;

public class TextElement extends UIElement {
    private String title;
    private String body;

    public TextElement(String title, String body) {
        super("text");
        this.title = title;
        this.body = body;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }
}
