//***************************************************
// HTML Pong v0.1
// Author: edokoa
// Website: www.edokoa.com
// Contact: hello@edokoa.com
//
// This code is made with educational purposes and is licensed under a
// CREATIVE COMMONS: BY-NC-SA license.
//
// The code is provided as-is and I don't hold any responability
// derived from the use of this program or part of it.
//
//
//
//  This is an early version and it freezes when a player goes over 9
//  points. To restart a match you should refresh the browser window.
//
//***************************************************

var socket = io.connect(location.protocol+'//'+location.host+'/');

var field = document.getElementById("playfield");
var player1 = document.getElementById("player1");
var player2 = document.getElementById("player2");
var ball = document.getElementById("ball");

//array of pressed keys
var keys = [0,0,0,0];

/*
  Define a play mode.

  Valid values are:
  * maxscore: If a player reaches the max score, the game is finished
  * bestofx: If the score of both players reaches the max score the one with most points wins
*/
var playmode = 'bestofx';
var max_score = 9;


//those arrays will contain the player scores
var p1display = [];
var p2display = [];
var p1score = 0;
var p2score = 0;
var gameloop = null;
var sessionID = jQuery('#playfield').attr('data-session');
var player1_connected = false;
var player2_connected = false;

function null_callback() {}

//If you look closely, this array contains sprites for the numbers
//(1=Pixel on, 0=Pixel off), they are hard-coded number sprites from 0
//to 9
var scoreNumbers =
    //It's a 3D array where [actual number][pixel row][pixel column]
    [
        //0
        [
            [1,1,1,1],
            [1,0,0,1],
            [1,0,0,1],
            [1,0,0,1],
            [1,1,1,1]
        ],
        //1
        [
            [0,0,0,1],
            [0,0,0,1],
            [0,0,0,1],
            [0,0,0,1],
            [0,0,0,1]
        ],
        //2
        [
            [1,1,1,1],
            [0,0,0,1],
            [1,1,1,1],
            [1,0,0,0],
            [1,1,1,1]
        ],
        //3
        [
            [1,1,1,1],
            [0,0,0,1],
            [1,1,1,1],
            [0,0,0,1],
            [1,1,1,1]
        ],
        //4
        [
            [1,0,0,1],
            [1,0,0,1],
            [1,1,1,1],
            [0,0,0,1],
            [0,0,0,1]
        ],
        // 5
        [
            [1,1,1,1],
            [1,0,0,0],
            [1,1,1,1],
            [0,0,0,1],
            [1,1,1,1]
        ],
        // 6
        [
            [1,1,1,1],
            [1,0,0,0],
            [1,1,1,1],
            [1,0,0,1],
            [1,1,1,1]
        ],
        // 7
        [
            [1,1,1,1],
            [0,0,0,1],
            [0,0,0,1],
            [0,0,0,1],
            [0,0,0,1]
        ],
        // 8
        [
            [1,1,1,1],
            [1,0,0,1],
            [1,1,1,1],
            [1,0,0,1],
            [1,1,1,1]
        ],
        // 9
        [
            [1,1,1,1],
            [1,0,0,1],
            [1,1,1,1],
            [0,0,0,1],
            [1,1,1,1]
        ],

    ];


function finishGame(whichPlayer) {
    clearInterval(gameloop);
    $('#gameresults').show();
    if (p1score > p2score) {
        $('#player').text('1');
    } else if(p2score > p1score) {
        $('#player').text('2');
    }
    var counter = 10;
    $('#restartcounter').text(counter);
    setInterval(function(){
        if (counter <= 0) {
            location.reload();
        }
        $('#restartcounter').text(counter);
        counter--;
    },1000);
}

//this function adds points to scores and updates the numbers in the
//diplays
function updateScore(whichPlayer){
    //right now the game freezes when a player has more than 9
    //points. The victory control should be inside of this function.
    if(whichPlayer==1) {
        currentDisplay = p1display;
        p1score++;
        currentScore = p1score;
    } else {
        currentDisplay = p2display;
        p2score++;
        currentScore = p2score;
    }

    if (playmode == 'bestofx') {
        if ((p1score + p2score) >= max_score) {
            // game is finished! stop the gameloop, show the winner
            // and start the restart counter
            finishGame();
        }
    } else if (playmode == 'maxscore') {
        if ((p1score >= max_score) || (p2score >= max_score)) {
            // game is finished! stop the gameloop, show the winner
            // and start the restart counter
            finishGame();
        }
    }

    //Here I'm wiping the current 2D array and substituting it with
    //the appropiate number from the big array (in binary format as
    //on/off pixels)
    for(i=0;i<5;i++) {
        row=[];
        for(j=0;j<4;j++) {
            pixel=currentDisplay[i][j];
            currentPix=scoreNumbers[currentScore][i][j];
            if(currentPix){
                pixel.style.opacity=1;
            }
            else {
                pixel.style.opacity=0;
            }
        }
    }
}


//this creates the grids that will be used for displaying the scores
function createScores(){
    for(p=1;p<=2;p++) {
        pScore=document.createElement("div");
        pScore.className="score";
        if(p==1) {
            pScore.id="p1score";
        } else {
            pScore.id="p2score";
        }

        //creates the <div> grid that will serve as displays for each player
        for(i=0;i<5;i++) {
            row=[];
            for(j=0;j<4;j++) {
                currentPix=scoreNumbers[0][i][j];
                pixel=document.createElement("div");
                pixel.className="pixel";
                pixel.style.top=i*30+"px";
                pixel.style.left=j*30+"px";
                if (currentPix) {
                    pixel.style.opacity=1;
                } else {
                    pixel.style.opacity=0;
                }
                row.push(pixel)
                pScore.appendChild(pixel)
            }
            if(p==1) {
                p1display.push(row);
            } else {
                p2display.push(row);
            }
        }

        field.appendChild(pScore);
    }
}

function manageBall(){

    ball.x += ball.speed * ball.hDir;
    ball.y += ball.speed * ball.vDir;

    //ball rebounds against walls
    if((ball.y+30>800) || (ball.y < 0)) {
        ball.vDir=-ball.vDir;
        //avoid ball going through walls
        if(ball.y<=0) {
            ball.y=0;
        } else if(ball.y>770) {
            ball.y=770;
        }
    }

    //COLLISIONS

    //We check that the ball is in the player1 area and that is going
    //to the left
    if((ball.x < 80) && (ball.x > 50) && (ball.hDir < 0)){
        //This checks that the ball touches the paddle
        if(ball.y+30>player1.y && ball.y<player1.y+playerHeight) {
            //Changes the horizontal direction of the ball and adds speed
            ball.hDir=-ball.hDir*1.1;
            //adjusts the angle of rebound depending on the vertical
            //point where it touched the paddle (Could need a little
            //bit of tweaking)
            ball.vDir = ((playerHeight - (player1.y - ball.y) - playerHeight - 30) / playerHeight) * 2;
        }
    } else {
        //Same as with player1 but with player2
        if(ball.x>850 && ball.x<880 && ball.hDir>0) {
            if(ball.y+30>player2.y && ball.y<player2.y+playerHeight) {
                ball.hDir = -ball.hDir * 1.1;
                ball.vDir= ((playerHeight - (player2.y - ball.y) - playerHeight-30) / playerHeight) * 2;
      }

  }
    }

    //Checks that it's a goal and updates score, also makes the ball
    //rebound & slow it down
    if(ball.x+30>960 || ball.x<0) {
        if (ball.hDir>0) {
            updateScore(1);
            ball.hDir=-ball.hDir/2;
            if(ball.hDir>-1) {
                //avoid the ball being too slow
                ball.hDir=-1;
            }
            ball.x=930;
        } else {
            updateScore(2);
            ball.hDir=1;
            ball.hDir=-ball.hDir/2;
            if(ball.hDir<1) {
                //avoid the ball being too slow
                ball.hDir=1;
            }
            ball.x=0;
        }
    }

    if(ball.hDir<-5) ball.hDir=-5;
    // We control the maximum speed of the ball
    if(ball.hDir>5) ball.hDir=5;
    console.log(ball.hDir);
    //We position the ball in every frame
    ball.style.left=ball.x+"px";
    ball.style.top=ball.y+"px";
}

function frame() {
    // in every frame we manage players and ball
    managePlayers();
    manageBall();
}

function managePlayers(){
    // map controls to acceleration
    if(keys[0]) player1.vSpeed-=2;
    if(keys[1]) player1.vSpeed+=2;
    if(keys[2]) player2.vSpeed-=2;
    if(keys[3]) player2.vSpeed+=2;

    // Limit the max speed
    if(player1.vSpeed>12) player1.vSpeed=12;
    if(player1.vSpeed<-12) player1.vSpeed=-12;
    if(player2.vSpeed>12) player2.vSpeed=12;
    if(player2.vSpeed<-12) player2.vSpeed=-12;

    //transport speed to movement P1
    player1.y+=Math.round(player1.vSpeed);
    //transport speed to movement P2
    player2.y+=Math.round(player2.vSpeed);

    if(player2.y < 0) {
        player2.y = 0;
        if(player2.vSpeed < -1) {
            //bounce against the wall
            player2.vSpeed = -player2.vSpeed * 0.5;
        }
    }
    if((player2.y + playerHeight) > 800) {
        player2.y = 800 - playerHeight;
        //bounce against the wall
        player2.vSpeed = -player2.vSpeed * 0.5;
    }



    //Collision with top wall
    if(player1.y<0) {
        //Adjust coords so it doesn't go through wall
        player1.y=0;
        //bounce against the wall
        player1.vSpeed=-player1.vSpeed*0.5;
    }

    if(player1.y+playerHeight>800) {
        //Collision with bottom wall
        //Adjust coords so it doesn't go through wall
        player1.y=800-playerHeight;
        //bounce against the wall
        player1.vSpeed=-player1.vSpeed*0.5;
    }

    //friction P1
    player1.vSpeed=player1.vSpeed*0.9;
    //friction P2
    player2.vSpeed=player2.vSpeed*0.9;

    //place paddles where they belong
    player1.style.top=Math.floor(player1.y)+"px";
    player2.style.top=Math.floor(player2.y)+"px";

}


function main(){
    $('#nojs').hide();
    $('#playfield').show();
    //initialize elements
    //This is will come handy in subsequent versions. Ignore
    playerHeight=100;

    player1.vSpeed=0;              //init players
    player2.vSpeed=0;

    //this controls the global ball speed. Don't change right now or
    //bad things will happen (collisions with players will fail)
    ball.speed = 5;

    // this initializes the player displays with the fancy <div> grid
    createScores();

    ball.x=500;
    ball.y=50;                  //place the ball and initialize values
    ball.vDir=0;
    ball.hDir=-1;

    player1.x=30;                //place players
    player1.y=0;
    player2.x=30;
    player2.y=0;

    //this will come handy later when making the game more dynamic
    player1.style.height=playerHeight;


    socket.on('donav', function (data) {
        console.log(data);
        if (data.player == 1) {
            if (data.direction == 'up') {
                keys[0] = true;
                window.setTimeout(function(){ keys[0] = false; }, 1000/20);
            } else if(data.direction == 'down') {
                keys[1] = true;
                window.setTimeout(function(){ keys[1] = false; }, 1000/20);
            }
        }
        if (data.player == 2) {
            if (data.direction == 'up') {
                keys[2] = true;
                window.setTimeout(function(){ keys[2] = false; }, 1000/20);
            } else if(data.direction == 'down') {
                keys[3] = true;
                window.setTimeout(function(){ keys[3] = false; }, 1000/20);
            }
        }
    });

    socket.on('player_connect',function (data) {
        console.log(data);
        if (data.session == sessionID) {
            if (data.player == 1) {
                player1_connected = true;
                jQuery('#qr-player1').hide();
            }
            if (data.player == 2) {
                player2_connected = true;
                jQuery('#qr-player2').hide();
            }
        }
        console.log([player1_connected,player2_connected]);
        if (player1_connected && player2_connected) {
            // both players are connect, start teh game
            // display the game elements
            jQuery('.player, .ball').show();
            jQuery('#instruction').hide();
            //call the main game loop
            gameloop = window.setInterval(frame, 1000/30);
        }
    });

    //socket.on('player_disconnect',function () {
    //    location.reload();
    //});

    var qrcodedraw = new QRCodeLib.QRCodeDraw();

    var player1_url =
        location.protocol + '//' + 
        location.host + '/' +
        '#' + sessionID +
        ',1';
    console.log(player1_url);
    qrcodedraw.draw(document.getElementById('qr-player1'),player1_url,null_callback);

    var player2_url = 
        location.protocol + '//' + 
        location.host + '/' +
        '#' + sessionID +
        ',2';
    qrcodedraw.draw(document.getElementById('qr-player2'),player2_url,null_callback);
}

main();
