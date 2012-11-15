/*
 * Wegas
 * http://www.albasim.com/wegas/
 *
 * School of Business and Engineering Vaud, http://www.heig-vd.ch/
 * Media Engineering :: Information Technology Managment :: Comem
 *
 * Copyright (C) 2012
 */

/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

YUI.add('wegas-pageloader', function(Y) {
    "use strict";

    var CONTENTBOX = 'contentBox', PageLoader;

    PageLoader = Y.Base.create("wegas-pageloader", Y.Widget, [Y.WidgetChild, Y.WidgetParent, Y.Wegas.Widget, Y.Wegas.persistence.Editable], {
        // *** Private Methods ***/
        isLoadingALoop: function(pageId) {                                     //Page loader mustn't load the page who contain himself.
            var k, isALoop = false;
            for (k in PageLoader.pageLoaderInstances) {
                if (PageLoader.pageLoaderInstances[k].get('id') === this.get('id')) { //don't check pageId of current instance and contained childrens
                    break;
                }
                if (pageId === PageLoader.pageLoaderInstances[k].get('pageId')
                    || pageId === PageLoader.pageLoaderInstances[k].get('variable.evaluated')) {
                    isALoop = true;
                    Y.log("Attempt to load the PageLoader of this PageLoader's instance is aborted.", 'warn', 'Wegas.PageLoader');
                }
            }
            return isALoop;
        },
        // *** Lifecycle Methods ***/
        initializer: function() {
            PageLoader.pageLoaderInstances[this.get("pageLoaderId")] = this;    // We keep a references of all loaded PageLoaders
            this.currentPageId = null;
            if (this.get("defaultPageId")) {
                this.set("pageId", this.get("defaultPageId"));
            }
        },
        bindUI: function() {
            //Y.Wegas.app.dataSources.Page.after("response", this.syncUI, this);
            Y.Wegas.PageFacade.rest.after("pageUpdated", function(e) {
                if (e.page && (+e.page["@pageId"] === +this.get("pageId"))) {
                    this.currentPageId = null; // @hack force update
                    this.syncUI();
                }
            }, this);
            var onUpdate = function(e) {
                if (+this.get("variable.evaluated") !== +this.get('pageId')) {
                    this.syncUI();
                }
            };
            Y.Wegas.app.dataSources.VariableDescriptor.after("response", onUpdate, this);
            Y.Wegas.app.after('currentPlayerChange', onUpdate, this);

        },
        syncUI: function() {
            var val = this.get("variable.evaluated");
            if (val && val.getInstance().get('value')) {                        // If there is a variable to refresh
                this.set("pageId", val.getInstance().get('value'));
            } else {                                                            // Otherwise use pageId (in case the setter has not been called yet)
                this.set("pageId", this.get("pageId"));
            }
        }
    }, {
        ATTRS: {
            pageLoaderId: {},
            defaultPageId: {
                type: "string"
            },
            pageId: {
                type: "string",
                "transient": true,
                setter: function(val) {
                    if (!val || val === this.currentPageId || this.isLoadingALoop(val)) {// If the widget is currently being loaded, escape
                        return val;
                    }
                    var widgetCfg = Y.Wegas.PageFacade.rest.getPage(val),
                    oldWidget = this.get("widget");
                    if (!widgetCfg) {
                        return val;
                    }
                    this.currentPageId = val;
                    if (this.get("widget")) {
                        this.get("widget").destroy();                           // @fixme we should remove the widget instead of destroying it
                    }
                    this.get(CONTENTBOX).empty();
                    this.showOverlay();
                    try {
                        Y.Wegas.Widget.use(widgetCfg, Y.bind(function(cfg) {   // Load the subwidget dependencies
                            var widget = Y.Wegas.Widget.create(cfg);            // Render the subwidget
                            widget.render(this.get(CONTENTBOX));
                            this.set("widget", widget);
                            this.hideOverlay();
                        }, this, widgetCfg));
                    } catch (e) {
                        Y.log('renderUI(): Error rendering widget: ' + (e.stack || e), 'error', 'Wegas.PageLoader');
                    }
                    return val;
                }
            },
            /**
             * The target variable, returned either based on the name attribute,
             * and if absent by evaluating the expr attribute.
             */
            variable: {
                getter: Y.Wegas.persistence.Editable.VARIABLEDESCRIPTORGETTER
            },
            widget: {
                "transient": true
            }
        },

        pageLoaderInstances: [],

        find: function (id) {
            return PageLoader.pageLoaderInstances[id];
        }
    });

    Y.namespace('Wegas').PageLoader = PageLoader;
});
