const app = require("./app");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const dbConnection = require("./database/db_connection");
const connectedUsers = [];
var usersScores = [];  //score format,string 'username:score'
const port = process.env.PORT || 5000;
if(!process.env.PORT){
  process.env.NODE_ENV='test';
}
const gamePhases = {
  pending: "Game pending",
  onGoing: "Game onGoing",
  ended: "Game Ended"
};
var gameStatus = gamePhases.pending;
const gameWords = [
  "camel",
  "car",
  "mario",
  "snake",
  "nature",
  "guitar",
  "sea",
  "laptop",
  "chair",
  "star",
  "coffee",
  "milk",
  'star',
  'spaceship',
  'rocket',
  'lemon',
  'apple',
  'bottle',
  'shoe'
];
var gameWord = "";
var drawer="";
var drawerIndex=0;
/************************          Helper functions     */

function selectDrawer() {
  drawerIndex++;
  console.log("rand is ", drawerIndex);
  if(drawerIndex>connectedUsers.length-1){
    drawerIndex=0;
  }
  return drawerIndex;
}
function getWord() {
  // dbConnection.query(
  //   `SELECT doodle FROM round
  // ORDER BY RANDOM() LIMIT 1`,
  //   (err, result) => {
  //     gameWord = result.rows[0].doodle;
  //   }
  // );
  var rand = Math.floor(Math.random() * (gameWords.length));
  console.log(gameWords[rand]);
  return gameWords[rand];
}
/****** *********************   End of Helper functions      */
http.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});

io.on("connection", socket => {
  var userName = "";
  socket.on("user connected", newUser => {
    console.log("New user connected to backend", newUser);
    userName = newUser;
    connectedUsers.push(userName);
    console.log(`${userName} has joind the game`);
    console.log(`Connected users :`);
    console.table(connectedUsers);
    io.emit("update connected users", connectedUsers);
    function startGame(){
        if (connectedUsers.length >= 2 && gameStatus !== gamePhases.onGoing) {
            drawer = connectedUsers[selectDrawer()];
            usersScores=[];
            console.log("Game gonna start drawing user is : ", drawer);
            
            io.emit("start game", { 'drawingUser': drawer, 'gameWord': getWord() });
            gameStatus = gamePhases.onGoing;
          }
          if (connectedUsers.length < 2) {
            gameStatus = gamePhases.pending;
            return false;
          }
    }
socket.on("restart game",()=>{
  console.log('Restart game event recived on backend');
 startGame();
});
    // score recieves should be a string of format username:score
    socket.on("round end", (score) => {
      console.log("round end event recieved on the backend ");
      usersScores.push(score);
      console.table(usersScores);
      var tempScores=[...usersScores];
      var tempDrawer=drawer;
      if(usersScores.length===connectedUsers.length-1){
        var totalGuessed =0;
        tempScores.forEach(score=>{
          totalGuessed+=parseInt(score.split(':')[1]);
        });
        var drawerScore = 0.5*totalGuessed;
        tempScores.push(tempDrawer+ ':' +drawerScore); 
        gameStatus=gamePhases.pending;
        io.emit("round end", tempScores);
      }
    });

    socket.on("chat message", function(msg) {
      console.log(msg);
      io.emit("chat message", userName + " :" + msg);
    });
  });

  socket.on("drawing", data => socket.broadcast.emit("drawing", data));

  socket.on("disconnect", () => {
    console.log(`${userName} has left`);
    const userIndex = connectedUsers.indexOf(userName);
    connectedUsers.splice(userIndex, 1);
    console.log(`Connected users :`);
    console.table(connectedUsers);
    io.emit("update connected users", connectedUsers);
  });
});
