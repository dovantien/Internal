angular.module('starter.controllers.PrintingController', [])
    .controller('PrintingController', function($scope, $timeout, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
        $cordovaPrinter, ClosePopupService, PopupService, WSService, $ionicLoading, $ionicHistory, WSService) {

        console.log('PrintingController');
        var WSService = WSService;
        $scope.status = false;
        $rootScope.listDevices = [];



        $rootScope.deviceSelected = {};
        $rootScope.devicePrinter = {};
        $scope.paperTypeSelected = {};
        $rootScope.paperType = {};
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
        var socket = io('http://it.mycafe.co:3011');
        // var socket = io('http://mycafe.co:3011');
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

        $rootScope.dockConnected = false;
        $rootScope.paperList = {
            paperTypeOption: [{
                name: "58mm",
                type: 0
            }, {
                name: "80mm",
                type: 1
            }],
            selectedOption: {
                name: "58mm",
                type: 0
            }
        };


        $scope.find_print = function() {
            console.log('find_print');
            $scope.connectDockSever();
            // WSService.start($rootScope.dockUrl);
            // var check = WSService.sendEvtControl();
            // console.log(check)
        };
        $scope.connectDockSever = function() {
            // WSService.start($rootScope.dockUrl);
            // $timeout(function() {
            // if ($rootScope.isConnected) {
            // $scope.status = true;
            $scope.sendMsgGetDeviceList();
            // $scope.stopPrinter();
            // console.log($rootScope.deviceList);
            // } else $scope.status = false;
            // }, 500);
        };

        $scope.sendMsgGetDeviceList = function() {
            var listDevices = {};
            // $rootScope.listDevices = [];
            var jsonObj = WSService.getHeader(MSG_C2S_GET_DEVICES);
            var jsonData = {};
            jsonObj.data = jsonData;
            WSService.sendEvtControl(jsonObj).then(function(result) {
                console.log(result.data);
                $scope.status = true;
                listDevices = JSON.parse(result.data);
                // console.log(JSON.stringify(obj));
                // listDevices= obj;
                for (var i = 0; i < listDevices.data.device_list.length; i++) {
                    if (listDevices.data.device_list[i].id != '1d6b:0002' && listDevices.data.device_list[i].id != '0424:2514') {
                        $rootScope.listDevices.push(listDevices.data.device_list[i]);
                    }
                };
                $rootScope.deviceSelected = $rootScope.listDevices[0];
                console.log(JSON.stringify($rootScope.listDevices))
            }, function(err) {
                console.log(err)
                $scope.status = false;
            });

            // $timeout(function() {

            // list = $rootScope.response;
            // console.log(list);
            // var listData= angular.toJson(listDevices, true); 
            // console.log(listDevices);
            // console.log(JSON.stringify(listDevices));
            // for (var i = 0; i < listDevices.data.device_list.length; i++) {
            //     if (listDevices.data.device_list[i].id != '1d6b:0002' && listDevices.data.device_list[i].id != '0424:2514') {
            //         $rootScope.listDevices.push(listDevices.data.device_list[i]);
            //     }
            // };
            // $rootScope.deviceSelected = $rootScope.listDevices[0];
            // console.log(JSON.stringify($rootScope.listDevices))
            // }, 100);
        };
        $scope.$on('$ionicView.enter', function() {
            console.log('PrintingController');
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('portrait');
            // }
        }); // end on enter
        
        $scope.startPrinter = function() {
            console.log("selectPrinter");


            console.log($rootScope.deviceSelected);
            var jsonObj = WSService.getHeader(MSG_C2S_CTL_DEVICE);

            // jsonObj.uid = $rootScope.deviceSelected.uid;
            // jsonObj.ctl_type = 0;
            // jsonObj.device_type = 1;

            if ($rootScope.deviceSelected) {
                jsonObj.data = {
                    "uid": $rootScope.deviceSelected.uid,
                    "device_type": 1,
                    "ctl_type": 0
                }

                WSService.sendEvtControl(jsonObj).then(function(result) {
                    console.log(result.data);
                    var jsObj = JSON.parse(result.data);
                    if (jsObj.error_code == 0) {
                        PopupService.showPopup({
                            type: 1,
                            message: 'Thiết lập máy in thành công',
                            buttonName: 'OK',
                            function: function() {
                                PopupService.closePopup();
                                console.log('Đóng popup');
                                // console.log(JSON.stringify($rootScope.configPopup));
                            }
                        });

                    }
                });


            } else {
                PopupService.showPopup({
                    type: 1,
                    message: 'Chưa có máy in được chọn',
                    buttonName: 'OK',
                    function: function() {
                        PopupService.closePopup();
                        console.log('Đóng popup');
                        // console.log(JSON.stringify($rootScope.configPopup));
                    }
                });
            }

        };
        // $scope.stopPrinter = function() {
        //     console.log("selectPrinter");
        //     console.log($rootScope.deviceSelected);

        //     var jsonObj = WSService.getHeader(MSG_C2S_CTL_DEVICE);
        //     jsonObj.data = {
        //             "uid": $rootScope.deviceSelected.uid,
        //             "device_type": 1,
        //             "ctl_type": 2
        //         }
        //         // jsonObj.uid = $rootScope.deviceSelected.uid;
        //         // jsonObj.device_type = 1;
        //         // jsonObj.ctl_type = 2;

        //     WSService.send(jsonObj);
        // };
        // $scope.ConfigPrint = function(paperType, printOption) {
        //     console.log('ConfigPrint');
        //     var result = {};
        //     if ($rootScope.deviceSelected) {
        //         $scope.startPrinter();
        //         $timeout(function() {
        //             if ($rootScope.response) {
        //                 result = JSON.parse($rootScope.response);
        //                 console.log(JSON.stringify(result));
        //                 if (result.data.errorCode != 1 && result.status == 1) {
        //                     PopupService.showPopup({
        //                         type: 1,
        //                         message: 'Thiết lập máy in thành công',
        //                         buttonName: 'OK',
        //                         function: function() {
        //                             PopupService.closePopup();
        //                             console.log('Đóng popup');
        //                             // console.log(JSON.stringify($rootScope.configPopup));
        //                         }
        //                     });

        //                 }
        //             }


        //         }, 200);
        //     } else {
        //         PopupService.showPopup({
        //             type: 1,
        //             message: 'Chưa có máy in được chọn',
        //             buttonName: 'OK',
        //             function: function() {
        //                 PopupService.closePopup();
        //                 console.log('Đóng popup');
        //                 // console.log(JSON.stringify($rootScope.configPopup));
        //             }
        //         });
        //     }





        //     // $scope.selectPaper();
        // }


    });
