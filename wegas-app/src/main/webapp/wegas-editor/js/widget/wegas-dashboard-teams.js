/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * Wegas Team Dashboard - Extends of Basic Dashboard
 * @author Raphaël Schmutz <raph@hat-owl.cc>
 */
YUI.add('wegas-teams-dashboard', function(Y) {
    "use strict";

    Y.Wegas.TeamsDashboard = Y.Base.create("wegas-teams-dashboard", Y.Wegas.Dashboard, [], {
        BOUNDING_TEMPLATE: "<div class='dashboard dashboard--teams' />",
        initializer: function() {
            var game = Y.Wegas.Facade.Game.cache.getCurrentGame(),
                cardsData = [],
                icon = game.get("properties.freeForAll") ? "user" : "group";
            if (game) {
                game.get("teams").forEach(function(team) {
                    if ((game.get("@class") === "DebugGame" || team.get("@class") !== "DebugTeam") &&
                        team.get("players").length) {
                        var data = {
                            id: team.get("id"),
                            team: team,
                            title: game.get("properties.freeForAll") ?
                                team.get("players")[0].get("name") :
                                team.get("name"),
                            icon: icon,
                            blocs: []
                        };
                        cardsData.push(data);
                    }
                });
                // sort by title alphabetically, case insensitive (unless identical).
                cardsData.sort(function(a, b) {
                    var aUp = a.title.toUpperCase(),
                        bUp = b.title.toUpperCase(),
                        equalUp = (aUp === bUp);
                    if (aUp < bUp || (equalUp && a.title < b.title)) {
                        return -1;
                    }
                    if (aUp > bUp || (equalUp && a.title > b.title)) {
                        return 1;
                    }
                    return 0;
                });
                this.set("cardsData", cardsData);
            }
        }
    });
});
