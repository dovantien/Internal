angular.module('starter.controllers.PrintingController', [])
    .controller('PrintingController', function($scope, $timeout, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
        $cordovaPrinter, ClosePopupService, PopupService, WSService, $ionicLoading, $ionicHistory) {

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



        function find_print() {
            $scope.connectDockSever();
        }
        $scope.connectDockSever = function() {
            WSService.start($rootScope.dockUrl);
            $timeout(function() {
                if ($rootScope.Connect == 1) {
                    $scope.status = true;
                    $scope.sendMsgGetDeviceList();
                    // $scope.stopPrinter();
                    console.log($rootScope.deviceList);
                } else $scope.status = false;
            }, 500);
        }

        $scope.sendMsgGetDeviceList = function() {
            $rootScope.listDevices = [];
          var jsonObj = WSService.getHeader(1);
            jsonObj.type = 1;

            // jsonObj.data = jsonData;
            WSService.send(jsonObj);
            var listDevices = {};
            $timeout(function() {
                listDevices = JSON.parse($rootScope.response);
                list= $rootScope.response;
                console.log(JSON.stringify(listDevices.data.devices));
                for (var i = 0; i < listDevices.data.devices.length; i++) {
                    if (listDevices.data.devices[i].id != '1d6b:0002' && listDevices.data.devices[i].id != '0424:2514') {
                        $rootScope.listDevices.push(listDevices.data.devices[i]);
                    }
                };
                $rootScope.deviceSelected = $rootScope.listDevices[0];
                console.log(JSON.stringify($rootScope.listDevices))
            }, 100);
        };
        $scope.$on('$ionicView.enter', function() {
            console.log('PrintingController');
            find_print();
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //     screen.lockOrientation('portrait');
            // }
        }); // end on enter
        $scope.startPrinter = function() {
            console.log("selectPrinter");
            console.log($rootScope.deviceSelected);


            var jsonObj = WSService.getHeader(2);
            jsonObj.uid = $rootScope.deviceSelected.uid;
            jsonObj.type = 1;
            jsonObj.ctl = 0;

            WSService.send(jsonObj);


        };
        $scope.stopPrinter = function() {
            console.log("selectPrinter");
            console.log($rootScope.deviceSelected);

            var jsonObj = WSService.getHeader(2);
            jsonObj.uid = $rootScope.deviceSelected.uid;
            jsonObj.type = 1;
            jsonObj.ctl = 2;

            WSService.send(jsonObj);
        };
        $scope.ConfigPrint = function(paperType, printOption) {
            console.log('ConfigPrint');
            var result = {};
            if ($rootScope.deviceSelected) {
                $scope.startPrinter();
                $timeout(function() {
                    if ($rootScope.response) {
                        result = JSON.parse($rootScope.response);
                        console.log(JSON.stringify(result));
                        if (result.data.errorCode != 1 && result.status == 1) {
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
                    }


                }, 200);
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





            // $scope.selectPaper();
        }


    });
