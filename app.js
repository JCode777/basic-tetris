document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const restartBtn = document.querySelector('#restart-button');
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let myMusic;
    const colors = [
        'blue',
        'orange',
        'green',
        'purple',
        'yellow',
        'aqua', 
        'red'
    ];

    // The Tetrominoes
    const jTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    //trying to add another tetromino
    const lTetromino = [
        [1, width+1, width*2+1, 0],
        [width, width+1, width+2, 2],
        [1, width+1, width*2+1, width*2+2],
        [width, width+1, width+2, width*2],
    ];

    const sTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    //trying to add another tetromino
    const zTetromino = [
        [2, width+2, width+1, width*2+1],
        [0, 1, width+1, width+2],
        [2, width+2, width+1, width*2+1],
        [0, 1, width+1, width+2]
    ];

    const theTetrominoes = [jTetromino, lTetromino, sTetromino, tTetromino, oTetromino, iTetromino, zTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        })
    }

    // undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        })
    }

    // assign functions to keyCodes
    function control(e) {
        if(e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }
    document.addEventListener('keyup', control);

    // move down function
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    //freeze function
    function freeze() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            // start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1;
        }
        draw();
    }

    // move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if(!isAtRightEdge) currentPosition +=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1;
        }
        draw();
    }

    // FIX ROTATION OF TETROMINOS AT THE EDGE
    function isAtRight() {
        return current.some(index => (currentPosition + index + 1) % width === 0);
    }

    function isAtLeft() {
        return current.some(index => (currentPosition + index) % width === 0);
    }

    function checkRotatedPosition(P){
        P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
        if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
          if (isAtRight()){            //use actual position to check if it's flipped over to right side
            currentPosition += 1    //if so, add one to wrap it back around
            checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
            }
        }
        else if (P % width > 5) {
          if (isAtLeft()){
            currentPosition -= 1
          checkRotatedPosition(P)
          }
        }
      }

    // rotate the tetromino
    function rotate() {
        undraw();
        currentRotation++;
        if(currentRotation === current.length) { // if the current rotation gets to 4, make it go back to zero
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        checkRotatedPosition();
        draw();
    }

    // show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;


    // the Tetrominos without rotations
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], //jTetromino
        [1, displayWidth+1, displayWidth*2+1, 0], //lTetromino attempt
        [0, displayWidth, displayWidth+1, displayWidth*2+1], //sTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
        [0, 1, displayWidth, displayWidth+1], //oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], //iTetromino
        [2, displayWidth+2, displayWidth+1, displayWidth*2+1] //zTetromino attempt
    ]

    // display the shape in the mini-grid display
    function displayShape() {
        //remove any trace of a tetromino from the entire grid
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
        });
    }

    //Add sound to the game
    function sound(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("loop", "preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function(){
            this.sound.play();
        }
        this.stop = function(){
            this.sound.pause();
        }    
    }

    //add functionality to the button
    startBtn.addEventListener('click',() => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
            myMusic.stop();
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            displayShape();
            myMusic = new sound('Doodoodoodoo Tetris.mp3');
            myMusic.play();
        }
    })

    //my attempt at a restart button
    restartBtn.addEventListener('click', () => {
        document.location.href = '';
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 1000);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            displayShape();
        }
   
    })

    //add score
    function addScore() {
        for (let i = 0; i < 199; i+=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if(row.every(index => squares[index].classList.contains('taken'))) {
                score+=10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                })
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    //game over
    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'Game Over';
            clearInterval(timerId);
        }
    }

})

//thanks to Ania Kubow for the tutorial on how to build Tetris with Javascript. I added my own styling, a reset button, two more Tetrominos in order to match the 7 Tetrominos of original Tetris and music.
