package com.chat.service;

import com.chat.model.ButtonElement;
import com.chat.model.ChatResponse;
import com.chat.model.InputElement;
import com.chat.model.TableElement;
import com.chat.model.TextElement;

import java.util.List;

/**
 * Demo chat "brain". It inspects the user's message for keywords and decides
 * whether to attach UI elements to the reply. Replace this with a real model /
 * business logic later — the contract ({@link ChatResponse}) stays the same.
 */
public class ChatService {

    public ChatResponse reply(String message) {
        String text = message == null ? "" : message.toLowerCase();

        if (text.contains("table")) {
            return tableExample();
        }
        if (text.contains("input") || text.contains("form")) {
            return formExample();
        }
        if (text.contains("button")) {
            return buttonExample();
        }

        // Plain conversational reply — no elements, so the UI stays single-column.
        return new ChatResponse(
            "You said: \"" + message + "\".\n\n"
            + "I only attach side-panel elements for certain keywords. "
            + "Try \"show me a table\", \"give me an input form\", or \"add a button\"."
        );
    }

    private ChatResponse tableExample() {
        TableElement table = new TableElement(
            "Sample data",
            List.of("ID", "Name", "Role", "Active"),
            List.of(
                List.of(1, "Ada Lovelace", "Engineer", true),
                List.of(2, "Alan Turing", "Researcher", true),
                List.of(3, "Grace Hopper", "Admiral", false)
            )
        );
        return new ChatResponse("Here's a table rendered in the right-hand panel.")
            .addElement(table);
    }

    private ChatResponse formExample() {
        return new ChatResponse("Here's a small form in the right-hand panel.")
            .addElement(new TextElement("Profile", "Fill in your details below."))
            .addElement(new InputElement("fullName", "Full name", "Jane Doe", "text"))
            .addElement(new InputElement("email", "Email", "jane@example.com", "email"))
            .addElement(new ButtonElement("Save", "save-profile"));
    }

    private ChatResponse buttonExample() {
        return new ChatResponse("Here's a button in the right-hand panel.")
            .addElement(new ButtonElement("Click me", "demo-action"));
    }
}
