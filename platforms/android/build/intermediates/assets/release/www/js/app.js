angular.module('starter', ['ionic', 'ngCordova', 'ionic.cloud', 'ngAudio', 'starter.controllers', 'starter.services.APIService', 'starter.services.UtilsService', 'starter.services.UserService',
  'starter.services.ClosePopupService', 'starter.services.PopupService', 'tabSlideBox', 'ionicLazyLoad'
])

.run(function($ionicPlatform, $ionicDeploy) {
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicCloudProvider) {
  $ionicCloudProvider.init({
    "core": {
      "app_id": "d12c5211"
    }
  })

  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('start', {
      url: '/start',
      templateUrl: 'templates/start.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'AuthController'
    })

  .state('app.order', {
      url: '/order',
      params: { isLogin: null },
      views: {
        'menuContent': {
          templateUrl: 'templates/order.html',
          controller: 'OrderController'
        }
      }

    })
    .state('app.orderhistory', {
      url: '/orderhistory',
      views: {
        'menuContent': {
          templateUrl: 'templates/orderhistory.html',
          controller: 'OrderHistoryController'
        }
      }

    })
    .state('app.barorder', {
      url: '/barorder',
      views: {
        'menuContent': {
          templateUrl: 'templates/barorder.html',
          controller: 'BarOrderController'
        }
      }
    })
    .state('app.cashier', {
      url: '/cashier',
      views: {
        'menuContent': {
          templateUrl: 'templates/cashier.html',
          controller: 'CashierController'
        }
      }
    })
    .state('app.setting', {
      url: '/setting',
      views: {
        'menuContent': {
          templateUrl: 'templates/setting.html',
          controller: 'AppCtrl'
        }
      }

    })
    .state('app.changepassword', {
      url: '/changepassword',
      views: {
        'menuContent': {
          templateUrl: 'templates/changepassword.html',
          controller: 'AppCtrl'
        }
      }
    })


  $urlRouterProvider.otherwise('/login');
});
