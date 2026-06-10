package com.chat.model;

/**
 * Base class for everything the backend can ask the frontend to render.
 * The `type` discriminator is serialized into JSON and matched by the
 * frontend's UIElement union (see frontend/src/types/chat.ts).
 */
public abstract class UIElement {
    private final String type;

    protected UIElement(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
