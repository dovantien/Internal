angular.module('starter.controllers.PaidController', [])
  .controller('PaidController', function($scope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
    $cordovaPrinter, ClosePopupService, PopupService) {
    console.log('PaidController');
    $scope.sound = ngAudio.load("sounds/noti.mp3");
    // var socket = io('http://it.mycafe.co:3011');
            var socket = io('http://mycafe.co:3011');
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
      getListOrderComplete();
      // APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
      //   .then(function(result) {
          
      //   }, function(err) {});
    });
    socket.connect();

    function getListOrderComplete() {
      var apiData = {
        cartStatus: 4,
        prodStatus: 5,
        userid: UserService.getUser().userid
      };
      console.log(JSON.stringify(apiData));
      APIService.api_get_history_order(apiData).then(function(result) {
        console.log(JSON.stringify(result.data));
        $scope.listOrderComplete = result.data;
        for (var i = 0; i < $scope.listOrderComplete.length; i++) {
          var total = 0;
          for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
            total += $scope.listOrderComplete[i].products[j].price;
          }
          $scope.listOrderComplete[i].cart.total = total;
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
      var check = false;
      for (var i = 0; i < $scope.listOrderComplete.length; i++) {
        if ($scope.listOrderComplete[i].cart.cartid == cartid) {
          var cart = $scope.listOrderComplete[i];
          for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
            $scope.listOrderComplete[i].products[j].isChecked = true;
          }
          console.log($scope.listOrderComplete[i]);
          check = true;
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
              bill_product: []
            };
            for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
              console.log(JSON.stringify($scope.orderCompleteDetail.products[j]));
              if ($scope.orderCompleteDetail.products[j].prodstatname != 'Đã hủy') {
                console.log(JSON.stringify($scope.orderCompleteDetail.products[j]));
                $scope.currentOrderInBill.bill_product.push({
                                            item_name: $scope.orderCompleteDetail.products[j].prodname,
                                            amount: $scope.orderCompleteDetail.products[j].price,
                                            svfee: $scope.orderCompleteDetail.products[j].svfee,
                                            quantity: 1,
                                        });
                console.log('ok')
              }
            }

            for (var i = 0; i < $scope.currentOrderInBill.bill_product.length; i++) {
              $scope.currentOrderInBill.cart.subTotal += $scope.currentOrderInBill.bill_product[i].amount;
              $scope.currentOrderInBill.cart.svfee += $scope.currentOrderInBill.bill_product[i].svfee;
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
                console.log(JSON.stirngify(apicart));
                APIService.api_update_cart(apicart).then(function(result) {
                  console.log(JSON.stringify(result));
                  getListOrderComplete();
                  PopupService.showPopup({
                    type: 1,
                    message: 'Order đã được thanh toán.',
                    buttonName: 'OK',
                    function: function() {
                      PopupService.closePopup();
                    }
                  });
                }, function(err) {
                  // body...
                });
                $scope.isShowOrderDetail = false;
              }
            });
          }
          $scope.bill = function() {
            // alert('chua phat trien chuc nang nay');
            for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
              if ($scope.orderCompleteDetail.products[j].isChecked) {
                $scope.orderCompleteDetail.products[j].isPay = true;
              }
            }
            if ($cordovaPrinter.isAvailable()) {
              var page = document.getElementById('bill');
              $cordovaPrinter.print(page, 'BillHelio.html');
            } else {
              alert("Printing is not available on device");
            }
          }
        }
        if (!check) {}
      }
      //$ionicScrollDelegate.$getByHandle('bar_left_content').scrollTop(false);
    }

  }); // End controller AuthController
