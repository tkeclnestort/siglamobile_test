angular.module('thyssenApp.services', [])
  .factory('devInterceptor', function($q, appConfig) {
    return {
      'request': function(config) {
        if (appConfig.nbdebug === 'true') {
          if (config.url.includes("?"))
            config.url = config.url + '&XDEBUG_SESSION_START=netbeans-xdebug';
          else
            config.url = config.url + '?XDEBUG_SESSION_START=netbeans-xdebug';
        }
        return config || $q.when(config);
      }
    }
  })
  .factory('loadingInterceptor', function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })
  .factory('authInterceptor', function($q, $window, $location) {
    return {
      request: function(config) {
        if ($window.sessionStorage.access_token) {
          //HttpBearerAuth
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.access_token;
        }
        return config;
      },
      responseError: function(rejection) {
        if (rejection.status === 401) {
          $location.path('/login').replace();
        }
        return $q.reject(rejection);
      }
    };
  })
  .factory('OtcDataFactory', function($q, $http, appConfig) { //Ordenes de Trabajo Correctivas
    var requerimientosDataSource = appConfig.apiUrl + '/requerimientos';
    var equiposDataSource = appConfig.apiUrl + '/equipos';
    return {
      getOtcList: function(currentPage) {
        return $http.get(appConfig.apiUrl + '/averias?page=' + currentPage).then(function(response) {
          var pageTotalCount = parseInt(response.headers('X-Pagination-Page-Count'));
          if (currentPage <= pageTotalCount)
            return response.data;
          else
            return [];
        });
      },
      /*getUltimasOtc: function(id) {
  return $http.get(appConfig.apiUrl + '/ultimasaverias?id=' + id).then(function(response){
  return response.data;
});
},*/

      getEquipos: function() {
        //descomentar cuando se implemente el servicio desde BD
        // return $http.get(equiposDataSource).then(function(response){
        //               return response.data;
        //           });
        var obj = [{
            label: "102868",
            id: "1"
          },
          {
            label: "876534",
            id: "2"
          },
          {
            label: "81383",
            id: "3"
          },
          {
            label: "132453",
            id: "4"
          }
        ]

        var deferred = $q.defer();
        deferred.resolve(obj);
        return deferred.promise;

      },
      getMotivosList: function() {
        var obj = [{
            label: "No hay Equipo",
            id: "1"
          },
          {
            label: "Analisis Técnico",
            id: "2"
          },
          {
            label: "Piezas",
            id: "3"
          },
          {
            label: "Pedido del Cliente",
            id: "4"
          },
          {
            label: "Reparación",
            id: "5"
          },
          {
            label: "Modernización",
            id: "6"
          },
        ];
        var deferred = $q.defer();
        deferred.resolve(obj);
        return deferred.promise;

      },
      getPiezasList: function() {
        var obj = [{
            label: "Cabina externo/Contra Peso",
            id: "14"
          },
          {
            label: "Pavimento",
            id: "12"
          },
          {
            label: "Puertas/Cabina externa(NMPP)",
            id: "203"
          },
        ];
        var deferred = $q.defer();
        deferred.resolve(obj);
        return deferred.promise;

      },
      getDefectosList: function() {
        var obj = [{
            label: "Defecto mecánico de puerta de cabina",
            id: "8701"
          },
          {
            label: "Defecto de funcionamiento eléctrico",
            id: "8702"
          },
          {
            label: "Defecto de funcionamiento mecánico",
            id: "8703"
          },
          {
            label: "Defecto en el cableado de la cabina",
            id: "8704"
          },
        ];
        var deferred = $q.defer();
        deferred.resolve(obj);
        return deferred.promise;

      },
      getAccionesList: function() {
        var obj = [{
            label: "Ajuste",
            id: "1"
          },
          {
            label: "Lubricación",
            id: "2"
          },
          {
            label: "Limpieza",
            id: "3"
          },
          {
            label: "Sustitución",
            id: "4"
          },
          {
            label: "Inspección",
            id: "5"
          },
        ];
        var deferred = $q.defer();
        deferred.resolve(obj);
        return deferred.promise;

      },
      getOtc: function(otcId) {
        return $http.get(appConfig.apiUrl + '/averia?id=' + otcId).success(function(data, status, headers, config) {
          return data;
        });
      },
      searchOtc: function(qs) {
        return $http.post(appConfig.apiUrl + '/searchaverias', {
          "qs": qs
        }).success(function(data, status, headers, config) {
          return data;
        });
      }
    }
  })
  .factory('OtpDataFactory', function($q, $http, appConfig) { //Ordenes de Trabajo Preventivas
    var requerimientosDataSource = appConfig.apiUrl + '/requerimientos';
    return {
      getOtpList: function(currentPage) {
        return $http.get(appConfig.apiUrl + '/partes?page=' + currentPage).then(function(response) {
          var pageTotalCount = parseInt(response.headers('X-Pagination-Page-Count'));
          if (currentPage <= pageTotalCount)
            return response.data;
          else
            return [];
        });
      },
      getOtp: function(otpId) {
        return $http.get(appConfig.apiUrl + '/parte?id=' + otpId).success(function(response) {
          return response;
        });
      },
      getActividadesList: function(parte_id) {
        return $http.get(appConfig.apiUrl + '/actividades?idparte=' + parte_id).then(function(response) {
          return response.data;
        });
      },
      searchOtp: function(qs) {
        return $http.post(appConfig.apiUrl + '/searchpartes', {
          "qs": qs
        }).success(function(data, status, headers, config) {
          return data;
        });
      }
    }
  })
  .factory('SiglaSyncDataFactory', function($q, $http, appConfig) {
    return {
      obtenerUltimasAverias: function(idEquipo) {
        return $http.get(appConfig.apiUrl + '/ultimasaverias?id=' + idEquipo).then(function(response) {
          return response.data;
        });
      },
      obtenerPaises: function() {
        return $http.post(appConfig.apiUrl + '/listapaises').success(function(data, status, headers, config) {
          return data;
        });
      },
      obtenerTiposReq: function() {
        return $http.post(appConfig.apiUrl + '/tiporeqs').success(function(data, status, headers, config) {
          return data;
        });
      },
      getEstadosList: function() {
        return $http.get(appConfig.apiUrl + '/estadossituacion').success(function(data, status, headers, config) {
          return data;
        });
      }
    }
  })
  .factory('estadosFactory', function($q, $http, appConfig, $ionicPopup, $ionicLoading) {
    return {
      //ESTADOS PARA ORDENES (PARTES Y AVERIAS)
      setAceptar: function(id) {
        return $http.post(appConfig.apiUrl + '/aceptarorden', {
          "id": id
        }).success(function(data, status, headers, config) {
          return data;
        });
      },
      setIniciar: function(id) {
        return $http.post(appConfig.apiUrl + '/iniciarorden', {
          "id": id
        }).success(function(data, status, headers, config) {
          return data;
        });
      },
      setContinuar: function(id) {
        return $http.post(appConfig.apiUrl + '/continuarorden', {
          "id": id
        }).success(function(data, status, headers, config) {
          return data;
        });
      },
      setPausar: function(id) {
        return $http.post(appConfig.apiUrl + '/pausarorden', {
          "id": id
        }).success(function(data, status, headers, config) {
          return data;
        });
      },
      setFinalizar: function(model) {
        return $http.post(appConfig.apiUrl + '/finalizarorden', model).success(function(data, status, headers, config) {
            return data;
          })
          .error(function(error, status, code) {
            $ionicLoading.hide();
            if (error.code === 9100) {
              $ionicPopup.alert({
                title: 'Error',
                template: error.message
              });
            } else {
              if (status === 422) {
                $ionicPopup.alert({
                  title: 'Error',
                  template: 'Se ha producido un error de autenticaci&oacute;n.'
                });
              } else {
                $ionicPopup.alert({
                  title: 'Error',
                  template: 'No se ha podido finalizar '
                });
              }
            }
          });
      },
      setRechazar: function(id) {
        return $http.post(appConfig.apiUrl + '/rechazarorden', {
          "id": id
        }).success(function(data, status, headers, config) {
          return data;
        });
      }
    }
  });
