/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
package com.wegas.core.ejb;

import com.wegas.core.persistence.game.*;
import junit.framework.Assert;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.naming.NamingException;
import java.util.function.Function;

/**
 * @author Francois-Xavier Aeberhard (fx at red-agent.com)
 */
public class GameModelFacadeTest extends AbstractEJBTest {

    private static final Logger logger = LoggerFactory.getLogger(GameModelFacadeTest.class);

    @Test
    public void createGameModels() throws NamingException {
        logger.info("createGameModel()");
        final String name = "test";
        final String SCRIPTNAME = "defaultScript";
        final String SCRIPTCONTENT = "test";

        GameModel gameModel = new GameModel();
        gameModel.setName(name);
        gameModel.getClientScriptLibrary().put(SCRIPTNAME, new GameModelContent(SCRIPTCONTENT));
        gameModel.getScriptLibrary().put(SCRIPTNAME, new GameModelContent(SCRIPTCONTENT));
        gameModel.getCssLibrary().put(SCRIPTNAME, new GameModelContent(SCRIPTCONTENT));
        gameModel.getProperties().setPagesUri(SCRIPTCONTENT);

        final int size = gameModelFacade.findAll().size();
        gameModelFacade.create(gameModel);
        Assert.assertEquals(size + 1, gameModelFacade.findAll().size());

        gameModel = gameModelFacade.find(gameModel.getId());
        Assert.assertEquals(name, gameModel.getName());
        Assert.assertEquals(SCRIPTCONTENT, gameModel.getClientScriptLibrary().get(SCRIPTNAME).getContent());
        Assert.assertEquals(SCRIPTCONTENT, gameModel.getProperties().getPagesUri());
        Assert.assertEquals(SCRIPTCONTENT, gameModel.getCssLibrary().get(SCRIPTNAME).getContent());
        Assert.assertEquals(SCRIPTCONTENT, gameModel.getScriptLibrary().get(SCRIPTNAME).getContent());

        gameModelFacade.remove(gameModel.getId());
        Assert.assertEquals(size, gameModelFacade.findAll().size());
    }

    @Test
    public void createGame() throws NamingException {
        logger.info("createGame()");
        final String GAMENAME = "test-gamemodel";
        final String GAMENAME2 = "test-gamemodel2";
        final String NAME = "test-game";
        final String TOKEN = "token-for-testGame";

        GameFacade gf = lookupBy(GameFacade.class);
        TeamFacade tf = lookupBy(TeamFacade.class);
        PlayerFacade pf = lookupBy(PlayerFacade.class);

        // Create a game model
        GameModel gameModel = new GameModel(GAMENAME);
        final int size = gameModelFacade.findAll().size();
        gameModelFacade.create(gameModel);
        Assert.assertEquals(size + 1, gameModelFacade.findAll().size());

        // Edit this gam
        GameModel gm2 = gameModelFacade.update(gameModel.getId(), new GameModel(GAMENAME2));
        Assert.assertEquals(GAMENAME2, gm2.getName());

        // Create a game, a team and a player
        Game g = new Game(NAME, TOKEN);
        gf.create(gameModel.getId(), g);

        Game g2 = gf.findByToken(TOKEN);
        Assert.assertEquals(NAME, g2.getName());

        Team t = new Team();
        t.setName("test-team");
        tf.create(g.getId(), t);
        Assert.assertNotNull(t.getId());

        Player p = new Player();

        pf.create(t.getId(), p);
        Assert.assertNotNull(p.getId());

        gameModelFacade.remove(gameModel.getId());
        Assert.assertEquals(size, gameModelFacade.findAll().size());
    }

    @Test
    public void createMultipleTeam() throws NamingException, InterruptedException {
        GameFacade gf = lookupBy(GameFacade.class);
        final TeamFacade teamFacade = lookupBy(TeamFacade.class);

        final int size = gameModelFacade.findAll().size();

        GameModel gameModel = new GameModel("TESTGM");
        gameModelFacade.create(gameModel);

        Game g = new Game("TESTGAME", "xxx");
        gf.create(gameModel.getId(), g);
        Team t1 = new Team();
        Team t2 = new Team();
        t1.setName("test-team");
        t2.setName("test-team");
        final Function<Team, Runnable> runCreateTeam = (Team team) -> () -> teamFacade.create(g.getId(), team);
        final Thread thread1 = TestHelper.start(runCreateTeam.apply(t1));
        final Thread thread2 = TestHelper.start(runCreateTeam.apply(t2));
        thread1.join();
        thread2.join();
        Assert.assertFalse(t1.getName().equals(t2.getName()));
        Assert.assertEquals(size + 1, gameModelFacade.findAll().size());

        gameModelFacade.remove(gameModel.getId());
        Assert.assertEquals(size, gameModelFacade.findAll().size());
    }
}
