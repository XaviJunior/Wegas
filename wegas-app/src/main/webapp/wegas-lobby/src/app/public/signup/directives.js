angular.module('public.signup.directives', [])
    .directive('publicSignupIndex', function() {
        "use strict";
        return {
            scope: {
                close: "&"
            },
            controller: 'PublicSignupController as publicSignupCtrl',
            templateUrl: 'app/public/signup/directives.tmpl/index.html'
        };
    })
    // Directive for auto-focus
    .directive('focus', function($timeout) {
        return {
            scope : {
                trigger : '=focus'
            },
            link : function(scope, element) {
                scope.$watch('trigger', function(value) {
                    console.log('element=',element[0],'  value=',value);
                    if (value === "true" || value===true) {
                        $timeout(function() {
                            element[0].focus();
                        }, 2000);
                    }
                });
            }
        };
    })
    .controller('PublicSignupController', function PublicSignupController($scope, $translate, Auth, Flash, $state, TeamsModel, SessionsModel, ScenariosModel) {
        "use strict";
        var ctrl = this;
        ctrl.newUser = {
            email: "",
            username: "",
            p1: "",
            p2: "",
            firstname: "",
            lastname: "",
            language: "",
            agree: ""
        };
        // Returns true if either (1) username does not look like an e-mail address or (2) username is an e-mail and is identical to the e-mail address field.
        // Returns false otherwise.
        ctrl.checkEmailInUsername = function() {
            var username = ctrl.newUser.username.trim();
            if (username.indexOf('@') != -1) {
                return (username==ctrl.newUser.email.trim());
            } else {
                return true;
            }
        };
        ctrl.signup = function() {
            if (ctrl.newUser.username && ctrl.newUser.username.length > 0) {
                if (ctrl.newUser.email && ctrl.newUser.email.length > 0) {
                    if (ctrl.checkEmailInUsername()){
                        if (ctrl.newUser.p1 && ctrl.newUser.p1.length >= 3) {
                            if (ctrl.newUser.p1 === ctrl.newUser.p2) {
                                if (ctrl.newUser.firstname && ctrl.newUser.firstname.length > 0 && ctrl.newUser.lastname &&
                                    ctrl.newUser.lastname.length > 0) {
                                    if (ctrl.newUser.agree) {
                                        Auth.signup(ctrl.newUser.email,
                                            ctrl.newUser.username,
                                            ctrl.newUser.p1,
                                            ctrl.newUser.firstname,
                                            ctrl.newUser.lastname,
                                            ctrl.newUser.language,
                                            ctrl.newUser.agree).then(function (response) {
                                            if (response.isErroneous()) {
                                                response.flash();
                                            } else {
                                                // Automatic login after successful registration:
                                                Auth.login(ctrl.newUser.username, ctrl.newUser.p1).then(function (response2) {
                                                    if (response2.isErroneous()) {
                                                        response2.flash();
                                                    } else {
                                                        $scope.username = $scope.p1 = "";
                                                        // clear cache after a Login. We do not want to have previous user's cache
                                                        TeamsModel.clearCache();
                                                        SessionsModel.clearCache();
                                                        ScenariosModel.clearCache();
                                                        // Pre-load teams into local cache to speed up first login:
                                                        TeamsModel.getTeams().then(function () {
                                                            // Don't leave this page until the cache is pre-populated:
                                                            $scope.close();
                                                        });
                                                        // Browser redirect is done in signup.js
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        $translate('CREATE-ACCOUNT-FLASH-MUST-AGREE').then(function (message) {
                                            Flash.danger(message);
                                        });
                                    }
                                } else {
                                    if (ctrl.newUser.firstname && ctrl.newUser.firstname.length > 0)
                                        document.getElementById('lastname').focus();
                                    else
                                        document.getElementById('firstname').focus();
                                    $translate('CREATE-ACCOUNT-FLASH-WRONG-NAME').then(function (message) {
                                        Flash.danger(message);
                                    });
                                }
                            } else {
                                document.getElementById('password2').focus();
                                $translate('CREATE-ACCOUNT-FLASH-WRONG-PASS2').then(function (message) {
                                    Flash.danger(message);
                                });
                            }
                        } else {
                            document.getElementById('password1').focus();
                            $translate('CREATE-ACCOUNT-FLASH-WRONG-PASS').then(function (message) {
                                Flash.danger(message);
                            });
                        }
                    } else {
                        document.getElementById('username').focus();
                        $translate('CREATE-ACCOUNT-FLASH-WRONG-EMAIL-IN-USERNAME').then(function (message) {
                            Flash.danger(message);
                        });
                    }
                } else {
                    document.getElementById('email').focus();
                    $translate('CREATE-ACCOUNT-FLASH-WRONG-EMAIL').then(function (message) {
                        Flash.danger(message);
                    });
                }
            } else {
                document.getElementById('username').focus();
                $translate('CREATE-ACCOUNT-FLASH-WRONG-USERNAME').then(function (message) {
                    Flash.danger(message);
                });
            }
        };
});
