/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.event.client;

import com.wegas.core.persistence.AbstractEntity;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Yannick Lagger (lagger.yannick at gmail.com)
 */
public class EntityUpdatedEvent extends ClientEvent {

    private static final long serialVersionUID = 1L;
    private List<AbstractEntity> updatedEntities = new ArrayList<>();

    /**
     *
     */
    public EntityUpdatedEvent() {
    }

    /**
     *
     * @param updatedEntities
     */
    public EntityUpdatedEvent(List<AbstractEntity> updatedEntities) {
        this.updatedEntities = updatedEntities;
    }

    /**
     * @return the updatedEntities
     */
    public List<AbstractEntity> getUpdatedEntities() {
        return updatedEntities;
    }

    /**
     * @param updatedEntities the updatedEntities to set
     */
    public void setUpdatedEntities(List<AbstractEntity> updatedEntities) {
        this.updatedEntities = updatedEntities;
    }

    /**
     *
     * @param vi
     */
    public void addEntity(AbstractEntity vi) {
        this.updatedEntities.add(vi);
    }

}
