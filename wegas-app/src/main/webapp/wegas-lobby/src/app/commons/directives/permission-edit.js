/*
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2015 School of Business and Engineering Vaud, Comem
 * Licensed under the MIT License
 */
 /*global _*/
angular.module("wegas.directive.permission.edit", [])
    .directive('permissionEdit', function($q, SessionsModel, ScenariosModel) {
        "use strict";

        var DANGER_BG_CLASS = "bg-danger";
        var PERMISSIONS = {
            GameModel: [{
                value: "*",
                label: "All permissions"
            }, {
                value: "Edit",
                label: "Edit"
            }, {
                value: "Instantiate",
                label: "Instantiate"
            }, {
                value: "Duplicate",
                label: "Copy"
            }, {
                value: "View",
                label: "View"
            }],
            Game: [{
                value: "*",
                label: "All permissions"
            }, {
                value: "Edit",
                label: "Edit"
            }, {
                value: "View",
                label: "View"
            }, {
                value: "Token",
                label: "Token"
            }],
            User: [{
                value: "*",
                label: "All permissions"
            }]
        };
        var PERM_STRING_REGEX = /^(Game|GameModel|User):(.+):(?:(g|gm)(\d+)|(\*))$/;
        var TYPE_TO_KEY = Object.create(null, {
            GameModel: {
                value: "gm",
                enumerable: true
            },
            Game: {
                value: "g",
                enumerable: true
            },
            User: {
                value: undefined,
                enumerable: true
            }
        });
        var STATUS = ["LIVE", "BIN", "DELETE"];
        var ALL_OPTION = {
            name: "ALL",
            id: "*"
        };

        function parsePerm(permString) {
            var match = permString.match(PERM_STRING_REGEX);
            if (!match || (TYPE_TO_KEY[match[1]] !== match[3] && !match[5])) {
                throw new Error("Invalid permission string: " + permString);
            }
            return {
                type: match[1],
                permissions: match[2].split(","),
                id: match[4] || "*"
            };
        }

        function genPerm(obj) {
            if (!(obj.type in TYPE_TO_KEY)) {
                throw new Error("Invalid type: " + obj.type);
            }
            return obj.type + ":" + obj.permissions.join(",") + ":" +
                (obj.id === "*" ? "*" : (TYPE_TO_KEY[obj.type] || "") + obj.id);
        }

        return {
            templateUrl: 'app/commons/directives/permission-edit.tmpl.html',
            restrict: 'E',
            link: function(scope, elem) {
                scope.availablePermissions = PERMISSIONS.GameModel;
                scope.options = [];
                scope.perm = {
                    permissions: [],
                    id: "",
                    type: "GameModel"
                };

                scope.update = function(val) {
                    var permString;
                    var availabaleValues;
                    elem.children().removeClass(DANGER_BG_CLASS);
                    scope.availablePermissions = PERMISSIONS[val.type];
                    availabaleValues = _.map(scope.availablePermissions, "value");
                    _.remove(val.permissions, function(elem) {
                        return availabaleValues.indexOf(elem) < 0;
                    });
                    try {
                        permString = genPerm(val);
                        parsePerm(permString);
                        scope.permission.value = permString;
                    } catch (e) {
                        elem.children().addClass(DANGER_BG_CLASS);
                    }

                };
                scope.togglePerm = function(perm) {
                    var permissions = scope.perm.permissions;
                    var idx = permissions.indexOf(perm);
                    if (idx > -1) {
                        permissions.splice(idx, 1);
                    } else {
                        permissions.push(perm);
                    }
                    if (permissions.indexOf("*") > -1) { //Remove all in case "*" is selected
                        permissions.length = 0;
                        permissions.push("*");
                    }
                    scope.update(scope.perm);
                };
                /* Update available id options base on type (Game / GameModel / User) */
                scope.$watch("perm.type", function(v) {
                    scope.options = [ALL_OPTION];
                    if (v === "GameModel") {
                        $q.all(_.map(STATUS, function(status) {
                            return ScenariosModel.getScenarios(status);
                        }))
                            .then(function(arr) {
                                _.forEach(arr, function(el) {
                                    scope.options = scope.options.concat(el.data);
                                });
                            });
                    } else if (v === "Game") {
                        $q.all(_.map(STATUS, function(status) {
                            return SessionsModel.getSessions(status);
                        }))
                            .then(function(arr) {
                                _.forEach(arr, function(el) {
                                    scope.options = scope.options.concat(el.data);
                                });
                            });
                    }
                });
                scope.$watchCollection('perm', function(value) {
                    scope.update(value);
                });
                try {
                    scope.perm = parsePerm(scope.permission.value);
                } catch (e) {
                    //ERROR stays unmodified
                }
            }

        };
    });
