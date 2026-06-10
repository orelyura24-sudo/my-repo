package com.chat;

import com.chat.web.ChatServlet;
import com.chat.web.ChatStreamServlet;
import com.chat.web.HealthServlet;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

/**
 * Embedded Jetty bootstrap. No external Tomcat needed — just run this class
 * (or the shaded jar) and the servlets are served on http://localhost:8080.
 */
public class Main {

    public static void main(String[] args) throws Exception {
        int port = resolvePort();

        Server server = new Server(port);

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        context.addServlet(new ServletHolder(new ChatServlet()), "/api/chat");
        context.addServlet(new ServletHolder(new ChatStreamServlet()), "/api/chat/stream");
        context.addServlet(new ServletHolder(new HealthServlet()), "/api/health");

        server.setHandler(context);

        server.start();
        System.out.println("Chat backend listening on http://localhost:" + port);
        System.out.println("  POST /api/chat   POST /api/chat/stream   GET /api/health");
        server.join();
    }

    private static int resolvePort() {
        String env = System.getenv("PORT");
        if (env != null && !env.isBlank()) {
            try {
                return Integer.parseInt(env.trim());
            } catch (NumberFormatException ignored) {
                // fall through to default
            }
        }
        return 8080;
    }
}
