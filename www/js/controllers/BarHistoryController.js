angular.module('starter.controllers.BarHistoryController', [])
    .controller('BarHistoryController', function($scope, APIService, $http, $q, UtilsService, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, PopupService) {
        console.log('BarHistoryController');

        //san pham tra lai status = 6 , hoan thanh = 3
        function getBarOrder(argument) {
            var apiData = {
                // 18-8 17-7
                prodid: 18,
                proddetailid: 17,
                shopid: UserService.getUser().shopid
            };
            console.log(JSON.stringify(apiData));
            APIService.api_get_barhistory_new(apiData)
                .then(function(result) {
                    if (result.data.length > 0) {
                        $scope.listBarOrder = result.data;
                        console.log(JSON.stringify(result.data));
                        console.log($scope.listBarOrder);
                        $scope.getListOrderDetail($scope.listBarOrder[0].product.prodid);
                        $scope.selectedProd = $scope.listBarOrder[0].product.prodid;
                    }

                }, function(err) {});
        }
        $scope.$on('$ionicView.enter', function() {
            getBarOrder();
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('landscape');
            // }
        }); // end on enter
        $scope.getListOrderDetail = function(prodid) {
            var check = false;
            // alert('check' +$scope.listBarOrder.length )
            if ($scope.listBarOrder.length == 0) {
                $scope.listOrderDetail = [];
            }
            for (var i = 0; i < $scope.listBarOrder.length; i++) {
                if ($scope.listBarOrder[i].product.prodid == prodid) {
                    $scope.listOrderDetail = $scope.listBarOrder[i].detail;
                    $scope.selectedProd = $scope.listBarOrder[i].product.prodid;
                    check = true;
                    console.log('listOrderDetail' + JSON.stringify($scope.listOrderDetail));
                }
                if (!check) {
                    $scope.listOrderDetail = $scope.listBarOrder[0].detail;
                    $scope.selectedProd = $scope.listBarOrder[0].product.prodid;
                }
            }
            $ionicScrollDelegate.$getByHandle('bar_left_content').scrollTop(false);
        }
    }); // End controller AuthController
