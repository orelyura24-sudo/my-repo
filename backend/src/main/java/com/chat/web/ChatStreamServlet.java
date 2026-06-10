package com.chat.web;

import com.chat.model.ChatRequest;
import com.chat.model.ChatResponse;
import com.chat.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * POST /api/chat/stream — streams the reply with Server-Sent Events.
 *
 * Wire format (text/event-stream). Each frame is a single `data:` line holding
 * a JSON envelope with a `type`:
 *   data: {"type":"token","text":"Here "}
 *   data: {"type":"token","text":"is "}
 *   data: {"type":"elements","elements":[ ... ]}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 *
 * Jackson always serializes to a single physical line (newlines inside strings
 * are escaped as \n), so each envelope is SSE-safe.
 *
 * Note: this blocks one Jetty thread for the duration of the stream. That's
 * fine for a demo; for high concurrency switch to async servlets
 * (req.startAsync()) driven by a scheduler.
 */
public class ChatStreamServlet extends HttpServlet {

    private final transient ObjectMapper mapper = new ObjectMapper();
    private final transient ChatService chatService = new ChatService();

    /** Delay between word chunks, to produce the typewriter effect. */
    private static final long TOKEN_DELAY_MS = 35;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType("text/event-stream");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-cache");
        resp.setHeader("Connection", "keep-alive");
        // Tell intermediary proxies (nginx, etc.) not to buffer the stream.
        resp.setHeader("X-Accel-Buffering", "no");

        PrintWriter out = resp.getWriter();

        ChatRequest chatRequest;
        try {
            chatRequest = mapper.readValue(req.getInputStream(), ChatRequest.class);
        } catch (Exception e) {
            sendEvent(out, Map.of("type", "error",
                "message", "Invalid JSON body: " + e.getMessage()));
            return;
        }

        if (chatRequest == null || chatRequest.getMessage() == null
                || chatRequest.getMessage().isBlank()) {
            sendEvent(out, Map.of("type", "error",
                "message", "Field 'message' is required."));
            return;
        }

        ChatResponse full = chatService.reply(chatRequest.getMessage());

        // 1) Stream the reply text word-by-word.
        for (String chunk : tokenize(full.getReply())) {
            sendEvent(out, Map.of("type", "token", "text", chunk));
            if (out.checkError()) {
                return; // client disconnected — checkError() flushes then reports
            }
            sleep(TOKEN_DELAY_MS);
        }

        // 2) Send any UI elements in one frame (drives the right-hand panel).
        if (full.getElements() != null && !full.getElements().isEmpty()) {
            sendEvent(out, Map.of("type", "elements", "elements", full.getElements()));
        }

        // 3) Signal completion.
        sendEvent(out, Map.of("type", "done"));
    }

    private void sendEvent(PrintWriter out, Object envelope) {
        try {
            out.write("data: " + mapper.writeValueAsString(envelope) + "\n\n");
            out.flush();
        } catch (IOException e) {
            // Serialization failure — nothing useful we can stream at this point.
            throw new IllegalStateException("Failed to serialize SSE event", e);
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
