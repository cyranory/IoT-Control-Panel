// handles the fetching of the objects in firebase and signal decoding to letters or words
var morse = "";
var decoded = "";
function firebaseClient() {
  this.verifySetup();
  this.startFirebase();
  this.fetchData();
}

// decodes the signal to letter or word based on time interval
function morseCodeDecode(signal,time){
    var word_gap = 6000;
    var letter_gap = 3000;
    var morseCodeTable = {
    'SL' : 'A',
    'LSSS' : 'B',
    'LSLS' : 'C',
    'LSS' : 'D',
    'S' : 'E',
    'SSLS' : 'F',
    'LLS' : 'G',
    'SSSS' : 'H',
    'SS' : 'I',
    'SLLL' : 'J',
    'LSL' : 'K',
    'SLSS' : 'L',
    'LL' : 'M',
    'LS' : 'N',
    'LLL' : 'O',
    'SLLS' : 'P',
    'LLSL' : 'Q',
    'SLS' : 'R',
    'SSS' : 'S',
    'L' : 'T',
    'SSL' : 'U',
    'SSSL' : 'V',
    'SLL' : 'W',
    'LSSL' : 'X',
    'LSLL' : 'Y',
    'LLSS' : 'Z',
    'LLLLL' : '0',
    'SLLLL' : '1',
    'SSLLL' : '2',
    'SSSLL' : '3',
    'SSSSL' : '4',
    'SSSSS' : '5',
    'LSSSS' : '6',
    'LLSSS' : '7',
    'LLLSS' : '8',
    'LLLLS' : '9',
    'SLSLSL' : '.',
    'LLSSLL' : ',',
    'LLLSSS' : ':',
    'SSLLSS' : '?',
    'SLLLLS' : "'",
    'LSSSSL' : '-',
    'LSSLS' : '/',
    'LSLLSL' : '()',
    'SLSSLS' : '"',
    'SLLSLS' : '@',
    'LSSSL' : '='
};
    if (morse === 'SSSLSL'){
        firebaseClient.endTransmission();
        console.log('SK, End of transmission');
    }else if (time > word_gap){
        if (typeof morseCodeTable[morse] === "undefined"){
            console.log('Invalid signal')
            morse = "";
        }else{
            decoded += morseCodeTable[morse] + " ";
        morse = "";
        document.getElementById('morse').innerText = decoded;
        morse += signal;
        console.log('current signal: ' + morse);
        }    
    }else if (time > letter_gap){
        if (typeof morseCodeTable[morse] === "undefined"){
            console.log('Invalid signal')
            morse = "";
        }else{
            decoded += morseCodeTable[morse];
        document.getElementById('morse').innerText = decoded;
        morse = "";
        morse += signal;
        console.log('current signal: ' + morse);
        }    
    }else{
        morse += signal;
        console.log('current signal: ' + morse);
    }
};

//initialisation
  firebaseClient.prototype.startFirebase = function () {
    this.database = firebase.database();
    this.storage = firebase.storage();
  };

//fetches data from firebase
  firebaseClient.prototype.fetchData = function () {
    var current = 0;
    var prev = 0;
    // Reference to database path
    this.messagesRef = this.database.ref('motionSensorData');
    // remove all previous listeners
    this.messagesRef.off();

    // Fetch database objects and listen to new ones
    var setMessage = function (data) {
      var val = data.val();
      if (val.type === 'signal'){
          console.log('received ' + val.description);
          if (val.id === 1){
              current = val.end;
//              morse += val.description;
              morseCodeDecode(val.description,0);
              console.log('First signal');
              //console.log('Current signal: '+morse);
          }else{
          prev = current;
          //console.log('previous '+prev)
          current = val.start;
          var diff = current - prev;
          console.log('diff is ' + diff);
          morseCodeDecode(val.description,diff);
          current = val.end;
          //console.log('current signal ' + morse);
          };
          
      };
    };
    this.messagesRef.limitToLast(25).on('child_added', setMessage);
    this.messagesRef.limitToLast(25).on('child_changed', setMessage);
  };

// send message to server to turn motion sensor on/off
  firebaseClient.prototype.pushMotionData = function (command){
      //push motion sensor command
      this.messagesRef = this.database.ref('motionSensorData');
      this.messagesRef.push({
    type: 'motion',
    description: command
    });
  };

// send end transmission message to server when sk pro signal is detected
  firebaseClient.prototype.endTransmission = function (command){
      //push motion sensor command
      this.messagesRef = this.database.ref('motionSensorData');
      this.messagesRef.push({
    type: 'motion',
    description: 'end'
    });
  };

// removes all objects in firebase
  firebaseClient.prototype.clearFirebase = function (){
      //reset database
      this.messagesRef = this.database.ref('motionSensorData');
      this.messagesRef.remove();
  };

//refreshes the morse code text
  firebaseClient.prototype.refreshCounter = function (){
      //reset counters after resetting the database
      document.getElementById('morse').innerText = "";
  };

  // Check if Firebase SDK has been correctly setup and configured.
  firebaseClient.prototype.verifySetup = function () {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
      window.alert('Firebase has not been setup');
    } else if (config.storageBucket === '') {
      window.alert('Firebase Storage bucket is not found.');
    }
  };

  


window.onload = function () {
  window.firebaseClient = new firebaseClient();
};