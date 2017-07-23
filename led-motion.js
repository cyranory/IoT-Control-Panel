// handles all button interactions in the user interface

var app = angular.module('ioApp',[]);
 
 app.controller('ArduController', ['$scope',function ($scope) { 
     //$scope is used to update data from js to the html tags and vice versa,

    $scope.motionOn = function () {
        firebaseClient.pushMotionData('on');
        console.log("motion sensor started");
};

   $scope.motionOff = function () {
       firebaseClient.pushMotionData('off');
       console.log("motion sensor stopped");
};
     
     $scope.clearDb = function (){
         firebaseClient.clearFirebase();
         firebaseClient.refreshCounter();
     }
}]);
