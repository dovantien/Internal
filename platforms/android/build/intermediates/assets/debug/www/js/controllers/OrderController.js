angular.module('starter.controllers.OrderController', [])
    .controller('OrderController', function($cordovaNativeAudio, $scope, $log, $rootScope, APIService, ngAudio, $http, $filter, $q, UserService, $ionicPopup, $ionicScrollDelegate, $ionicModal,
        $cordovaBarcodeScanner, $ionicTabsDelegate, $timeout, $cordovaFile, $cordovaPrinter, $ionicSlideBoxDelegate, ClosePopupService, $ionicBackdrop, $state, PopupService, $ionicLoading, WSService) {
        console.log('order');
        $scope.listProd = [];
        $scope.isOrder = true;
        var listAllProducts = null;
        var detailPopupOption = null;
        $scope.quantity_product = 1;
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
        var initEdittingOrder = function() {
            UserService.setEditingOrder({
                shopid: UserService.getUser().shopid,
                shopTableid: 0,
                listProd: [],
                subPrice: 0,
                svFee: 0,
                cartDesc: '',
                orderNote: ''
            });
            $scope.edittingOrder = UserService.getEditingOrder();
            UserService.setCurrentTable(null);
        }
        initEdittingOrder();
        console.log(JSON.stringify(UserService.getEditingOrder()));
        if (UserService.getCacheImage() == null) {
            UserService.setCacheImage([]);
        }
        // $scope.sound = ngAudio.load("sounds/noti.mp3");
        if (window.cordova) {
            $cordovaNativeAudio.preloadSimple('noti', 'sounds/noti.mp3');
        }

        var socket = io('http://mycafe.co:3011');
        socket.on('connected', function() {
            console.log('connected')
            $ionicLoading.hide();
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
            console.log($rootScope.configPopup);
            console.log(JSON.stringify(data));

            // $scope.sound.play();
            if (data.prodname) {
                if (window.cordova) {
                    $cordovaNativeAudio.play('noti');
                    navigator.vibrate(3000);
                }
                PopupService.showPopup({
                    type: 1,
                    message: data.prodname + ' tại ' + data.shoptablename + ' đã hoàn thành.',
                    buttonName: 'OK',
                    function: function() {
                        PopupService.closePopup();
                        console.log(JSON.stringify($rootScope.configPopup));
                    }
                });
                console.log(JSON.stringify($rootScope.configPopup));
            }
        });
        socket.on('disconnect', function(data) {
            console.log('diss')
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><p>Kết Nối Internet có vấn đề ! </p>',
                content: 'Loading',
                // animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
            });

        });
        socket.connect();


        
        //end
        var getProducts = function(verImg) {
            // console.log(JSON.stringify(UserService.getCacheImage()))
            // UserService.setCacheImage([]);
            // console.log(UserService.getUser().shopid);
            APIService.api_get_product({ shopid: UserService.getUser().shopid }).then(function(resutlt) {
                // console.log(JSON.stringify(resutlt));
                if (!resutlt.data.status) {
                    console.log(JSON.stringify(resutlt));
                    $state.go('login');
                } else {
                    // downloadImg(resutlt);
                    APIService.api_get_category({ shopid: UserService.getUser().shopid }).then(function(resutlt2) {
                        // console.log(JSON.stringify(resutlt2));
                        var cachedImg = UserService.getCacheImage();
                        // console.log(JSON.stringify(cachedImg));
                        listAllProducts = resutlt.data.products;
                        //test tren web : active khi build
                        if (window.cordova) {
                            for (var i = 0; i < listAllProducts.length; i++) {
                                if (listAllProducts[i].prodimg != null) {
                                    var imgcheck = listAllProducts[i].prodimg.split("/").pop();
                                } else var imgcheck = listAllProducts[i].prodimg;

                                var url = cordova.file.externalApplicationStorageDirectory + imgcheck;
                                for (var j = 0; j < cachedImg.length; j++) {
                                    if (cachedImg[j].prodimg == url) {
                                        listAllProducts[i].prodimg = url + verImg;
                                    }
                                }
                            }
                        }

                        //end test
                        if ($rootScope.listTable.selected == null) {
                            getTables();
                        }
                        $scope.listCategory = resutlt2.data;
                        $ionicSlideBoxDelegate.update();
                        if (resutlt.data.products.length > 0) {
                            $scope.goTabsCate($scope.listCategory[0]);
                        }

                        $timeout(function() {
                            $ionicTabsDelegate.select(0, false);

                        }, 10);
                    }, function(error) {
                        // body...
                    });
                }
                // return listAllProducts;
            }, function(err) {
                console.log(err);
            });
        }

        var getTables = function() {
            // console.log();
            var apiData = {
                "pFunid": 3,
                "pProdid": UserService.getUser().shopid == 1001 ? 1 : UserService.getUser().shopid,
                "pShoptableid": null,
                "pTablename": null
            };
            APIService.api_get_table_chair(apiData).then(function(resutlt) {
                // console.log(JSON.stringify(resutlt));
                $rootScope.listTable = {
                    selected: null,
                    list: resutlt.data
                };
                // if ($rootScope.listTable.selected == null) {
                //     $scope.clickChooseTable();
                // }
            });
        }
        $scope.showlistTable = function() {
            $scope.isShow = true;
            $scope.chooseTable = function(index) {
                console.log(index);
                // tắt khi build 
                // var test={"shoptableid":164,"shopid":1,"shoptablename":"Table 15"};
                // $rootScope.listTable.selected = test;

                $rootScope.listTable.selected = $rootScope.listTable.list[index];
                $scope.isShow = false;
                UserService.setCurrentTable($rootScope.listTable.selected);

            }

        }
        $rootScope.listTable = {
            selected: null
        };
        $scope.$on('$ionicView.enter', function() {
            console.log('$ionicView.enter');
            var d = new Date();
            var verImg = '?vers' + d.getTime();
            getProducts(verImg);
            // console.log(JSON.stringify(listAllProducts));
            // downloadImg();
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('portrait');
            // }
            console.log(UserService.getCurrentTable());
            if ($rootScope.listTable != null) {
                $rootScope.listTable.selected = UserService.getCurrentTable();
            }
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
            // getProducts();

            // console.log(JSON.stringify(listAllProducts));
            // getProducts();
            for (var i = 0; i < listAllProducts.length; i++) {
                if (listAllProducts[i].cateid == cate.cateid) {
                    $scope.listProd.push(listAllProducts[i]);
                    list.push(listAllProducts[i]);
                }
            }

            // console.log('$scope.listProd'+JSON.stringify(listAllProducts[4]));
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
                console.log(index);
                // tắt khi build 
                // var test={"shoptableid":164,"shopid":1,"shoptablename":"Table 15"};
                // $rootScope.listTable.selected = test;

                $rootScope.listTable.selected = $rootScope.listTable.list[index];

                detailPopupTable.close();
            }
        }

        $scope.clickScanQR = function(imageData) {

            $cordovaBarcodeScanner.scan().then(function(imageData) {
                var check = imageData.text;
                // alert(check);
                // if ($scope.isJson(check)) {
                var parsedData = JSON.parse(check);
                //     $rootScope.listTable.selected = parsedData;
                // }
                $rootScope.listTable.selected = parsedData;
                $scope.isShow = false;
                // alert($rootScope.listTable.selected);
                console.log("Barcode Format -> " + imageData.format);
                console.log("Cancelled -> " + imageData.cancelled);
            }, function(error) {
                console.log("An error happened -> " + error);
            });
        }

        $scope.showProdOption = function(prod) {
            console.log(prod);
            if ($rootScope.listTable.selected == null) {
                //$scope.clickScanQR
                $scope.showlistTable();
            } else {
                var apiData = {
                    prodid: prod.prodid,
                    pShoptableid: $rootScope.listTable.selected.shoptableid
                };
                console.log(JSON.stringify(apiData));
                APIService.api_prod_option(apiData).then(function(resutlt) {
                    console.log(JSON.stringify(resutlt));
                    $scope.prodOptions = resutlt.data;
                    for (var i = 0; i < $scope.prodOptions.length; i++) {
                        $scope.prodOptions[i].isShow = false;
                        $scope.prodOptions[i].selected = $scope.prodOptions[i].option[0];
                    }
                    $scope.prodOptions.prod = prod;
                    $scope.isShowProdOption = true;
                    $scope.closePopup = function() {
                            $scope.isShowProdOption = false;
                        }
                        // detailPopupOption = $ionicPopup.show({
                        //     scope: $scope,
                        //     templateUrl: 'templates/popup_product_option.html',
                        //     cssClass: 'od_full1'
                        // });
                        // ClosePopupService.register(detailPopupOption);
                        // $scope.closeDetailPopupClick = function() {
                        //     detailPopupOption.close();
                        // }
                });
            }
        }

        $scope.show = function(prod) {
            console.log(JSON.stringify(prod));
            for (var i = 0; i < $scope.prodOptions.length; i++) {


                if (prod.opttypeid == $scope.prodOptions[i].opttypeid) {
                    console.log(JSON.stringify($scope.prodOptions[i].isShow));
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
        $scope.addProductToOder = function(quantity_product) {
            // console.log(quantity_product);
            console.log(JSON.stringify(UserService.getEditingOrder()));
            console.log(JSON.stringify($scope.prodOptions.prod));
            console.log(JSON.stringify($scope.prodOptions));
            for (var i = 0; i < quantity_product; i++) {
                var edittingOrder = UserService.getEditingOrder();
                var prod = $scope.prodOptions.prod;
                prod.options = $scope.prodOptions;
                edittingOrder.listProd.push(prod);
                // console.log(edittingOrder.listProd);
                edittingOrder.subPrice += prod.prodprice;
                UserService.setEditingOrder(edittingOrder);
                // detailPopupOption.close();
                $scope.edittingOrder = UserService.getEditingOrder();
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
            }
            $scope.isShowProdOption = false;
        }

        $scope.clickOrderDetail = function() {


            console.log(JSON.stringify($scope.edittingOrder));
            if ($scope.edittingOrder.listProd.length != 0) {
                $scope.isShowOrderDetail = true;
                setTimeout(function() {
                    document.getElementById('oderdetailModal').style.height = ($scope.edittingOrder.listProd.length * 126 + 113 + 50) + 'px';

                    // if ($scope.edittingOrder.listProd.length >= 5) {
                    //   document.getElementById('oderdetailModal').style.height = ($scope.edittingOrder.listProd.length * 126 + 113) + 'px';
                    // } else {
                    //   document.getElementById('oderdetailModal').style.height = ($scope.edittingOrder.listProd.length * 126 + 113 + 50) + 'px';
                    // }
                }, 10)
                $scope.closePopup = function() {
                    $scope.isShowOrderDetail = false;
                }
            } else {
                alert("Danh sách sản phẩm trống");
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
                $scope.isOrder = false;
                var listProd = UserService.getEditingOrder().listProd;
                console.log(listProd);
                var products = [];
                for (var i = 0; i < listProd.length; i++) {
                    var options = [];
                    for (var j = 0; j < listProd[i].options.length - 1; j++) {
                        if (listProd[i].options[j].selected != null) {
                            options.push(listProd[i].options[j].selected);
                        }
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
                    orderNote: $scope.edittingOrder.orderNote,
                    products: products
                }
                console.log(UserService.getUser().userinfo.newFunction == "true");
                console.log(JSON.stringify(apiData))

                if (UserService.getUser().userinfo.newFunction == "true") {
                    console.log('quy trinh mới');
                    APIService.api_addpurchased_new(apiData).then(function(resutlt) {
                        console.log(JSON.stringify(resutlt));
                        initEdittingOrder();
                        $rootScope.listTable.selected = null;
                        $scope.isShowOrderDetail = false;
                        setTimeout(function() {
                            // WSService.close();
                            $rootScope.popup.close();
                            $scope.isOrder = true;
                        }, 2000);
                        PopupService.showPopup({
                            type: 4,
                            message: resutlt.data.msg,

                        });
                    }, function(err) {})
                } else {
                    APIService.api_addpurchased(apiData).then(function(resutlt) {
                        console.log(JSON.stringify(resutlt));

                        initEdittingOrder();
                        $rootScope.listTable.selected = null;
                        $scope.isShowOrderDetail = false;
                        setTimeout(function() {
                            $rootScope.popup.close();
                            $scope.isOrder = true;
                        }, 2000);
                        PopupService.showPopup({
                            type: 4,
                            message: resutlt.data.msg,

                        });
                    }, function(err) {})
                }

            }
        }
    }); // End controller AuthController
