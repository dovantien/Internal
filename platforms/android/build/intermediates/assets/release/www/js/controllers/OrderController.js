angular.module('starter.controllers.OrderController', [])
  .controller('OrderController', function($scope, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, $ionicModal,
    $ionicTabsDelegate, $timeout, $cordovaPrinter, $ionicSlideBoxDelegate, ClosePopupService, $ionicBackdrop, $state, PopupService) {
    console.log('order');
   
    var listAllProducts = null;
    var detailPopupOption = null;
    var initEdittingOrder = function() {
      UserService.setEditingOrder({
        shopid: UserService.getUser().shopid,
        shopTableid: 0,
        listProd: [],
        subPrice: 0,
        svFee: 0,
        cartDesc: ''
      });
      $scope.edittingOrder = UserService.getEditingOrder();
    }
    initEdittingOrder();
    if (UserService.getCacheImage() == null) {
      UserService.setCacheImage([]);
    }

    var getProducts = function() {
      APIService.api_get_product({ shopid: UserService.getUser().shopid }).then(function(resutlt) {
        console.log(JSON.stringify(resutlt));
        if (!resutlt.data.status) {
          $state.go('login');
        } else {
          APIService.api_get_category({ shopid: UserService.getUser().shopid }).then(function(resutlt2) {
            console.log(JSON.stringify(resutlt2));
            if ($rootScope.listTable.selected == null) {
              getTables();
            }
            $scope.listCategory = resutlt2.data;
            $ionicSlideBoxDelegate.update();
            $scope.goTabsCate($scope.listCategory[0]);
            $timeout(function() {
              $ionicTabsDelegate.select(0, false);

            }, 10);
          }, function(error) {
            // body...
          });
          console.log(JSON.stringify($scope.listProd));
          listAllProducts = resutlt.data.products;
          // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
          //   console.log('not web')
          //   for (var i = 0; i < listAllProducts.length; i++) {
          //     //var downloadImg = function() {
          //     var url = listAllProducts[i].prodimg;
          //     var filename = url.split("/").pop();
          //     var targetPath = cordova.file.dataDirectory + filename;
          //     // var cachedImg = $filter('searchByField')('prodimg',
          //     //   targetPath, UserService.getCacheImage());
          //     console.log(JSON.stringify(targetPath));
          //     var cachedImg = null;
          //     for (var j = 0; j < UserService.getCacheImage().length; j++) {
          //       //console.log(UserService.getCacheImage()[i]);
          //       if (UserService.getCacheImage()[j].prodimg == targetPath) {
          //         cachedImg = UserService.getCacheImage()[j];
          //         console.log(JSON.stringify(cachedImg));
          //       }
          //     }

          //     if (cachedImg == null) {

          //       var ft = new FileTransfer();
          //       ft.download(url,
          //         targetPath,
          //         function(entry) {
          //           console.log("download complete: " + entry.toURL());
          //           var image = UserService.getCacheImage();
          //           image.push({
          //             prodimg: entry.toURL()
          //           });
          //           UserService.setCacheImage(image);
          //         },
          //         function(error) {
          //           console.log("download error source " + error.source);
          //         },
          //         false, {});

          //     } else {
          //       $scope.listProd[i].prodimg = cachedImg.prodimg;
          //     }
          //     //}
          //   }
          // }
        }

      }, function(err) {
        console.log(err);
      });
    }
    var getTables = function() {
      var apiData = {
        "pFunid": 3,
        "pProdid": 1,
        "pShoptableid": null,
        "pTablename": null
      }
      APIService.api_get_table_chair(apiData).then(function(resutlt) {
        console.log(JSON.stringify(resutlt));
        $rootScope.listTable = {
          selected: null,
          list: resutlt.data
        };

        if ($rootScope.listTable.selected == null) {
          $scope.clickChooseTable();
        }
      });
    }
    $rootScope.listTable = {
      selected: null
    };
    $scope.$on('$ionicView.enter', function() {

      getProducts();
      if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
        screen.lockOrientation('portrait');
      }
      // if ($cordovaPrinter.isAvailable()) {
      //   var page = '<h1>Hello Document12345</h1>';
      //   $cordovaPrinter.print(page, 'BillHelio.html');
      // } else {
      //   alert("Printing is not available on device");
      // }
    }); // end on enter
    $scope.slideHasChanged = function(index) {
      console.log(JSON.stringify($scope.listCategory[index]));
      $scope.goTabsCate($scope.listCategory[index]);
      $scope.events.trigger("slideChange", { "index": index });
      $timeout(function() {
        if ($scope.onSlideMove) $scope.onSlideMove({ "index": eval(index) });
      }, 100);
    };
    $scope.goTabsCate = function(cate) {
      var list = [];
      $scope.listProd = [];
      if (listAllProducts.length == 0) {
        getProducts();
      } else {
        for (var i = 0; i < listAllProducts.length; i++) {
          if (listAllProducts[i].cateid == cate.cateid) {
            $scope.listProd.push(listAllProducts[i]);
            list.push(listAllProducts[i]);
          }
        }
      }
      //console.log(JSON.stringify($scope.listProd));
      return list;
    }

    $scope.clickChooseTable = function() {
      var detailPopupTable = $ionicPopup.show({
        scope: $scope,
        templateUrl: 'templates/tabledetail.html',
        cssClass: 'od_full'
      });
      $scope.closeDetailPopupClick = function() {
        detailPopupTable.close();
      }
      $scope.chooseTable = function(index) {
        $rootScope.listTable.selected = $rootScope.listTable.list[index];
        detailPopupTable.close();
      }
    }

    $scope.showProdOption = function(prod) {
      console.log(prod);
      if ($rootScope.listTable.selected == null) {
        $scope.clickChooseTable();
      } else {
        var apiData = {
          prodid: prod.prodid,
          pShoptableid: $rootScope.listTable.selected.shoptableid
        };
        APIService.api_prod_option(apiData).then(function(resutlt) {
          console.log(JSON.stringify(resutlt));
          $scope.prodOptions = resutlt.data;
          for (var i = 0; i < $scope.prodOptions.length; i++) {
            $scope.prodOptions[i].isShow = false;
            $scope.prodOptions[i].selected = $scope.prodOptions[i].option[0];
          }
          $scope.prodOptions.prod = prod;
          detailPopupOption = $ionicPopup.show({
            scope: $scope,
            templateUrl: 'templates/popup_product_option.html',
            cssClass: 'od_full1'
          });
          ClosePopupService.register(detailPopupOption);
          $scope.closeDetailPopupClick = function() {
            detailPopupOption.close();
          }
        });
      }
    }
    $scope.show = function(prod) {
      console.log(JSON.stringify(prod));
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
          $scope.prodOptions[i].selected = optionDetail;
          console.log(JSON.stringify($scope.prodOptions[i]))
        }
      }
    }
    $scope.addProductToOder = function() {
      console.log(JSON.stringify($scope.prodOptions.prod));
      console.log(JSON.stringify($scope.prodOptions));
      var edittingOrder = UserService.getEditingOrder();
      var prod = $scope.prodOptions.prod;
      prod.options = $scope.prodOptions;
      edittingOrder.listProd.push(prod);
      edittingOrder.subPrice += prod.prodprice;
      UserService.setEditingOrder(edittingOrder);
      detailPopupOption.close();
      $scope.edittingOrder = UserService.getEditingOrder();
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
    }

    $scope.clickOrderDetail = function() {


      console.log(JSON.stringify($scope.edittingOrder));
      if ($scope.edittingOrder.listProd.length != 0) {
        $scope.isShowOrderDetail = true;
        setTimeout(function() {
          document.getElementById('oderdetailModal').style.height = ($scope.edittingOrder.listProd.length * 126 + 113) + 'px';
        }, 100)
        $scope.closePopup = function() {
          $scope.isShowOrderDetail = false;
        }
      } else {
        //alert("Danh sách sản phẩm trống");
      }

      $scope.clickEditOrder = function(prod, index) {
        console.log(JSON.stringify($scope.prodOptions));
        console.log(JSON.stringify(prod));
        $scope.prodOptions = prod.options;
        $scope.prodOptions.prod = prod;
        var inProd = prod.options;
        var detailPopupOptionEdit = $ionicPopup.show({
          scope: $scope,
          templateUrl: 'templates/popup_product_option_edit.html',
          cssClass: 'od_full1'
        });
        ClosePopupService.register(detailPopupOptionEdit);
        $scope.closeDetailPopupClick = function() {
          detailPopupOptionEdit.close();
          console.log('ok');
        }
        $scope.doEdit = function() {
          // console.log(JSON.stringify(UserService.getEditingOrder()));
          // console.log(JSON.stringify($scope.prodOptions));
          prod.options = $scope.prodOptions;
          var edittingOrder = UserService.getEditingOrder();
          edittingOrder.listProd[index] = prod;
          UserService.setEditingOrder(edittingOrder);
          // console.log(JSON.stringify(UserService.getEditingOrder()));
          detailPopupOptionEdit.close();

        }
      }
      $scope.clickDelete = function(prod, index) {
        var edittingOrder = UserService.getEditingOrder();
        edittingOrder.listProd.splice(index, 1);
        edittingOrder.subPrice -= prod.prodprice;
        UserService.setEditingOrder(edittingOrder);
        $scope.edittingOrder = UserService.getEditingOrder();
        console.log(JSON.stringify(UserService.getEditingOrder()));
        if (UserService.getEditingOrder().listProd.length == 0) {
          $scope.isShowOrderDetail = false;
        }
      }
      $scope.clear = function() {
        initEdittingOrder();
        $scope.isShowOrderDetail = false;
      }
      $scope.doOrder = function() {
        var listProd = UserService.getEditingOrder().listProd;
        console.log(listProd);
        var products = [];
        for (var i = 0; i < listProd.length; i++) {
          var options = [];
          for (var j = 0; j < listProd[i].options.length - 1; j++) {
            options.push(listProd[i].options[j].selected);
          }
          var chairid = listProd[i].options[listProd[i].options.length - 1].selected.shopcharid;
          console.log(chairid)
          products.push({
            prodid: listProd[i].prodid,
            prodprice: listProd[i].prodprice,
            chairid: chairid,
            options: options
          })
        }

        var apiData = {
          shopid: UserService.getEditingOrder().shopid,
          subPrice: UserService.getEditingOrder().subPrice,
          svFee: UserService.getEditingOrder().svFee,
          shopTableid: $rootScope.listTable.selected.shoptableid,
          products: products
        }
        console.log(JSON.stringify(apiData))
        APIService.api_addpurchased(apiData).then(function(resutlt) {
          console.log(JSON.stringify(resutlt));
          initEdittingOrder();
          $rootScope.listTable.selected = null;
          $scope.isShowOrderDetail = false;
          PopupService.showPopup({
            type: 1,
            message: resutlt.data.msg,
            buttonName: 'OK',
            function: function() {
              PopupService.closePopup();
            }
          });
        }, function(err) {})
      }
    }
  }); // End controller AuthController
