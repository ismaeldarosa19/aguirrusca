const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box;
let snake;
let food;
let score;
let totalTime;
let lastUpdateTime = 0;
let timerInterval;
let d;
let game;
let gameStarted = false;

let bestScore = 0;
let bestTime = Infinity;

const levels = Array.from({ length: 13 }, (_, i) => ({ speed: 150 - i * 10, duration: 30 }));
let currentLevel = 0;

const snakeHeadImg = new Image();
snakeHeadImg.src = 'snake_head.png';

const numSegments = 10;
const images = [];
for (let i = 1; i <= numSegments; i++) {
    const img = new Image();
    img.src = `${i}.png`;
    images.push(img);
}

const backgroundImage = new Image();
backgroundImage.src = 'background.png';
const victoryImage = new Image();
victoryImage.src = 'victory.jpg';

const eatSound = new Audio('eat_sound.mp3');
const backgroundMusic = new Audio('background_music.mp3');
backgroundMusic.loop = true; // Hacer que la música de fondo se repita continuamente
const startScreenMusic = new Audio('start_screen_music.mp3');
const victoryMusic = new Audio('victory_music.mp3');
victoryMusic.loop = true;

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 800);
    canvas.width = size;
    canvas.height = size;
    box = canvas.width / 10;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function initGame() {
    box = canvas.width / 10;
    snake = [{ x: 4 * box, y: 5 * box }];
    food = {
        x: Math.floor(Math.random() * 9) * box,
        y: Math.floor(Math.random() * 9) * box
    };
    score = 0;
    totalTime = 0;
    lastUpdateTime = performance.now();
    d = null;
    gameStarted = false;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function startGame() {
    clearInterval(game);
    initGame();
    game = setInterval(draw, levels[currentLevel].speed);
    gameStarted = false;
}

function direction(event) {
    let key = event.keyCode;
    if (key == 37 && d !== "RIGHT") {
        d = "LEFT";
    } else if (key == 38 && d !== "DOWN") {
        d = "UP";
    } else if (key == 39 && d !== "LEFT") {
        d = "RIGHT";
    } else if (key == 40 && d !== "UP") {
        d = "DOWN";
    }

    startTimerIfNotStarted();
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            const headSize = box * 1.2;
            ctx.drawImage(snakeHeadImg, snake[i].x - (headSize - box) / 2, snake[i].y - (headSize - box) / 2, headSize, headSize);
        } else {
            const img = images[(i - 1) % images.length];
            ctx.drawImage(img, snake[i].x, snake[i].y, box, box);
        }
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        eatSound.play();
        if (score === 13) {
            winGame();
            return;
        }
        food = {
            x: Math.floor(Math.random() * 9) * box,
            y: Math.floor(Math.random() * 9) * box
        };
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        backgroundMusic.pause();
        clearInterval(timerInterval);
        checkAndUpdateRecord();
        endGame();
    }

    snake.unshift(newHead);
}

function checkAndUpdateRecord() {
    if (score > bestScore || (score === bestScore && totalTime < bestTime)) {
        bestScore = score;
        bestTime = totalTime;
        document.getElementById("record").textContent = `Record: ${bestScore}`;
    }
}

function displayGameOverText(message) {
    document.getElementById("gameOverText").innerHTML = message;
    document.getElementById("gameOverText").style.color = 'yellow';
    document.getElementById("gameOverText").style.opacity = 1;
    document.getElementById("restartButton").style.color = 'yellow';
    document.getElementById("restartButton").style.opacity = 1;
    document.getElementById("gameOverScreen").style.display = 'flex';
}

function endGame() {
    document.getElementById("gameInfo").style.display = 'none';
    snake = [];
    food = {};
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    document.querySelector('.game-container').classList.add('grayscale');
    setTimeout(() => {
        let message;
        if (score <= 6) {
            message = `Perdiste, llegaste a Fase de Grupos.<br>Tu puntaje: ${score}<br>Tiempo: ${Math.floor(totalTime / 1000)} seg`;
        } else if (score <= 8) {
            message = `Perdiste, llegaste a Octavos de final.<br>Tu puntaje: ${score}<br>Tiempo: ${Math.floor(totalTime / 1000)} seg`;
        } else if (score <= 10) {
            message = `Perdiste, llegaste a Cuartos de final.<br>Tu puntaje: ${score}<br>Tiempo: ${Math.floor(totalTime / 1000)} seg`;
        } else if (score <= 12) {
            message = `Que cerca!!!, llegaste a Semi Final.<br>Tu puntaje: ${score}<br>Tiempo: ${Math.floor(totalTime / 1000)} seg`;
        } else if (score === 13) {
            message = `Casi Casi!!! llegaste a la final.<br>Tu puntaje: ${score}<br>Tiempo: ${Math.floor(totalTime / 1000)} seg`;
        }
        displayGameOverText(message);
    }, 2000);
}

function winGame() {
    clearInterval(game);
    backgroundMusic.pause();
    victoryMusic.play();
    clearInterval(timerInterval);
    checkAndUpdateRecord();
    document.getElementById("gameInfo").style.display = 'none';
    snake = [];
    food = {};
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('backgroundImage').classList.add('fade-out');
    setTimeout(() => {
        document.getElementById('backgroundImage').style.display = 'none';
        document.getElementById('victoryImage').style.display = 'block';
        document.getElementById('victoryImage').classList.add('fade-in');
        const message = `Lograste la 6ta junto a Diego, en ${Math.floor(totalTime / 1000)} segundos`;
        displayGameOverText(message);
    }, 2000);
}

document.getElementById("submitTwitterUser").addEventListener("click", function() {
    const twitterUser = document.getElementById("twitterUser").value;
    if (twitterUser) {
        document.getElementById("initialScreen").style.display = 'none';
        document.getElementById("startScreen").style.display = 'flex';
        document.getElementById("headerText").style.display = 'block';
        startScreenMusic.play();
    }
});

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("startScreen").style.display = 'none';
    document.getElementById("headerText").style.display = 'none';
    startGame();
    startScreenMusic.pause();
    backgroundMusic.currentTime = 0; // Reiniciar la música
    backgroundMusic.play();
});

document.getElementById("restartButton").addEventListener("click", function() {
    document.getElementById("gameOverScreen").style.display = 'none';
    document.querySelector('.game-container').classList.remove('grayscale');
    startGame();
    backgroundMusic.currentTime = 0; // Reiniciar la música
    backgroundMusic.play();
});

document.addEventListener("keydown", direction);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

let xDown = null;
let yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && d !== "RIGHT") {
            d = "LEFT";
        } else if (xDiff < 0 && d !== "LEFT") {
            d = "RIGHT";
        }
    } else {
        if (yDiff > 0 && d !== "DOWN") {
            d = "UP";
        } else if (yDiff < 0 && d !== "UP") {
            d = "DOWN";
        }
    }

    xDown = null;
    yDown = null;

    startTimerIfNotStarted();
}

function startTimerIfNotStarted() {
    if (!gameStarted) {
        gameStarted = true;
        lastUpdateTime = performance.now();
        timerInterval = setInterval(updateTime, 10);
    }
}

function updateTime() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTime;
    totalTime += deltaTime;
    lastUpdateTime = currentTime;

    const seconds = Math.floor(totalTime / 1000);
    const centiseconds = Math.floor((totalTime % 1000) / 10);

    // Document elements updated to be commented temporarily
    // document.getElementById("seconds").textContent = seconds;
    // document.getElementById("centiseconds").textContent = centiseconds.toString().padStart(2, '0');
}
