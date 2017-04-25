angular.module('starter.controllers.OrderHistoryController', [])
  .controller('OrderHistoryController', function($scope, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicModal,
    $ionicScrollDelegate, PopupService, ClosePopupService, $ionicLoading) {
    console.log('order history');
    UserService.setHistoryOrder([]);

    function getListHistory(status) {
      var apiData = {
        cartStatus: status,
        prodStatus: 4,
        userid: UserService.getUser().userid
      };
      APIService.api_get_history_order(apiData).then(function(result) {
        console.log(JSON.stringify(result));
        UserService.setHistoryOrder(result.data);
        $scope.listHistoryOrder = UserService.getHistoryOrder();
        $ionicScrollDelegate.$getByHandle('history_list').scrollTop(false);
        $ionicLoading.hide();
      });
    }

    function forloop(length, fn) {
      var index = 0;
      var deferred = $q.defer();

      function loop() {
        if (index >= length) {
          deferred.resolve('done');
        } else {
          index += 1;
          fn().then(function(success) {
            loop();
          });
        }
      }
      loop();
      return deferred.promise;
    }

    $scope.$on('$ionicView.enter', function() {
      getListHistory(0);
      $scope.isMore = true;
    }); // end on enter
    $scope.moreHistory = function(value) {
      $scope.isMore = !$scope.isMore;
      getListHistory(value);
    }

    $scope.clickOrderHistory = function(cart) {
      console.log(JSON.stringify(cart));
      $scope.isEditted = false;
      var apiData = {
        cartid: cart.cart.cartid,
        shopid: UserService.getUser().shopid
      }
      APIService.api_get_detail_order(apiData).then(function(success) {
        console.log(JSON.stringify(success.data));
        cart.productsEdit = success.data;

        var indexProd = 0;
        forloop(cart.productsEdit.length, function() {
          var deferred = $q.defer();
          var apiData = {
            prodid: cart.productsEdit[indexProd].prodid,
            pShoptableid: cart.cart.shoptableid
          };
          //cap nhat option va selected cua no vao cart
          APIService.api_prod_option(apiData).then(function(result) {
            var product = cart.productsEdit[indexProd];
            product.option = result.data;
            var arrayOptiondetalid = [product.optdetailid1, product.optdetailid2, product.optdetailid3];
            for (var j = 0; j < product.option.length; j++) {
              var option = product.option[j];
              option.isShow = false;
              if (j == product.option.length - 1) { //option cuoi la chon ghe
                for (var k = 0; k < option.option.length; k++) {
                  if (option.option[k].shopcharid == product.shopcharid) {
                    option.selected = option.option[k];
                  }
                }
              } else { //option khac
                for (var k = 0; k < option.option.length; k++) {
                  console.log(option.option[k]);
                  console.log(arrayOptiondetalid[j])
                  if (option.option[k].optdetailid == arrayOptiondetalid[j]) {
                    option.selected = option.option[k];
                  }
                }
              }
            }
            indexProd++;
            deferred.resolve('done');
          });
          return deferred.promise;
        }).then(function(result) {
          console.log(cart);
          Locstor.set("edittingOrder", cart);
          $scope.edittingOrder = Locstor.get("edittingOrder", null);
          $scope.isShowOrderDetail = true;
          setTimeout(function() {
            document.getElementById('oderdetailModal').style.height = ($scope.edittingOrder.productsEdit.length * 126 + 113) + 'px';
          }, 10);
          console.log(JSON.stringify($scope.edittingOrder))
        });
        $scope.closePopup = function() {
          $scope.isShowOrderDetail = false;
        };
        $scope.cancelOrder = function() {
          var configPopup = {
            type: 3,
            cancelOrderDesc: null,
            func: function() {
              PopupService.closePopup();
              var apicart = {
                cartid: cart.cart.cartid,
                shopid: UserService.getUser().shopid,
                shopTableid: null,
                cartStatus: cart.cart.cartstat,
                cartDesc: configPopup.cancelOrderDesc,
                subprice: null,
                svfee: null,
              }
              console.log(JSON.stringify(apicart));
              APIService.api_cancel_order(apicart).then(function(success) {
                console.log(JSON.stringify(success));
                $scope.isShowOrderDetail = false;
                getListHistory(0);
              }, function(err) {
                // body...
              });
            }
          }
          PopupService.showPopup(configPopup);
        }

        var productsCancel = [];
        $scope.clickDelete = function(prodcancel, indexProdCancel) {
          var configPopup = {
            type: 3,
            cancelOrderDesc: null,
            func: function() {
              PopupService.closePopup();
              prodcancel.desc = configPopup.cancelOrderDesc;
              $scope.isEditted = true;
              productsCancel.push(prodcancel);
              $scope.edittingOrder.productsEdit.splice(indexProdCancel, 1);
            }
          }
          PopupService.showPopup(configPopup);
        }
        $scope.clickEditOrder = function(prod, index) {
          if ($rootScope.utils.activeFunFromUser(UserService.getUser().roleid, 3)) {
            var edittingOrder = Locstor.get("edittingOrder", null);
            $scope.prodOptions = edittingOrder.productsEdit[index].option;
            $scope.prodOptions.prod = edittingOrder.productsEdit[index];
            var detailPopupOptionEdit = $ionicPopup.show({
              scope: $scope,
              templateUrl: 'templates/popup_product_option_edit.html',
              cssClass: 'od_full1'
            });
            $scope.closeDetailPopupClick = function() {
              detailPopupOptionEdit.close();

            }
            ClosePopupService.register(detailPopupOptionEdit);
          }

          $scope.show = function(prod) {
            for (var i = 0; i < $scope.prodOptions.length; i++) {
              if (prod.opttypeid == $scope.prodOptions[i].opttypeid) {
                $scope.prodOptions[i].isShow = !$scope.prodOptions[i].isShow;
              } else {
                $scope.prodOptions[i].isShow = false;
              }
            }
          }
          $scope.clickChooseOption = function(option, optionDetail) {

            for (var i = 0; i < $scope.prodOptions.length; i++) {
              if (option == $scope.prodOptions[i]) {
                if ($scope.prodOptions[i].selected == optionDetail) {
                  //$scope.isEditted = false;
                } else {
                  $scope.isEditted = true;
                  $scope.prodOptions[i].selected = optionDetail;
                  console.log(JSON.stringify($scope.prodOptions[i]));
                }
              }
            }
          }
          $scope.doEdit = function() {
            var edittingOrder = Locstor.get("edittingOrder", null);
            edittingOrder.productsEdit[index].option = $scope.prodOptions;
            Locstor.set("edittingOrder", edittingOrder);
            $scope.edittingOrder = edittingOrder;
            detailPopupOptionEdit.close();
          }
        }
        $scope.doOrder = function() {
          PopupService.showPopup({
            type: 2,
            message: 'Bạn có muốn thay đổi order?',
            buttonLName: 'Cancel',
            buttonRName: 'OK',
            functionL: function() {
              PopupService.closePopup();
            },
            functionR: function() {
              $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
              });
              console.log(JSON.stringify($scope.edittingOrder));
              //nhung san pham xoa
              if (productsCancel.length > 0) {
                var indexProdCancel = 0;
                forloop(productsCancel.length, function() {
                  var deferred = $q.defer();
                  var apiData = {
                    funid: 6,
                    purchasepProdid: productsCancel[indexProdCancel].purchasedprodid,
                    cartid: $scope.edittingOrder.cart.cartid,
                    prodid: productsCancel[indexProdCancel].prodid,
                    quantity: null,
                    price: null,
                    svfee: null,
                    shopchairid: productsCancel[indexProdCancel].shopcharid,
                    optiondetail1: productsCancel[indexProdCancel].optdetailid1,
                    optiondetail2: productsCancel[indexProdCancel].optdetailid2,
                    optiondetail3: productsCancel[indexProdCancel].optdetailid3,
                    desc: productsCancel[indexProdCancel].desc
                  }
                  console.log(JSON.stringify(apiData));
                  APIService.api_update_product(apiData).then(function(result) {
                    console.log(result);
                    $ionicLoading.hide();
                    $scope.isShowOrderDetail = false;
                    if (result.data.status != false) {
                      deferred.resolve();
                      indexProdCancel++;
                    } else {
                      PopupService.showPopup({
                        type: 1,
                        message: 'Order đã được cập nhật.',
                        buttonName: 'OK',
                        function: function() {
                          PopupService.closePopup();
                          getListHistory(0);
                        }
                      });
                    }
                  }, function(err) {
                    // body...
                  });
                  return deferred.promise;
                }).then(function(success) {
                  PopupService.showPopup({
                    type: 1,
                    message: 'Order đã được cập nhật.',
                    buttonName: 'OK',
                    function: function() {
                      PopupService.closePopup();
                      getListHistory(0);
                    }
                  });
                });
              }
              //nhung san pham duoc edit
              var indexProdEdit = 0;
              forloop($scope.edittingOrder.productsEdit.length, function() {
                var deferred = $q.defer();
                var product = $scope.edittingOrder.productsEdit[indexProdEdit];
                console.log(JSON.stringify(product));
                if (product.option) {
                  var shopchairid = (product.option[product.option.length - 1]).selected.shopcharid;
                  //product.option.splice(product.option.length - 1, 1);
                  for (var j = 0; j < 3; j++) {
                    if (product.option[j] == null || product.option[j].shopcharid) {
                      product.option.push({ selected: { optdetailid: null } });
                    }
                  }
                  var apiData = {
                    funid: 11,
                    purchasepProdid: product.purchasedprodid,
                    cartid: $scope.edittingOrder.cart.cartid,
                    prodid: product.prodid,
                    quantity: null,
                    price: null,
                    svfee: null,
                    shopchairid: shopchairid,
                    optiondetail1: product.option[0].selected.optdetailid,
                    optiondetail2: product.option[1].selected.optdetailid,
                    optiondetail3: product.option[2].selected.optdetailid,
                    desc: null,
                    shopid: UserService.getUser().shopid
                  }
                  console.log(JSON.stringify(apiData));
                  APIService.api_update_product(apiData).then(function(result) {
                    console.log(result);
                    $ionicLoading.hide();
                    $scope.isShowOrderDetail = false;
                    if (result.data.status != false) {
                      deferred.resolve();
                      indexProdEdit++;
                    } else {
                      PopupService.showPopup({
                        type: 1,
                        message: result.data.msg,
                        buttonName: 'OK',
                        function: function() {
                          PopupService.closePopup();
                          getListHistory(0);
                        }
                      });
                    }

                  }, function(err) {
                    // body...
                  });
                }
                return deferred.promise;
              }).then(function(success) {
                PopupService.showPopup({
                  type: 1,
                  message: 'Order đã được cập nhật.',
                  buttonName: 'OK',
                  function: function() {
                    PopupService.closePopup();
                    getListHistory(0);
                  }
                });
              });
            }
          });
        }
      }, function(err) {
        // body...
      })
    }


  });
