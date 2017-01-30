angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $timeout) {

  $scope.speedArr          = [];

  function resetVariables(){

    $scope.selectedLog       = null;

    $scope.startLoadingLog   = null;
    $scope.loadingLog        = null;
    $scope.loadingLogError   = null;
    $scope.emptyLogError     = null;

    $scope.startExecutingLog = null;
    $scope.executingLog      = null;

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
    //   $scope.logs = response.data;
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
                          "/home/luizfeli/public_html/wifitracker/2017-01-26-17-21-44.json",
                          "/home/luizfeli/public_html/wifitracker/2017-01-26-17-27-12.json",
                          "/home/luizfeli/public_html/wifitracker/2017-01-26-17-35-56.json",
                          "/home/luizfeli/public_html/wifitracker/2017-01-29-08-42-55.json",
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
          $http({
            method: 'GET',
            // url: 'http://luizfelipe.com.br/wifitracker',                             //cors
            // url: 'http://luizfelipe.com.br/wifitracker/list.php',                   //erro no json
            url: 'http://luizfelipe.com.br/wifitracker/get.php?name=2017-01-25-17-27-03.json', //cors
            // url: 'logs/abcd-2017-01-23-18-02-38.json',
            headers: {'Content-Type': 'application/json'}

          })
        .then(function(response, status) {


          console.log(response);

          var events = response.data.events;

          events.forEach(function(event){
            $scope.speedArr.push(event.position.speed);
          })


          // $scope.file = response.data;
          //
          // $scope.file.events.forEach(function(event){
          //
          //   if(event.type === 'real-arrive'){
          //     $scope.file.arrive = event;
          //   }
          //
          //   if(event.type === 'real-departure'){
          //     $scope.file.departure = event;
          //   }
          // })

        }, function(response, status){
          console.log(response);
          alert('Algo deu errado');
        }).then(function(){
          console.log($scope.speedArr);
        })



  };


//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------


function demoroScan(scan){

          // get events from JSON
                WifiWizard.getScanResults({numLevels: true},function(networks){
                    /*---------------------------|
                    |
                    |  userReviewdPlaces contém:
                    |    array de places
                    |
                    |  user.ReviewdPlaces[i].place contém:
                    |    Informação sobre o place (object)
                    |    Array de networks.
                    */

                    //compare
                    $scope.keepGoing = true;

                    //Para cada place:
                    for (var i = 0, len = $localStorage.userReviewdPlaces.length; i< len; i++){
                        if ($scope.keepGoing){

                            place = $localStorage.userReviewdPlaces[i];

                            //Para cada uma das redes de um place:
                            for (var j = 0, len2 = place.networks.length; j < len2; j++){
                                if ($scope.keepGoing){
                                    placeNetwork = place.networks[j];

                                    //Pra cada uma das redes locais guardads no scan anterior:
                                    for (var k = 0, len3 = networks.length ; k < len3; k++){
                                        network = networks[k];

                                        if ($scope.keepGoing){
                                            console.log(JSON.stringify('comparing: ' +  placeNetwork.SSID + ' -- ' + network.SSID ));

                                            if (placeNetwork.BSSID === network.BSSID){
                                                $Configurations.setLog('[Debug] MATCH: Possible potential waiting: ' + network.SSID);
                                                $scope.PlaceNetworkConfirmation = network;
                                                $scope.keepGoing = false;
                                            }

                                        } else {
                                          // $Configurations.setLog('keepgoing2: ' + $scope.keepGoing);
                                          break;}
                                    }
                                } else {
                                  // $Configurations.setLog('keepgoing1: ' + $scope.keepGoing);
                                  break;}
                            }
                        } //keep going (close)


                        // Se achou algum match setou o keepGoing como false, permitindo assim o acesso ao trecho abaixo:
                        if(!$scope.keepGoing) {
                            $Configurations.setLog('Calling checkPotentialWaiting');
                            //Se houver algum match do scan de redes atuais com o scan de
                            // redes guardado ao realizar uma review então chama a função:
                            checkPotentialWaiting();
                        }

                        var now = new Date();

                        if (($localStorage.potentialWaitingTime != 0) && (now >= $localStorage.maxPWT)){
                        $Configurations.setLog('Expirando rascunho de pwt');
                          //Espera em potencial expirada.
                          $localStorage.potentialWaiting = false;
                          $localStorage.potentialWaitingTime = 0;

                        }
                        else{
                          $Configurations.setLog('Não é necessário expirar o rascunho de pwt.');
                        }
                    } // place (close)

                    numberOfScansExecuted++;
                  }, function(){
                    alert('WIFI SCAN - failed! WIFI is not enabled on the device! Turn it on ');
                    $Configurations.setLog('[Debug] WIFI Bug, please contact the support.');
                  });
} //demoroScan

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------


function checkPotentialWaiting(){

  //Não há espera em potencial cadastrada
  if (!$localStorage.potentialWaiting){
      console.log('*** NÃO TEM ESPERA POTENCIAL  ***');

      //Espera em potencial detectada
      var now = new Date();
      $localStorage.potentialWaitingTime = now;

      $localStorage.minPWT = new Date();
      $localStorage.minPWT.setMinutes($localStorage.potentialWaitingTime.getMinutes() + $scope.minPotentialWaitingTime);


      $localStorage.maxPWT = new Date();
      $localStorage.maxPWT.setMinutes($localStorage.potentialWaitingTime.getMinutes() + $scope.maxPotentialWaitingTime);

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
      console.log('*** espera ***');
      var now = new Date();

      //Confirmando espera em potencial.

      $Configurations.setLog('checking if $now >= $minPWT ');


      if (now >= $localStorage.minPWT){
          //Espera (detectada) confirmada

          $Configurations.setLog('Confirmation: There is a potential waiting for: ' + $localStorage.potentialWaiting.place.name);
          console.log('*** STEP (3) ***');

          checkDND();
          demoroScanDeparture();

      }
  }
}

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------


function checkDND(){

        //Se tiver setado testa...
        if ($localStorage.temporaryDisturb[place.place.id]){
            //Data atual para comparação
            var date = new Date();

            //Data do localStorage (guardada na ultima vez que uma sugestão de espera foi feita para este place) [em dias]
            var diffDaysDays =  Math.floor(( Date.parse(date) - Date.parse($localStorage.temporaryDisturb[place.place.id]) ) / 86400000);
        }
        //se não tiver setado diffDays = 2
        else {
            diffDaysDays = 2;
        }


        // -------------------------------------------------


        if (diffDaysDays < 1){
            $Configurations.setLog('Demoro tried to disturb user about place: ' + place.place.name + '. But user should not be bothered TODAY about this place. ');
        }
        else{
            console.log(')*** STEP (5 )***');

            //Verifica se a detecção de esperas para este place está desabilitada permanentemente.
            if ($localStorage.permanentDisturb[place.place.id]){
              $Configurations.setLog('Demoro tried to disturb user about place: ' + place.place.name + '. But user should never be bothered about this place. ');
            }
            else{
                console.log('*** STEP (6) ***');

                //Verifica se a detecção de esperas para este place está desabilitada por HOJE.
                if ($localStorage.todayDisturb[place.place.id]){
                    //Data atual para comparação
                    var date = new Date();

                    //Data do localStorage (guardada na ultima vez que uma sugestão de espera foi feita para este place) [em dias]
                    var diffDays =  Math.floor(( Date.parse(date) - Date.parse($localStorage.todayDisturb[place.place.id]) ) / 86400000);
                }
                //Se não ta setado, jump.
                else {
                    diffDays = 2;
                }


                // -------------------------------------------------


                if (diffDays < 1){
                    $Configurations.setLog('Demoro tried to disturb user about place: ' + place.place.name + '. But user should not be bothered TODAY anymore about THIS place. ');
                }
                else{
                    console.log('*** STEP (7) ***');
                    //Verifica se a detecção de esperas para este place está desabilitada por 3 horas.
                    if ($localStorage.temporaryDisturb[place.place.id]){

                        //Data atual para comparação
                        var date = new Date();

                        //Data do localStorage (guardada na ultima vez que uma sugestão de espera foi feita para este place) [em minutos]
                        var diffMinutes =  Math.floor(( Date.parse(date) - Date.parse($localStorage.temporaryDisturb[place.place.id]) ) / 60000);
                    }
                    else {
                        diffMinutes = 190;
                    }


                    // -------------------------------------------------


                    if (diffMinutes < 180){
                        $Configurations.setLog('Demoro tried to disturb user about place: ' + place.place.name + '. But user should not be bothered TODAY anymore about THIS place. ');
                    }
                    else{
                        console.log('*** STEP (8)');
                        //Demorô agora pode sugerir uma espera para o usuário:

                        //Verifica se já existe um popup de sugestão visível para o usuário
                        if ($rootScope.demoroPopup){
                            $Configurations.setLog('Demoro tried to suggest a waiting place. But there is a suggestion popup already. Please close it first.');
                        }
                        else {
                            suggestWaiting();
                        }
                    } //step 8
                } // step 7
            } //step 6
        } //step 5
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











})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
