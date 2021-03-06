/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.persistence.variable.statemachine;

import com.wegas.core.Helper;
import com.wegas.core.exception.client.WegasIncompatibleType;
import com.wegas.core.persistence.AbstractEntity;
import java.util.List;
import javax.persistence.Entity;
import javax.persistence.Lob;

/**
 *
 * @author Francois-Xavier Aeberhard (fx at red-agent.com)
 */
@Entity
public class DialogueState extends State {

    private static final long serialVersionUID = 1L;
    /**
     *
     */
    @Lob
    private String text;

    @Override
    public Boolean containsAll(final List<String> criterias) {
        if (Helper.insensitiveContainsAll(this.getText(), criterias)) {
            return true;
        }
        return super.containsAll(criterias);
    }

    /**
     * @return the text
     */
    public String getText() {
        return text;
    }

    /**
     * @param text the text to set
     */
    public void setText(String text) {
        this.text = text;
    }

    @Override
    public void merge(AbstractEntity other) {
        if (other instanceof DialogueState) {
            this.setText(((DialogueState) other).getText());
            super.merge(other);
        } else {
            throw new WegasIncompatibleType(this.getClass().getSimpleName() + ".merge (" + other.getClass().getSimpleName() + ") is not possible");
        }
    }
}
