angular.module('starter.controllers.CashierController', [])
    .controller('CashierController', function($scope, $rootScope, $timeout, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
        $cordovaPrinter, ClosePopupService, PopupService, WSService, $ionicLoading, $filter) {
        console.log('CashierController');
        $scope.sound = ngAudio.load("sounds/noti.mp3");
        var request_id = 1;

        // $rootScope.isConnected = false;
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
        var socket = io('http://mycafe.co:3011');
        socket.on('connected', function() {
            console.log('connected')
            $ionicLoading.hide();
            // console.log('getListOrderComplete 1');
            // getListOrderComplete();
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
            console.log(JSON.stringify(data));
            // for(var i= 0 ; i< data.result.length; i++){

            // }
            if (data.result != null) {
                AutoPrint(data);
            } else {
                console.log(JSON.stringify(data));
            }


            // $scope.sound.play();
            // if (data.prodname) {
            // PopupService.showPopup({
            //     type: 1,
            //     message: data.prodname + ' tại ' + data.shoptablename + ' đã hoàn thành.',
            //     buttonName: 'OK',
            //     function: function() {
            //         PopupService.closePopup();
            //     }
            // });
            // }
            console.log('getListOrderComplete 2');
            getListOrderComplete();
            // APIService.api_get_barorder({ shopid: UserService.getUser().shopid })
            //     .then(function(result) {
            //         console.log(JSON.stringify(result));
            //     }, function(err) {});
        });
        socket.on('disconnect', function(data) {
            console.log('diss')
            console.log(JSON.stringify(data));
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><p>Kết Nối Internet có vấn đề ! </p>',
                content: 'Loading',
                // animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
            });

        });
        socket.connect();
        //End In Bill



        function AutoPrint(data) {
            console.log('Thuc hien in tu dong')
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
                    $timeout(function() {
                        WSService.send(jsonObj);

                    }, 300);
                }

                for (var i = 0; i < data.result.length; i++) {
                    console.log(data.result[i][0][0].purchasedprodid)
                    APIService.api_update_PrintStatus({ purchasedprodid: data.result[i][0][0].purchasedprodid, shopid: UserService.getUser().shopid }).then(function(result) {
                        console.log('getListOrderComplete 3');
                        getListOrderComplete();
                        
                    }, function(err) {

                    });
                }
                 $timeout(function() {
                        WSService.close();

                    }, 300);
            }, 300);
            //Kiem tra co dang ket noi voi dock hay khong
        }

        function getListOrderComplete() {
            // console.log(UserService.getUser().userinfo.newFunction == "true");
            var apiData = {
                // 3 - 8
                cartStatus: 8,
                // 5 -11
                prodStatus: 11,
                userid: UserService.getUser().userid
            };
            console.log(JSON.stringify(apiData));
            APIService.api_get_history_order(apiData).then(function(result) {
                $scope.listOrderComplete = result.data;
                console.log(JSON.stringify(result.data));
                // for (var i = 0; i < $scope.listOrderComplete.length; i++) {
                //     var total = 0;
                //     for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
                //         total += $scope.listOrderComplete[i].products[j].price;
                //     }
                //     $scope.listOrderComplete[i].cart.total = total;
                // }
                // if (callback != null) {
                //     callback();
                // }

                // console.log(JSON.stringify($scope.listOrderComplete));
                // $scope.getOrderCompleteDetail($scope.listOrderComplete[0].cart.cartid);
            });
        }
        $scope.$on('$ionicView.enter', function() {
            console.log('getListOrderComplete 4');
            getListOrderComplete();
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('portrait');
            // }
        }); // end on enter
        $scope.getOrderCompleteDetail = function(cartid) {
            // WSService.start($rootScope.dockUrl);

            for (var i = 0; i < $scope.listOrderComplete.length; i++) {
                if ($scope.listOrderComplete[i].cart.cartid == cartid) {
                    console.log('cart.cartid == cartid');
                    var cart = $scope.listOrderComplete[i];
                    for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
                        console.log(JSON.stringify($scope.listOrderComplete[i].products[j].prodstat));
                        if ($scope.listOrderComplete[i].products[j].prodstat != 4 || $scope.listOrderComplete[i].products[j].prodstat != 6) {
                            $scope.listOrderComplete[i].products[j].isChecked = true;
                        } else {
                            $scope.listOrderComplete[i].products[j].isChecked = false;
                        }
                    }
                    console.log(JSON.stringify($scope.listOrderComplete[i]));
                    $scope.orderCompleteDetail = $scope.listOrderComplete[i];
                    var heightModal = $scope.orderCompleteDetail.products.length * 126 + 113;
                    $scope.isShowOrderDetail = true;
                    setTimeout(function() {
                        document.getElementById('oderdetailModal').style.height = heightModal + 'px';
                    }, 0);
                    $scope.closePopup = function() {
                        $scope.isShowOrderDetail = false;


                        WSService.close();

                    }
                    $scope.viewBill = function() {
                        //Mở kết nối DockSever
                        WSService.start($rootScope.dockUrl);



                        $scope.currentOrderInBill = {
                            cart: {
                                subTotal: 0,
                                svfee: 0
                            },
                            products: [],
                            bill_product: []
                        };
                        console.log(JSON.stringify($scope.orderCompleteDetail.products));
                        for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
                            if ($scope.orderCompleteDetail.products[j].isChecked) {
                                $scope.currentOrderInBill.products.push($scope.orderCompleteDetail.products[j]);
                                console.log(JSON.stringify($scope.orderCompleteDetail.products[j]));
                            }
                        }
                        console.log(JSON.stringify($scope.currentOrderInBill.products));
                        for (var i = 0; i < $scope.orderCompleteDetail.products.length; i++) {
                            // && ($scope.orderCompleteDetail.products[i].prodstat != 6)
                            if ($scope.orderCompleteDetail.products[i].isChecked ) {

                                if ($scope.currentOrderInBill.bill_product.length == 0) {
                                    $scope.currentOrderInBill.bill_product.push({
                                        item_name: $scope.orderCompleteDetail.products[i].prodname,
                                        amount: $scope.orderCompleteDetail.products[i].price,
                                        quantity: 1
                                    });
                                } else {
                                    var check = false;
                                    for (var j = 0; j < $scope.currentOrderInBill.bill_product.length; j++) {
                                        if ($scope.currentOrderInBill.bill_product[j].item_name == $scope.orderCompleteDetail.products[i].prodname && $scope.currentOrderInBill.bill_product[j].amount == $scope.orderCompleteDetail.products[i].price ) {
                                            $scope.currentOrderInBill.bill_product[j].quantity += 1;
                                            var check = true;
                                        }
                                    }
                                    if (!check) {
                                        $scope.currentOrderInBill.bill_product.push({
                                            item_name: $scope.orderCompleteDetail.products[i].prodname,
                                            amount: $scope.orderCompleteDetail.products[i].price,
                                            quantity: 1
                                        });
                                    }
                                }
                            }
                        }
                        console.log(JSON.stringify($scope.currentOrderInBill.bill_product));



                        for (var i = 0; i < $scope.currentOrderInBill.products.length; i++) {
                            // if ($scope.currentOrderInBill.products[i].isChecked) {
                                $scope.currentOrderInBill.cart.subTotal += $scope.currentOrderInBill.products[i].price;
                                if($scope.currentOrderInBill.products[i].prodstat != 6 ){
                                $scope.currentOrderInBill.cart.svfee += $scope.currentOrderInBill.products[i].svfee;
                            }

                        }
                        console.log(JSON.stringify($scope.currentOrderInBill.bill_product));
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
                            //Duong test print

                            // var test= $scope.sendMsgGetDeviceList();
                            console.log(JSON.stringify(UserService.getUser().shops[0].shopaddress));
                            var jsonObj = WSService.getHeader(104);
                            //Duong truyen cung uid thiet bi can setup lai sau
                            jsonObj.uid = "0fe6:811e";
                            // jsonObj.uid = "0416:5011";
                            jsonObj.print_tpl = 13;
                            jsonObj.paper_type = 0;

                            var items = [];
                            var quantit = 1;
                            for (var j = 0; j < $scope.currentOrderInBill.bill_product.length; j++) {
                                items.push({
                                    "item_name": $rootScope.utils.formatUnikey($scope.currentOrderInBill.bill_product[j].item_name) + "",
                                    "quantity": $scope.currentOrderInBill.bill_product[j].quantity + "",
                                    "amount": $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.currentOrderInBill.bill_product[j].amount)) + ""
                                });
                            }
                            console.log(JSON.stringify($scope.currentOrderInBill.cart.subTotal));
                            var time = $rootScope.utils.formatDateView(cart.cart.ordertime);

                            var moneyfee = $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.currentOrderInBill.cart.svfee));
                            // console.log(moneyfee);
                            var moneyTotal = $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.currentOrderInBill.cart.subTotal + $scope.currentOrderInBill.cart.svfee));
                            // console.log(JSON.stringify(items));
                            // console.log(JSON.stringify($scope.currentOrderInBill.bill_product));
                            console.log(moneyTotal);
                            var dataJson = {
                                "title": "Helio",
                                "sub_title": "Vietnam Specialty Coffee",
                                "address": UserService.getUser().shops[0].shopaddress,
                                "tel": UserService.getUser().shops[0].shopphone,
                                "datetime": time + "",
                                "receipt_num": cart.cart.cartnumb + "",
                                "shift": UserService.getUser().username + "",
                                "table": cart.cart.shoptablename + "",
                                "service_charge_percent": "5%",
                                "service_charge_value": moneyfee + "",
                                "total": moneyTotal + "",
                                "footer1": "Thank you for coming !",
                                "footer2": "( BẢN IN LẠI  )",
                                "item": items
                            };

                            jsonObj.print_data = JSON.stringify(dataJson);
                            console.log(jsonObj.print_data);

                            $timeout(function() {

                                WSService.send(jsonObj);



                            }, 200);
                            //end test

                            for (var j = 0; j < $scope.orderCompleteDetail.products.length; j++) {
                                if ($scope.orderCompleteDetail.products[j].isChecked) {
                                    console.log('check' + JSON.stringify($scope.orderCompleteDetail.products[j]))

                                    var apiData = {
                                        // 4-12
                                        funid: UserService.getUser().userinfo.newFunction == "true" ? FuncProc.NeworderCompleteDetail.funid : FuncProc.OldorderCompleteDetail.cartStatus,
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
                                        // optiondetail:
                                        desc: null
                                    }
                                    console.log(JSON.stringify(apiData));
                                    APIService.api_update_product(apiData).then(function(result) {
                                        console.log(JSON.stringify(result));
                                    }, function(err) {
                                        // body...
                                        console.log(JSON.stringify(err));
                                    });
                                }
                            }
                            viewBillPopup.close();
                            $scope.isShowOrderDetail = false;
                            console.log('getListOrderComplete 5');
                            // getListOrderComplete(function() {
                            //     $scope.getOrderCompleteDetail(cartid);
                            // });

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
                                    // 5-9
                                    funid: UserService.getUser().userinfo.newFunction == "true" ? FuncProc.NewfunctionR.funid : FuncProc.OldfunctionR.funid,
                                    cartid: cart.cart.cartid,
                                    shopid: UserService.getUser().shopid,
                                    shopTableid: cart.cart.shoptableid,
                                    cartStatus: cart.cart.cartstat,
                                    cartDesc: null,
                                    subprice: cart.cart.subprice,
                                    svfee: cart.cart.svfee
                                }
                                console.log(JSON.stringify(apicart));
                                APIService.api_update_cart(apicart).then(function(result) {
                                    console.log(JSON.stringify(result));
                                    console.log('getListOrderComplete 6');
                                    getListOrderComplete();
                                    PopupService.closePopup();
                                }, function(err) {
                                    // body...
                                    console.log(JSON.stringify(err));
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
