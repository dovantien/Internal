angular.module('starter.controllers.CashierController', [])
    .controller('CashierController', function($scope, $rootScope, $timeout, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
        $cordovaPrinter, ClosePopupService, PopupService, WSService, $ionicLoading, $filter, $ionicHistory, $interval) {
        console.log('CashierController');
        $scope.sound = ngAudio.load("sounds/noti.mp3");
        var request_id = 1;
        var connectedSocket = 0;
        var print_stt = false;
        // var listProd = [];
        // $rootScope.isConnected = false;
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
        var socket = io('http://it.mycafe.co:3011');
        // var socket = io('http://mycafe.co:3011');
        socket.on('connected', function() {
            console.log('connected')
            $ionicLoading.hide();
            // console.log('getListOrderComplete 1');
            getListOrderComplete();
            socket.emit('register', {
                userid: UserService.getUser().userid,
                shopid: UserService.getUser().shopid
            });

            APIService.api_getcachebill({ shopid: UserService.getUser().shopid }).then(function(result) {
                console.log(JSON.stringify('api_getcachebill'));
                // console.log(JSON.stringify(result));
            }, function(err) {

            });

        });
        socket.on('register', function(data) {
            console.log(data);
        });

        socket.on('reloadordercomplete', function(data) {
            console.log('reload list order');
            console.log(JSON.stringify(data));
            // for(var i= 0 ; i< data.result.length; i++){
            console.log(UserService.getUser().roleid == 4)
                // }
            if (data.result && UserService.getUser().roleid == 4) {
                console.log('thu ngân in tự động');
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
        // socket.on('PongFromServer', function(data) {
        //     // console.log('data :' + data);
        //     $scope.data=data;
        // });
        socket.on('disconnect', function(data) {
            console.log('disconnect Socket')
            connectedSocket = 0;
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
                                $scope.Bill.cart.svfee += $scope.Bill.bill_product[j].amount * UserService.getUser().shops[0].svfee / 100;
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
                    "amount": $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.Bill.bill_product[j].amount * $scope.Bill.bill_product[j].quantity)) + ""
                });
            }

            for (var i = 0; i < $scope.Bill.bill_product.length; i++) {
                console.log(JSON.stringify($scope.Bill.bill_product[i].amount));
                $scope.Bill.cart.subTotal += $scope.Bill.bill_product[i].amount;
                $scope.Bill.cart.svfee += $scope.Bill.bill_product[i].amount * UserService.getUser().shops[0].svfee / 100;
            }
            console.log($scope.Bill.cart.svfee);
            // WSService.start($rootScope.dockUrl);
            // $timeout(function() {
            console.log($rootScope.isConnected);
            //check trang thai ket noi voi dock (0 - mất kết nối , 1- Có kết nối)
            console.log('ket noi thanh cong thuc hien in tu dong')
            console.log(JSON.stringify(UserService.getUser()));
            var jsonObj = WSService.getHeader(MSG_C2S_PRINT_TEMPLATE_BY_VID);
            //Duong truyen cung uid thiet bi can setup lai sau
            jsonObj.error_code = "";
            // jsonObj.uid = UserService.getUser().shops[0].svfee;
            // // jsonObj.uid = "0416:5011";
            // // jsonObj.msg = "";
            // jsonObj.template_type = 13;
            // jsonObj.paper_type = 0;

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
                "service_charge_percent": UserService.getUser().shops[0].svfee + "%",
                "service_charge_value": moneyfee + "",
                "total": moneyTotal + "",
                "footer1": "Thank you for coming !",
                "footer2": "",
                "item": items
            };
            jsonObj.data = {
                "uid": UserService.getUser().shops[0].printid,
                "template_type": 13,
                "paper_type": 0,
                "print_data": JSON.stringify(dataJson)

            }
            jsonObj.print_data = dataJson;
            console.log('thực hiện in ! ');
            console.log(jsonObj);
            //in tu dong cu~
            // WSService.sendEvtControl(jsonObj).then(function(result) {
            //     console.log(result);
            //     //        for (var i = 0; i < data.result.length; i++) {
            //     //     console.log(data.result[i][0][0].purchasedprodid)
            //     //     APIService.api_update_PrintStatus({ purchasedprodid: data.result[i][0][0].purchasedprodid, shopid: UserService.getUser().shopid }).then(function(result) {
            //     //         // WSService.close();
            //     //     }, function(err) {

            //     //     });
            //     // }
            // });
            //end
            function updatePrintAutoStt() {
                var listProd = [];
                for (var i = 0; i < data.result.length; i++) {
                    console.log(data.result[i][0][0].purchasedprodid);
                    listProd.push(data.result[i][0][0].purchasedprodid);

                    if (i == data.result.length - 1) {
                        console.log(listProd);
                        APIService.api_update_PrintStatus({ purchasedprodid: listProd, shopid: UserService.getUser().shopid }).then(function(result) {
                            console.log(result);
                            // WSService.close();
                            getListOrderComplete();
                        }, function(err) {

                        });
                    }
                }



            };
            //IN START
            $ionicLoading.show({
                template: '<ion-spinner icon="bubbles"></ion-spinner><p>Đang thực hiện In</p>',
                content: 'Loading',
                // animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
            });
            WSService.sendEvtControl(jsonObj).then(function(result) {
                console.log(result.data);
                var objStt = JSON.parse(result.data);
                $ionicLoading.hide();
                WSService.close();
                console.log(objStt.error_code);
                var apiData = {
                    shopid: UserService.getUser().shopid,
                    status: objStt,
                    logs: 'sendEvtControl'
                };
                console.log(apiData);
                APIService.api_writeLogFile(apiData).then(function(result) {
                    console.log(JSON.stringify(result));
                }, function(err) {
                    // body...
                });
                switch (objStt.error_code) {
                    case Success_Not_error:
                        //Statements executed when the result of expression matches value1
                        // getListOrderComplete();
                        updatePrintAutoStt();
                        $scope.isShowOrderDetail = false;
                        break;

                    case Unknown_error:
                        //Statements executed when the result of expression matches value2

                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: 'Unknown_error !! Opps Lỗi chưa xác định  !! ',
                            buttonName: 'Unknown_error ',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;

                    case initizalize:
                        //Statements executed when the result of expression matches valueN

                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: 'Có lỗi xảy ra !! ',
                            buttonName: 'initizalize ',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;

                    case Service_failed:
                        //Statements executed when the result of expression matches value2

                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: 'Service_failed- Lỗi thiết bị Dock - rs dock !! ',
                            buttonName: 'Service_failed ',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;

                    case Invalid_data:
                        //Statements executed when the result of expression matches value2

                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: 'Invalid_data - Dữ liệu máy in bị lỗi!! ',
                            buttonName: 'Invalid_data ',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;

                    case Print_device_error:
                        //Statements executed when the result of expression matches value2
                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: ' Có lỗi với máy in, Kiểm tra lại máy in và cấu hình lại cho máy in !! ',
                            buttonName: 'OK',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;


                    default:
                        //Statements executed when none of the values match the value of the expression
                        $scope.isShowOrderDetail = false;
                        PopupService.showPopup({
                            type: 1,
                            message: ' Lỗi thiết bị: Reset App hoặc bộ thiết bị DOCK. ',
                            buttonName: 'OK',
                            function: function() {
                                PopupService.closePopup();
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });
                        break;

                }

            }, function(err) {
                $ionicLoading.hide();
                console.log(err);
                var statusPrint = false;
                var count = 15;
                var timerId = $interval(function() {
                    WSService.sendEvtControl(jsonObj).then(function(result) {
                        console.log('ResendEvtControl Dock thành công !');
                        console.log(result.data);
                        var objStt = JSON.parse(result.data);
                        $interval.cancel(timerId);
                        $ionicLoading.hide();
                        WSService.close();
                        var apiData = {
                            shopid: UserService.getUser().shopid,
                            status: objStt,
                            logs: 'sendEvtControl'
                        };
                        console.log(apiData);
                        APIService.api_writeLogFile(apiData).then(function(result) {
                            console.log(JSON.stringify(result));
                        }, function(err) {
                            // body...
                        });
                        console.log(objStt.error_code);
                        switch (objStt.error_code) {
                            case Success_Not_error:
                                //Statements executed when the result of expression matches value1
                                // getListOrderComplete();
                                updatePrintAutoStt();
                                // viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                break;

                            case Unknown_error:
                                //Statements executed when the result of expression matches value2

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Có lỗi xảy ra !! ',
                                    buttonName: 'Unknown_error ',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;

                            case initizalize:
                                //Statements executed when the result of expression matches valueN

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Có lỗi xảy ra !! ',
                                    buttonName: 'initizalize ',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;

                            case Service_failed:
                                //Statements executed when the result of expression matches value2

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Có lỗi xảy ra !! ',
                                    buttonName: 'Service_failed ',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;

                            case Invalid_data:
                                //Statements executed when the result of expression matches value2

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Có lỗi xảy ra !! ',
                                    buttonName: 'Invalid_data ',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;

                            case Print_device_error:
                                //Statements executed when the result of expression matches value2

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Có lỗi xảy ra !! ',
                                    buttonName: 'Máy in chưa được bật hoặc thiếu giấy reset máy in',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;


                            default:
                                //Statements executed when none of the values match the value of the expression

                                viewBillPopup.close();
                                $scope.isShowOrderDetail = false;
                                PopupService.showPopup({
                                    type: 1,
                                    message: ' Có lỗi xảy ra : Vui lòng reset App hoặc bộ thiết bị . ',
                                    buttonName: 'OK',
                                    function: function() {
                                        PopupService.closePopup();
                                        // console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                                break;

                        }






                    }, function(err) {
                        console.log('Lỗi in lại :' + err);
                    });

                    if (statusPrint == false) {
                        if (count < 0) {
                            $interval.cancel(timerId);
                            $ionicLoading.hide();
                            console.log('Không thể reconnect tới dock');

                            // $ionicLoading.show({
                            //     template: '<ion-spinner icon="bubbles"></ion-spinner><p>Kiểm tra lại Wifi hiện tại</p>',
                            //     content: 'Loading',
                            //     // animation: 'fade-in',
                            //     showBackdrop: true,
                            //     maxWidth: 200,
                            // });
                            // $timeout(function() {
                            // viewBillPopup.close();
                            $scope.isShowOrderDetail = false;

                            // }, 3000);
                        } else {
                            // PopupService.showPopup({
                            //     type: 1,
                            //     message: 'Kết nối lại với dock - Kiểm tra wifi hiện tại',
                            //     buttonName: 'Reconnect ' + count,
                            //     function: function() {
                            //         PopupService.closePopup();
                            //         // console.log(JSON.stringify($rootScope.configPopup));
                            //     }
                            // });
                            // console.log('kết nối lại lần thứ : ' + count);
                            // count -= 1;

                            // viewBillPopup.close();
                            $ionicLoading.hide();
                            $scope.isShowOrderDetail = false;
                            $ionicLoading.show({
                                template: '<ion-spinner icon="bubbles"></ion-spinner><p>Đang thử In lại ' + count + '</p>',
                                content: 'Loading',
                                // animation: 'fade-in',
                                showBackdrop: false,
                                maxWidth: 200,
                            });
                            console.log('kết nối lại lần thứ : ' + count);
                            count -= 1;

                        }
                    } else {
                        console.log('kết nối lại thành công !')
                        $interval.cancel(timerId);
                        count = 0;
                    }


                }, 2000);




            });
            //END



        } //

        function getListOrderComplete(callback) {
            console.log('Reload list Cashier');
            // console.log(JSON.stringify($rootScope.response));
            // console.log(UserService.getUser().userinfo.newFunction == "true");
            var apiData = {
                // 3 - 8
                cartStatus: 18,
                // 5 -11
                prodStatus: 11,
                userid: UserService.getUser().userid
            };
            console.log(JSON.stringify(apiData));
            APIService.api_get_history_order(apiData).then(function(result) {
                $scope.listOrderComplete = result.data;
                // console.log(JSON.stringify(result.data));

                // for (var i = 0; i < $scope.listOrderComplete.length; i++) {
                //     var total = 0;
                //     for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
                //         total += $scope.listOrderComplete[i].products[j].price;
                //     }
                //     $scope.listOrderComplete[i].cart.total = total;
                // }
                if (callback != null) {
                    callback();
                }
            });

        }

        $scope.$on('$ionicView.enter', function() {
            console.log('getListOrderComplete 4');
            getListOrderComplete();
            // $ionicHistory.clearCache().then(function() { getListOrderComplete(); });

            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('portrait');
            // }
        }); // end on enter
        $scope.getOrderCompleteDetail = function(cartid) {
            // WSService.start($rootScope.dockUrl);

            for (var i = 0; i < $scope.listOrderComplete.length; i++) {
                if ($scope.listOrderComplete[i].cart.cartid == cartid) {
                    // console.log('cart.cartid == cartid');
                    var cart = $scope.listOrderComplete[i];
                    for (var j = 0; j < $scope.listOrderComplete[i].products.length; j++) {
                        console.log(JSON.stringify($scope.listOrderComplete[i].products[j].prodstat));
                        if ($scope.listOrderComplete[i].products[j].prodstat != 4 || $scope.listOrderComplete[i].products[j].prodstat != 6) {
                            $scope.listOrderComplete[i].products[j].isChecked = true;
                        } else {
                            $scope.listOrderComplete[i].products[j].isChecked = false;
                        }
                    }
                    // console.log(JSON.stringify($scope.listOrderComplete[i]));
                    $scope.orderCompleteDetail = $scope.listOrderComplete[i];
                    var heightModal = $scope.orderCompleteDetail.products.length * 126 + 113;
                    $scope.isShowOrderDetail = true;
                    setTimeout(function() {
                        document.getElementById('oderdetailModal').style.height = heightModal + 'px';
                    }, 0);
                    $scope.closePopup = function() {
                        $scope.isShowOrderDetail = false;

                        getListOrderComplete();
                        // WSService.close();

                    }
                    $scope.viewBill = function() {
                        // console.log($rootScope.utils.activeFunFromUser(UserService.getUser().roleid,6));
                        //Mở kết nối DockSever
                        // WSService.start($rootScope.dockUrl);



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
                            if ($scope.orderCompleteDetail.products[i].isChecked) {

                                if ($scope.currentOrderInBill.bill_product.length == 0) {
                                    $scope.currentOrderInBill.bill_product.push({
                                        item_name: $scope.orderCompleteDetail.products[i].prodname,
                                        amount: $scope.orderCompleteDetail.products[i].price,
                                        quantity: 1
                                    });
                                } else {
                                    var check = false;
                                    for (var j = 0; j < $scope.currentOrderInBill.bill_product.length; j++) {
                                        if ($scope.currentOrderInBill.bill_product[j].item_name == $scope.orderCompleteDetail.products[i].prodname && $scope.currentOrderInBill.bill_product[j].amount == $scope.orderCompleteDetail.products[i].price) {
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
                            if ($scope.currentOrderInBill.products[i].prodstat != 6) {
                                //svfee tạm thời của bờ hồ x2 = 10%
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
                            function updateSttPrint() {

                                var listProd = [];
                                //new
                                for (var i = 0; i < $scope.orderCompleteDetail.products.length; i++) {
                                    listProd.push($scope.orderCompleteDetail.products[i].purchasedprodid);
                                    if (i == ($scope.orderCompleteDetail.products.length - 1)) {
                                    console.log(JSON.stringify(listProd));
                                        APIService.api_update_PrintStatus({ purchasedprodid: listProd, shopid: UserService.getUser().shopid }).then(function(result) {
                                            // WSService.close();
                                            getListOrderComplete();
                                        }, function(err) {
                                            $ionicLoading.hide();
                                        });
                                    }
                                }
                            };
                            if (!$rootScope.utils.activeFunFromUser(UserService.getUser().roleid, 6)) {
                                // $ionicLoading.show({
                                //     template: '<ion-spinner icon="bubbles"></ion-spinner><p>Chức năng chỉ dành cho Quản Lý</p>',
                                //     content: 'Loading',
                                //     // animation: 'fade-in',
                                //     showBackdrop: true,
                                //     maxWidth: 200,
                                // });
                                // $timeout(function() { $ionicLoading.hide() }, 2000);
                                PopupService.showPopup({
                                    type: 1,
                                    message: 'Chức năng hiện tại chỉ dành cho Quản Lý',
                                    buttonName: 'OK',
                                    function: function() {
                                        PopupService.closePopup();
                                        console.log(JSON.stringify($rootScope.configPopup));
                                    }
                                });
                            } else {
                                console.log($rootScope.isConnected);
                                // if (!$rootScope.isConnected) {
                                // $ionicLoading.show({
                                //     template: '<ion-spinner icon="bubbles"></ion-spinner><p>Kết nối với máy In có vấn đề !!! </p>',
                                //     content: 'Loading',
                                //     // animation: 'fade-in',
                                //     showBackdrop: true,
                                //     maxWidth: 200,
                                // });
                                // $timeout(function() { $ionicLoading.hide() }, 1500);
                                // } else {


                                // var test= $scope.sendMsgGetDeviceList();
                                console.log(JSON.stringify(UserService.getUser().shops[0].shopaddress));
                                var jsonObj = WSService.getHeader(MSG_C2S_PRINT_TEMPLATE_BY_VID);
                                //Duong truyen cung uid thiet bi can setup lai sau
                                // jsonObj.uid = UserService.getUser().shops[0].printid;
                                console.log(JSON.stringify(jsonObj.uid));
                                // jsonObj.uid = "0416:5011";
                                // jsonObj.template_type = 13;// jsonObj.paper_type = 0;


                                // jsonObj.template_type = 13;
                                // jsonObj.paper_type = 0;

                                var items = [];
                                var quantit = 1;
                                for (var j = 0; j < $scope.currentOrderInBill.bill_product.length; j++) {
                                    items.push({
                                        "item_name": $rootScope.utils.formatUnikey($scope.currentOrderInBill.bill_product[j].item_name) + "",
                                        "quantity": $scope.currentOrderInBill.bill_product[j].quantity + "",
                                        "amount": $rootScope.utils.formatUnikey($rootScope.utils.formatMoney($scope.currentOrderInBill.bill_product[j].amount * $scope.currentOrderInBill.bill_product[j].quantity)) + ""
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
                                    "service_charge_percent": UserService.getUser().shops[0].svfee + "%",
                                    "service_charge_value": moneyfee + "",
                                    "total": moneyTotal + "",
                                    "footer1": "Thank you for coming !",
                                    "footer2": "( BẢN IN LẠI  )",
                                    "item": items
                                };

                                jsonObj.data = {
                                    "uid": UserService.getUser().shops[0].printid,
                                    "template_type": 13,
                                    "paper_type": 0,
                                    "print_data": JSON.stringify(dataJson)

                                };
                                // jsonObj.print_data = JSON.stringify(dataJson);
                                console.log(jsonObj);

                                $ionicLoading.show({
                                    template: '<ion-spinner icon="bubbles"></ion-spinner><p>Đang thực hiện In</p>',
                                    content: 'Loading',
                                    // animation: 'fade-in',
                                    showBackdrop: true,
                                    maxWidth: 200,
                                });
                                WSService.sendEvtControl(jsonObj).then(function(result) {
                                    console.log(result.data);
                                    var objStt = JSON.parse(result.data);
                                    $ionicLoading.hide();
                                    var apiData = {
                                        shopid: UserService.getUser().shopid,
                                        status: objStt,
                                        logs: 'sendEvtControl'
                                    };
                                    console.log(apiData);
                                    APIService.api_writeLogFile(apiData).then(function(result) {
                                        console.log(JSON.stringify(result));
                                    }, function(err) {
                                        // body...
                                    });
                                    WSService.close();
                                    // if (result.data.error_code == 0) {

                                    //     updateSttPrint();
                                    //     viewBillPopup.close();
                                    //     $scope.isShowOrderDetail = false;
                                    //     // }
                                    // }
                                    console.log(objStt.error_code);
                                    switch (objStt.error_code) {
                                        case Success_Not_error:
                                            //Statements executed when the result of expression matches value1
                                            console.log('In thành công ghi log');
                                            updateSttPrint();
                                            getListOrderComplete();
                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            break;

                                        case Unknown_error:
                                            //Statements executed when the result of expression matches value2

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: 'Unknown_error !! Opps Lỗi chưa xác định  !! ',
                                                buttonName: 'Unknown_error ',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;

                                        case initizalize:
                                            //Statements executed when the result of expression matches valueN

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: 'Có lỗi xảy ra !! ',
                                                buttonName: 'initizalize ',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;

                                        case Service_failed:
                                            //Statements executed when the result of expression matches value2

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: 'Service_failed- Lỗi thiết bị Dock - rs dock !! ',
                                                buttonName: 'Service_failed ',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;

                                        case Invalid_data:
                                            //Statements executed when the result of expression matches value2

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: 'Invalid_data - Dữ liệu máy in bị lỗi!! ',
                                                buttonName: 'Invalid_data ',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;

                                        case Print_device_error:
                                            //Statements executed when the result of expression matches value2

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: ' Có lỗi với máy in, Kiểm tra lại máy in và cấu hình lại cho máy in !! ',
                                                buttonName: 'OK',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;


                                        default:
                                            //Statements executed when none of the values match the value of the expression

                                            viewBillPopup.close();
                                            $scope.isShowOrderDetail = false;
                                            PopupService.showPopup({
                                                type: 1,
                                                message: ' Lỗi thiết bị: Reset App hoặc bộ thiết bị DOCK. ',
                                                buttonName: 'OK',
                                                function: function() {
                                                    PopupService.closePopup();
                                                    // console.log(JSON.stringify($rootScope.configPopup));
                                                }
                                            });
                                            break;

                                    }

                                }, function(err) {
                                    $ionicLoading.hide();
                                    console.log(err);
                                    var apiData = {
                                        shopid: UserService.getUser().shopid,
                                        status: err,
                                        logs: 'sendEvtControl'
                                    };
                                    console.log(apiData);
                                    APIService.api_writeLogFile(apiData).then(function(result) {
                                        console.log(JSON.stringify(result));
                                    }, function(err) {
                                        // body...
                                    });
                                    var statusPrint = false;
                                    var count = 15;
                                    var timerId = $interval(function() {
                                        WSService.sendEvtControl(jsonObj).then(function(result) {
                                            console.log('ResendEvtControl Dock thành công !');
                                            console.log(result.data);
                                            var objStt = JSON.parse(result.data);
                                            $interval.cancel(timerId);
                                            $ionicLoading.hide();
                                            WSService.close();


                                            console.log(objStt.error_code);
                                            switch (objStt.error_code) {
                                                case Success_Not_error:
                                                    //Statements executed when the result of expression matches value1
                                                    getListOrderComplete();
                                                    updateSttPrint();
                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    break;

                                                case Unknown_error:
                                                    //Statements executed when the result of expression matches value2

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: 'Có lỗi xảy ra !! ',
                                                        buttonName: 'Unknown_error ',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;

                                                case initizalize:
                                                    //Statements executed when the result of expression matches valueN

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: 'Có lỗi xảy ra !! ',
                                                        buttonName: 'initizalize ',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;

                                                case Service_failed:
                                                    //Statements executed when the result of expression matches value2

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: 'Có lỗi xảy ra !! ',
                                                        buttonName: 'Service_failed ',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;

                                                case Invalid_data:
                                                    //Statements executed when the result of expression matches value2

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: 'Có lỗi xảy ra !! ',
                                                        buttonName: 'Invalid_data ',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;

                                                case Print_device_error:
                                                    //Statements executed when the result of expression matches value2

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: 'Có lỗi xảy ra !! ',
                                                        buttonName: 'Máy in chưa được bật hoặc thiếu giấy reset máy in',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;


                                                default:
                                                    //Statements executed when none of the values match the value of the expression

                                                    viewBillPopup.close();
                                                    $scope.isShowOrderDetail = false;
                                                    PopupService.showPopup({
                                                        type: 1,
                                                        message: ' Có lỗi xảy ra : Vui lòng reset App hoặc bộ thiết bị . ',
                                                        buttonName: 'OK',
                                                        function: function() {
                                                            PopupService.closePopup();
                                                            // console.log(JSON.stringify($rootScope.configPopup));
                                                        }
                                                    });
                                                    break;

                                            }






                                        }, function(err) {
                                            console.log('Lỗi in lại :' + err);
                                        });
                                        if (statusPrint == false) {


                                            if (count < 0) {
                                                $interval.cancel(timerId);
                                                $ionicLoading.hide();
                                                console.log('Không thể reconnect tới dock');
                                                // PopupService.showPopup({
                                                //     type: 1,
                                                //     message: 'Kiểm tra lại Wifi hiện tại  ',
                                                //     buttonName: 'OK',
                                                //     function: function() {
                                                //         PopupService.closePopup();
                                                //         // console.log(JSON.stringify($rootScope.configPopup));
                                                //     }
                                                // });
                                                // $ionicLoading.show({
                                                //     template: '<ion-spinner icon="bubbles"></ion-spinner><p>Kiểm tra lại Wifi hiện tại</p>',
                                                //     content: 'Loading',
                                                //     // animation: 'fade-in',
                                                //     showBackdrop: true,
                                                //     maxWidth: 200,
                                                // });
                                                // $timeout(function() {
                                                //     viewBillPopup.close();
                                                //     $scope.isShowOrderDetail = false;
                                                //     $ionicLoading.hide()
                                                // }, 3000);
                                            } else {
                                                viewBillPopup.close();
                                                $scope.isShowOrderDetail = false;
                                                $ionicLoading.show({
                                                    template: '<ion-spinner icon="bubbles"></ion-spinner><p>Đang thử In lại ' + count + '</p>',
                                                    content: 'Loading',
                                                    // animation: 'fade-in',
                                                    showBackdrop: false,
                                                    maxWidth: 200,
                                                });
                                                console.log('kết nối lại lần thứ : ' + count);
                                                count -= 1;
                                            }


                                        } else {
                                            console.log('kết nối lại thành công !')
                                            $interval.cancel(timerId);
                                            count = 0;
                                        }



                                    }, 2000);




                                });

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
                                });
                                PopupService.closePopup();
                                $scope.isShowOrderDetail = false;
                            }
                        });
                    }
                }
            }
        }

    }); // End controller AuthController
