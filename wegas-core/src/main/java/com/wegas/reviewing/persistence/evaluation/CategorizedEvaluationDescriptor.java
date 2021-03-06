 /*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.reviewing.persistence.evaluation;

import com.wegas.core.exception.client.WegasIncompatibleType;
import com.wegas.core.persistence.AbstractEntity;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;

/**
 * Define an evaluation as a categorisation. For instance : [ very bad ; bad ;
 * acceptable ; good ; very good ], [true ; false], [off topic, irrelevant,
 * relevant]
 *
 *
 * @author Maxence Laurent (maxence.laurent at gmail.com)
 */
@Entity
public class CategorizedEvaluationDescriptor extends EvaluationDescriptor<CategorizedEvaluationInstance> {

    private static final long serialVersionUID = 1L;

    /**
     * List of allowed categories
     */
    @ElementCollection
    private List<String> categories = new ArrayList<>();

    /**
     * Get the list of allowed categories
     *
     * @return allowed categories
     */
    public List<String> getCategories() {
        return categories;
    }

    /**
     * set the list of allowed categories
     *
     * @param categories allowed categories
     */
    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    /**
     * Add a category to the list
     *
     * @param category the category to add
     */
    public void addCategory(String category) {
        if (!categories.contains(category)) {
            categories.add(category);
        }
    }

    /**
     * remove a category from the list
     *
     * @param category
     */
    public void removeCategory(String category) {
        categories.remove(category);
    }

    @Override
    public void merge(AbstractEntity a) {
        if (a instanceof CategorizedEvaluationDescriptor) {
            super.merge(a);
            CategorizedEvaluationDescriptor o = (CategorizedEvaluationDescriptor) a;
            this.categories = new ArrayList<>();
            this.categories.addAll(o.getCategories());
        } else {
            throw new WegasIncompatibleType(this.getClass().getSimpleName() + ".merge (" + a.getClass().getSimpleName() + ") is not possible");
        }
    }

    @Override
    protected CategorizedEvaluationInstance newInstance() {
        return new CategorizedEvaluationInstance();
    }
}
