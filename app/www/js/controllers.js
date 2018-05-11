//angular.module('starter.controllers', [])
angular.module('thyssenApp.controllers', ['thyssenApp.services'])
  .controller('LoginCtrl', function($scope, $ionicLoading, $ionicPopup, $http, $ionicHistory, $state, $window, $location, SiglaSyncDataFactory, appConfig, listaPaises) {
    $scope.userModel = {};
    $scope.appConfig = appConfig;
    $scope.paises = listaPaises.data;
    $scope.doLogin = function() {
      $scope.submitted = true;
      $scope.error = {};
      $scope.userModel.idpais = $scope.userModel.pais.id
      $http.post(appConfig.loginUrl, $scope.userModel)
        .success(
          function(data) {
            $window.sessionStorage.access_token = data.access_token;
            $window.sessionStorage.idTecnico = data.idTecnico;
            $window.sessionStorage.idpais = $scope.userModel.pais.id;
            $window.sessionStorage.nombrepais = $scope.userModel.pais.nombre;
            $state.go('app.inicio');
          })
        .error(
          function(error, status, code) {
            $ionicLoading.hide();
            if (error.code === 9100) {
              $ionicPopup.alert({
                title: 'Error de Acceso',
                template: error.message
              });
            } else {
              if (status === 422) {
                $ionicPopup.alert({
                  title: 'Error de Acceso',
                  template: 'Verifique usuario y contraseña'
                });
              } else {
                angular.forEach(error, function(err) {
                  $scope.error[err.field] = err.message;
                  //$location.path('/inicio').replace();
                });
                $ionicPopup.alert({
                  title: 'Error de Acceso',
                  template: 'Contacte al administrador'
                });
              }
            }
          }
        );
    };

    $scope.logout = function() {
      delete $window.sessionStorage.access_token;
      $ionicHistory.clearCache().then(function() {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('login');
      });
    }
  })
  .controller('MenuCtrl', function($scope, $ionicHistory, $state, $window) {
    $scope.logout = function() {
      $window.sessionStorage.access_token = null;
      $ionicHistory.clearCache().then(function() {
        $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
        });
        $state.go('login');
      });
    }
  })

  .controller('OtcListCtrl', function($scope, $ionicLoading, $ionicPopup, $http, OtcDataFactory, $timeout, $ionicScrollDelegate, $window) {
    $scope.myType = "bar-assertive";
    $scope.currentOtcListPage = 1;
    $scope.moreOtcCanBeLoaded = false;
    $scope.otc_list = [];

    $scope.getList = function() {
      $scope.otc_list = []; //Vacío para que vacíe la lista de la página.
      $scope.currentOtcListPage = 1;
      OtcDataFactory.getOtcList($scope.currentOtcListPage).then(function(data) {
        $scope.otc_list = data;
        $scope.moreOtcCanBeLoaded = ($scope.otc_list.length > 0);
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error obteniendo la lista de Aver�as'
        });
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    $scope.getMore = function() {
      if ($scope.moreOtcCanBeLoaded) {
        $scope.currentOtcListPage += 1;
        OtcDataFactory.getOtcList($scope.currentOtcListPage).then(function(data) {
          if (data.length > 0) {
            $scope.otc_list = $scope.otc_list.concat(data);
            $scope.moreOtcCanBeLoaded = true;
          } else {
            $scope.currentOtcListPage -= 1;
            $scope.moreOtcCanBeLoaded = false;
          };
        }).catch(function(response) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Error',
            template: 'Error obteniendo m�s Aver�as'
          });
        }).finally(function() {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $scope.buscarOT = function(qs) {
      if (qs.buscar != '') {
        OtcDataFactory.searchOtc(qs.buscar).then(function(response) {
            $scope.otc_list = response.data;
          })
          .catch(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Error',
              template: 'Error buscando Aver�as'
            });
          })
      }
    };

    $scope.getList();
  })
  .controller('OtcDetailCtrl', function($scope, $ionicLoading, $ionicPopup, $http, $window, $stateParams, OtcDataFactory, $state, $ionicModal, SiglaSyncDataFactory, estadosFactory, $ionicHistory) {
    $scope.finalizarModel = {};
    $scope.finalizarModel.tipo = 1; //AVERIA
    $scope.finalizarModel.situacion = "";
    $scope.finalizarModel.id = $stateParams.otcId;

    $ionicModal.fromTemplateUrl('templates/finalizarModal.html', function(modal) {
      $scope.cuadroFinalizarModalOtc = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });
    $ionicModal.fromTemplateUrl('templates/r_clienteModal.html', function(modal) {
      $scope.relatoCliente = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    $scope.mostrarCuadroFinalizarModal = function() {
      $scope.cuadroFinalizarModalOtc.show();
    };
    $scope.cerrarCuadroFinalizarModal = function() {
      $scope.cuadroFinalizarModalOtc.hide();
    };
    $scope.mostrarRelatoCliente = function() {
      $scope.relatoCliente.show();
    };
    $scope.cerrarRelatoCliente = function() {
      $scope.relatoCliente.hide();
    };

    $scope.showOtcDetail = function() {
      OtcDataFactory.getOtc($stateParams.otcId).then(function(response) {
        $scope.otc = response.data[0];
        $scope.finalizarModel.numero = $scope.otc.numero;
        $scope.estadossit = JSON.parse(sessionStorage.estadossit);
        $scope.listaRequerimientos = JSON.parse(sessionStorage.tiposreq);
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error cargando detalle de Averia'
        });
      });

    };

    $scope.mostrarListaRequerimientos = function() {
      $scope.listaRequerimientos.show();
    };
    $scope.cerrarListaRequerimientos = function() {
      $scope.listaRequerimientos.hide();
    };

    $scope.cargarUltimasOTC = function() {
      $scope.ultimasOtc = []; //Vacío para que vacíe la lista de la página.
      SiglaSyncDataFactory.obtenerUltimasAverias($scope.otc.idEquipo).then(function(data) {
        $scope.ultimasOtc = data;
        $scope.equipo = $scope.otc.descEquipo;
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error obteniendo ultimas Averias'
        });
      });
    };

    $ionicModal.fromTemplateUrl('templates/ultimasOTCsModal.html', function(modal) {
      $scope.ultimasOTCsModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    // Open our new task modal
    $scope.mostrarUltimasOTC = function() {
      $scope.cargarUltimasOTC();
      $scope.ultimasOTCsModal.show();
    };

    // Close the new task modal
    $scope.cerrarUltimasOTC = function() {
      $scope.ultimasOTCsModal.hide();
    };

    $scope.aceptarOT = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Aceptar Aver&iacute;a?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setAceptar($stateParams.otcId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'La Avería ha sido Aceptada.'
                });
                $state.go('app.otc-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al Aceptar la Aver&iacute;��a.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error aceptando la Averia'
              });
            });
          }
        }]
      });
    };

    $scope.rechazarOT = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Confirma que desea Rechazar esta OT?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setRechazar($stateParams.otcId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'La Avería ha sido Rechazada.'
                });
                $state.go('app.otc-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurrió un error al rechazar la Avería.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error rechazando la averia'
              });
            });
          }
        }]
      });
    };

    $scope.estoyAquiOT = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Iniciar Servicio de Aver&iacute;a?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setIniciar($stateParams.otcId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'La Aver&iacute;a est� En Servicio.'
                });
                $state.go('app.otc-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al iniciar la Aver&iacute;a.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error Iniciando Averias'
              });
            });
          }
        }]
      });
    };

    $scope.finalizarOrden = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Finalizar el Servicio de Aver&iacute;a?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setFinalizar($scope.finalizarModel).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'La Aver&iacute;a ha sido Finalizada.'
                });
                $scope.cuadroFinalizarModalOtc.hide();
                $state.go('app.otc-list');
              }
            });
            // .catch(function(error, status, code) {
            //     $ionicLoading.hide();
            //     $ionicPopup.alert({
            //         template: 'Ocurrió un error al finalizar la Aver&iacute;a.'
            //     });
            // });
          }
        }]
      });
    };
    $scope.showOtcDetail();
  })
  .controller('OtpListCtrl', function($scope, $ionicLoading, $ionicPopup, $http, OtpDataFactory, $timeout, $ionicScrollDelegate, $window, $exceptionHandler) {
    $scope.myType = "bar-assertive";
    $scope.currentOtpListPage = 1;
    $scope.moreOtpCanBeLoaded = false;
    $scope.otp_list = [];

    $scope.getList = function() {
      $scope.otp_list = []; //Vacío para que vacíe la lista de la página.
      $scope.currentOtpListPage = 1;
      OtpDataFactory.getOtpList($scope.currentOtpListPage).then(function(data) {
        $scope.otp_list = data;
        $scope.moreOtpCanBeLoaded = ($scope.otp_list.length > 0);
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error obteniendo lista de Partes'
        });
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.getMore = function() {
      if ($scope.moreOtpCanBeLoaded) {
        $scope.currentOtpListPage += 1;
        OtpDataFactory.getOtpList($scope.currentOtpListPage).then(function(data) {
          if (data.length > 0) {
            $scope.otp_list = $scope.otp_list.concat(data);
            $scope.moreOtpCanBeLoaded = true;
          } else {
            $scope.currentOtpListPage -= 1;
            $scope.moreOtpCanBeLoaded = false;
          };
        }).catch(function(response) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Error',
            template: 'Error obteniendo m�s Partes'
          });
        }).finally(function() {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      } else {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    };

    $scope.buscarOT = function(qs) {
      if (qs.buscar != '') {
        OtpDataFactory.searchOtp(qs.buscar).then(function(response) {
            $scope.otp_list = response.data;
          })
          .catch(function(response) {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Error',
              template: 'Error buscando Partes'
            });
          })
      }
    };

    $scope.getList();

  })
  .controller('OtpDetailCtrl', function($scope, $ionicLoading, $ionicPopup, $http, $window, $stateParams, OtpDataFactory, SiglaSyncDataFactory, $ionicModal, $state, $ionicHistory, estadosFactory) {
    $scope.finalizarModel = {};
    $scope.finalizarModel.tipo = 0; //PREVENTIVA
    $scope.finalizarModel.situacion = "";
    $scope.finalizarModel.id = $stateParams.otpId;

    $ionicModal.fromTemplateUrl('templates/finalizarModal.html', function(modal) {
      $scope.cuadroFinalizarModalOtp = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    // abrir cuadro para finalizacion de OT
    $scope.mostrarCuadroFinalizarModal = function() {
      $scope.cuadroFinalizarModalOtp.show();
    };
    // cerrar (cancelar) cuadro para finalizacion de OT
    $scope.cerrarCuadroFinalizarModal = function() {
      $scope.cuadroFinalizarModalOtp.hide();
    };
    $scope.cargarUltimasOTC = function() {
      $scope.ultimasOtc = []; //Vacío para que vacíe la lista de la página.
      SiglaSyncDataFactory.obtenerUltimasAverias($scope.otp.idEquipo).then(function(data) {
        $scope.ultimasOtc = data;
        $scope.equipo = $scope.otp.descEquipo;
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error cargando Ultimas Averias'
        });
      });
    };

    $ionicModal.fromTemplateUrl('templates/ultimasOTCsModal.html', function(modal) {
      $scope.ultimasOTCsModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    // Open our new task modal
    $scope.mostrarUltimasOTC = function() {
      $scope.cargarUltimasOTC();
      $scope.ultimasOTCsModal.show();
    };

    // Close the new task modal
    $scope.cerrarUltimasOTC = function() {
      $scope.ultimasOTCsModal.hide();
    };


    $scope.cargarActividades = function() {
      $scope.actividades = []; //Vacío para que vacíe la lista de la página.
      OtpDataFactory.getActividadesList($scope.otp.parte_id).then(function(data) {
        $scope.actividades = data;
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error cargando actividades'
        });
      });
    };

    $ionicModal.fromTemplateUrl('templates/otp_actividades.html', function(modal) {
      $scope.actividadesModal = modal;
    }, {
      scope: $scope,
      animation: 'slide-in-up'
    });

    // Open our new task modal
    $scope.mostrarActividades = function() {
      $scope.cargarActividades();
      $scope.actividadesModal.show();
    };

    // Close the new task modal
    $scope.cerrarActividades = function() {
      $scope.actividadesModal.hide();
    };

    $scope.guardarActividades = function() {
      $scope.actividadesModal.hide();
    };

    $scope.showOtpDetail = function() {
      OtpDataFactory.getOtp($stateParams.otpId).then(function(response) {
        $scope.otp = response.data[0];
        $scope.finalizarModel.numero = $scope.otp.numero;
        $scope.listaRequerimientos = JSON.parse(sessionStorage.tiposreq);
        $scope.estadossit = JSON.parse(sessionStorage.estadossit);
      }).catch(function(response) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Error',
          template: 'Error cargando Detalle de Parte'
        });
      });
    };

    $scope.mostrarListaRequerimientos = function() {
      $scope.listaRequerimientos.show();
    };

    $scope.cerrarListaRequerimientos = function() {
      $scope.listaRequerimientos.hide();
    };

    $scope.iniciarOT = function() {
      $ionicPopup.confirm({
        template: '¿Confirma que desea Iniciar Servicio?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setIniciar($stateParams.otpId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'Se ha iniciado el Servicio.'
                });
                $state.go('app.otp-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al iniciar el Servicio.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error iniciando el Parte'
              });
            });
          }
        }]
      });
    }

    $scope.finalizarOrden = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Confirma que desea Finalizar el Servicio?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setFinalizar($scope.finalizarModel).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'El servicio ha sido Finalizado.'
                });
                $scope.cuadroFinalizarModalOtp.hide();
                $state.go('app.otp-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al finalizar el Servicio.'
                });
              }
            });
          }
        }]
      });
    }

    $scope.pausarOT = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Confirma que desea Pausar el Servicio?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setPausar($stateParams.otpId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'El servicio ha sido Pausado.'
                });
                $state.go('app.otp-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al Pausar el Servicio.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error Pausando el Parte'
              });
            });
          }
        }]
      });
    }

    $scope.continuarOT = function() {
      $ionicPopup.confirm({
        //title: '',
        template: '¿Confirma que desea Continuar el Servicio?',
        buttons: [{
          text: 'No'
        }, {
          text: '<b>S&iacute;</b>',
          type: 'button-positive',
          onTap: function(e) {
            estadosFactory.setContinuar($stateParams.otpId).then(function(response) {
              if (response.data) {
                $ionicHistory.clearCache();
                $ionicPopup.alert({
                  template: 'En Servicio nuevamente.'
                });
                $state.go('app.otp-list');
              } else {
                $ionicPopup.alert({
                  template: 'Ocurri&oacute; un error al Continuar el Servicio.'
                });
              }
            }).catch(function(response) {
              $ionicLoading.hide();
              $ionicPopup.alert({
                title: 'Error',
                template: 'Error Continuando el Parte'
              });
            });
          }
        }]
      });
    }
    $scope.showOtpDetail();
  });
