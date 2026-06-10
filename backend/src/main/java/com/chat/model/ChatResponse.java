package com.chat.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Outgoing payload for POST /api/chat. Mirrors the frontend ChatResponse type:
 * a plain-text reply plus an optional list of UI elements. When `elements` is
 * non-empty, the frontend splits its right side into chat + elements columns.
 */
public class ChatResponse {
    private String reply;
    private List<UIElement> elements = new ArrayList<>();

    public ChatResponse() {
    }

    public ChatResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<UIElement> getElements() {
        return elements;
    }

    public void setElements(List<UIElement> elements) {
        this.elements = elements;
    }

    public ChatResponse addElement(UIElement element) {
        this.elements.add(element);
        return this;
    }
}
