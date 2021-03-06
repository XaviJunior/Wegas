/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013, 2014, 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Cyril Junod <cyril.junod at gmail.com>
 */
YUI.add("wegas-statemachineviewer", function(Y) {
    "use strict";
    var CONTENT_BOX = "contentBox", BOUNDING_BOX = "boundingBox", PARENT = "parent",
        SID = "sid", ENTITY = "entity", STATES = "states", CLICK = "click",
        Wegas = Y.Wegas, Plugin = Y.Plugin, StateMachineViewer, State, Transition, jp, Batch;
    StateMachineViewer = Y.Base.create("wegas-statemachineviewer",
        Y.Widget,
        [Wegas.Widget,
            Y.WidgetParent,
            Y.WidgetChild],
        {
            //TODO : minimap

            CONTENT_TEMPLATE: "<div><div class='scrollable'><div class='sm-zoom'></div></div></div>",
            BOUNDING_TEMPLATE: "<div><div class='wegas-statemachineviewer-legend'><div class='legend-initial-state'></div><div class='legend-currentState'></div></div></div>",
            /**
             *
             */
            initializer: function() {
                this.currentZoom = 1;
                this.nodes = {};
                this.events = [];
                /**
                 * storing callback on save
                 */
                this._queue = new Batch();
                /**
                 * storing failure callback on save
                 */
                this._fQueue = new Batch();
                this.jpLoaded = false;
                // Waiting for jsPlumb
                this.publish("jsPlumbLoaded", {
                    bubbles: false,
                    fireOnce: true,
                    async: true,
                    broadcast: true
                });
            },
            renderUI: function() {
                var header = this.toolbar.get("header");
                this._childrenContainer = this.get(CONTENT_BOX).one(".sm-zoom")
                    .setStyle("transform", "scale(1)");
                this.btnNew = new Y.Button({
                    label: "<span class=\"wegas-icon wegas-icon-new\"></span>New"
                }).render(header);
                this.btnNew.get(BOUNDING_BOX).addClass("wegas-advanced-feature");
                header.append('<div style="width:10px;display:inline-block;"></div>'); // Add a separator

                this.sliderZoom = new Y.Slider({
                    min: StateMachineViewer.MIN_ZOOM * StateMachineViewer.FACTOR_ZOOM,
                    max: StateMachineViewer.MAX_ZOOM * StateMachineViewer.FACTOR_ZOOM,
                    value: StateMachineViewer.FACTOR_ZOOM                           // default zoom
                }).render(header);
                header.append('<div style="width:10px;display:inline-block;"></div>'); // Add a separator

                this.btnZoomValue = new Y.Button({
                    label: "<span class=\"wegas-icon wegas-icon-zoom\"></span>100%"
                }).render(header);
                this.scrollView = Y.one(".scrollable").plug(Y.Plugin.PanelNode).panel;
                window.jsPlumb.ready(Y.bind(this.initJsPlumb, this));
            },
            bindUI: function() {
                var key, cb = this.get(CONTENT_BOX),
                    availableStates = this.get("availableStates");
                this.events.push(Wegas.Facade.Variable.after("update", this.syncUI, this));
                cb.on("mousedown", function() {
                    this.one(".scrollable").addClass("mousedown");
                });
                cb.on("mouseup", function() {
                    this.one(".scrollable").removeClass("mousedown");
                });
                this.on("*:destroy", function(e) {
                    /**
                     @HACK prevent tab from losing its child each time something is destroyed.
                     */
                    if (e.target !== this) {
                        e.stopPropagation();
                    }
                });
                this.after("entityChange", function(e) {
                    this.showOverlay();
                    this.onceAfter("jsPlumbLoaded", this.rebuild);
                });
                this.events.push(cb.on("mousewheel", Y.bind(this.onMouseWheel, this))); // Zoom on Ctrl+Wheel

                if (availableStates.length === 1) {
                    this.btnNew.on(CLICK, Y.bind(this.onNewState, this, availableStates[0]));
                } else {
                    var menu = [];
                    for (key in availableStates) {
                        if (availableStates.hasOwnProperty(key)) {

                            menu.push({
                                type: "Button",
                                label: availableStates[key],
                                on: {
                                    click: Y.bind(this.onNewState, this, availableStates[key])
                                }
                            });
                        }
                    }
                    this.btnNew.plug(Plugin.WidgetMenu, {
                        children: menu
                    });
                }

                this.sliderZoom.on("valueChange", function(e) {
                    this.setZoom(e.newVal / StateMachineViewer.FACTOR_ZOOM, true);
                }, this);
                this.btnZoomValue.on(CLICK, function() {
                    this.setZoom(1, false);
                }, this);
            },
            syncUI: function() {
                this.highlightCurrentState();
            },
            destructor: function() {
                for (var i in this.events) {
                    if (this.events.hasOwnProperty(i)) {
                        try {
                            this.events[i].detach();
                        } catch (e) {
                            Y.log("Destruction failed, can't detach event", "error", "Y.Wegas.StateMachineViewer");
                        }
                    }
                }
                jp.unbind();
                this.scrollView.destroy();
                this.sliderZoom.destroy();
                this.btnNew.destroy();
                this.btnZoomValue.destroy();
            },
            initJsPlumb: function() {
                jp = window.jsPlumb.getInstance({
                    Container: this.get(CONTENT_BOX).one(".sm-zoom").getDOMNode(),
                    Anchor: ["Continuous", {faces: ["top", "left", "bottom"]}],
                    //                    Anchor: ["Perimeter", {shape: "Rectangle", anchorCount: 120}],
                    ConnectionsDetachable: true,
                    ReattachConnections: true,
                    Endpoint: ["Dot", {
                        radius: 7
                    }],
                    EndpointStyle: {fillStyle: "none"},
                    //                EndpointHoverStyle: {fillStyle: "#456"},
                    Connector: ["Straight"],
                    Overlays: [["Arrow", {
                        location: 1,
                        width: 10,
                        length: 10,
                        foldback: 1
                    }]],
                    PaintStyle: {
                        lineWidth: 2,
                        outlineColor: "white",
                        strokeStyle: "darkgray",
                        outlineWidth: 4
                    },
                    HoverPaintStyle: {
                        strokeStyle: "#03283A"
                    }
                });
                jp.bind("connectionDetached", Y.bind(function(e) {
                    Y.log("connectionDetached", "info", "Wegas.StateMachineViewer");
                    if (Y.Widget.getByNode(e.target) === this) { // drop on panel
                        var node = this.onNewState(this.get("availableStates")[0], {
                            editorPosition: new Wegas.persistence.Coordinate({
                                x: parseInt(Y.one(e.target).getStyle("left")),
                                y: parseInt(Y.one(e.target).getStyle("top"))
                            })
                        });
                        Y.Widget.getByNode(e.source).addTransition(node);
                        Y.soon(function() {
                            jp.repaintEverything();
                        });
                    }
                }, this));
                jp.bind("connectionMoved", function(e) {
                    Y.log("connectionMoved", "info", "Wegas.StateMachineViewer");
                    var s = Y.Widget.getByNode("#" + e.newSourceId),
                        t = Y.Widget.getByNode("#" + e.newTargetId),
                        trans = e.connection.getParameter("transition");
                    Y.soon(function() {                                             // let move finish remove the old one
                        trans.disconnect();
                    });
                });
                jp.bind("connection", function(e, oe) {
                    if (oe && oe.constructor === MouseEvent) { //done with mouse
                        var s = Y.Widget.getByNode(e.source),
                            t = Y.Widget.getByNode(e.target);
                        s.addTransition(t, e.connection.getParameter("transition")); //make a programmatic connection
                        Y.soon(function() {                                          //remove the "drawn" one
                            jp.detach(e.connection, {
                                fireEvent: false
                            });
                        });
                    }
                });
                this.jpLoaded = true;
                this.setZoom(1, true);
                this.fire("jsPlumbLoaded");
            },
            rebuild: function() {
                if (!this.jpLoaded) {
                    this.hideOverlay();
                    return;
                }
                var sm = this.get(ENTITY);
                jp.setSuspendDrawing(true);
                this.nodes = {};
                this.destroyAll();
                if (sm) {
                    Y.Object.each(sm.get(STATES), this.addState, this);             // Render all states
                    this.each(function() {                                          // For each state,
                        // try {
                        Y.Object.each(this.get(ENTITY).get("transitions"), function(t) {// render transitions
                            this.add(new Wegas.Transition({
                                entity: t
                            }));
                        }, this);
                        //} catch (e) {
                        //    Y.error("Failed creating transition", e, "Y.Wegas.StateMachineViewer");
                        //}
                    });
                }
                this.highlightCurrentState();
                jp.setSuspendDrawing(false, true);
                this.hideOverlay();
                this.highlightUnusedStates();
            },
            onNewState: function(type, cfg) {
                var state, region = this.get(CONTENT_BOX).one(".scrollable").get("region"),
                    id;
                cfg = cfg || {
                    editorPosition: new Wegas.persistence.Coordinate({
                        x: parseInt(region.width / 4),
                        y: parseInt(region.height / 4)
                    })
                };

                id = this._genNextStateId();
                state = new Wegas.persistence[type](cfg);                           // State or DialogueState
                //this.setZoom(1, false);                                           // force setting default zoom to
                // have correct position
                this.get(ENTITY).get(STATES)[id.toString()] = state;
                this.save();
                return this.addState(state, id);
            },
            _genNextStateId: function() {
                var id = 0;
                Y.Object.each(this.get(ENTITY).get(STATES), function(s, key) {      // Lookup for an available id for the new state
                    id = Math.max(id, +key);
                });
                return id + 1;
            },
            addState: function(entity, id) {
                if (this.jpLoaded) {
                    this.nodes[+id] = this.add(new Wegas.State({
                        sid: +id,
                        entity: entity
                    })).item(0);
                    return this.nodes[+id];
                }
            },
            save: function(callback, failureCallback) {
                this._queue.add(callback);
                this._fQueue.add(failureCallback);
                if (this._saveTimer) {
                    this._saveTimer.cancel();
                }
                /**
                 * avoid multiple calls. Save last.
                 */
                this._saveTimer = Y.later(100, this, function() {
                    var entity = this.get(ENTITY),
                        DEFAULTCB = {
                            success: Y.bind(function(queue, e) {
                                this._saveOngoing = false;
                                if (this._saveWaiting) {
                                    this.save();
                                }
                                queue.call(e);
                                this.highlightUnusedStates();
                                this.hideOverlay();
                            }, this, this._queue),
                            failure: Y.bind(function(queue, e) {
                                this._saveOngoing = false;
                                if (this._saveWaiting) {
                                    this.save();
                                }
                                this.showMessage("error", e.response.data.message);
                                queue.call(e);
                                this.highlightUnusedStates();
                                this.hideOverlay();
                            }, this, this._fQueue)
                        };
                    if (entity) {
                        //this.showOverlay();
                        if (this._saveOngoing) {
                            this._saveWaiting = true;
                            return;
                        }
                        this._saveOngoing = true;
                        this._saveWaiting = false;
                        entity = Y.JSON.parse(Y.JSON.stringify(entity));
                        if (entity.id) {
                            Wegas.Facade.Variable.cache.put(entity, {
                                on: DEFAULTCB,
                                cfg: {updateEvent: false}
                            });
                        } else {
                            Wegas.Facade.Variable.cache.post(entity, {
                                on: DEFAULTCB
                            });
                        }
                        this._queue = new Batch();
                        this._fQueue = new Batch();
                    }
                });
            },
            onMouseWheel: function(e) {
                if ((e.ctrlKey || e.shiftKey) &&
                    this.get(CONTENT_BOX).one("#" + e.target.get("id"))) {                            // Zoom on Ctrl+Wheel

                    e.halt(true);
                    if (e.wheelDelta < 0) {
                        this.setZoom(this.currentZoom - 0.05, false);
                    } else {
                        this.setZoom(this.currentZoom + 0.05, false);
                    }
                }
            },
            setZoom: function(lvl, isFromSliderOrInit) {
                var oldZoom = this.currentZoom;
                this.currentZoom = Math.min(Math.max(lvl, StateMachineViewer.MIN_ZOOM), StateMachineViewer.MAX_ZOOM);
                this.scrollView.set("scrollX", this.scrollView.get("scrollX") / oldZoom * this.currentZoom);
                this.scrollView.set("scrollY", this.scrollView.get("scrollY") / oldZoom * this.currentZoom);
                this.get(CONTENT_BOX).one(".sm-zoom").setStyle("transform", 'scale(' + this.currentZoom + ')');
                jp.setZoom(this.currentZoom);
                this.btnZoomValue.set("label",
                    "<span class=\"wegas-icon wegas-icon-zoom\"></span>" + parseInt(this.currentZoom * 100) + "%");
                if (!isFromSliderOrInit) {
                    this.sliderZoom.set("value", this.currentZoom * StateMachineViewer.FACTOR_ZOOM);
                }

            },
            highlightCurrentState: function() {
                var currentStateNode, sm = this.get(ENTITY);
                if (!sm) {
                    return;
                }
                this.get(BOUNDING_BOX).all(".currentState").removeClass("currentState");
                currentStateNode = this.nodes[Wegas.Facade.Variable.cache.findById(sm.get("id")).getInstance().get("currentStateId")]; // Need to lookup in cache because current entity doesn't have instances
                if (currentStateNode) {
                    currentStateNode.get(BOUNDING_BOX).addClass("currentState");
                }
            },
            /**
             * add a css class(unusedState) to unreachable nodes.
             * Currently disabled.
             * @returns {undefined}
             */
            highlightUnusedStates: function() {
                return "DISABLED";                                                             //disable
                /*   var currentState, i,
                 initialNode = this.nodes[this.get(ENTITY).getInitialStateId()],
                 listStates = Y.Object.keys(this.nodes), // Prepare data
                 listPath = initialNode ? [initialNode] : [];
                 this.get(BOUNDING_BOX).all(".unusedState").removeClass("unusedState");
                 // Follow the path
                 while (listPath.length > 0) {
                 currentState = listPath.pop();
                 for (i in currentState.get(ENTITY).get("transitions")) {
                 listPath.push(this.nodes[currentState.get(ENTITY).get("transitions")[i].get("nextStateId")]);
                 }
                 listStates.splice(Y.Array.indexOf(listStates, "" + currentState.get(SID)), 1);
                 }
                 // Highlight
                 for (i in listStates) {
                 this.nodes[listStates[i]].get(BOUNDING_BOX).addClass("unusedState");
                 }*/
            }
        },
        {
            MIN_ZOOM: 0.3,
            MAX_ZOOM: 2,
            FACTOR_ZOOM: 1000,
            ATTRS: {
                entity: {
                    validator: function(o) {
                        return o instanceof Wegas.persistence.FSMDescriptor || o === null;
                    }
                },
                availableStates: {
                    value: ["State"]
                },
                availableTransitions: {
                    value: ["Transition"]
                }
            }
        }
    )
    ;
    State = Y.Base.create("wegas-state", Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
        BOUNDING_TEMPLATE: "<div>" +
                           "<div></div>" +
                           '<div class="wegas-state-text"></div>' + "<div class='transition-start'></div>" +
                           /* "<div class='state-toolbox'><div class='state-initial'></div><div class='state-delete'></div></div>" +*/
                           "</div>",
        CONTENT_TEMPLATE: null,
        initializer: function() {
            this.transitionsTarget = []; //store incoming transitions
        },
        renderUI: function() {
            this.get(BOUNDING_BOX).addClass(this.get(ENTITY) instanceof Wegas.persistence.DialogueState ?
                "sm-dialoguestate" : "sm-state")
                .setStyles({
                    left: this.get(ENTITY).get("editorPosition").get("x") + "px",
                    top: this.get(ENTITY).get("editorPosition").get("y") + "px"
                });
        },
        syncUI: function() {
            var label, entity = this.get(ENTITY),
                impact = Y.inputEx.WysiwygScript.formatScript(entity.get("onEnterEvent"));

            if (entity instanceof Wegas.persistence.DialogueState) {
                label = entity.get("text");
            } else if (entity.get("label")) {
                label = "<div style='text-align: center;'>" + entity.get("label") + "</div>";
            } else {
                label = impact;
            }
            this.get(BOUNDING_BOX).toggleClass("initial-state",
                this.get(PARENT).get(ENTITY).getInitialStateId() === this.get(SID));
            this.get(BOUNDING_BOX).one(".wegas-state-text").setHTML(label ||
                                                                    "<div style='text-align: center;'><em><br />Empty</em></div>")
                .set("title", impact ? "<b>Impact</b><br />" + impact : "").plug(Y.Plugin.Tooltip);
        },
        bindUI: function() {
            var stateMachine = this.get(PARENT),
                bb = this.get(BOUNDING_BOX);
            jp.draggable(bb.getDOMNode(), {
                containment: stateMachine.get(BOUNDING_BOX).one(".sm-zoom").getDOMNode(),
                stop: Y.bind(this.dragEnd, this)
            });
            jp.makeTarget(bb.getDOMNode(), {
                dropOptions: {
                    hoverClass: "droppable-state"
                }
            });
            jp.makeSource(bb.getDOMNode(), {
                filter: ".transition-start",
                maxConnections: 20
            });
            //bb.delegate(CLICK, this.deleteSelf, ".state-delete", this); // Delete state button
            //bb.delegate(CLICK, function(e) {
            //    e.halt(true);
            //    this.setAsInitial();
            //}, ".state-initial", this);
            bb.on(CLICK, function() {                                         // Label click
                var form;
                Plugin.EditEntityAction.hideRightTabs();
                this.editionHighlight();
                form = Plugin.EditEntityAction.showEditForm(this.get(ENTITY), Y.bind(this.setEntity, this));
                form.toolbar.add(new Y.Wegas.Button({
                    label: "<span class=\"wegas-icon wegas-icon-copy\"></span>Copy",
                    on: {
                        click: Y.bind(function() {
                            var editor = this.get(PARENT), state = this.get(ENTITY).toObject("id",
                                "transitions"), newNode;
                            state.editorPosition = new Wegas.persistence.Coordinate(state.editorPosition);
                            state.editorPosition.set("x", state.editorPosition.get("x") + 10);
                            state.editorPosition.set("y", state.editorPosition.get("y") + 10);
                            newNode = editor.onNewState(this.get(ENTITY).get("@class"), state);
                            newNode.get(BOUNDING_BOX).simulate(CLICK);
                        }, this)
                    }
                }));
                form.toolbar.add(new Y.Wegas.Button({
                    label: "<span class=\"wegas-icon wegas-icon-delete\"></span>Delete",
                    on: {
                        click: Y.bind(this.deleteSelf, this)
                    }
                }));
                if (this.get(PARENT).get(ENTITY).getInitialStateId() !== this.get(SID)) {
                    form.toolbar.add(new Y.Wegas.Button({
                        label: '<span class="wegas-icon state-initial"></span>Initial State',
                        on: {
                            click: Y.bind(this.setAsInitial, this)
                        }
                    }));
                }
            }, this);
            if (stateMachine.get("availableTransitions").length > 1) {          // Add transition selection menu
                this.menuNode = new Y.Node.create("<div></div>");
                bb.append(this.menuNode);
                this.menuNode.plug(Plugin.WidgetMenu, {
                    children: Y.Array.map(Y.Object.values(stateMachine.get("availableTransitions")), function(t) {
                        return {
                            type: "Button",
                            label: t,
                            on: {
                                click: Y.bind(this.onSelectTransitionMenu, this, t)
                            }
                        };
                    }, this)
                });
            }
        },
        editionHighlight: function() {
            Y.all(".wegas-editing").removeClass("wegas-editing");
            this.get(BOUNDING_BOX).addClass("wegas-editing");
        },
        setAsInitial: function() {
            var stateMachine = this.get(PARENT);
            stateMachine.get(ENTITY).setInitialStateId(this.get(SID));
            stateMachine.get(BOUNDING_BOX).all(".initial-state").removeClass("initial-state");
            this.syncUI();
            stateMachine.save();
        },
        onSelectTransitionMenu: function(type) {
            if (this.source !== null) {
                var tr = new Wegas.persistence[type]({// DialogueTransition || Transition
                    nextStateId: this.get(SID)
                });
                this.source.addTransition(this, tr);
                /*new Wegas.Transition({
                 entity: tr
                 }));
                 this.source.get(ENTITY).get("transitions").push(tr);
                 this.get(PARENT).save();*/
                this.source = null;
            }
        },
        dragEnd: function(e) {
            this.get(ENTITY).get("editorPosition").setAttrs({
                x: e.pos[0],
                y: e.pos[1]
            });
            this.get(PARENT).save();
        },
        setEntity: function(entity) {
            this.get(ENTITY).setAttrs({
                label: entity.label,
                onEnterEvent: entity.onEnterEvent,
                text: entity.text
            });
            Plugin.EditEntityAction.hideEditFormOverlay();
            Plugin.EditEntityAction.showFormMessage("success", "Saving ...");
            this.get(PARENT).save(function() {
                Plugin.EditEntityAction.showFormMessage("success", "Item updated");
            });
            this.syncUI();
        },
        addTransition: function(target, transition, connection) {
            var tr, fsmViewer = this.get(PARENT),
                availableTransitions = fsmViewer.get("availableTransitions"), newTr;
            if (transition) {
                tr = transition.get(ENTITY);
                tr.set("nextStateId", target.get(SID));
            } else if (availableTransitions.length === 1) {
                tr = new Wegas.persistence[availableTransitions[0]]({
                    nextStateId: target.get(SID)
                });
            } else if (availableTransitions.length > 1) {                              // Show menu to select transition type
                target.source = this;
                target.stateId = target.get(SID);
                target.menuNode.menu.show();
                return;
            } else {
                Y.log("No transition available");
                return;
            }
            newTr = this.add(new Wegas.Transition({
                entity: tr,
                connection: connection
            })).item(0);
            this.get(ENTITY).get("transitions").push(tr);
            this.get(PARENT).save();
            return newTr;
        },
        /**
         * User action delete Node.
         * @returns {undefined}
         */
        deleteSelf: function() {
            var fsmViewer = this.get(PARENT);
            if (this.get(SID) === fsmViewer.get(ENTITY).getInitialStateId()) {
                fsmViewer.showMessage("info", "Unable to delete initial state");
                return;
            }
            Y.Array.each(this.transitionsTarget.slice(0), function(t) {
                t.disconnect();
            });
            delete fsmViewer.get(ENTITY).get(STATES)[this.get(SID).toString()];
            delete fsmViewer.nodes[this.get(SID)];
            this.each(function(item) {                                          //disconnect all outgoing transition.
                item.disconnect();
            });
            this.destroy();
            //            if (this.get(SID) === fsmViewer.get(ENTITY).getInitialStateId()) {  // If the state was the
            // initial state, find a new one var id = +Y.Object.keys(fsmViewer.get(ENTITY).get(STATES))[0] || null; if
            // (id !== null) { fsmViewer.get(ENTITY).setInitialStateId(id);
            // fsmViewer.get(BOUNDING_BOX).all(".initial-state").removeClass("initial-state");
            // fsmViewer.nodes[id].syncUI(); } }
            fsmViewer.save();
        }
    }, {
        ATTRS: {
            sid: {},
            entity: {
                valueFn: function() {
                    return new Wegas.persistence.State();
                    //return new Wegas.persistence.DialogueState();
                },
                validator: function(o) {
                    return o instanceof Wegas.persistence.State;
                }
            }
        }
    });
    /**
     *
     */
    Transition = Y.Base.create("wegas-transition", Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
        initializer: function(cfg) {
            this.connection = cfg.connection;
        },
        renderUI: function() {
            var connection, parentTransitions,
                source = this.get(PARENT),
                target = this.getTargetState(),
                stateMachineViewer = source.get(PARENT),
                editAction = Y.bind(function() {                // Show edit form on connection click
                    var form;
                    Plugin.EditEntityAction.hideRightTabs();
                    this.editionHighlight();
                    form = Plugin.EditEntityAction.showEditForm(this.get(ENTITY), Y.bind(this.setEntity, this));
                    form.toolbar.add(new Y.Wegas.Button({
                        label: "<span class=\"wegas-icon wegas-icon-copy\"></span>Copy",
                        on: {
                            click: Y.bind(function() {
                                var entity = this.get(ENTITY).toObject("id"), tr;
                                tr = this.get(PARENT).addTransition(this.getTargetState(),
                                    new Transition({entity: new Wegas.persistence[entity["@class"]](entity)})
                                );
                                Y.one(tr.connection.getLabelOverlay().getElement()).simulate(CLICK);
                            }, this)
                        }
                    }));
                    form.toolbar.add(new Y.Wegas.Button({
                        label: "<span class=\"wegas-icon wegas-icon-delete\"></span>Delete",
                        on: {
                            click: Y.bind(this.disconnect, this)
                        }
                    }));

                }, this);
            //this.get(BOUNDING_BOX).appendTo(source.get(CONTENT_BOX).one(".sm-zoom"));
            /*
             fix bug where a state could have a transition without an existing target state.
             */
            if (!target || !source) {
                parentTransitions = source.get(ENTITY).get("transitions");
                parentTransitions.splice(Y.Array.indexOf(parentTransitions, this.get(ENTITY)), 1);
                stateMachineViewer.save();
                return;
            }
            //            if (!this.connection) {
            connection = this.connection = this.connection || jp.connect({
                source: source.get(BOUNDING_BOX).getDOMNode(),
                target: target.get(BOUNDING_BOX).getDOMNode(),
                deleteEndpointsOnDetach: true,
                connector: source.get(SID) === target.get(SID) ? ["StateMachine", {margin: 5}] : "Straight"

                //                parameters: {
                //                    transition: this
                //                }
            });
            connection.setParameter("transition", this);
            target.transitionsTarget.push(this);
            //            }
            this.updateLabel();
            connection.canvas.setAttribute("cursor", "pointer");
            connection.canvas.onclick = editAction;
            Y.one(connection.getLabelOverlay().getElement()).on(CLICK, editAction);
            //Y.one(this.connection.getOverlay("toolbox").getElement()).delegate(CLICK, function(e) {// Delete
            // transition button click e.halt("true"); this.disconnect(); }, ".transition-delete", this);
            // this.connection.canvas.onmouseover = function() {
            // this.labelNode.canvas.getElementsByClassName("transition-toolbox")[0].setAttribute("style",
            // "display:inline-block;"); }; this.connection.canvas.onmouseout = function() {
            // this.labelNode.canvas.getElementsByClassName("transition-toolbox")[0].setAttribute("style",
            // "display:none;"); };
        },
        disconnect: function() {
            var target = this.getTargetState(),
                index = Y.Array.indexOf(target.transitionsTarget, this),
                con = this.connection,
                transitions;
            if (Y.one(con.getLabelOverlay().getElement()).hasClass("wegas-editing")) { //Currently editing
                Plugin.EditEntityAction.hideRightTabs();
            }
            this.connection = null;
            jp.detach(con, {
                fireEvent: false
            });
            if (index > -1) {
                target.transitionsTarget.splice(index, 1);
            }
            transitions = this.get(PARENT).get(ENTITY).get("transitions");
            index = Y.Array.indexOf(transitions, this.get(ENTITY));
            if (index > -1) {
                transitions.splice(index, 1);
            }
            this.get(PARENT).get(PARENT).save();

            this.destroy();
        },
        setEntity: function(entity) {
            this.get(ENTITY).setAttrs(entity);
            Plugin.EditEntityAction.hideEditFormOverlay();
            this.updateLabel();
            Plugin.EditEntityAction.showFormMessage("success", "Saving ...");
            this.get(PARENT).get(PARENT).save(function() {
                Plugin.EditEntityAction.showFormMessage("success", "Item updated");
            });
        },
        editionHighlight: function() {
            Y.all(".wegas-editing").removeClass("wegas-editing");
            Y.one(this.connection.getLabelOverlay().getElement()).addClass("wegas-editing");
        },
        updateLabel: function() {
            var entity = this.get(ENTITY),
                condition = Y.inputEx.WysiwygScript.formatScript(entity.get("triggerCondition")),
                impact = Y.inputEx.WysiwygScript.formatScript(entity.get("preStateImpact")),
                label = entity instanceof Wegas.persistence.DialogueTransition ? entity.get("actionText") :
                    condition;

            this.connection.setLabel({
                label: label || "<em>Empty</empty>",
                cssClass: "transition-label"
            });
            Y.one(this.connection.getLabelOverlay().getElement()).plug(Y.Plugin.Tooltip, {
                content: (condition ? "<b>Condition</b><br />" + condition + "<br />" : "") +
                         (impact ? "<br /><b>Impact</b><br />" + impact : "")

            });
        },
        destructor: function() {
            if (this.connection) {
                jp.detach(this.connection, {
                    forceDetach: true,
                    fireEvent: false
                });
            }

        },
        getTargetState: function() {
            var targetStateId = this.get(ENTITY).get("nextStateId");
            return this.get(PARENT).get(PARENT).nodes[targetStateId];
        }
    }, {
        ATTRS: {
            entity: {
                valueFn: function() {
                    var e = new Wegas.persistence.Transition();
                    return e;
                }
            }
        }
    });
    Wegas.StateMachineViewer = StateMachineViewer;
    Wegas.State = State;
    Wegas.Transition = Transition;
    Batch = (function() {
        /**
         * asynchronous function queuing, all functions will run once they are called (Batch).
         */
        /**
         *
         * @constructor Q
         */
        var Q = function() {
            this._q = []; // function queue
            this._c = false; //commit,
            this._r = null; //response
        };
        Q.prototype = {
            add: function(cb) {
                if (typeof cb !== "function") {
                    return this;
                }
                if (this._c) { // already committed, run immediately
                    cb.apply(cb, this._r);
                } else {
                    this._q.push(cb);
                }
                return this;
            },
            /**
             * requirement met, call functions
             * @param {type} args any arguments
             * @returns {undefined}
             */
            call: function() {
                var cb;
                if (this._c) {
                    return;
                }
                this._r = arguments;
                this._c = true;
                while (this._q.length) {
                    cb = this._q.shift();
                    cb.apply(cb, this._r);
                }
            }
        };
        return Q;
    }());
})
;
