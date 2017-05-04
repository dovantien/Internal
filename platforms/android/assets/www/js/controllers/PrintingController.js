angular.module('starter.controllers.PrintingController', [])
    .controller('PrintingController', function($scope, $timeout, $rootScope, APIService, $http, $q, UserService, $ionicPopup, $ionicScrollDelegate, ngAudio, $ionicModal,
        $cordovaPrinter, ClosePopupService, PopupService, WSService) {

        console.log('PrintingController');
        var WSService = WSService;
        $scope.status = false;
        $rootScope.deviceList = [];
        // $rootScope.deviceList.deviceSelected = ;
        
        $rootScope.deviceSelected = {};
        $rootScope.devicePrinter = {};
        $scope.paperTypeSelected = {};
        $rootScope.paperType = {};
        $rootScope.dockUrl = "ws://192.168.35.1:9876/ws/";
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

         $scope.processDeviceList = function(message) {
            console.log("processDeviceList");

            $scope.safeApply(function() {
                $rootScope.deviceList = message.data.devices;
                if ($rootScope.deviceList.length > 0) {
                    $rootScope.deviceSelected = $rootScope.deviceList[0];
                } else {
                    $rootScope.deviceSelected = {};
                }
            });


            console.log($rootScope.deviceList);
        };


        // if (localStorage.dockUrl) {
        //     $rootScope.dockUrl = localStorage.dockUrl;
        //     console.log("$rootScope.dockUrl = ");
        //     console.log($rootScope.dockUrl);
        // }

        // if (localStorage.devicePrinter) {
        //     $rootScope.devicePrinter = JSON.parse(localStorage.devicePrinter);
        //     console.log("$rootScope.devicePrinter = ");
        //     console.log($rootScope.devicePrinter);
        // }

        $rootScope.paperType = $scope.paperTypeSelected;

        console.log($scope.paperTypeSelected);
        localStorage.paperType = JSON.stringify($rootScope.paperType);
        $scope.find_print = function() {

            $scope.connectDockSever();
            setInterval(function() {
                $scope.connectDockSever();
            }, 10000);

        }
        $scope.connectDockSever = function() {
            WSService.start($rootScope.dockUrl);
            $timeout(function() {
                if ($rootScope.Connect == 1) {
                    $scope.status = true;
                    $scope.processDeviceList();
                    console.log($rootScope.deviceList);
                   } else $scope.status = false;
            }, 1000);
        }

        $scope.sendMsgGetDeviceList = function() {
            var jsonObj = WSService.getHeader(1);
            jsonObj.type = 1;
            WSService.send(jsonObj);
        };

        $scope.selectPrinter = function(devicePrinter) {
            console.log("selectPrinter");
            console.log(devicePrinter.uid);

            var jsonObj = WSService.getHeader(2);
            jsonObj.uid = devicePrinter.uid;
            jsonObj.type = 1;
            jsonObj.ctl = 0;

            WSService.send(jsonObj);
        };

        $scope.setDockUrl = function() {
            console.log('setDockUrl');
            WSService.start($rootScope.dockUrl);
        };

        $scope.selectPaper = function() {
            console.log('selectPaper')
            $rootScope.paperType = $scope.paperTypeSelected;

            console.log($scope.paperTypeSelected);
            localStorage.paperType = JSON.stringify($rootScope.paperType);
        };
        $scope.ConfigPrint = function(paperType,printOption) {
            console.log('ConfigPrint');
            console.log(paperType);
            console.log(printOption);

            // console.log(JSON.stringify($rootScope.deviceSelected));


            $scope.selectPrinter(printOption);
            // $scope.selectPaper();
        }
            $scope.processDeviceList = function(message) {
                console.log("processDeviceList");
                
                $scope.safeApply(function () {
                    // $rootScope.deviceList = message.data.devices;
                    if ($rootScope.deviceList.length > 0) {
                        $rootScope.deviceSelected = $rootScope.deviceList[0];
                    } else {
                        $rootScope.deviceSelected = {};
                    }
                });
                
                
                console.log($rootScope.deviceList);
            };
            $scope.safeApply = function(fn) {
                if (this.$root) {
                    var phase = this.$root.$$phase;
                    if (phase == '$apply' || phase == '$digest') {
                        if (fn && (typeof (fn) === 'function')) {
                            fn();
                        }
                    } else {
                        this.$apply(fn);
                    }
                }
            };

    });
