/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileOverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add('wegas-popuplistener', function(Y) {
    "use strict";

    var PopupListener, HOST = "host";

    PopupListener = Y.Base.create("wegas-popuplistener", Y.Plugin.Base, [], {
        DEFAULT_CONFIG: function() {
            return {
                align: {
                    node: this.get(HOST).get(this.get("alignAttr")),
                    points: [Y.WidgetPositionAlign.TC, Y.WidgetPositionAlign.TC]
                },
                buttons: {
                    footer: [{
                            name: 'proceed',
                            label: 'OK',
                            action: "exit"
                        }]
                },
                modal: false,
                centered: false,
                width: "80%"
            };
        },
        initializer: function() {
            var bb = this.get(HOST).get(this.get("targetAttr"));

            this.handlers = [
                bb.on("dom-message:showPopup", this._show, this),
                bb.on("dom-message:error", this._system, this, "error"),
                bb.on("dom-message:success", this._system, this, "success"),
                bb.on("dom-message:info", this._system, this, "info"),
                bb.on("dom-message:warn", this._system, this, "warn")
            ];

            this.onHostEvent("*:showOverlay", this.onShowOverlay);
            this.onHostEvent("*:hideOverlay", this.onHideOverlay);
            this.onHostEvent("*:message", this.onShowMessage);

            if (this.get("showServerMessages")) {
                this.handlers.push(Y.Wegas.Facade.Variable.on("popupEvent", function(e) {
                    this.get(HOST).showMessage("info", e.content);
                }, this));
            }
        },
        destructor: function() {
            for (var i = 0; i < this.handlers.length; i += 1) {
                this.handlers[i].detach();
            }
            this.hideOverlay();
        },
        _show: function(event) {
            event = Y.mix(this.DEFAULT_CONFIG(), PopupListener.stringToObject(event), true, null, 0, false);
            var panel = new Y.Wegas.Panel(event).render(this.get(HOST).get(this.get("targetAttr")));
            if (event.timeout) {
                setTimeout(function() {
                    panel.get("destroyed") || panel.exit();
                }, event.timeout);
            }
        },
        _system: function(event, lvl) {
            event = PopupListener.stringToObject(event);
            this._show({
                content: "<div class='icon icon-" + lvl + "'>" + ((event && event.content) ? event.content : "") + "</div>",
                timeout: event.timeout ? event.timeout : false
            });
        },
        onShowMessage: function(e) {
            if (this.get("filter") && this.get("filter").indexOf(e.level) > -1) {
                return;
            }

            if (e.level === "successPopup")
                e.level = "success";                                       // @hack to create popups that will not be displayed in the toolbar

            if (e.level) {
                e.content = "<div class='icon icon-" + e.level + "'>" + (e.content) + "</div>";
            }
            this._show(e);
            e.halt(true);
        },
        onShowOverlay: function(e) {
            this.get(HOST).get(this.get("targetAttr"))
                .addClass("wegas-loading")
                .prepend("<div class='wegas-loading-overlay'></div>");

            e.halt(true);

            Y.later(5000, this, function() {
                this.get(HOST).get(this.get("targetAttr")).all(".wegas-loading-overlay").addClass("wegas-loading-long");
            });
        },
        onHideOverlay: function(e) {
            this.hideOverlay();
            e.halt(true);
        },
        hideOverlay: function() {
            this.get(HOST).get(this.get("targetAttr"))
                .removeClass("wegas-loading")
                .all("> .wegas-loading-overlay").remove(true);
        }
    }, {
        NS: "popuplistener",
        ATTRS: {
            filter: {},
            targetAttr: {
                value: "boundingBox"
            },
            alignAttr: {
                value: "contentBox"
            },
            showServerMessages: {
                value: false
            }
        },
        stringToObject: function(o) {
            return (Y.Lang.isString(o)) ? {content: o} : o;
        }
    });
    Y.Plugin.PopupListener = PopupListener;
});
