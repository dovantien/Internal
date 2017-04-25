angular.module('starter.controllers.AuthController', ['angular-md5'])
    .controller('AuthController', function($scope, $rootScope, APIService, $http, $state, UserService, md5, $ionicLoading, PopupService, $ionicDeploy, $cordovaBarcodeScanner,$ionicLoading) {

        $scope.$on('$ionicView.enter', function() {
            // if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
            //   screen.lockOrientation('portrait');
            // }


            // $scope.username = 'test01';
            // $scope.password = '12345';
            // navigator.geolocation.getCurrentPosition(function(pos) {
            //     alert(pos);
            // }, function(err) {

            // });

        });

        $scope.onSuccess = function(data) {
            console.log(data);
        };
        $scope.onError = function(error) {
            console.log(error);
        };
        $scope.onVideoError = function(error) {
            console.log(error);
        };
        var downloadImg = function() {
            console.log('downloadImg');
            APIService.api_get_product({ shopid: UserService.getUser().shopid }).then(function(resutlt) {
                listAllProducts = resutlt.data.products;
                UserService.setCacheImage([]);
                for (var i = 0; i < listAllProducts.length; i++) {
                    var url = listAllProducts[i].prodimg;
                    var filename = url.split("/").pop();
                    var targetPath = cordova.file.externalApplicationStorageDirectory + filename;
                    var ft = new FileTransfer();
                    ft.download(url,
                        targetPath,
                        function(entry) {
                            // console.log("download complete: " + i);
                            var image = UserService.getCacheImage();
                            image.push({
                                prodimg: entry.toURL()
                            });
                            UserService.setCacheImage(image);
                            // console.log(image.length);
                        },
                        function(error) {
                            // console.log("download error source " + i);
                        },
                        false, {});

                }
            }, function(error) {
                // body...
            });


        }
        $scope.login = function() {
            $ionicLoading.show({
                content: 'Loading',
                // animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            var apiData = {
                username: $scope.username,
                password: md5.createHash($scope.password || ''),
                version: NUMBER_VERSION
            };
            //$state.go('app.order');
            APIService.api_login(apiData).then(function(result2) {
                console.log(JSON.stringify(result2));
                // result2.data.data.shopid = 1; //test
                // result2.data.data.usergroupid = 0;
                if (result2.data.status) {
                    UserService.setUser(result2.data.data);
                    $rootScope.user = UserService.getUser();
                    //bat tat download
                    // if (ionic.Platform.isAndroid()) {
                    //     downloadImg();
                    // }

                    // console.log(UserService.getUser());
                    //vao trang order
                    $rootScope.listTable = {
                        selected: null
                    };
                    $state.go(listDefautlPage[result2.data.data.roleid]);
                    $ionicLoading.hide();
                } else {
                    $ionicLoading.hide();
                    var configPopup = {
                        type: 1,
                        message: 'Gặp lỗi đăng nhập.',
                        buttonName: 'OK',
                        function: function() {
                            PopupService.closePopup();
                        }
                    }
                    PopupService.showPopup(configPopup);
                }
            }, function(error) {

            });
        };
        $scope.isJson = function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        };
        $scope.onQrcode = function(imageData) {
            $cordovaBarcodeScanner.scan().then(function(imageData) {
                var check = imageData.text;
                // alert(check);
                if ($scope.isJson(check)) {
                    var parsedData = JSON.parse(check);
                }
                $scope.username = parsedData.id;
                $scope.password = parsedData.pass;
                $scope.login();
                console.log("Barcode Format -> " + imageData.format);
                console.log("Cancelled -> " + imageData.cancelled);
            }, function(error) {
                console.log("An error happened -> " + error);
            });
        };



    }); // End controller AuthController
