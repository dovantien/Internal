angular.module('starter.controllers', ['starter.controllers.AuthController',
  'starter.controllers.OrderController','angular-md5','starter.controllers.OrderHistoryController',
  'starter.controllers.BarOrderController','starter.controllers.CashierController','starter.controllers.PaidController',
  'starter.controllers.BarHistoryController'
])

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].focus(); 
      }, 150);
    }
  };
})
.controller('AppCtrl', function($scope, $rootScope, $stateParams, APIService, $http, UserService, $state, UtilsService) {
  $rootScope.utils = UtilsService;
  $rootScope.user = UserService.getUser();
  $scope.formData = {
    oldPass:"",
    newPass:"",
    reNewPass:""
  };
  $scope.logOut = function() {
    console.log($http.defaults.headers.common.Authorization);
    APIService.api_logout({ authKey: $http.defaults.headers.common.Authorization }).then(function(result) {
      console.log(JSON.stringify(result));
    });
  }
  $scope.clickChangePassword = function() {
  	$state.go('app.changepassword');
  }
  $scope.showPass = function (id) {
    console.log($scope.oldPass);
    if (document.getElementById(id).type == 'text') {
      document.getElementById(id).type = 'password';
    } else {
      document.getElementById(id).type = 'text';
    }
  }
  $scope.changePassword = function () {
    if ($scope.formData.newPass != $scope.formData.reNewPass) {
      alert('Nhập lại mật khẩu không khớp');
    } else {
      var apiData = {
      username: $scope.user.username,
      oldpassword: $scope.formData.oldPass,
      newpassword: $scope.formData.reNewPass
    }
    console.log(JSON.stringify(apiData))
    APIService.api_changepassword(apiData).then(function(result) {
      console.log(JSON.stringify(result));
    });
    }
  }
});
