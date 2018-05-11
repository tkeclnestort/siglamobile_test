// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('thyssenApp', ['ionic', 'thyssenApp.controllers', 'ionic-modal-select'])
  .run(function($ionicPlatform, $rootScope, $ionicLoading) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova) {
        cordova.getAppVersion(function(version) {
            $rootScope.appVersion = version;
        });
      }else{
            $rootScope.appVersion = "-";
      }
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      $rootScope.$on('loading:show', function() {
        $ionicLoading.show({
          template: 'Cargando...'
        });
      });
      $rootScope.$on('loading:hide', function() {
        $ionicLoading.hide();
      });
    });
  })
  .constant('appConfig', {
    appName: 'SIGLA Movil',
  //nbdebug: 'false', apiUrl: 'http://mobile.tkelatam.com/siglam/api', loginUrl: 'http://mobile.tkelatam.com/siglam/app/login', lblTest : '',
  //nbdebug: 'false', apiUrl: 'http://localhost/server/api', loginUrl: 'http://localhost:8100/app/login', lblTest : 'TEST Azure',
  nbdebug: 'false', apiUrl: 'http://mobile.tkelatam.com/siglam-test/api', loginUrl: 'http://mobile.tkelatam.com/siglam-test/app/login', lblTest : 'TEST Azure',
  
})
.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
  $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl'
      })

      .state('app.otc-list', {
        url: '/otcs',
        views: {
          'menuContent': {
            templateUrl: 'templates/otc_list.html',
            controller: 'OtcListCtrl',
            cache: false,
          }
        }
      })
      .state('app.otc-detail', {
        url: '/otc_list/:otcId',
        views: {
          'menuContent': {
            templateUrl: 'templates/otc_detail.html',
            controller: 'OtcDetailCtrl'
          }
        }
      })
      .state('app.otp-list', {
        url: '/otps',
        views: {
          'menuContent': {
            templateUrl: 'templates/otp_list.html',
            controller: 'OtpListCtrl',
            cache: false,
          }
        }
      })
      .state('app.otp-detail', {
        url: '/otp_list/:otpId',
        views: {
          'menuContent': {
            templateUrl: 'templates/otp_detail.html',
            controller: 'OtpDetailCtrl',
            cache: false,
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        resolve: {
          listaPaises: function(SiglaSyncDataFactory) {
            return SiglaSyncDataFactory.obtenerPaises();
          }
        },
        controller: 'LoginCtrl'
      })
      .state('app.inicio', {
        url: '/inicio',
        views: {
          'menuContent': {
            templateUrl: 'templates/inicio.html',
          }
        },
        resolve: {
          listaTiposReq: function(SiglaSyncDataFactory, $window) {
            SiglaSyncDataFactory.obtenerTiposReq().then(function(response){
              $window.sessionStorage.setItem('tiposreq', JSON.stringify(response.data));
            });
            SiglaSyncDataFactory.getEstadosList().then(function(response) {
              $window.sessionStorage.setItem('estadossit', JSON.stringify(response.data));
            });
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.interceptors.push('loadingInterceptor');
    $httpProvider.interceptors.push('devInterceptor');
  })
  .directive('otcListWidget', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/otc_list_widget.html'
    };
  })
