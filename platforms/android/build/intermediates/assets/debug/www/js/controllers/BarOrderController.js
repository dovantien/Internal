angular.module('starter.controllers.BarOrderController', [])
  .controller('BarOrderController', function($scope, APIService, $http, $q, UtilsService, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, PopupService) {
    console.log('bar order');
    $scope.utils = UtilsService;
    $scope.sound = ngAudio.load("sounds/noti.mp3");
    var socket = io('http://it.mycafe.co:3011');
    socket.on('connected', function() {
      console.log('connected')
      socket.emit('register', {
        userid: UserService.getUser().userid,
        shopid: UserService.getUser().shopid
      });
    });
    socket.on('register', function(data) {
      console.log(data);
    });
    socket.on('reloadlistorder', function(data) {
      console.log('reload list order');
      $scope.sound.play();
      APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
        .then(function(result) {
          $scope.listBarOrder = result.data;
          $scope.getListOrderDetail($scope.selectedProd);
        }, function(err) {});
    });
    socket.connect();

    function getBarOrder(argument) {
      APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
        .then(function(result) {
          console.log(JSON.stringify(result));
          if (result.data.length > 0) {
            $scope.listBarOrder = result.data;
            $scope.getListOrderDetail($scope.listBarOrder[0].product.prodid);
            $scope.selectedProd = $scope.listBarOrder[0].product.prodid;
          }
          console.log($scope.selectedProd);
        }, function(err) {});
    }
    $scope.$on('$ionicView.enter', function() {
      getBarOrder();
      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        screen.lockOrientation('landscape');
      }
    }); // end on enter
    $scope.getListOrderDetail = function(prodid) {
      var check = false;
      if ($scope.listBarOrder.length == 0) {
        $scope.listOrderDetail = [];
      }
      for (var i = 0; i < $scope.listBarOrder.length; i++) {
        if ($scope.listBarOrder[i].product.prodid == prodid) {
          $scope.listOrderDetail = $scope.listBarOrder[i].detail;
          $scope.selectedProd = $scope.listBarOrder[i].product.prodid;
          check = true;
        }
        if (!check) {
          $scope.listOrderDetail = $scope.listBarOrder[0].detail;
          $scope.selectedProd = $scope.listBarOrder[0].product.prodid;
        }
      }
      $ionicScrollDelegate.$getByHandle('bar_left_content').scrollTop(false);
    }
    $scope.completeProduce = function(prod, index) {
      PopupService.showPopup({
        type: 2,
        message: 'Hoàn thành order?',
        buttonLName: 'Cancel',
        buttonRName: 'OK',
        functionL: function() {
          PopupService.closePopup();
        },
        functionR: function() {
          console.log(JSON.stringify(prod))
          var apiData = {
            funid: 3,
            purchasepProdid: prod.purchasedprodid,
            cartid: null,
            prodid: null,
            quantity: null,
            price: null,
            svfee: null,
            shopchairid: prod.shopchairid,
            optiondetail1: null,
            optiondetail2: null,
            optiondetail3: null,
            desc: null,
            shopid: UserService.getUser().shopid,
            prodname: prod.prodname,
            shoptablename: prod.shoptablename
          }
          APIService.api_update_product(apiData).then(function(result) {
            console.log(result);
            if (!result.data.status) {
              PopupService.showPopup({
                type: 1,
                message: result.data.msg,
                buttonName: 'OK',
                function: function() {
                  PopupService.closePopup();
                  APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
                    .then(function(result) {
                      // $scope.listOrderDetail.splice(index, 1);
                      $scope.listBarOrder = result.data;
                      $scope.getListOrderDetail($scope.selectedProd);
                    }, function(err) {});
                }
              });
            } else {
              PopupService.closePopup();
            }
          }, function(err) {});
        }
      });
    }

  }); // End controller AuthController
