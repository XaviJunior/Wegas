/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileOverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add("wegas-preview-fullscreen", function(Y) {
    "use strict";

    Y.Plugin.PreviewFullScreen = Y.Base.create("wegas-preview-fullscreen", Y.Plugin.Base, [], {
        initializer: function() {
            this.afterHostEvent("render", this.render);
        },
        render: function() {
            var host = this.get('host');

            if (host.toolbar) {
                this.swapNode = Y.Node.create("<span class='wegas-fullscreen'></span>");
                Y.one("body").append(this.swapNode);

                var fullScreenButton = host.toolbar.add({
                    type: "ToggleButton",
                    label: "<span class='wegas-icon wegas-icon-fullscreen'></span>Fullscreen"
                }).item(0);

                fullScreenButton.after("pressedChange", function(event) {
                    host.get("boundingBox").swap(this.swapNode);
                    if (event.newVal) {
                        Y.all("body > .wegas-editview").hide();
                    } else {
                        Y.all("body > .wegas-editview").show();
                    }
                }, this);
            }
        },
        destructor: function() {
            if (this.swapNode) {
                this.swapNode.destroy(true);
            }
        }
    }, {
        NS: "preview"
    });
    Y.Plugin.BlockAction = Y.Base.create("wegas-blockaction", Y.Plugin.Base, [], {
        initializer: function() {

            Y.publish("playerAction", {
                emitFacade: true
            });
            this.handler = Y.on("playerAction", function(e) {
                if (this.get("host").get("parent").get("selected") && this.doBlock(e)) { // @hack the plugin is only active when the preview tab is selected
                    e.halt(true);
                }
            }, this);
        },
        doBlock: function() {
            return true;
        },
        destructor: function() {
            this.handler.detach();
        }
    }, {
        NS: "BlockAction"
    });

    Y.Plugin.BlockAnyAction = Y.Base.create("wegas-blockanyaction", Y.Plugin.Base, [], {
        initializer: function() {

            Y.publish("playerAction", {
                emitFacade: true
            });
            this.handler = Y.on("playerAction", function(e) {
                e.halt(true);
            }, this);
        },
        doBlock: function() {
            return true;
        },
        destructor: function() {
            this.handler.detach();
        }
    }, {
        NS: "BlockAction"
    });
    Y.Plugin.ToggleBlockAction = Y.Base.create("wegas-toggle-blockaction", Y.Plugin.BlockAction, [], {
        initializer: function() {
            this.afterHostEvent("render", this.render);
        },
        doBlock: function() {
            return this.viewButton.get("pressed");
        },
        render: function() {
            var host = this.get('host');

            if (host.toolbar) {
                this.viewButton = host.toolbar.add({
                    type: "ToggleButton",
                    pressed: true
                }).item(0);

                this.viewButton.after("pressedChange", this.sync, this);
                this.sync();
            }
        },
        sync: function() {
            this.viewButton.set("label", this.viewButton.get("pressed") ?
                "<span class='wegas-icon wegas-icon-lock'></span>Block actions"
                : "<span class='wegas-icon wegas-icon-unlock'></span>Allow actions");
        },
        destructor: function() {
            this.viewButton.destroy();
        }
    }, {
        NS: "BlockAction"
    });
});
