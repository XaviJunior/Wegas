/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.security.ejb;

import com.wegas.core.ejb.BaseFacade;
import com.wegas.core.ejb.PlayerFacade;
import com.wegas.core.ejb.RequestManager;
import com.wegas.core.event.client.WarningEvent;
import com.wegas.core.exception.client.WegasErrorMessage;
import com.wegas.core.exception.internal.WegasNoResultException;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.game.Team;
import com.wegas.core.security.jparealm.JpaAccount;
import com.wegas.core.security.persistence.AbstractAccount;
import com.wegas.core.security.persistence.Role;
import org.apache.shiro.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.EJB;
import javax.ejb.EJBException;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.*;

/**
 * @author Francois-Xavier Aeberhard (fx at red-agent.com)
 */
@Stateless
@LocalBean
public class AccountFacade extends BaseFacade<AbstractAccount> {

    Logger logger = LoggerFactory.getLogger(AccountFacade.class);

    private static final int MAXRESULT = 30;

    /**
     *
     */
    @EJB
    private RoleFacade roleFacade;

    @EJB
    private PlayerFacade playerFacade;

    @EJB
    private UserFacade userFacade;

    @Inject
    private RequestManager requestManager;

    /**
     *
     */
    public AccountFacade() {
        super(AbstractAccount.class);
    }

    /**
     * Update an account
     *
     * @param entityId id of account to update
     * @param account  account to update from
     * @return up to date account
     */
    @Override
    public AbstractAccount update(final Long entityId, final AbstractAccount account) {
        if (account.getUsername() != null && !account.getUsername().equals("")) {// If the provided username is not null
            try {
                AbstractAccount a = this.findByUsername(account.getUsername());
                if (!a.getId().equals(account.getId())) {                       // and we can find an account with the username which is not the one we are editing,
                    throw WegasErrorMessage.error("This username is already in use");// throw an exception
                }
            } catch (WegasNoResultException e) {
                // GOTCHA no username could be found, do not use
            }
        }

        AbstractAccount oAccount = super.update(entityId, account);

        if (SecurityUtils.getSubject().isPermitted("User:Edit:" + entityId)) {
            Set<Role> revivedRoles = new HashSet<>();
            for (Role r : account.getDeserialisedRoles()) {
                try {
                    revivedRoles.add(roleFacade.find(r.getId()));
                } catch (EJBException e) {
                    // not able to revive this role
                }
            }
            oAccount.getUser().setRoles(revivedRoles);
            //oAccount.setRoles(revivedRoles);
        }

        return oAccount;
    }

    /**
     * Remvoe an account
     *
     * @param entity account to remove
     */
    @Override
    public void remove(AbstractAccount entity) {
        getEntityManager().remove(entity);
    }

    /**
     * Create an account
     *
     * @param entity account to persist
     */
    @Override
    public void create(AbstractAccount entity) {
        getEntityManager().persist(entity);
    }

    /**
     * Get all JPA Accounts
     *
     * @return all JPAAccounts
     */
    public List<JpaAccount> findAllRegistered() {
//        final CriteriaQuery query = getEntityManager().getCriteriaBuilder().createQuery();
//        query.select(query.from(JpaAccount.class));
//        return getEntityManager().createQuery(query).getResultList();
        final TypedQuery<JpaAccount> query = getEntityManager().createNamedQuery("JpaAccount.findExactClass", JpaAccount.class);
        query.setParameter("accountClass", JpaAccount.class);
        return query.getResultList();
    }

    /**
     * Return a user based on his principal.
     *
     * @param username
     * @return the user who owns an with the given username
     * @throws WegasNoResultException if no such a user exists
     */
    public AbstractAccount findByUsername(String username) throws WegasNoResultException {
        final TypedQuery<AbstractAccount> query = getEntityManager().createNamedQuery("AbstractAccount.findByUsername", AbstractAccount.class);
        query.setParameter("username", username);
        try {
            return query.getSingleResult();
        } catch (NoResultException ex) {
            throw new WegasNoResultException(ex);
        }
    }

    /**
     * @param email
     * @return the user who owns an account with this email address
     * @throws WegasNoResultException if no such a user exists
     */
    public JpaAccount findByEmail(String email) throws WegasNoResultException {
        try {
            final TypedQuery<JpaAccount> query = getEntityManager().createNamedQuery("JpaAccount.findByEmail", JpaAccount.class);
            query.setParameter("email", email);
            return query.getSingleResult();
        } catch (NoResultException ex) {
            throw new WegasNoResultException(ex);
        }
    }

    /**
     * Look for jpaAccounts matching given value.
     *
     * The value can be part of the first name, last name, email or username.
     *
     * @param input search token
     * @return list of JpaAccount matching the token
     */
    public List<JpaAccount> findByNameEmailOrUsername(String input) {
        String[] tokens = input.split(" ");

        CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        CriteriaQuery<JpaAccount> cq = cb.createQuery(JpaAccount.class);
        Root<JpaAccount> jpaAccount = cq.from(JpaAccount.class);

        Predicate[] prs = {};

        List<Predicate> andPreds = new ArrayList<>();
        for (String token : tokens) {
            if (!token.isEmpty()) {
                token = "%" + token.toLowerCase() + "%";
                List<Predicate> orPreds = new ArrayList<>();
                orPreds.add(cb.like(cb.lower(jpaAccount.get("firstname")), token));
                orPreds.add(cb.like(cb.lower(jpaAccount.get("lastname")), token));
                orPreds.add(cb.like(cb.lower(jpaAccount.get("email")), token));
                orPreds.add(cb.like(cb.lower(jpaAccount.get("username")), token));

                andPreds.add(cb.or(orPreds.toArray(prs)));
            }
        }

        cq.where(cb.and(andPreds.toArray(prs)));

        TypedQuery<JpaAccount> q = getEntityManager().createQuery(cq);
        q.setMaxResults(MAXRESULT);
        return q.getResultList();
    }

    /**
     * @param name
     * @param withEmail
     * @return all account matching name
     */
    public List<JpaAccount> findByNameOrEmail(String name, boolean withEmail) {
        ArrayList<JpaAccount> accounts = new ArrayList<>();
        String splidedName[] = name.split(" ");
        for (int i = 0; i < splidedName.length; i++) {
            StringBuilder firstnameBuilder = new StringBuilder();
            StringBuilder lastnameBuilder = new StringBuilder();
            String firstname, lastname;
            for (int ii = 0; ii <= i; ii++) {
                firstnameBuilder.append(splidedName[ii]).append(" ");
            }
            firstname = normalizeName(firstnameBuilder.toString());
            if (i < splidedName.length - 1) {
                for (int ii = i + 1; ii < splidedName.length; ii++) {
                    lastnameBuilder.append(splidedName[ii]).append(" ");
                }
            }
            lastname = normalizeName(lastnameBuilder.toString());
            List<JpaAccount> tempAccount = this.findByNameOrEmailQuery("name", firstname, lastname);
            accounts = this.compareExistingAccount(tempAccount, accounts);
            tempAccount = this.findByNameOrEmailQuery("name", lastname, firstname);
            accounts = this.compareExistingAccount(tempAccount, accounts);
            if (withEmail && splidedName.length == 1) {
                tempAccount = this.findByNameOrEmailQuery("email", splidedName[i], null);
                accounts = this.compareExistingAccount(tempAccount, accounts);
            }
        }
        return accounts;
    }

    private String normalizeName(String name) {
        if (name.equals("")) {
            return "%";
        } else {
            return name.substring(0, name.length() - 1);
        }
    }

    private List<JpaAccount> findByNameOrEmailQuery(final String type, String value1, String value2) {

        final TypedQuery<JpaAccount> query;

        //CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
        //CriteriaQuery cq = cb.createQuery();
        //Root<JpaAccount> account = cq.from(JpaAccount.class);
        switch (type) {
            case "name":
                query = getEntityManager().createNamedQuery("JpaAccount.findByFullName", JpaAccount.class);
                query.setParameter("firstname", value1);
                query.setParameter("lastname", value2);
                break;
            case "email":
                query = getEntityManager().createNamedQuery("JpaAccount.findByEmail", JpaAccount.class);
                query.setParameter("email", value1);
                break;
            default:
                throw new UnsupportedOperationException("Unexpected parameter " + type);
        }
        //Query q = getEntityManager().createQuery(cq);
        //q.setMaxResults(MAXRESULT);
        query.setMaxResults(MAXRESULT);
        return query.getResultList();
        //return (List<JpaAccount>) q.getResultList();
    }

    private ArrayList<JpaAccount> compareExistingAccount(List<JpaAccount> tempAccount, ArrayList<JpaAccount> accounts) {
        for (JpaAccount tempAccount1 : tempAccount) {
            if (!accounts.contains(tempAccount1)) {
                accounts.add(tempAccount1);
            }
        }
        return accounts;
    }

    /**
     * @param team
     * @return all user who have a player registered in the given team
     */
    public ArrayList<AbstractAccount> findByTeam(Team team) {
        ArrayList<AbstractAccount> result = new ArrayList<>();
        for (Player player : team.getPlayers()) {
            if (player.getUser() != null) {
                result.add(player.getUser().getMainAccount());                      // Test players dont have a user, we do not return anything since the target widget would not know what to do with it
            }
        }
        return result;
    }

    /**
     * Look for jpaAccounts matching given value.
     *
     * The value can be part of the first name, last name, email or username.
     *
     * @param value search token
     * @return list of JpaAccount matching the token
     */
    public List<JpaAccount> getAutoComplete(String value) {
        return findByNameEmailOrUsername(value);
    }

    public List<JpaAccount> getAutoCompleteFull(String value, Long gameId) {
        List<JpaAccount> accounts = this.getAutoComplete(value);
        for (int i = 0; i < accounts.size(); i++) {
            JpaAccount ja = accounts.get(i);
            getEntityManager().detach(ja);
            ja.setEmail(ja.getEmail().replaceFirst("([^@]{1,4})[^@]*(@.*)", "$1****$2"));
            try {
                Player p = playerFacade.findByGameIdAndUserId(gameId, ja.getUser().getId());
                if (ja.getUser() == p.getUser()) {
                    accounts.remove(i);
                }
            } catch (WegasNoResultException e) {
                //Gotcha
            }
        }
        return accounts;
    }

    /**
     * Same as {@link #getAutoComplete(java.lang.String) getAutoComplete} but
     * account must be member of (at least) one role in rolesList
     *
     * @param value     account search token
     * @param rolesList list of roles targeted account should be members (only
     *                  one membership is sufficient)
     * @return list of JpaAccount matching the token that are member of at least
     *         one given role
     */
    public List<JpaAccount> getAutoCompleteByRoles(String value, HashMap<String, List<String>> rolesList) {
        ArrayList<String> roles = (ArrayList<String>) rolesList.get("rolesList");

        List<JpaAccount> returnValue = new ArrayList<>();
        //for (JpaAccount a : accountFacade.findByNameOrEmail("%" + value + "%", true)) {
        for (JpaAccount a : findByNameEmailOrUsername(value)) {
            boolean hasRole = userFacade.hasRoles(roles, new ArrayList<>(a.getRoles()));
            if (hasRole) {
                getEntityManager().detach(a);
                a.setEmail(a.getEmail().replaceFirst("([^@]{1,4})[^@]*(@.*)", "$1****$2"));
                returnValue.add(a);
            }
        }
        return returnValue;
    }

    /**
     * @param values
     * @return bag of scrap
     * @deprecated 
     */
    public List<Map> findAccountsByEmailValues(List<String> values) {
        List<Map> returnValue = new ArrayList<>();
        List<String> notValidValue = new ArrayList<>();
        for (String value : values) {
            try {
                Map<String, Object> account = new HashMap<>();
                JpaAccount a = findByEmail(value.trim());
                if (a.getFirstname() != null && a.getLastname() != null) {
                    account.put("label", a.getFirstname() + " " + a.getLastname());
                } else {
                    account.put("label", a.getEmail());
                }
                account.put("value", a.getId());
                returnValue.add(account);
            } catch (WegasNoResultException e2) {
                notValidValue.add(value);
            }
        }
        requestManager.addEvent(new WarningEvent("NotAddedAccount", notValidValue));
        return returnValue;
    }

    /**
     * piece of scrap
     *
     * @deprecated
     * @param values
     * @return jpaAccounts and some strange event...
     */
    public List<JpaAccount> findAccountsByName(List<String> values) {
        List<JpaAccount> returnValue = new ArrayList<>();
        List<String> notValidValue = new ArrayList<>();
        for (int i = 0; i < values.size(); i++) {
            String s = values.get(i);
            List<JpaAccount> temps = findByNameOrEmail(s, false);
            if (temps.size() == 1) {
                returnValue.addAll(temps);
            } else {
                notValidValue.add(s);
            }
        }
        requestManager.addEvent(new WarningEvent("NotAddedAccount", notValidValue));
        return returnValue;
    }

}
