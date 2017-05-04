(function() {
    'use strict';

    theApp
        .controller('PrintingController', PrintingController);

    PrintingController.$inject = ['$scope', '$rootScope', '$uibModal', '$timeout', '$location', '$filter', 'WSService'];

    function PrintingController($scope, $rootScope, $uibModal, $timeout, $location, $filter, WSService) {

        var WSService = WSService;

        $rootScope.deviceList = [];
        $rootScope.deviceSelected = {};
        $rootScope.devicePrinter = {};
        $scope.paperTypeSelected = {};
        $rootScope.paperType = {};
        $rootScope.dockUrl = "ws://192.168.1.1:9876/ws/";
        $rootScope.dockConnected = false;


        $scope.wirelessSSID = "";
        $scope.wirelessPass = "";
        $scope.passType = "password";

        $rootScope.paperList = [{
            name: "58mm",
            type: 0
        }, {
            name: "80mm",
            type: 1
        }]

        if (localStorage.dockUrl) {
            $rootScope.dockUrl = localStorage.dockUrl;
            console.log("$rootScope.dockUrl = ");
            console.log($rootScope.dockUrl);
        }

        if (localStorage.devicePrinter) {
            $rootScope.devicePrinter = JSON.parse(localStorage.devicePrinter);
            console.log("$rootScope.devicePrinter = ");
            console.log($rootScope.devicePrinter);
        }

        if (localStorage.paperType) {
            $rootScope.paperType = JSON.parse(localStorage.paperType);
            $scope.paperTypeSelected = $rootScope.paperType;
        } else {
            $scope.paperTypeSelected = $rootScope.paperList[0];
            $rootScope.paperType = $scope.paperTypeSelected;
        }


        $scope.safeApply = function(fn) {
            if (this.$root) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
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

        WSService.addCallBack(MSG_TYPE_GET_DEVICE_LIST, $scope.processDeviceList);
        WSService.addEventConnectCallBack(function() {
            $scope.safeApply(function() {
                $rootScope.dockConnected = true;
                $scope.sendMsgGetDeviceList();
                localStorage.dockUrl = $rootScope.dockUrl;
            });
        });
        WSService.addEventDisConnectCallBack(function() {
            $scope.safeApply(function() {
                $rootScope.dockConnected = false;
            });
        });

        WSService.addNtfCallBack(MSG_DEVICE_STATUS_CHANGE, function(message) {
            $scope.safeApply(function() {
                $scope.sendMsgGetDeviceList();
            });
        });

        $scope.sendMsgGetDeviceList = function() {
            var jsonObj = WSService.getHeader(MSG_TYPE_GET_DEVICE_LIST);
            jsonObj.type = 1;

            WSService.send(jsonObj);
        };

        WSService.addCallBack(MSG_TYPE_CONTROL_DEVICE, function(message) {
            console.log("Set printer response");
            if (message.status = 1) {
                localStorage.devicePrinter = JSON.stringify($rootScope.devicePrinter);
                $.alert("Bạn đã chọn máy in thành công", {
                    title: "Thông báo",
                    type: "success"
                });
            } else {
                $.alert("Có lỗi xảy ra, F5 lại", "Thông báo");
            }
        });

        $scope.selectPrinter = function() {
            $rootScope.devicePrinter = $rootScope.deviceSelected;
            console.log("selectPrinter");
            console.log($rootScope.devicePrinter);

            var jsonObj = WSService.getHeader(MSG_TYPE_CONTROL_DEVICE);
            jsonObj.uid = $rootScope.devicePrinter.uid;
            jsonObj.type = 1;
            jsonObj.ctl = 0;

            WSService.send(jsonObj);
        }

        $scope.setDockUrl = function() {
            WSService.start($rootScope.dockUrl);
        }

        $scope.selectPaper = function() {
            $rootScope.paperType = $scope.paperTypeSelected;

            console.log($scope.paperTypeSelected);
            localStorage.paperType = JSON.stringify($rootScope.paperType);
        }

        WSService.addCallBack(MSG_WIRELESS_CONFIG_CHANGE, function(message) {
            console.log("Response from change wifi");
            console.log(message);

            if (message.status = 1) {
                $.alert("Bạn đã thay đổi cấu hình wifi thành công", {
                    title: "Thông báo",
                    type: "success"
                });
            } else {
                $.alert("Cấu hình wifi lỗi", "Thông báo");
            }
        });

        $scope.connectToWifi = function() {
            var jsonObj = WSService.getHeader(MSG_WIRELESS_CONFIG_CHANGE);
            jsonObj.ssid = $scope.wirelessSSID;
            jsonObj.password = $scope.wirelessPass;
            jsonObj.fullconfig = "";

            console.log("send change wifi");
            console.log(jsonObj);
            WSService.send(jsonObj);
        }

        $scope.showPassword = function() {
            if ($scope.passType == "password") {
                $scope.passType = "text";
            } else {
                $scope.passType = "password";
            }
        }
    }


})();
