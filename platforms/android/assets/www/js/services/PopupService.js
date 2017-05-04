angular.module('starter.services.PopupService', [])
    .factory('PopupService',
        function($ionicPopup, $ionicPlatform, $rootScope, ClosePopupService, $state) {

            return {
                showPopup: showPopup,
                closePopup: closePopup,
                showLoginAgain: showLoginAgain
            }

            function showPopup(configPopup, isRegistryClose) {

                $rootScope.configPopup = configPopup;
                if ($rootScope.popup != null) {
                    $rootScope.popup.close();
                }
                $rootScope.popup = null;
                if (configPopup.type == 4) {
                    $rootScope.popup = $ionicPopup.show({
                        templateUrl: 'templates/popupAlert.html',
                        cssClass: 'popupNt animated fadeIn'
                    });
                    if (isRegistryClose == null) {
                        ClosePopupService.register($rootScope.popup);
                    }
                    $rootScope.closePopup = function() {
                        $rootScope.popup.close();
                    };
                }
                if (configPopup.type == 1) {
                    $rootScope.popup = $ionicPopup.show({
                        templateUrl: 'templates/popupNoti.html',
                        cssClass: 'popupNt animated fadeIn'
                    });
                    if (isRegistryClose == null) {
                        ClosePopupService.register($rootScope.popup);
                    }
                    $rootScope.closePopup = function() {
                        $rootScope.popup.close();
                    };
                }
                if (configPopup.type == 2) {
                    $rootScope.popup = $ionicPopup.show({
                        templateUrl: 'templates/popupOKCancel.html',
                        cssClass: 'popupNt animated bounceIn'
                    });
                    ClosePopupService.register($rootScope.popup);
                    $rootScope.closePopup = function() {
                        $rootScope.popup.close();
                    };
                }
                if (configPopup.type == 3) {
                    $rootScope.popup = $ionicPopup.show({
                        templateUrl: 'templates/popup_cancel_order_desc.html',
                        cssClass: 'od_full1'
                    });
                    ClosePopupService.register($rootScope.popup);
                    $rootScope.closePopup = function() {
                        $rootScope.popup.close();
                    };
                }
                return $rootScope.popup;
            }

            function closePopup(popup) {
                $rootScope.popup.close();
            }

            function showLoginAgain() {
                var configPopup = {
                    'id': 4,
                    'message': MSG_RE_LOGIN,
                    'type': 1,
                    'buttonName': 'OK',
                    'function': function() {
                        $rootScope.closePopup();
                        $state.go('login')
                    }
                };
                showPopup(configPopup);
            }

            function inviteFB() {
                facebookConnectPlugin.showDialog({
                    method: 'apprequests',
                    message: 'Mời bạn hãy sử dụng app Helio để nhận được nhiều ưu đãi khi đặt hàng...2',
                    data: '{"cid":"1234"}',
                    title: 'Testabc'
                }, function(result) {
                    console.log("result : ", result);
                });
            }



        } // end
    )
