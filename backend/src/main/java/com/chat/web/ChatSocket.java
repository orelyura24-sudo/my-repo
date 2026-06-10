package com.chat.web;

import com.chat.model.ChatRequest;
import com.chat.model.ChatResponse;
import com.chat.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Map;

/**
 * WebSocket endpoint at ws://host/api/chat/ws.
 *
 * The client sends one JSON message: {"message":"...","conversationId":"..."}.
 * The server replies with a sequence of typed JSON envelopes, one per WebSocket
 * message (no framing needed — WebSocket messages are already discrete):
 *   {"type":"token","text":"Here's "}
 *   {"type":"token","text":"a "}
 *   {"type":"elements","elements":[ ... ]}
 *   {"type":"done"}
 *   {"type":"error","message":"..."}
 *
 * A new instance is created per connection, so instance state would be
 * per-client; here the collaborators are stateless and shared via statics.
 *
 * Note: streaming runs on the message-handling thread with blocking sends and
 * sleeps. That's fine for a demo (one in-flight reply per connection). For a
 * real model you'd forward its token stream instead of sleeping.
 */
@ServerEndpoint("/api/chat/ws")
public class ChatSocket {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final ChatService CHAT_SERVICE = new ChatService();

    /** Delay between word chunks, to produce the typewriter effect. */
    private static final long TOKEN_DELAY_MS = 35;

    @OnMessage
    public void onMessage(String raw, Session session) {
        ChatRequest request;
        try {
            request = MAPPER.readValue(raw, ChatRequest.class);
        } catch (Exception e) {
            send(session, Map.of("type", "error",
                "message", "Invalid JSON: " + e.getMessage()));
            return;
        }

        if (request == null || request.getMessage() == null
                || request.getMessage().isBlank()) {
            send(session, Map.of("type", "error",
                "message", "Field 'message' is required."));
            return;
        }

        ChatResponse full = CHAT_SERVICE.reply(request.getMessage());

        // 1) Stream the reply text word-by-word.
        for (String chunk : tokenize(full.getReply())) {
            if (!session.isOpen()) {
                return; // client disconnected
            }
            send(session, Map.of("type", "token", "text", chunk));
            sleep(TOKEN_DELAY_MS);
        }

        // 2) Send any UI elements in one message (drives the right-hand panel).
        if (full.getElements() != null && !full.getElements().isEmpty()) {
            send(session, Map.of("type", "elements", "elements", full.getElements()));
        }

        // 3) Signal completion.
        send(session, Map.of("type", "done"));
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.err.println("WebSocket error: " + error.getMessage());
    }

    private void send(Session session, Object envelope) {
        if (!session.isOpen()) {
            return;
        }
        try {
            session.getBasicRemote().sendText(MAPPER.writeValueAsString(envelope));
        } catch (IOException e) {
            // Client likely disconnected mid-stream — nothing useful to do.
        }
    }

    /** Split into word-sized chunks, keeping trailing whitespace on each chunk. */
    private String[] tokenize(String text) {
        if (text == null || text.isEmpty()) {
            return new String[0];
        }
        return text.split("(?<=\\s)");
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
