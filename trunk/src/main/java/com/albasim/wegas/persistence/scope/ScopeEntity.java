/*
 * Wegas. 
 * http://www.albasim.com/wegas/
 * 
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem⁺
 *
 * Copyright (C) 2011 
 */
package com.albasim.wegas.persistence.scope;

import com.albasim.wegas.persistence.variabledescriptor.VariableDescriptorEntity;
import com.albasim.wegas.persistence.variableinstance.VariableInstanceEntity;
import com.albasim.wegas.persistence.*;
import java.io.Serializable;
import java.util.Map;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.OneToOne;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.codehaus.jackson.annotate.JsonSubTypes;

/**
 *
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
// Database serialization
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
// JSon Serialisation
@XmlType(name = "Scope")
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "UserScope", value = UserScopeEntity.class),
    @JsonSubTypes.Type(name = "TeamScope", value = TeamScopeEntity.class),
    @JsonSubTypes.Type(name = "GameScope", value = GameScopeEntity.class)
})
public abstract class ScopeEntity extends AnonymousEntity implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "scope_seq")
    private Long id;
    //abstract public void getVariableInstance(UserEntity u);
 /*   @OneToOne(mappedBy="scope")
    @NotNull
    @XmlTransient
    @JsonBackReference*7
     * 
     */
    @OneToOne
    @XmlTransient
    private VariableDescriptorEntity variableDescriptor;

    /**
     * 
     * @param userId
     * @param v
     */
    abstract public void setVariableInstances(Long userId, VariableInstanceEntity v);

    /**
     * 
     * @return
     */
    abstract public Map<Long, VariableInstanceEntity> getVariableInstances();

    /*@OneToOne
    @JoinColumn(name = "variabledescriptor_id")
    @XmlInverseReference(mappedBy = "scope")
    @XmlTransient*/
    /**
     * 
     * @return
     */
    @XmlTransient
    public VariableDescriptorEntity getVariableDescriptor() {
        return this.variableDescriptor;
    }

    /**
     * 
     * @param varDesc
     */
    @XmlTransient
    public void setVariableDescscriptor(VariableDescriptorEntity varDesc) {
        this.variableDescriptor = varDesc;
    }

    /**
     * 
     * @return
     */
    @Override
    @XmlTransient
    public Long getId() {
        return this.id;
    }

    /**
     * 
     * @param id
     */
    @Override
    @XmlTransient
    public void setId(Long id) {
        this.id = id;
    }
}
