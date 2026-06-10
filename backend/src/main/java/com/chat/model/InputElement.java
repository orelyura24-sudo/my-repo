package com.chat.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class InputElement extends UIElement {
    private String name;
    private String label;
    private String placeholder;
    private String inputType;

    public InputElement(String name, String label, String placeholder, String inputType) {
        super("input");
        this.name = name;
        this.label = label;
        this.placeholder = placeholder;
        this.inputType = inputType;
    }

    public String getName() {
        return name;
    }

    public String getLabel() {
        return label;
    }

    public String getPlaceholder() {
        return placeholder;
    }

    public String getInputType() {
        return inputType;
    }
}
