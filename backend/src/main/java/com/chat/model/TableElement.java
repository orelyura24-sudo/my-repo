package com.chat.model;

import java.util.List;

public class TableElement extends UIElement {
    private String title;
    private List<String> columns;
    private List<List<Object>> rows;

    public TableElement(String title, List<String> columns, List<List<Object>> rows) {
        super("table");
        this.title = title;
        this.columns = columns;
        this.rows = rows;
    }

    public String getTitle() {
        return title;
    }

    public List<String> getColumns() {
        return columns;
    }

    public List<List<Object>> getRows() {
        return rows;
    }
}
