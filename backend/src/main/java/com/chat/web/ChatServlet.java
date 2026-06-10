package com.chat.web;

import com.chat.model.ChatRequest;
import com.chat.model.ChatResponse;
import com.chat.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * POST /api/chat
 *   request:  { "message": "...", "conversationId": "..." }
 *   response: { "reply": "...", "elements": [ ... ] }
 */
public class ChatServlet extends HttpServlet {

    private final transient ObjectMapper mapper = new ObjectMapper();
    private final transient ChatService chatService = new ChatService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ChatRequest chatRequest;
        try {
            chatRequest = mapper.readValue(
                req.getInputStream(), ChatRequest.class);
        } catch (Exception e) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST,
                "Invalid JSON body: " + e.getMessage());
            return;
        }

        if (chatRequest == null || chatRequest.getMessage() == null
                || chatRequest.getMessage().isBlank()) {
            writeError(resp, HttpServletResponse.SC_BAD_REQUEST,
                "Field 'message' is required.");
            return;
        }

        ChatResponse chatResponse = chatService.reply(chatRequest.getMessage());
        writeJson(resp, HttpServletResponse.SC_OK, chatResponse);
    }

    private void writeJson(HttpServletResponse resp, int status, Object body) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
        mapper.writeValue(resp.getOutputStream(), body);
    }

    private void writeError(HttpServletResponse resp, int status, String message) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding(StandardCharsets.UTF_8.name());
        mapper.writeValue(resp.getOutputStream(),
            java.util.Map.of("error", message));
    }
}
