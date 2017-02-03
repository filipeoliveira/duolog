angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $timeout) {

  function resetVariables(){

    $scope.selectedLog       = null;

    $scope.startLoadingLog   = null;
    $scope.loadingLog        = null;
    $scope.loadingLogError   = null;
    $scope.emptyLogError     = null;

    $scope.startExecutingLog = null;
    $scope.executingLog      = null;

    $scope.potencialWaiting        = {};
    $scope.globalPWTMin            = 2; //minutes
    $scope.globalPWTMax            = 4;

    $scope.hasPotentialWaiting     = null;
  }

  // Responsible for loading initial log files in decrescent time order (newer to oldest)
  $scope.initialize = function(){
    resetVariables();
    // $http({
    //   method: 'GET',
    //   // url: 'http://luizfelipe.com.br/wifitracker/list.php',
    //   url: 'http://luizfelipe.com.br/wifitracker/',
    //   headers: {'Content-Type': 'application/json'}
    // })
    // .then(function(response, status) {
    //
    //   console.log(response);
    //
    //   $scope.serverLogs = response.data;
    //
    //
    // }, function(response, status){
    //   console.log(response);
    //   alert('Algo deu errado');
    // }).then(function(){
    //   console.log('ok');
    // })

    //Initial logs from server
    $scope.serverLogs = [
                          "/home/luizfeli/public_html/wifitracker/2017-01-31-21-40-24.json",
                          "/home/luizfeli/public_html/wifitracker/2017-01-31-18-51-09.json",
                          "/home/luizfeli/public_html/wifitracker/abcd-2017-01-23-18-02-38.json"
                        ].reverse();

    //Show parsed log
    $scope.logs = [];
    var index_log = 0;

    //Iterating trough logs
    $scope.serverLogs.forEach(function(log){

      var log_tmp = log.split("/");
      var log_url = log_tmp[log_tmp.length - 1];

      //cuting out .json
      log_tmp = log_url.split(".");

      //cuting out "-"
      log_tmp = log_tmp[0].split("-");

      //Array.lenght = 6 without name;
      if (isNaN(log_tmp[0])){
        var obj = {
          "name"      : log_tmp[0],
          "date"      : log_tmp[3] + "/" + log_tmp[2] + "/" + log_tmp[1],
          "timestamp" : log_tmp[1] + "-" + log_tmp[2] + "-" + log_tmp[3] + "-" + log_tmp[4] + "-" + log_tmp[5] + "-" + log_tmp[6],
          "url"       : "http://luizfelipe.com.br/wifitracker/get.php?name=" + log_url
        }
      }
      else {
        var obj = {
          "name"      : "no_name_log_" + index_log,
          "date"      : log_tmp[2] + "/" + log_tmp[1] + "/" + log_tmp[0],
          "timestamp" : log_tmp[0] + "-" + log_tmp[1] + "-" + log_tmp[2] + "-" + log_tmp[3] + "-" + log_tmp[4] + "-" + log_tmp[5],
          "url"       : "http://luizfelipe.com.br/wifitracker/get.php?name=" + log_url
        }

        index_log = index_log + 1;

      }
      $scope.logs.push(obj);
    })
  }

  $scope.loadLog = function(index, log_url) {
    resetVariables();
    $scope.startLoadingLog = true;

    $http({
        method: 'GET',
        url: log_url,
        headers: {'Content-Type': 'application/json'}
    })
   .then(function(response, status) {
        console.log(response);

        $scope.selectedLog = response.data;

        if ($scope.selectedLog === ""){
            $scope.emptyLogError = true;
        }
        else {
            $scope.selectedLog.date = $scope.logs[index].date;

            var events = response.data.events;

            //Geting Arrive and Departure event
            if ($scope.selectedLog.events){
                $scope.selectedLog.events.forEach(function(event){
                    if(event.type === 'real-arrive'){
                        $scope.selectedLog.arrive = event;
                    }

                    if(event.type === 'real-departure'){
                        $scope.selectedLog.departure = event;
                    }
                });
            }
            else {
              $scope.selectedLog.events = []
            }
        }

        console.log($scope.selectedLog);

        $timeout(function(){
          $scope.startLoadingLog = false;
          $scope.logLoaded = true;

        }, 1500)


    }, function(response, status){
        console.log(response);

        $timeout(function(){
            $scope.startLoadingLog = false;
            $scope.loadingLogError = true;
            $scope.logLoaded       = false;
            alert('Algo deu errado');
        }, 1000)
    });
  };

  $scope.simulate = function(selectedLog){

    console.log(selectedLog);

    var events              = selectedLog.events;
    var knowledges_networks = selectedLog.knowledges_networks;

    //For each Events
    events.forEach(function(event){
        var eventNetworks = event.data;

        //For each network in events
        eventNetworks.every(function(eventNetwork){

          //For each network in events compare with each knowledge network.
          knowledges_networks.every(function(knowledgeNetwork){

            //If I dont have a potentialWaiting.network set than I continue to iterate.
            if(!$scope.hasPotentialWaiting){
              if (eventNetwork.BSSID === knowledgeNetwork.BSSID){
                console.log('MATCH: Possible potencial waiting: ' + knowledgeNetwork.SSID);

                //if I found networks with same BSSID, then set potentialWaiting.time minutes;
                var formattedEventTime = new Date(event.time);
                var formattedEventTimeMin = new Date(event.time);
                var formattedEventTimeMax = new Date(event.time);
                formattedEventTimeMin.setMinutes(formattedEventTime.getMinutes() + $scope.globalPWTMin);
                formattedEventTimeMax.setMinutes(formattedEventTime.getMinutes() + $scope.globalPWTMax);

                $scope.hasPotentialWaiting = true;
                $scope.potentialWaiting    = {
                  "network": knowledgeNetwork,
                  "time": formattedEventTime,
                  "min": formattedEventTimeMin,
                  "max": formattedEventTimeMax
                }
                return false;
              }
            }
            //We already have a potentialWaiting.
            else{
              checkPotentialWaiting();
              var event_time = new Date(event.time);
              if ((event_time >= $scope.potentialWaiting.min) && (event_time < $scope.potentialWaiting.max)){
                  //Espera (detectada) confirmada

                  return false;

              }

              // checkPotentialWaiting();
            }

          });

        });

    });
  }



  function checkPotentialWaiting(){

    //There is a potential waiting
    if (!$scope.potentialWaiting){
        console.log('*** NÃO TEM ESPERA POTENCIAL  ***');

        //Espera em potencial detectada
        var now = new Date();
        $scope.potentialWaitingTime = now;

        // $scope.minPWT = new Date();
        // $scope.minPWT.setMinutes($scope.potentialWaitingTime.getMinutes() + $scope.minPotentialWaitingTime);
        //
        //
        // $localStorage.maxPWT = new Date();
        // $localStorage.maxPWT.setMinutes($localStorage.potentialWaitingTime.getMinutes() + $scope.maxPotentialWaitingTime);

        console.log('*** STEP (2) ***');

        console.log('minPWT: '+ $localStorage.minPWT);
        console.log('maxPWT: '+ $localStorage.maxPWT);
        console.log('*** CADASTRANDO UMA ESPERA EM POTENCIAL ***');

        $Configurations.setLog('Confirmation: There isn\'t a potential waiting registered yet;  Registering it!');
        $localStorage.potentialWaiting = {place: place.place, network: $scope.PlaceNetworkConfirmation};


        var time = new Date();
        $rootScope.devEstimatedArrivalTime = pad(time.getHours()) + ":" + pad(time.getMinutes()) + ":" + pad(time.getSeconds());
        var momentEstimated = moment($rootScope.devEstimatedArrival);

        console.log($rootScope.devEstimatedArrivalTime);
        return;
    }
    //Há uma espera em potencial cadastrada.
    else {
        var now = new Date();
        //Confirmando espera em potencial.

        if (now >= $scope.minPWT){
            //Espera (detectada) confirmada

            $Configurations.setLog('Confirmation: There is a potential waiting for: ' + $localStorage.potentialWaiting.place.name);
            console.log('*** STEP (3) ***');

            checkDND();
            demoroScanDeparture();

        }
    }
  }

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------


function suggestWaiting(){

    //FAZER O POPUP DE ALERTA
    // CAPTURAR O TEMPO ANTES DE ALERTAR!!!

    var time = new Date();
    $rootScope.devRealArrivalConfirmation = time;
    $rootScope.devRealArrivalConfirmationTime = pad(time.getHours()) + ":" + pad(time.getMinutes()) + ":" + pad(time.getSeconds());

    $scope.temp = '<span>Você está esperando no local: ' + place.place.name + ' ? </span></br><span>Não lembrar este local nunca mais</span><input type="checkbox" id="permanentDemoroDisturb"></input></br><span>Não detectar mais esperas por hoje para este local</span><input type="checkbox" id="todayDisturb" value="true"></input';

    $rootScope.demoroPopup = true;

    $ionicPopup.confirm({
        scope: $scope,
        title: 'Espera detectada',
        template: $scope.temp,
        cssClass: 'alertPopup',
        buttons:[{
          text: $translateIt('General.no'),
          type: 'button-default',
          onTap: function(e){
              $Configurations.setLog('User clicked in NO when asked about potential waiting in: ' + place.place.name);
              $Configurations.setLog('Demoro should not disturb user anymore about this place for 2 hours.');

              $rootScope.demoroPopup = false;
              var date = new Date();

              // -----------------------------------------------------------

              //Usuario não deve ser incomodado sobre este place nunca mais.
              if (document.getElementById('permanentDemoroDisturb').checked){
                  $localStorage.permanentDisturb[place.place.id] = date;
              }

              //Usuario não deve ser incomodado sobre este place por hoje.
              if (document.getElementById('todayDisturb').checked){
                  $localStorage.todayDisturb[place.place.id] = date;
              }

              //Usuario não deve ser incomodado sobre este place por 3 horas.
              $localStorage.temporaryDisturb[place.place.id] = date;

          }
        },{
              text: $translateIt('General.yes'),
              type: 'button-energized',
              onTap: function(e){
                  console.log(JSON.stringify(place));
                  $rootScope.demoroPopup = false;

                  //Setando place no factory.
                  $AppSession.selectPlace(place.place);

                  //Capturando place via factory.
                  $scope.selectedPlace = $AppSession.getSelectedPlace();
                  $rootScope.queues    = $scope.selectedPlace.queues;

                  $Configurations.setLog('User clicked in YES when asked about potential waiting in: ' + place.place.name)
                  var date = new Date();

                  // -----------------------------------------------------------

                  //Usuario não deve ser incomodado sobre este place nunca mais.
                  if (document.getElementById('permanentDemoroDisturb').checked){
                      $localStorage.permanentDisturb[place.place.id] = date;
                  }

                  //Usuario não deve ser incomodado sobre este place por hoje.
                  if (document.getElementById('todayDisturb').checked){
                      $localStorage.todayDisturb[place.place.id] = date;
                  }

                  if ($scope.selectedPlace.address == undefined ){
                      $rootScope.reportPlace = $scope.selectedPlace.name;
                  }
                  else {
                      $rootScope.reportPlace = $scope.selectedPlace.description;
                  }

                  $rootScope.reportQueue = $translateIt('ClockTimer.reportQueue');
              }
        }]
    });
}

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------











});
