/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */

/**
 *
 * @fileoverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add("wegas-entitychooser", function(Y) {
    "use strict";
    var CONTENTBOX = "contentBox", EntityChooser, EntityChooser2;

    EntityChooser = Y.Base.create("wegas-entitychooser",
        Y.Widget,
        [Y.WidgetChild,
            Y.Wegas.Widget,
            Y.Wegas.Editable],
        {
            CONTENT_TEMPLATE: "<div><ul class='chooser-entities'></ul><div class='chooser-widget'></div></div>",
            renderUI: function() {
                var items = (this.get("variable.evaluated") ? (this.get("flatten") ? this.get("variable.evaluated").flatten() : this.get("variable.evaluated").get("items")) : []),
                    i, entityBox = this.get(CONTENTBOX).one(".chooser-entities"), length = items.length,
                    filter = [];


                if (this.get("classFilter")) {
                    if (!Y.Lang.isArray(this.get("classFilter"))) {
                        filter.push(this.get("classFilter"));
                    } else {
                        filter = filter.concat(this.get("classFilter"));
                    }
                }

                for (i = 0; i < length; i += 1) {
                    if (filter.length === 0 || filter.find(function(item) {
                        return item === items[i].get("@class");
                    })) {
                        if ((!items[i].getInstance().getAttrs().hasOwnProperty("active") ||
                            items[i].getInstance().get("active")) &&
                            (!items[i].getInstance().getAttrs().hasOwnProperty("enabled") ||
                                items[i].getInstance().get("enabled"))) {
                            entityBox.append("<li class='chooser-entity' data-name='" + items[i].get("name") + "'>" +
                                (items[i].get("title") || items[i].get("label")) + "</li>");
                        }
                    }
                }
            },
            bindUI: function() {
                this.get(CONTENTBOX).delegate("click", function(e) {
                    this.genWidget(e.target.getData("name"));
                    this.get(CONTENTBOX).all(".chooser-choosen").removeClass("chooser-choosen");
                    e.target.addClass("chooser-choosen");
                }, ".chooser-entities .chooser-entity", this);
            },
            genWidget: function(name) {
                var cfg = this.get("widget"),
                    ctx = this;
                // TODO fetch type
                Y.Wegas.Editable.use(cfg, function(Y) {
                    if (ctx.widget) {
                        ctx.widget.set(ctx.get("widgetAttr"), {name: name});
                    } else {
                        cfg[ctx.get("widgetAttr")] = {name: name};
                        Y.Wegas.use(cfg, Y.bind(function() {
                            this.widget = Y.Wegas.Widget.create(cfg);
                            this.widget.render(this.get(CONTENTBOX).one(".chooser-widget"));
                            this.widget.on(["*:message", "*:showOverlay", "*:hideOverlay"], this.fire, this); // Event on the loaded
                        }, ctx));
                    }
                });
            },
            syncUI: function() {

            },
            destructor: function() {
                this.widget && this.widget.destroy();
            }

        },
        {
            ATTRS: {
                variable: {
                    getter: Y.Wegas.Widget.VARIABLEDESCRIPTORGETTER,
                    _inputex: {
                        _type: "variableselect",
                        legend: "Folder",
                        classFilter: ["ListDescriptor"]
                    }
                },
                widget: {
                    value: {type: "HistoryDialog"},
                    getter: function(v) {
                        return Y.JSON.parse(Y.JSON.stringify(v));
                    },
                    _inputex: {
                        _type: "group",
                        fields: [{
                                type: "string",
                                name: "type",
                                label: "Type"
                            }]
                    }
                },
                widgetAttr: {
                    value: "dialogueVariable",
                    type: "string"
                },
                flatten: {
                    type: "boolean",
                    value: "true"
                },
                classFilter: {
                    type: "array",
                    _inputex: {
                        elementType: {
                            required: true,
                            type: "select",
                            choices: Y.Wegas.persistence.AVAILABLE_TYPES
                        }
                    }
                }
            }
        });
    Y.Wegas.EntityChooser = EntityChooser;




    EntityChooser2 = Y.Base.create("wegas-entitychooser2",
        Y.Widget,
        [Y.WidgetChild,
            Y.Wegas.Widget,
            Y.Wegas.Editable],
        {
            CONTENT_TEMPLATE: "<div><ul class='chooser-entities'></ul><div class='chooser-widget'></div></div>",
            initializer: function() {
            },
            renderUI: function() {
                var items = (this.get("variable.evaluated") ? (this.get("flatten") ? this.get("variable.evaluated").flatten() : this.get("variable.evaluated").get("items")) : []),
                    i, entityBox = this.get(CONTENTBOX).one(".chooser-entities"), length = items.length,
                    filter = Y.Object.keys(this.get("widgets"));

                for (i = 0; i < length; i += 1) {
                    if (filter.find(function(item) {
                        return item === items[i].get("@class");
                    })) {
                        if ((!items[i].getInstance().getAttrs().hasOwnProperty("active") ||
                            items[i].getInstance().get("active")) &&
                            (!items[i].getInstance().getAttrs().hasOwnProperty("enabled") ||
                                items[i].getInstance().get("enabled"))) {
                            entityBox.append("<li class='chooser-entity' data-type='" + items[i].get("@class") + "'data-name='" + items[i].get("name") + "'>" +
                                (items[i].get("title") || items[i].get("label")) + "</li>");
                        }
                    }
                }
            },
            bindUI: function() {
                this.get(CONTENTBOX).delegate("click", function(e) {
                    this.genWidget(e.target.getData("type"), e.target.getData("name"));
                    this.get(CONTENTBOX).all(".chooser-choosen").removeClass("chooser-choosen");
                    e.target.addClass("chooser-choosen");
                }, ".chooser-entities .chooser-entity", this);
            },
            genWidget: function(type, name) {
                var widgetConfig = this.get("widgets")[type],
                    ctx = this, cfg;
                cfg = widgetConfig.widget;

                Y.Wegas.Editable.use(cfg, function(Y) {
                    if (ctx._currentWidgetType === type) {
                        ctx._currentWidget.set(widgetConfig.widgetAttr, {name: name});
                    } else {
                        cfg[widgetConfig.widgetAttr] = {name: name};
                        Y.Wegas.use(cfg, Y.bind(function() {
                            this._currentWidget && this._currentWidget.destroy();

                            this._currentWidgetType = type;
                            this._currentWidget = Y.Wegas.Widget.create(cfg);
                            this._currentWidget.render(this.get(CONTENTBOX).one(".chooser-widget"));
                            // propagates selected event to the "parent"
                            this._currentWidget.on(["*:message", "*:showOverlay", "*:hideOverlay"], this.fire, this);
                        }, ctx));
                    }
                });
            },
            syncUI: function() {

            },
            destructor: function() {
                this._currentWidget && this._currentWidget.destroy();
            }
        },
        {
            ATTRS: {
                variable: {
                    getter: Y.Wegas.Widget.VARIABLEDESCRIPTORGETTER,
                    _inputex: {
                        _type: "variableselect",
                        legend: "Folder",
                        classFilter: ["ListDescriptor"]
                    }
                },
                widgets: {
                    optional: false,
                    _inputex: {
                        _type: "hashlist",
                        keyField: "dataType",
                        valueField: "config",
                        elementType: {
                            type: "combine",
                            fields: [{
                                    name: "dataType",
                                    type: "select",
                                    value: "DialogueDescriptor",
                                    choices: Y.Wegas.persistence.AVAILABLE_TYPES
                                }, {
                                    name: "config",
                                    type: "group",
                                    fields: [{
                                            name: "widget",
                                            type: "group",
                                            value: {type: "HistoryDialogue"},
                                            fields: [{
                                                    type: "string",
                                                    name: "type",
                                                    label: "Type"
                                                }]
                                        }, {
                                            name: "widgetAttr",
                                            value: "dialogueVariable",
                                            type: "string"
                                        }]
                                }
                            ]
                        }
                    }
                },
                flatten: {
                    type: "boolean",
                    value: "true"
                }
            }
        });
    Y.Wegas.EntityChooser2 = EntityChooser2;

});
