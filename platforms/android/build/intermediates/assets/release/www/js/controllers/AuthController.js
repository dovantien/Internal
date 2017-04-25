angular.module('starter.controllers.AuthController', ['angular-md5'])
  .controller('AuthController', function($scope, $rootScope, APIService, $http, $state, UserService, md5, $ionicLoading, PopupService, $ionicDeploy) {
    console.log(md5.createHash('12345' || ''));

    $scope.$on('$ionicView.enter', function() {
      // $scope.username = 'test01';
      // $scope.password = '12345';
      $ionicDeploy.channel = 'dev';
      $ionicDeploy.check().then(function(snapshotAvailable) {
        if (snapshotAvailable) {
          // When snapshotAvailable is true, you can apply the snapshot
          $ionicLoading.show({
            template: 'Vui lòng chờ cập nhật phiên bản...'
          });
          console.log(snapshotAvailable);
          $ionicDeploy.download().then(function() {
            return $ionicDeploy.extract().then(function() {
              $ionicLoading.hide();
              var configPopup = {
                type: 1,
                message: 'Cập nhật thành công.',
                buttonName: 'OK',
                function: function() {
                  PopupService.closePopup();
                  $ionicDeploy.load();
                }
              }
              PopupService.showPopup(configPopup);
            });
          });
        } else {
          console.log('khong co ban cap nhat.')
        }
      });
    }); // end on enter
    $scope.login = function() {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
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
          console.log(UserService.getUser());
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
    }

  }); // End controller AuthController
