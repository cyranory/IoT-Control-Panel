// handles the motion detection and sends the appropriate type of motion to firebase
var five = require("johnny-five"); //import johnny-five
var fireadmin = require("firebase-admin"); //import firebase-admin
var startTime; //used to indicate starting time of motion
var endTime; //used to indicate end time of motion
var motion;
var count = 0;
var sendMotion = false; //indicator to send motion data to firebase if motion sensor is on/off


var firebaseService = require("./serviceAccountKey.json");

// Initialize app with service account and grandting admin rights
fireadmin.initializeApp({
  credential: fireadmin.credential.cert(firebaseService),
  databaseURL: "https://assignment-4-5f5f4.firebaseio.com/"
});

var firedb = fireadmin.database();
var dbref = firedb.ref("/motionSensorData"); // database channel name

var board = new five.Board();  // create a johnny-five instance to communicate with arduino
board.on("ready", function() {
    console.log('Arduino Uno connected');
    motion = new five.Motion(3); //variable to control motion sensor at pin 3
    startMotion();
    motion.on("calibrated", function() {
    console.log("calibrated");
  });
  
  motion.on("motionstart", function() {
      if (sendMotion){
          startTime = new Date().getTime();

    console.log("motionstart");
      };
  });

  motion.on("motionend", function() {
      if (sendMotion){
          endTime = new Date().getTime();
          var diff = (endTime-startTime).toFixed(0);
          //console.log(diff)
          if (diff > 0){
              count += 1;
          };
          if (count > 0){
             determineMotion(diff,count);
          }
  };
});
});

//start listening for motion on/off message
function startMotion (){
    dbref.on("value", function(snapshot) { //this callback will be invoked with each new object
  snapshot.forEach(function (childSnapshot) {
            var value = childSnapshot.val();
            if (value.type == 'motion'){
                console.log(value.description)
                if (value.description == 'on'){
                    sendMotion = true;
                } else if (value.description == 'off'){
                    sendMotion = false;
                } else if (value.description === 'end'){
                    sendMotion = false;
                    console.log('end of transmission')
                };
            };
        });  // How to retrive the newly added object
}, function (errorObject) {             // if error
  console.log("Failed to read object: " + errorObject.code);
});
};

//time is the difference, count is for the motion id,determines the type of motion
function determineMotion(time,count){
     if ((time > 7000)){
             dbref.push({
            id: count,
            type:'signal',
            description:'L',
            start: startTime,
            end: endTime
            });
              console.log("motion lasted " + time + "ms");
             console.log("long motion detected")
         }else if((time < 7000)){
            dbref.push({
           id: count,
           type:'signal',
           description:'S',
           start: startTime,
           end: endTime
           });
             console.log("motion lasted " + time + "ms");
            console.log("short motion detected")
        };
    
};

