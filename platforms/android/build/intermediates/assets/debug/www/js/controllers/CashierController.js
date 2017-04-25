angular.module('starter.controllers.CashierController', [])
  .controller('CashierController', function($scope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
    $cordovaPrinter, ClosePopupService, PopupService) {
    console.log('CashierController');
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
    socket.on('reloadordercomplete', function(data) {
      console.log('reload list order');
      $scope.sound.play();
      if (data.prodname) {
        PopupService.showPopup({
          type: 1,
          message: data.prodname + ' tại ' + data.shoptablename + ' đã hoàn thành.',
          buttonName: 'OK',
          function: function() {
            PopupService.closePopup();
          }
        });
      }
      getListOrderComplete();
      // APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
      //   .then(function(result) {

      //   }, function(err) {});
    });
    socket.connect();

    function getListOrderComplete(callback) {
      var apiData = {
        cartStatus: 3,
        prodStatus: 5,
        userid: UserService.getUser().userid
      };
      APIService.api_get_history_order(apiData).then(function(result) {
        $scope.listOrderComplete = result.data;
        for (var i = 0; i < $scope.listOrderComplete.length; i++) {
          var total = 0;
          for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
            total += $scope.listOrderComplete[i].products[j].price;
          }
          $scope.listOrderComplete[i].cart.total = total;
        }
        if (callback != null) {
          callback();
        }
        
        console.log(JSON.stringify($scope.listOrderComplete));
        //$scope.getOrderCompleteDetail($scope.listOrderComplete[0].cart.cartid);
      });
    }
    $scope.$on('$ionicView.enter', function() {
      getListOrderComplete();
      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        screen.lockOrientation('portrait');
      }
    }); // end on enter
    $scope.getOrderCompleteDetail = function(cartid) {
      for (var i = 0; i < $scope.listOrderComplete.length; i++) {
        if ($scope.listOrderComplete[i].cart.cartid == cartid) {
          var cart = $scope.listOrderComplete[i];
          for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
            if ($scope.listOrderComplete[i].products[j].prodstat != 4) {
              $scope.listOrderComplete[i].products[j].isChecked = true;
            } else {
              $scope.listOrderComplete[i].products[j].isChecked = false;
            }
          }
          console.log($scope.listOrderComplete[i]);
          $scope.orderCompleteDetail = $scope.listOrderComplete[i];
          var heightModal = $scope.orderCompleteDetail.products.length * 126 + 113;
          $scope.isShowOrderDetail = true;
          setTimeout(function() {
            document.getElementById('oderdetailModal').style.height = heightModal + 'px';
          }, 0);
          $scope.closePopup = function() {
            $scope.isShowOrderDetail = false;
          }
          $scope.viewBill = function() {
            $scope.currentOrderInBill = {
              cart: {
                subTotal: 0,
                svfee: 0
              },
              products: []
            };
            for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
              if ($scope.orderCompleteDetail.products[j].isChecked) {
                $scope.currentOrderInBill.products.push($scope.orderCompleteDetail.products[j]);
                console.log('ok')
              }
            }
            for (var i = 0; i < $scope.currentOrderInBill.products.length; i++) {
              $scope.currentOrderInBill.cart.subTotal += $scope.currentOrderInBill.products[i].price;
              $scope.currentOrderInBill.cart.svfee += $scope.currentOrderInBill.products[i].svfee;
            }
            console.log(JSON.stringify($scope.currentOrderInBill));
            var viewBillPopup = $ionicPopup.show({
              scope: $scope,
              templateUrl: 'templates/viewbill.html',
              cssClass: 'od_full1'
            });
            ClosePopupService.register(viewBillPopup);
            $scope.closeDetailPopupClick = function() {
              viewBillPopup.close();
            }
            $scope.bill = function() {
              // alert('chua phat trien chuc nang nay');
              for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
                if ($scope.orderCompleteDetail.products[j].isChecked) {
                  console.log(JSON.stringify($scope.orderCompleteDetail.products[j]))
                  var apiData = {
                    funid: 4,
                    purchasepProdid: $scope.orderCompleteDetail.products[j].purchasedprodid,
                    cartid: cart.cart.cartid,
                    prodid: $scope.orderCompleteDetail.products[j].prodid,
                    quantity: null,
                    price: null,
                    svfee: null,
                    shopchairid: $scope.orderCompleteDetail.products[j].shopcharid,
                    optiondetail1: $scope.orderCompleteDetail.products[j].optdetailid1,
                    optiondetail2: $scope.orderCompleteDetail.products[j].optdetailid2,
                    optiondetail3: $scope.orderCompleteDetail.products[j].optdetailid3,
                    desc: null
                  }
                  APIService.api_update_product(apiData).then(function(result) {
                    console.log(JSON.stringify(result));
                  }, function(err) {
                    // body...
                  });
                }
              }
              viewBillPopup.close();
              //$scope.isShowOrderDetail = false;
              getListOrderComplete(function () {
                $scope.getOrderCompleteDetail(cartid);
              });
              
              if ($cordovaPrinter.isAvailable()) {
                var page = document.getElementById('bill');
                $cordovaPrinter.print(page, 'BillHelio.html');
              } else {
                alert("Printing is not available on device");
              }
            }
          }
          $scope.doPay = function() {
            PopupService.showPopup({
              type: 2,
              message: 'Bạn có muốn thanh toán order?',
              buttonLName: 'Cancel',
              buttonRName: 'OK',
              functionL: function() {
                PopupService.closePopup();
              },
              functionR: function() {
                cart.cart.subprice = 0;
                cart.cart.svfee = 0;
                for (var i = 0; i < cart.products.length; i++) {
                  cart.cart.subprice += cart.products[i].price;
                  cart.cart.svfee += cart.products[i].svfee;
                }
                var apicart = {
                  funid: 5,
                  cartid: cart.cart.cartid,
                  shopid: UserService.getUser().shopid,
                  shopTableid: cart.cart.shoptableid,
                  cartStatus: cart.cart.cartstat,
                  cartDesc: null,
                  subprice: cart.cart.subprice,
                  svfee: cart.cart.svfee
                }
                APIService.api_update_cart(apicart).then(function(result) {
                  console.log(JSON.stringify(result));
                  getListOrderComplete();
                  PopupService.closePopup();
                }, function(err) {
                  // body...
                });
                $scope.isShowOrderDetail = false;
              }
            });
          }
        }
      }
      //$ionicScrollDelegate.$getByHandle('bar_left_content').scrollTop(false);
    }

  }); // End controller AuthController
