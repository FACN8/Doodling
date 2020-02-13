/** General functions */
function getId(element) {
  return document.getElementById(element);
}

function getClass(element) {
  return document.getElementsByClassName(element);
}
function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function updateList(list, values) {
  removeChildren(list);
  values.forEach(value => {
    var newListing = document.createElement("li");
    newListing.textContent = value;
    list.append(newListing);
  });
}
/************  globals and consts **********/
const SETROUNDTIME = 15;
var imageData;
var currentDrawingUser = false;
var userScore = 0;
var roundTime = SETROUNDTIME;
var gameWordGlobal;
var guessed = false;
var userScoreObj = {};
var contextGlobal;
/****************** Specific functions  ************/
function wordToDashes(word) {
  var res = "";
  word.split("").forEach(character => (res += "_ "));
  return res;
}
// function countTime() {
//   getClass("round-time")[0].textContent = roundTime;
//   roundTime -= 1;
//   if (roundTime < 0) {
//     socket.emit("round end", userScoreObj);
//   }
// }
function resetGame() {
  roundTime = SETROUNDTIME;
  userScore = 0;
  var roundTimer = null;
  currentDrawingUser = false;
  guessed = false;
  userScoreObj = {};
  // contextGlobal.putImageData(null,0,0);
  contextGlobal.clearRect(0, 0, window.innerWidth * 0.6, window.innerHeight * 0.8);

}
/*************  The work begins when the dom is loaded  **************/
document.addEventListener("DOMContentLoaded", function() {
  const userMsg = getClass("user-msg")[0].textContent.split(" ");
  const scoreBoardDiv = getId("score-board");
  const scoresList = getId("scores-list");
  const canvasDiv = getId("canvas-container");
  getClass("round-time")[0].textContent = SETROUNDTIME;
  
  function displayScores(scoresArray) {
    scoreBoardDiv.style = "";
    canvasDiv.style = "display:none"; 
    updateList(
      scoresList,
      scoresArray.map(score => score + " points")
    );
    var newListing = document.createElement("li");
    var restartButton = document.createElement("button");
    restartButton.textContent="Play again!";
    restartButton.addEventListener('click',(e)=>{
      socket.emit("restart game",{});
    })
    newListing.appendChild(restartButton);
    getId('scores-list').appendChild(newListing);

  }
  function hideScores() {
    scoreBoardDiv.style = "display:none";
    canvasDiv.style = "";
  }
  function addStartButton(){
    console.log('creating start button..');
    var startButton = document.createElement('button');
    var startButtonLi= document.createElement('li');
    startButton.className='btn btn-success';
    startButton.textContent='Start!';
    startButton.addEventListener('click',e=>{
      socket.emit("restart game",{});
    });
    startButtonLi.appendChild(startButton);
    getId('users-list').appendChild(startButtonLi);
  }
  var socket = io();
  var currentUser = userMsg[1];
  console.log("A new user! and he is :", userMsg[1]);

  socket.emit("user connected", currentUser);
  var canvas = document.getElementsByClassName("whiteboard")[0];
  var colors = document.getElementsByClassName("color");
  var context = canvas.getContext("2d");
  contextGlobal=context;
  socket.on("start game", ({ drawingUser, gameWord }) => {
    hideScores();
    resetGame();
    gameWordGlobal = gameWord;
    const currWord = getClass("currWord")[0];
    console.log("Game has started!");
    console.log(
      `This is user:"${currentUser}" the Drawing user is "${drawingUser}"`
    );
    if (currentUser === drawingUser) {
      currWord.textContent = gameWord;
      currentDrawingUser = true;
    } else {
      currWord.textContent = wordToDashes(gameWord);
      currentDrawingUser = false;
    }
     roundTimer = setInterval(() => {
      getClass("round-time")[0].textContent = roundTime;
      roundTime -= 1;
      if (roundTime < 0) {
        clearInterval(roundTimer);
        console.log("Score object is :", currentUser + ":" + userScore);
        if(!currentDrawingUser)
        socket.emit("round end", currentUser + ":" + userScore);
      }
    }, 1000);
  });

  socket.on("round end", scoresArray => {
    console.log("round end event recivend on front end!");
    console.log("Scores array recives:", scoresArray);
    clearInterval(roundTimer);
    displayScores(scoresArray); //send scoresArray, but now its a fake one
  });

  var current = {
    color: "black"
  };
  var drawing = false;

  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mouseout", onMouseUp, false);
  canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener("touchstart", onMouseDown, false);
  canvas.addEventListener("touchend", onMouseUp, false);
  canvas.addEventListener("touchcancel", onMouseUp, false);
  canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener("click", onColorUpdate, false);
  }

  socket.on("drawing", onDrawingEvent);

  window.addEventListener("resize", onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit) {
    if (currentDrawingUser === false) {
      return;
    }
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();


    
    if (!emit) {
      return;
    }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit("drawing", {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e) {
    drawing = true;
    console.log(e.clientX);
    var rect = e.target.getBoundingClientRect();
    current.x = (e.clientX || e.touches[0].clientX) - rect.left;
    current.y = (e.clientY || e.touches[0].clientY) - rect.top;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    var rect = e.target.getBoundingClientRect();
    drawLine(
      current.x,
      current.y,
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top,
      current.color,
      true
    );
    current.x = (e.clientX || e.touches[0].clientX) - rect.left;
    current.y = (e.clientY || e.touches[0].clientY) - rect.top;
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    var rect = e.target.getBoundingClientRect();
    drawLine(
      current.x,
      current.y,
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top,
      current.color,
      true
    );
    current.x = (e.clientX || e.touches[0].clientX) - rect.left;
    current.y = (e.clientY || e.touches[0].clientY) - rect.top;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(" ")[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if (time - previousCall >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    const temp = currentDrawingUser;
    currentDrawingUser = true;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    currentDrawingUser = temp;
  }

  // make the canvas fill its parent
  function onResize() {
    imageData=context.getImageData(0,0,canvas.width,canvas.height);
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.8;
    context.putImageData(imageData,0,0);

  }

  getId("message-form").addEventListener("submit", e => {
    e.preventDefault();
    var sentMsg = getId("message").value;
    if (!currentDrawingUser) {
      if (sentMsg === gameWordGlobal) {
        if (!guessed) {
          userScore += 10;
          sentMsg = ` just gueesed the word!`;
          getClass("score")[0].textContent = userScore + " points";
          guessed = true;
          socket.emit("round end",currentUser+ ':' + userScore);
        } else {
          getId("message").value = "";
          return false;
        }
      }
    } else {
      if (sentMsg === gameWordGlobal) {
        getId("message").value = "";
        return false;
      }
    }

    socket.emit("chat message", sentMsg);
    getId("message").value = "";
    return false;
  });

  socket.on("chat message", function(msg) {
    var newMsg = document.createElement("li");
    newMsg.textContent = msg;
    getId("messages-list").append(newMsg);
  });

  socket.on("update connected users", function(connectedUsers) {
    updateList(getId("users-list"), connectedUsers);
    addStartButton();
  });
});
