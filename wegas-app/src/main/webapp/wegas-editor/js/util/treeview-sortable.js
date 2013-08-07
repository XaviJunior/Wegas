/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add("treeview-sortable", function(Y) {
    "use strict";

    var HOST = "host",
            NODE = 'node',
            PARENT_NODE = 'parentNode',
            NODES = 'nodes',
            CONTENTBOX = 'contentBox',
            TreeViewSortable;

    TreeViewSortable = Y.Base.create("treeview-sortable", Y.Plugin.Base, [], {
        initializer: function() {
            if (!(this.get(HOST) instanceof Y.TreeView)) {
                Y.log("TreeView filter host must be a TreeView", "warn", "TreeViewFilter");
                return;
            }

            this.afterHostEvent("render", function() {
                var host = this.get(HOST),
                        cb = host.get(CONTENTBOX);

                cb.setStyles({
                    overflowY: "auto",
                    overflowX: "hidden"
                });

                this.sortable = new NestedSortable({
                    container: cb,
                    nodes: 'li',
                    opacity: '.2',
                    invalid: ".wegas-editor-dummy",
                    moveType: "insert"
                            // handles: ['.yui3-treenode-content-icon', '.yui3-treeleaf-content-icon']
                            // opacityNode: "dragNode",

                });
                this.sortable.treeSortPlg = this;
//                this.sortable.delegate.dd.plug(Y.Plugin.DDNodeScroll, {
//                    node: cb,
//                    horizontal: false
//                });
                var addedNode, newNode;

                this.sortable.delegate.dd.on("drag:start", function(ev) {
                    newNode = Y.Node.create("<ul></ul>");
                    newNode.setAttribute("id", Y.guid());
                    this.syncDummies();
                }, this);

                this.sortable.delegate.dd.on("drag:over", function(ev) {
                    if (addedNode !== undefined) {                              // remove it from where it was
                        addedNode.remove();
                    }
                    var dragNode = ev.drag.get("node"),
                            dropNode = ev.drop.get("node"),
                            found = this.testGroups(dragNode, dropNode),
                            tOl = dropNode.one("ul");                           // tOl is looking for a child ol below the li

                    console.log("drag:over(", dropNode.get("nodeName").toLowerCase(), tOl ? "has tol" : "no tol",
                            found,
                            dropNode._node.className,
                            dropNode.one(".yui3-treenode-content-label") ? dropNode.one(".yui3-treenode-content-label").getHTML() : "nolabel");

                    switch (dropNode.get("nodeName").toLowerCase()) {           // if we've over an li, add the new ol child block
                        case "li":
                            if (tOl) {                                          // try and append it to existing ol on the target
                                try {
                                    if (found) {
                                        tOl.append(ev.drag.get("node"));
                                    }
                                } catch (e) {
                                }
                            } else {                                            // else add a new ol to the target
                                try {
                                    return;
                                    if (found) {
                                        dropNode.append(newNode);               // try adding newNode
                                        newNode.append(ev.drag.get("node"));
                                        addedNode = newNode;
                                    }
                                } catch (e) {
                                }
                            }
                            break;

                        case "ul":                                              // if we're over an ol, just add this as a new li child
                            try {
                                if (found) {
                                    dropNode.append(ev.drag.get("node"));
                                    return;

                                }
                            } catch (e) {
                            }
                            break;

                        default:
                            break;
                    }
                }, this);

                this.sortable.delegate.dd.after('drag:end', function(ev) {
                    var node = this.sortable.delegate.get('currentNode'),
                            //  prev = node.previous(), next = node.next(),
                            dragWidget = Y.Widget.getByNode(node),
                            dropNode = node.get("parentNode"),
                            dropWidget = Y.Widget.getByNode(dropNode),
                            index = dropNode.get("children").indexOf(node),
                            targetNode = ev.target.get("node");

                    Y.log("onDragEnd()", "info", "Wegas.VariableTreeView");


                    addedNode = undefined;
                    newNode = undefined;
                    targetNode.removeAttribute("style");// DD somewhere sets some element styles, which mess up alignment somewhere in IE

                    dropWidget.add(dragWidget, index);                                  // Update treeview
                    this.fire("sort", {
                        dragWidget: dragWidget,
                        dropWidget: dropWidget,
                        index: index
                    });                                                                 // Fire sorted event
                    this.syncDummies();

                }, this);
                //this.sortable.delegate.dd.after('drag:over', this.syncDummies, this);
            });
            this.afterHostMethod("syncUI", this.syncDummies, this);
        },
        testGroups: function(dragNode, dropNode) {
            var i, groups = this.get("nodeGroups");
            if (groups) {
                for (i = 0; i < groups.length; i += 1) {                        // Added custom class mathing for node groups
                    if (dragNode.hasClass(groups[i].nodeClass) && dropNode.hasClass(groups[i].nodeClass)) {
                        return true;
                    }
                }
            }
            return false;
        },
        syncDummies: function() {
            var cb = this.get(HOST).get(CONTENTBOX), i,
                    nodeGroups = this.get("nodeGroups");
            // cb.all(".wegas-editor-dummy").remove(true);
            cb.all(".wegas-editor-dummy").each(function(n) {
                if (n.ancestor("ul").get("children").size() > 1) {
                    n.remove(true);
                }
            });
            for (i = 0; i < nodeGroups.length; i += 1) {                       // Add dummies to allow drag on empty nodes
                cb.all(nodeGroups[i].parentNode + " ul:empty")
//                        .append("<li class=\"wegas-editor-dummy " + nodeGroups[i].nodeClass + " \">Empty<ul></ul></li>");
                        .append('<li class="yui3-widget yui3-treenode wegas-editor-listitem yui3-dd-drop wegas-editor-dummy" tabindex="1"><div class="content-header yui3-treenode-content-header"><span class="yui3-treenode-content-label" ><i>empty</i></span></div></li>');
            }
            this.sortable.sync();
        },
        destructor: function() {
            this.sortable.destroy();
        }

    }, {
        NAME: "TreeViewSortable",
        NS: "sortable",
        ATTRS: {
            /*
             * Defines groups of items to be moved and items on which they can be dropped, even when they are empty.
             */
            nodeGroups: {
                value: [{
                        nodeClass: "yui3-widget",
                        parentNode: ".yui3-widgget"
                    }]
            }
        }
    });

    Y.namespace("Plugin").TreeViewSortable = TreeViewSortable;

    /**
     * Extend so in works with nested lists
     *
     * @returns {undefined}
     */
    function NestedSortable() {
        NestedSortable.superclass.constructor.apply(this, arguments);
    }
    Y.extend(NestedSortable, Y.Sortable, {
        _onDropEnter: function(e) {
            var dropNode = e.drop.get(NODE),
                    dragNode = e.drag.get(NODE);

            // console.log("_onDropEnter(" + dropNode._node.className + ", " + dropNode.one(".yui3-treenode-content-label").getHTML() + ")");

            if (!this.treeSortPlg.testGroups(dragNode, dropNode)) {
                console.log("rejected1");
                return;
            }
            NestedSortable.superclass._onDropEnter.apply(this, e);

        },
        _onDragOver: function(e) {

            var dragNode = e.drag.get(NODE),
                    dropNode = e.drop.get(NODE);

            console.log("_onDragOver(", dropNode._node.className,
                    (dropNode.one(".yui3-treenode-content-label")) ?
                    dropNode.one(".yui3-treenode-content-label").getHTML() : "no label");

            if (!this.treeSortPlg.testGroups(dragNode, dropNode)) {
                return;
            }

            // is drop a child of drag?  - this is the bit that's added:
            if (e.drag.get(NODE).contains(e.drop.get(NODE))) {
                return;
            }
            NestedSortable.superclass._onDragOver.call(this, e);
        }
    });
});
