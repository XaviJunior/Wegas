/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.mcq.ejb;

import com.wegas.core.Helper;
import com.wegas.core.ejb.*;
import com.wegas.core.event.internal.DescriptorRevivedEvent;
import com.wegas.core.exception.client.WegasErrorMessage;
import com.wegas.core.exception.client.WegasRuntimeException;
import com.wegas.core.exception.client.WegasScriptException;
import com.wegas.core.exception.internal.WegasNoResultException;
import com.wegas.core.persistence.game.Player;
import com.wegas.mcq.persistence.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.naming.NamingException;
import javax.persistence.NoResultException;
import javax.persistence.Query;
import javax.persistence.TypedQuery;

/**
 * @author Francois-Xavier Aeberhard (fx at red-agent.com)
 */
@Stateless
@LocalBean
public class QuestionDescriptorFacade extends BaseFacade<ChoiceDescriptor> {

    static final private Logger logger = LoggerFactory.getLogger(QuestionDescriptorFacade.class);

    @Inject
    private Event<ReplyValidate> replyValidate;

    /**
     *
     */
    @EJB
    private PlayerFacade playerFacade;

    /**
     *
     */
    @EJB
    private ScriptFacade scriptManager;

    /**
     *
     */
    @EJB
    private RequestFacade requestFacade;

    /**
     *
     */
    @EJB
    QuestionSingleton questionSingleton;

    /**
     *
     */
    @Inject
    private ScriptEventFacade scriptEvent;

    /**
     * Find a result identified by the given name belonging to the given
     * descriptor
     *
     * @param choiceDescriptor
     * @param name
     * @return the given ChoiceDescriptor Result that matches the name
     * @throws WegasNoResultException if not found
     */
    public Result findResult(final ChoiceDescriptor choiceDescriptor, final String name) throws WegasNoResultException {
        if (!Helper.isNullOrEmpty(name)) {
            for (Result result : choiceDescriptor.getResults()) {
                if (name.equals(result.getName())) {
                    return result;
                }
            }
        }

        throw new WegasNoResultException("Result \"" + name + "\" not found");
    }

    public Result findResultTQ(final ChoiceDescriptor choiceDescriptor, final String name) throws WegasNoResultException {
        final TypedQuery<Result> query = getEntityManager().createNamedQuery("Result.findByName", Result.class);
        query.setParameter("choicedescriptor", choiceDescriptor);
        query.setParameter("name", name);
        try {
            return query.getSingleResult();
        } catch (NoResultException ex) {
            throw new WegasNoResultException(ex);
        }
    }

    public Result findResult(Long id) {
        return this.getEntityManager().find(Result.class, id);
    }

    /**
     * @param event
     */
    public void descriptorRevivedEvent(@Observes DescriptorRevivedEvent event) {
        logger.debug("Received DescriptorRevivedEvent event");

        if (event.getEntity() instanceof ChoiceDescriptor) {
            ChoiceDescriptor choice = (ChoiceDescriptor) event.getEntity();
            ChoiceInstance defaultInstance = choice.getDefaultInstance();
            if (defaultInstance.getDeserializedCurrentResultName() != null && !defaultInstance.getDeserializedCurrentResultName().isEmpty()) {
                try {
                    Result cr = findResult(choice, defaultInstance.getDeserializedCurrentResultName());
                    choice.changeCurrentResult(defaultInstance, cr);
                    //defaultInstance.setCurrentResult(cr);
                } catch (WegasNoResultException ex) {
                    throw WegasErrorMessage.error("Error while setting current result");
                }
            } else if (defaultInstance.getCurrentResultIndex() != null
                    && defaultInstance.getCurrentResultIndex() >= 0
                    && defaultInstance.getCurrentResultIndex() < choice.getResults().size()) {
                // Backward compat

                Result cr = choice.getResults().get(defaultInstance.getCurrentResultIndex());
                //defaultInstance.setCurrentResult(cr);
                choice.changeCurrentResult(defaultInstance, cr);
            }
        }
    }

    /**
     *
     */
    public QuestionDescriptorFacade() {
        super(ChoiceDescriptor.class);
    }

    public Reply findReply(Long id) {
        return this.getEntityManager().find(Reply.class, id);
    }

    /**
     * @param replyId
     * @param r
     * @return the updated reply
     */
    public Reply updateReply(Long replyId, Reply r) {
        final Reply oldEntity = this.findReply(replyId);
        oldEntity.merge(r);
        return oldEntity;
    }

    /**
     * @return @deprecated @param instanceId
     */
    public int findReplyCount(Long instanceId) {
        final Query query = getEntityManager().createQuery("SELECT COUNT(r) FROM Reply r WHERE r.questionInstance.id = :id");
        query.setParameter("id", instanceId);
        try {
            return ((Number) query.getSingleResult()).intValue();
        } catch (NoResultException ex) {
            return 0;
        }
    }

    /**
     * Create an ignoration Reply
     *
     * @param choiceId
     * @param player
     * @return new reply
     */
    public Reply ignoreChoice(Long choiceId, Player player) {

        ChoiceDescriptor choice = getEntityManager().find(ChoiceDescriptor.class, choiceId);
        QuestionDescriptor questionDescriptor = choice.getQuestion();
        if (!questionDescriptor.getCbx()) {
            logger.error("ignoreChoice() invoked on a Question which is not of checkbox type");
        }

        Reply reply = questionSingleton.createReplyTransactional(choiceId, player, -1L); // Negative startTime: hack to signal ignoration
        try {
            scriptEvent.fire(player, "replyIgnore", new ReplyValidate(reply));
        } catch (WegasScriptException e) {
            // GOTCHA no eventManager is instantiated
            logger.error("EventListener error (\"replySelect\")", e);
        }
        return reply;
    }

    /**
     * create a reply for given player based on given choice
     *
     * @param choiceId  selected choice
     * @param player    player who select the choice
     * @param startTime time the player select the choice
     * @return the new reply
     */
    public Reply selectChoice(Long choiceId, Player player, Long startTime) {

        ChoiceDescriptor choice = getEntityManager().find(ChoiceDescriptor.class, choiceId);
        QuestionDescriptor questionDescriptor = choice.getQuestion();
        // Verify if mutually exclusive replies must be cancelled:
        if (questionDescriptor.getCbx() && !questionDescriptor.getAllowMultipleReplies()) {
            for (Reply r : questionDescriptor.getInstance(player).getReplies()) {
                if (!r.getResult().getChoiceDescriptor().equals(choice)
                        && !r.getIgnored()) {
                    this.cancelReply(player.getId(), r.getId());
                }
            }
        }

        Reply reply = questionSingleton.createReplyTransactional(choiceId, player, startTime);
        try {
            scriptEvent.fire(player, "replySelect", new ReplyValidate(reply));
        } catch (WegasScriptException e) {
            // GOTCHA no eventManager is instantiated
            logger.error("EventListener error (\"replySelect\")", e);
        }

        return reply;
    }

    /**
     * {@link #selectChoice(java.lang.Long, java.lang.Long, java.lang.Long) selectChoice}
     * with startTime = 0
     *
     * @param choiceId
     * @param playerId
     * @return the new reply
     */
    public Reply selectChoice(Long choiceId, Long playerId) {
        return this.selectChoice(choiceId, playerFacade.find(playerId), (long) 0);
    }

    /**
     * @param choiceId  selected choice id
     * @param playerId  id of player who select the choice
     * @param startTime time the player select the choice
     * @return the new reply
     */
    public Reply selectChoice(Long choiceId, Long playerId, Long startTime) {
        return this.selectChoice(choiceId, playerFacade.find(playerId), startTime);
    }

    /**
     *
     * {@link #selectChoice(java.lang.Long, com.wegas.core.persistence.game.Player, java.lang.Long)  selectChoice} + {@link #validateReply(com.wegas.core.persistence.game.Player, java.lang.Long)  validateReply}
     * in one shot
     *
     * @param choiceId selected choice id
     * @param playerId id of player who select the choice
     * @return the new validated reply
     */
    public Reply selectAndValidateChoice(Long choiceId, Long playerId) {
        Player player = playerFacade.find(playerId);
        Reply reply = this.selectChoice(choiceId, player, (long) 0);
        try {
            this.validateReply(player, reply.getId());
        } catch (WegasRuntimeException e) {
            logger.error("CANCEL REPLY", e);
            this.cancelReplyTransactional(player, reply.getId());
            throw e;
        }
        return reply;
    }

    /**
     *
     * @param player  player who wants to cancel the reply
     * @param replyId id of reply to cancel
     * @return reply being canceled
     */
    public Reply cancelReplyTransactional(Player player, Long replyId) {
        Reply reply = questionSingleton.cancelReplyTransactional(replyId);
        try {
            scriptEvent.fire(player, "replyCancel", new ReplyValidate(reply));// Throw an event
        } catch (WegasRuntimeException e) {
            // GOTCHA no eventManager is instantiated
        }
        return reply;
    }

    /**
     *
     * @param playerId id of player who wants to cancel the reply
     * @param replyId  id of reply to cancel
     * @return reply being canceled
     */
    public Reply cancelReplyTransactional(Long playerId, Long replyId) {
        Player player = playerFacade.find(playerId);
        return this.cancelReplyTransactional(player, replyId);
    }

    /**
     * @param playerId id of player who wants to cancel the reply
     * @param replyId  id of reply to cancel
     * @return reply being canceled
     */
    public Reply cancelReply(Long playerId, Long replyId) {
        return this.cancelReplyTransactional(playerId, replyId);
    }

    /**
     * @param player
     * @param validateReply
     * @throws com.wegas.core.exception.client.WegasRuntimeException
     */
    public void validateReply(final Player player, final Reply validateReply) throws WegasRuntimeException {
        final ChoiceDescriptor choiceDescriptor = validateReply.getResult().getChoiceDescriptor();
        validateReply.setResult(choiceDescriptor.getInstance(player).getResult());// Refresh the current result

        if (validateReply.getIgnored()) {
            scriptManager.eval(player, validateReply.getResult().getIgnorationImpact(), choiceDescriptor);
        } else {
            scriptManager.eval(player, validateReply.getResult().getImpact(), choiceDescriptor);
        }
        final ReplyValidate replyValidate = new ReplyValidate(validateReply, choiceDescriptor.getInstance(player), validateReply.getQuestionInstance(), player);
        try {
            if (validateReply.getIgnored()) {
                scriptEvent.fire(player, "replyIgnore", replyValidate);
            } else {
                scriptEvent.fire(player, "replyValidate", replyValidate);
            }
        } catch (WegasRuntimeException e) {
            logger.error("EventListener error (\"replyValidate\")", e);
            // GOTCHA no eventManager is instantiated
        }
        this.replyValidate.fire(replyValidate);
    }

    /**
     * @param player
     * @param replyVariableInstanceId
     */
    public void validateReply(Player player, Long replyVariableInstanceId) {
        this.validateReply(player, getEntityManager().find(Reply.class, replyVariableInstanceId));
    }

    /**
     * @param playerId
     * @param replyVariableInstanceId
     */
    public void validateReply(Long playerId, Long replyVariableInstanceId) {
        this.validateReply(playerFacade.find(playerId), replyVariableInstanceId);
    }

    /**
     * Validates a question that's marked as checkbox type: sequentially
     * validates all replies (i.e. selected choices) and processes all other
     * choices as "ignored".
     *
     * @param validateQuestion
     * @param player
     * @throws com.wegas.core.exception.client.WegasRuntimeException
     */
    public void validateQuestion(final QuestionInstance validateQuestion, final Player player) throws WegasRuntimeException {

        final QuestionDescriptor questionDescriptor = (QuestionDescriptor) validateQuestion.getDescriptor();
        if (!questionDescriptor.getCbx()) {
            logger.error("validateQuestion() invoked on a Question which is not of checkbox type");
            return;
        }

        // Don't validate questions with no replies
        if (validateQuestion.getReplies().isEmpty()) {
            throw new WegasErrorMessage(WegasErrorMessage.ERROR, "Please select a reply");
        }

        // Loop on all choices: validate all replies (checked choices) and "ignore" all unchecked choices.
        // NB: there should be only one reply per choice for each player.
        for (ChoiceDescriptor choice : questionDescriptor.getItems()) {
            // Test if the current choice has been selected, i.e. there is a reply for it.
            boolean found = false;
            for (Reply r : validateQuestion.getReplies()) {
                if (r.getResult().getChoiceDescriptor().equals(choice)) {
                    if (!r.getIgnored()) {
                        // It's been selected: validate the reply (which executes the impact)
                        this.validateReply(player, r);
                    } else {
                        logger.error("validateQuestion() invoked on a Question where ignored replies are already persisted");
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                Reply ignoredReply = ignoreChoice(choice.getId(), player);
                this.validateReply(player, ignoredReply);
            }
        }

        getEntityManager().refresh(validateQuestion);
        validateQuestion.setValidated(true);
        //getEntityManager().flush();
    }

    /**
     * @param questionInstanceId
     * @param player
     */
    public void validateQuestion(Long questionInstanceId, Player player) {
        this.validateQuestion(getEntityManager().find(QuestionInstance.class, questionInstanceId), player);
    }

    /**
     * @param questionInstanceId
     * @param playerId
     */
    public void validateQuestion(Long questionInstanceId, Long playerId) {
        this.validateQuestion(questionInstanceId, playerFacade.find(playerId));
    }

    @Override
    public void create(ChoiceDescriptor entity) {
        getEntityManager().persist(entity);
        entity.getQuestion().addItem(entity);
    }

    @Override
    public void remove(ChoiceDescriptor entity) {
        logger.error("ICI *********************************************** ICI");
        getEntityManager().remove(entity);
        entity.getQuestion().remove(entity);
    }

    /**
     *
     */
    public static class ReplyValidate {

        /**
         *
         */
        final public Reply reply;

        /**
         *
         */
        final public ChoiceInstance choice;

        /**
         *
         */
        final public QuestionInstance question;

        /**
         *
         */
        final public Player player;

        /**
         * @param reply
         * @param choice
         * @param question
         */
        public ReplyValidate(Reply reply, ChoiceInstance choice, QuestionInstance question, Player player) {
            this.reply = reply;
            this.choice = choice;
            this.question = question;
            this.player = player;
        }

        /**
         * @param reply
         */
        public ReplyValidate(Reply reply) {
            this.reply = reply;
            this.choice = null;
            this.question = null;
            this.player = null;
        }
    }

    /**
     * @return looked-up EJB
     */
    public static QuestionDescriptorFacade lookup() {
        try {
            return Helper.lookupBy(QuestionDescriptorFacade.class);
        } catch (NamingException ex) {
            logger.error("Error retrieving var inst f", ex);
            return null;
        }
    }
}
