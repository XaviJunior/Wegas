/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.rest;

import com.wegas.core.Helper;
import com.wegas.core.ejb.GameFacade;
import com.wegas.core.ejb.PlayerFacade;
import com.wegas.core.ejb.TeamFacade;
import com.wegas.core.exception.internal.WegasNoResultException;
import com.wegas.core.persistence.game.DebugTeam;
import com.wegas.core.persistence.game.Game;
import com.wegas.core.persistence.game.Player;
import com.wegas.core.persistence.game.Team;
import com.wegas.core.security.ejb.UserFacade;
import com.wegas.core.security.persistence.User;
import com.wegas.core.security.util.SecurityHelper;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.annotation.RequiresRoles;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

/**
 * @author Francois-Xavier Aeberhard (fx at red-agent.com)
 */
@Stateless
@Path("GameModel/{gameModelId : ([1-9][0-9]*)?}{sep: /?}Game/")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class GameController {

    @PersistenceContext(unitName = "wegasPU")
    private EntityManager em;

    /**
     *
     */
    @EJB
    private GameFacade gameFacade;

    /**
     *
     */
    @EJB
    private UserFacade userFacade;

    /**
     *
     */
    @EJB
    private TeamFacade teamFacade;

    /**
     *
     */
    @EJB
    private PlayerFacade playerFacade;

    /**
     * @param entityId
     * @return game matching entityId
     * @throws AuthorizationException current user doesn't have access to the
     *                                requested game
     */
    @GET
    @Path("{entityId : [1-9][0-9]*}")
    public Game find(@PathParam("entityId") Long entityId) {
        Game g = gameFacade.find(entityId);
        SecurityHelper.checkAnyPermission(g, Arrays.asList("View", "Token", "TeamToken"));

        return g; // was: gameFacade.find(entityId);
    }

    /**
     * @param gameModelId
     * @return all gameModel games
     */
    @GET
    public Collection<Game> index(@PathParam("gameModelId") String gameModelId) {
        final Collection<Game> retGames = new ArrayList<>();
        final Collection<Game> games = (!gameModelId.isEmpty())
                ? gameFacade.findByGameModelId(Long.parseLong(gameModelId), "createdTime ASC")
                : gameFacade.findAll(Game.Status.LIVE);

        for (Game g : games) {
            if (SecurityHelper.isPermitted(g, "Edit")) {
                retGames.add(g);
            }
        }
        return retGames;
    }

    /**
     * Create a new game based on a given gameModel copy.
     *
     * @param gameModelId
     * @param game
     * @return the new game with its debug team filtered out
     * @throws IOException
     */
    @POST
    public Game create(@PathParam("gameModelId") Long gameModelId, Game game) throws IOException {
        SecurityUtils.getSubject().checkPermission("GameModel:Instantiate:gm" + gameModelId);

        gameFacade.publishAndCreate(gameModelId, game);
        //@Dirty: those lines exist to get a new game pointer. Cache is messing with it
        // removing debug team will stay in cache as this game pointer is new. work around
        em.flush();
        em.detach(game);
        game = em.find(Game.class, game.getId());
        //gameFacade.create(gameModelId, game);
        return getGameWithoutDebugTeam(game);
    }

    /**
     * Create a new game within the given game model
     *
     * @param gameModelId
     * @param entity
     * @return the new game with its debug team filtered out
     * @throws IOException
     */
    @POST
    @Path("ShadowCreate")
    public Game shadowCreate(@PathParam("gameModelId") Long gameModelId, Game entity) throws IOException {
        SecurityUtils.getSubject().checkPermission("GameModel:Instantiate:gm" + gameModelId);

        gameFacade.create(gameModelId, entity);
        return getGameWithoutDebugTeam(entity);
    }

    /**
     * Same as above, but take the parent game model id from a path param
     *
     * @param gameModelId
     * @param entity
     * @return the new game with its debug team
     * @throws IOException
     */
    @POST
    @Path("{gmId : [1-9][0-9]*}")
    public Game createBis(@PathParam("gmId") Long gameModelId, Game entity) throws IOException {
        return this.create(gameModelId, entity);
    }

    /**
     * @param entityId
     * @param entity
     * @return up to date game
     */
    @PUT
    @Path("{entityId: [1-9][0-9]*}")
    public Game update(@PathParam("entityId") Long entityId, Game entity) {

        SecurityHelper.checkPermission(gameFacade.find(entityId), "Edit");

        return gameFacade.update(entityId, entity);
    }

    /**
     * Change game status (bin, live, delete)
     *
     * @param entityId
     * @param status
     * @return the game with up to date status
     */
    @PUT
    @Path("{entityId: [1-9][0-9]*}/status/{status: [A-Z]*}")
    public Game changeStatus(@PathParam("entityId") Long entityId, @PathParam("status") final Game.Status status) {
        Game game = gameFacade.find(entityId);
        SecurityHelper.checkPermission(game, "Edit");
        switch (status) {
            case LIVE:
                gameFacade.live(game);
                break;
            case BIN:
                gameFacade.bin(game);
                break;
            case DELETE:
                gameFacade.delete(game);
                break;
        }
        return game;
    }

    /**
     * Get all game with given status
     *
     * @param status
     * @return all game having the given status
     */
    @GET
    @Path("status/{status: [A-Z]*}")
    public Collection<Game> findByStatus(@PathParam("status") final Game.Status status) {
        final Collection<Game> retGames = new ArrayList<>();
        final Collection<Game> games = gameFacade.findAll(status);
        for (Game g : games) {
            if (SecurityHelper.isPermitted(g, "Edit")) {
                retGames.add(getGameWithoutDebugTeam(g));
            }
        }
        return retGames;
    }

    /**
     * Count games by status
     *
     * @param status
     * @return number of game having the given status
     */
    @GET
    @Path("status/{status: [A-Z]*}/count")
    public int countByStatus(@PathParam("status") final Game.Status status) {
        final Collection<Game> retGames = new ArrayList<>();
        final Collection<Game> games = gameFacade.findAll(status);
        for (Game g : games) {
            if (SecurityHelper.isPermitted(g, "Edit")) {
                retGames.add(g);
            }
        }
        return retGames.size();
    }

    /**
     * @param entityId
     */
    @DELETE
    @Path("{entityId: [1-9][0-9]*}")
    @RequiresRoles("Administrator")
    public void forceDelete(@PathParam("entityId") Long entityId) {
        Game entity = gameFacade.find(entityId);
        switch (entity.getStatus()) {
            case DELETE:
                gameFacade.remove(entity);
                break;
        }
    }

    /**
     * @return all games which gave been deleted
     */
    @DELETE
    public Collection<Game> deleteAll() {
        final Collection<Game> retGames = new ArrayList<>();
        final Collection<Game> games = gameFacade.findAll(Game.Status.BIN);
        for (Game g : games) {
            if (SecurityHelper.isPermitted(g, "Edit")) {
                gameFacade.delete(g);
                retGames.add(g);
            }
        }
        return retGames;
    }

    /**
     * Check if a user is logged, Find a game by id and check if this game has
     * an open access, Check if current user is already a player for this game,
     * Check if the game is played individually, Create a new team with a new
     * player linked on the current user for the game found.
     *
     * @param gameId
     * @return Response
     */
    @POST
    @Path("{id}/Player")
    public Response joinIndividually(@PathParam("id") Long gameId) throws WegasNoResultException {
        Response r = Response.status(Response.Status.UNAUTHORIZED).build();
        User currentUser = userFacade.getCurrentUser();
        if (currentUser != null) {
            r = Response.status(Response.Status.BAD_REQUEST).build();
            Game game = gameFacade.find(gameId);
            if (game != null) {
                r = Response.status(Response.Status.CONFLICT).build();
                if (game.getAccess() == Game.GameAccess.OPEN) {
                    Player player = playerFacade.checkExistingPlayer(game.getId(), currentUser.getId());
                    if (player == null) {
                        if (game.getGameModel().getProperties().getFreeForAll()) {
                            Team team = new Team("Individually-" + Helper.genToken(20), 1);
                            teamFacade.create(game.getId(), team); // return managed team
                            playerFacade.create(team, currentUser);
                            Team find = teamFacade.find(team.getId());
                            r = Response.status(Response.Status.CREATED).entity(find).build();
                        }
                    }
                }
            }
        }
        return r;
    }

    /**
     * Filter out the debug team
     *
     * @param game
     * @return the game without the debug team
     */
    private Game getGameWithoutDebugTeam(Game game) {
        if (game != null) {
            em.detach(game);
            List<Team> withoutDebugTeam = new ArrayList<>();
            for (Team teamToCheck : game.getTeams()) {
                if (!(teamToCheck instanceof DebugTeam)) {
                    withoutDebugTeam.add(teamToCheck);
                }
            }
            game.setTeams(withoutDebugTeam);
        }
        return game;
    }

    /**
     * @param token
     * @return game which matches the token, without its debug team
     */
    @GET
    @Path("/FindByToken/{token : .*}/")
    public Game findByToken(@PathParam("token") String token) {
        return getGameWithoutDebugTeam(gameFacade.findByToken(token));

    }

    /**
     * Resets all the variables of a given game
     *
     * @param gameId gameId id of game to reset
     * @return HTTP 200 Ok
     */
    @GET
    @Path("{gameId : [1-9][0-9]*}/Reset")
    public Response reset(@PathParam("gameId") Long gameId) {

        SecurityUtils.getSubject().checkPermission("Game:Edit:g" + gameId);

        gameFacade.reset(gameId);
        return Response.ok().build();
    }
}
