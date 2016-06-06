angular
    .module('private.profile.directives', [

    ])
    .directive('profileIndex', function(UsersModel) {
        "use strict";
        return {
            scope: {
                close: "&"
            },
            templateUrl: 'app/private/profile/directives.tmpl/index.html',
            controller: function($scope, $stateParams, $sce, $translate, $rootScope, Auth, Flash) {
                var ctrl = this;
                $scope.user = {};
                $scope.originalUser = false;
                Auth.getAuthenticatedUser().then(function(user) {
                    if (user !== false) {
                        UsersModel.getFullUser(user.id).then(function(response) {
                            if (response.isErroneous()) {
                                response.flash();
                            } else {
                                $scope.user = response.data;
                                if ($scope.originalUser === false) {
                                    $scope.originalUsername = $scope.user.account.firstname + ' ' + $scope.user.account.lastname;
                                }
                            }
                        });
                    } else {
                        $translate('COMMONS-USERS-LOAD-FLASH-ERROR').then(function (message) {
                            Flash.danger(message);
                        });
                    }
                });

                ctrl.updateInformations = function() {
                    UsersModel.updateUser($scope.user.account).then(function(response) {
                        if (response) response.flash();
                        $scope.user.password = '';
                        $scope.user.password2 = '';

                        if (!response || !response.isErroneous()) {
                            $scope.close();
                        }
                    });
                };
                $scope.updateInformations = ctrl.updateInformations;
            }
        };
    })
    .directive('profileContent', function() {
        "use strict";
        return {
            templateUrl: 'app/private/profile/directives.tmpl/content.html',
            scope: true,
            require: "^profileIndex",
            link: function($scope, element, attrs, parentCtrl) {
                $scope.$watch(function() {
                    return $scope.$parent.user;
                }, function(n, o) {
                    $scope.user = n;
                });
                $scope.updateInformations = function() {
                    parentCtrl.updateInformations();
                };
            }
        };
    });
