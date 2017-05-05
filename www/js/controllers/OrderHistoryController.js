angular.module('starter.controllers.OrderHistoryController', [])
    .controller('OrderHistoryController', function($scope, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicModal,
        $ionicScrollDelegate, PopupService, ClosePopupService, $ionicLoading, $log, $state, WSService, $timeout) {
        UserService.setHistoryOrder([]);
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";

        function getListHistory(status) {
            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            console.log(status);
            if (status == 0) {
                var apiData = {
                    // 0-10
                    cartStatus: UserService.getUser().userinfo.newFunction == "true" ? FuncProc.NewgetListHistory.funidToday : FuncProc.OldgetListHistory.funidToday,
                    prodStatus: 4,
                    userid: UserService.getUser().userid
                };
            } else {
                var apiData = {
                    // 1-11
                    cartStatus: UserService.getUser().userinfo.newFunction == "true" ? FuncProc.NewgetListHistory.funidMore : FuncProc.OldgetListHistory.funidMore,
                    prodStatus: 4,
                    userid: UserService.getUser().userid
                };
            }
            console.log(JSON.stringify(apiData));
            APIService.api_get_history_order(apiData).then(function(result) {
                $ionicLoading.hide();
                console.log(JSON.stringify(result.data));
                UserService.setHistoryOrder(result.data);
                $scope.listHistoryOrder = UserService.getHistoryOrder();
                $ionicScrollDelegate.$getByHandle('history_list').scrollTop(false);

            }, function(err) {
                $ionicLoading.hide();
            });
        };

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

        //In tự động
        function AutoPrint(data) {
            $scope.Bill = {
                cart: {
                    subTotal: 0,
                    svfee: 0
                },
                bill_product: []

            }
            var items = [];
            console.log(JSON.stringify(data));
            console.log(JSON.stringify(UserService.getUser()));
            for (var i = 0; i < data.result.length; i++) {

                if (data.result[i][0][0].print == 0) {
                    if ($scope.Bill.bill_product.length == 0) {
                        $scope.Bill.bill_product.push({
                            item_name: data.result[i][0][0].prodname,
                            amount: data.result[i][0][0].pPrice,
                            quantity: 1
                        });
                    } else {
                        var check = false;
                        for (var j = 0; j < $scope.Bill.bill_product.length; j++) {
                            if ($scope.Bill.bill_product[j].item_name == data.result[i][0][0].prodname) {
                                $scope.Bill.bill_product[j].quantity += 1;
                                $scope.Bill.cart.subTotal += $scope.Bill.bill_product[j].amount;
                                $scope.Bill.cart.svfee += $scope.Bill.bill_product[j].amount * 5 / 100;
                                var check = true;
                            }
                        }
                        if (!check) {
                            $scope.Bill.bill_product.push({
                                item_name: data.result[i][0][0].prodname,
                                amount: data.result[i][0][0].pPrice,
                                quantity: 1
                            });
                        }
                    }
                }


            }
            console.log(JSON.stringify($scope.Bill));
            for (var j = 0; j < $scope.Bill.bill_product.length; j++) {
                items.push({
                    "item_name": $rootScope.utils.formatUnikey($scope.Bill.bill_product[j].item_name) + "",
                    "quantity": $scope.Bill.bill_product[j].quantity + "",
                    "amount": $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.Bill.bill_product[j].amount)) + ""
                });
            }

            for (var i = 0; i < $scope.Bill.bill_product.length; i++) {
                console.log(JSON.stringify($scope.Bill.bill_product[i].amount));
                $scope.Bill.cart.subTotal += $scope.Bill.bill_product[i].amount;
                $scope.Bill.cart.svfee += $scope.Bill.bill_product[i].amount * 5 / 100;
            }

            WSService.start($rootScope.dockUrl);
            $timeout(function() {
                console.log($rootScope.Connect);
                //check trang thai ket noi voi dock (0 - mất kết nối , 1- Có kết nối)
                if ($rootScope.Connect == 1) {
                    console.log('ket noi thanh cong thuc hien in tu dong')
                    console.log(JSON.stringify(UserService.getUser()));
                    var jsonObj = WSService.getHeader(104);
                    //Duong truyen cung uid thiet bi can setup lai sau
                    jsonObj.uid = "0fe6:811e";
                    // jsonObj.uid = "0416:5011";
                    jsonObj.print_tpl = 13;
                    jsonObj.paper_type = 0;

                    var time = $rootScope.utils.formatDateView(data.result[0][0][0].ordertime);
                    var moneyfee = $scope.Bill.cart.subTotal > 0 ? $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.Bill.cart.svfee)) : 0;
                    var moneyTotal = $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.Bill.cart.subTotal + $scope.Bill.cart.svfee));

                    var dataJson = {
                        "title": "Helio",
                        "sub_title": "Vietnam Specialty Coffee",
                        "address": UserService.getUser().shops[0].shopaddress,
                        "tel": UserService.getUser().shops[0].shopphone,
                        "datetime": time + "",
                        "receipt_num": data.result[0][0][0].cartnumb + "",
                        "shift": data.result[0][0][0].username + "",
                        "table": data.result[0][0][0].shoptablename + "",
                        "service_charge_percent": "5%",
                        "service_charge_value": moneyfee + "",
                        "total": moneyTotal + "",
                        "footer1": "Thank you for coming !",
                        "footer2": "",
                        "item": items
                    };

                    jsonObj.print_data = JSON.stringify(dataJson);
                    console.log('thực hiện in ! ');
                    console.log(jsonObj.print_data);
                        WSService.send(jsonObj);
                }

                for (var i = 0; i < data.result.length; i++) {
                    console.log(data.result[i][0][0].purchasedprodid)
                    APIService.api_update_PrintStatus({ purchasedprodid: data.result[i][0][0].purchasedprodid, shopid: UserService.getUser().shopid }).then(function(result) {
                        console.log(JSON.stringify(result));
                        // 

                    }, function(err) {

                    });
                }

            }, 300);
            getListOrderComplete();
            //Kiem tra co dang ket noi voi dock hay khong
        }
        //end function print

        var getTables = function() {
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
        $scope.$on('$ionicView.enter', function() {
            console.log('$ionicView.enter');
            getTables();
            getListHistory(0);
            $scope.isMore = true; //more history
            if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
                screen.lockOrientation('portrait');
            }
        }); // end on enter
        // purchasedprodid/ cartid /note /managerid
        //         returnProduct` (
        // pPurchasedprodid int,
        //   pCartid int,
        //      pNote varchar(50),
        //      pManagerid int)
        // $scope.clickDelete = function(prodcancel, indexProdCancel) {
        //             var configPopup = {
        //                 type: 3,
        //                 cancelOrderDesc: null,
        //                 func: function() {
        //                     PopupService.closePopup();
        //                     prodcancel.desc = configPopup.cancelOrderDesc;
        //                     $scope.isEditted = true;
        //                     productsCancel.push(prodcancel);
        //                     $scope.edittingOrder.productsEdit.splice(indexProdCancel, 1);
        //                 }
        //             }
        //             PopupService.showPopup(configPopup);
        //         }
        //click trả lại sản phẩm

        $scope.moreHistory = function(value) {
            $scope.isMore = !$scope.isMore;
            getListHistory(value);
        }
        $scope.clickOrderHistory = function(cart) {
            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            // $log.log(JSON.stringify(cart));
            if ($rootScope.listTable == null) {
                $ionicLoading.hide();
                $state.go('app.order');
            }
            UserService.setCurrentTable($rootScope.listTable.selected);
            console.log($rootScope.listTable.selected);
            for (var i = 0; i < $rootScope.listTable.list.length; i++) {
                if ($rootScope.listTable.list[i].shoptableid == cart.cart.shoptableid) {
                    $rootScope.listTable.selected = $rootScope.listTable.list[i];
                }
            }
            $scope.isEditted = false;
            var apiData = {
                cartid: cart.cart.cartid,
                shopid: UserService.getUser().shopid
            }
            console.log(JSON.stringify(apiData));
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
                    $ionicLoading.hide();
                    Locstor.set("edittingOrder", cart);
                    $scope.edittingOrder = Locstor.get("edittingOrder", null);
                    $scope.edittingOrder.orderNote = cart.cart.mannote;
                    $scope.isShowOrderDetail = true;
                    var heightModal = $scope.edittingOrder.productsEdit.length * 126 + 113 + 50;
                    setTimeout(function() {
                        document.getElementById('oderdetailModal').style.height = heightModal + 'px';
                    }, 0);
                    // $log.log(JSON.stringify($scope.edittingOrder))
                });
                $scope.closePopup = function() {
                    $scope.isShowOrderDetail = false;
                };
                $scope.cancelOrder = function() {
                    var configPopup = {
                        type: 3,
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
                                $log.log(JSON.stringify(success));
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
                $scope.clickRefunProd = function(product, indexProdCancel) {
                    console.log(JSON.stringify(product));
                    var configPopup = {
                        type: 3,
                        cancelOrderDesc: null,
                        func: function() {
                            PopupService.closePopup();
                            $scope.isEditted = true;
                            productsCancel.push(product);
                            $scope.edittingOrder.productsEdit.splice(indexProdCancel, 1);
                            var apiData = {
                                pPurchasedprodid: product.purchasedprodid,
                                pNote: configPopup.cancelOrderDesc,
                                pManagerid: UserService.getUser().userid
                            };
                            console.log(JSON.stringify(apiData));
                            APIService.api_refund_product(apiData).then(function(success) {
                                console.log(JSON.stringify(success));
                            }, function(err) {
                                // body...
                            });
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
                                    $log.log(JSON.stringify($scope.prodOptions[i]));
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
                    var products = [];
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
                                // animation: 'fade-in',
                                showBackdrop: true,
                                maxWidth: 200,
                                showDelay: 0
                            });
                            console.log(JSON.stringify($scope.edittingOrder));
                            //them note
                            var apicart = {
                                funid: 8,
                                cartid: $scope.edittingOrder.cart.cartid,
                                shopid: UserService.getUser().shopid,
                                shopTableid: $scope.edittingOrder.cart.shoptableid,
                                cartStatus: $scope.edittingOrder.cart.cartstat,
                                cartDesc: $scope.edittingOrder.orderNote,
                                subprice: null,
                                svfee: null
                            }
                            console.log(JSON.stringify(apicart));
                            APIService.api_update_cart(apicart).then(function(result) {
                                console.log(JSON.stringify(result));
                            }, function(err) {
                                // body...
                            });
                            //nhung san pham xoa
                            console.log(JSON.stringify(productsCancel))
                            if (productsCancel.length > 0) {
                                console.log('productsCancel.length > 0');
                                console.log(JSON.stringify(productsCancel));
                                console.log($scope.edittingOrder.cart.cartid);
                                var indexProdCancel = 0;
                                forloop(productsCancel.length, function() {
                                    console.log(JSON.stringify(productsCancel[indexProdCancel]));
                                    var deferred = $q.defer();
                                    var apiDataStt = {
                                        cartid: $scope.edittingOrder.cart.cartid,
                                        prodid: productsCancel[indexProdCancel].prodid,
                                        prodprice: -productsCancel[indexProdCancel].price,
                                        chairid: productsCancel[indexProdCancel].shopcharid,
                                        optdetailid1: productsCancel[indexProdCancel].optdetailid1,
                                        optdetailid2: productsCancel[indexProdCancel].optdetailid2,
                                        optdetailid3: productsCancel[indexProdCancel].optdetailid3,
                                        purchasedProdid: productsCancel[indexProdCancel].purchasedprodid,
                                        shopid: UserService.getUser().shopid
                                    }
                                    products.push(apiDataStt)
                                    console.log(JSON.stringify(apiDataStt));
                                    // APIService.api_set_AddPurchasedProductNewFunc(apiDataStt).then(function(result) {
                                    //     console.log(JSON.stringify(result));
                                    //     $ionicLoading.hide();
                                    //     $scope.isShowOrderDetail = false;
                                    deferred.resolve();
                                    indexProdCancel++;
                                    //     // getListHistory(0);
                                    //     // PopupService.showPopup({
                                    //     //     type: 1,
                                    //     //     message: 'Order đã được cập nhật.',
                                    //     //     buttonName: 'OK',
                                    //     //     function: function() {
                                    //     //         PopupService.closePopup();

                                    //     //     }
                                    //     // });
                                    // }, function(err) {
                                    //     // body...
                                    // });


                                    return deferred.promise;
                                }).then(function(success) {
                                    console.log(JSON.stringify(products));
                                    APIService.api_set_AddPurchasedProductNewFunc(products).then(function(result) {
                                        console.log(JSON.stringify(result));
                                        // if (result.data.status == true) {
                                        //     console.log(result.data.result);
                                        //     // AutoPrint(result.data);
                                        // }
                                        $ionicLoading.hide();
                                        $scope.isShowOrderDetail = false;

                                    }, function(err) {
                                        // body...
                                    });
                                    // $timeout(function() {
                                    //     WSService.close();

                                    // }, 700);

                                    getListHistory(0);
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
                            console.log(JSON.stringify($scope.edittingOrder.productsEdit.length));
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
                                        $log.log(result);
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
                                setTimeout(function() {
                                    $rootScope.popup.close();
                                }, 2000);
                                PopupService.showPopup({
                                    type: 4,
                                    message: 'Order đã được cập nhật.'
                                });
                            });
                        }
                    });
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
                        var apicart = {
                            funid: 7,
                            cartid: cart.cart.cartid,
                            shopid: UserService.getUser().shopid,
                            shopTableid: $rootScope.listTable.selected.shoptableid,
                            cartStatus: cart.cart.cartstat,
                            cartDesc: null,
                            subprice: null,
                            svfee: null
                        }
                        console.log(JSON.stringify(apicart));
                        APIService.api_update_cart(apicart).then(function(result) {
                            console.log(JSON.stringify(result));
                            getListHistory(0);
                            $scope.isShowOrderDetail = false;
                        }, function(err) {
                            // body...
                        });
                    }
                }
                $scope.showlistTable = function() {
                    console.log('$rootScope.listTable');
                    console.log($rootScope.listTable.selected);
                    $scope.isShow = true;
                    $scope.chooseTable = function(index) {
                        console.log(index);
                        // tắt khi build
                        // var test={"shoptableid":164,"shopid":1,"shoptablename":"Table 15"};
                        // $rootScope.listTable.selected = test;
                        $rootScope.listTable.selected = $rootScope.listTable.list[index];
                        $scope.isShow = false;
                        var apicart = {
                            funid: 7,
                            cartid: cart.cart.cartid,
                            shopid: UserService.getUser().shopid,
                            shopTableid: $rootScope.listTable.selected.shoptableid,
                            cartStatus: cart.cart.cartstat,
                            cartDesc: null,
                            subprice: null,
                            svfee: null
                        }
                        console.log(JSON.stringify(apicart));
                        APIService.api_update_cart(apicart).then(function(result) {
                            console.log(JSON.stringify(result));
                            getListHistory(0);
                            $scope.isShowOrderDetail = false;
                        }, function(err) {
                            // body...
                        });
                    }
                }
            }, function(err) {
                // body...
            })
        }
    });
