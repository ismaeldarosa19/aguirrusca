const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const initialScreen = document.getElementById("initialScreen");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const submitTwitterUserButton = document.getElementById("submitTwitterUser");
const headerText = document.getElementById("headerText");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const gameInfo = document.getElementById("gameInfo");
const recordDisplay = document.getElementById("record");
const gameOverText = document.getElementById("gameOverText");
const restartButton = document.getElementById("restartButton");
const secondsDisplay = document.getElementById("seconds");
const centisecondsDisplay = document.getElementById("centiseconds");

let box;
let snake;
let food;
let score;
let totalTime; // Tiempo en centésimas de segundo
let lastUpdateTime = 0;
let timerInterval;
let d;
let game;
let twitterUser;
let gameStarted = false;

let bestScore = 0;
let bestTime = Infinity; // Usamos Infinity para comparar tiempos

const levels = Array.from({ length: 13 }, (_, i) => ({ speed: 150 - i * 10, duration: 30 }));
let currentLevel = 0;

const snakeHeadImg = new Image();
snakeHeadImg.src = 'snake_head.png';

const numSegments = 10; // Número de segmentos de la serpiente (puede aumentar)
const images = [];
for (let i = 1; i <= numSegments; i++) {
    const img = new Image();
    img.src = `${i}.png`;
    images.push(img);
}

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

const victoryImage = new Image();
victoryImage.src = 'victory.jpg'; // Nueva imagen de victoria

// Cargar archivos de audio
const backgroundMusic = new Audio('background_music.mp3');
const eatSound = new Audio('eat_sound.mp3');
const startScreenMusic = new Audio('start_screen_music.mp3'); // Nueva música para la pantalla inicial
const victoryMusic = new Audio('victory_music.mp3'); // Nueva música para la victoria

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 800);
    canvas.width = size;
    canvas.height = size;
    box = canvas.width / 10;  // Duplicar el tamaño de las casillas
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function initGame() {
    box = canvas.width / 10;
    snake = [{ x: 4 * box, y: 5 * box }];
    food = {
        x: Math.floor(Math.random() * 9 + 1) * box,
        y: Math.floor(Math.random() * 9 + 1) * box
    };
    score = 0;
    totalTime = 0;
    lastUpdateTime = performance.now();
    updateScore();
    updateTime(); // Inicializar el tiempo
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
    gameInfo.style.display = 'flex';  // Mostrar el contenedor del puntaje y el temporizador
    headerText.style.display = 'none'; // Ocultar el texto de bienvenida
    recordDisplay.style.display = 'none';
    startScreen.style.display = 'none'; // Ocultar la pantalla de inicio

    // Cambiar la música
    startScreenMusic.pause();
    backgroundMusic.loop = true;
    backgroundMusic.play();
}

startButton.addEventListener('click', startGame);

submitTwitterUserButton.addEventListener('click', function() {
    twitterUser = document.getElementById("twitterUser").value;
    if (twitterUser) {
        initialScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        startButton.style.display = 'block'; // Asegurar que el botón se muestre
        headerText.style.display = 'block'; // Mostrar el texto de bienvenida
        recordDisplay.style.display = 'none'; // Ocultar el record
        startScreenMusic.loop = true;
        startScreenMusic.play();
        drawStartScreen();
    }
});

restartButton.addEventListener('click', function() {
    gameOverScreen.style.display = 'none';
    document.querySelector('.game-container').classList.remove('grayscale');
    document.getElementById('victoryBackground').style.opacity = 0; // Ocultar la imagen de victoria
    document.getElementById('background').style.opacity = 1; // Mostrar la imagen de fondo normal
    startGame();
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
        timerInterval = setInterval(updateTime, 10); // Actualizar cada 10 milisegundos
    }
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
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Dibujar imagen de fondo

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            // Dibujar la cabeza un poco más grande
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

    if (snakeX == food.x && snakeY == food.y) {
        score++;
        eatSound.play(); // Reproducir sonido al comer
        if (score === 13) {
            winGame();
            return;
        }
        food = {
            x: Math.floor(Math.random() * 9 + 1) * box,
            y: Math.floor(Math.random() * 9 + 1) * box
        };
        updateScore();
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        backgroundMusic.pause(); // Pausar la música de fondo al terminar el juego
        clearInterval(timerInterval); // Detener el temporizador
        checkAndUpdateRecord(); // Comprobar y actualizar el récord al finalizar el juego
        endGame();
    }

    snake.unshift(newHead);

    ctx.fillStyle = "white";
    ctx.font = "45px Changa one";
}

function updateScore() {
    scoreDisplay.textContent = "Puntaje: " + score;
}

function updateTime() {
    const now = performance.now();
    const elapsed = now - lastUpdateTime;
    lastUpdateTime = now;

    totalTime += elapsed; // Incrementar en milisegundos
    const seconds = Math.floor(totalTime / 1000);
    const centiseconds = Math.floor((totalTime % 1000) / 10);
    secondsDisplay.textContent = seconds;
    centisecondsDisplay.textContent = centiseconds.toString().padStart(2, '0');
}

function checkAndUpdateRecord() {
    if (score > bestScore || (score === bestScore && totalTime < bestTime)) {
        bestScore = score;
        bestTime = totalTime;
        recordDisplay.textContent = `Record: ${bestScore}`;
    }
}

function displayGameOverText(message) {
    gameOverText.innerHTML = message;
    gameOverText.style.color = 'yellow'; // Asegurar que el texto sea amarillo
    gameOverText.style.opacity = 1; // Mostrar el mensaje de forma suave
    restartButton.style.color = 'yellow'; // Asegurar que el botón tenga texto amarillo
    restartButton.style.opacity = 1; // Mostrar el botón de reinicio de forma suave
    gameOverScreen.style.display = 'flex';
}

function endGame() {
    gameInfo.style.display = 'none';
    // Eliminar la serpiente y la comida
    snake = [];
    food = {};
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Dibujar solo la imagen de fondo

    document.querySelector('.game-container').classList.add('grayscale'); // Añadir clase para transición a blanco y negro
    setTimeout(() => {
        let message;
        if (score <= 6) {
            message = `Perdiste, llegaste a Fase de Grupos.<br>Tu puntaje: ${score}<br>Tiempo: ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} seg`;
        } else if (score <= 8) {
            message = `Perdiste, llegaste a Octavos de final.<br>Tu puntaje: ${score}<br>Tiempo: ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} seg`;
        } else if (score <= 10) {
            message = `Perdiste, llegaste a Cuartos de final.<br>Tu puntaje: ${score}<br>Tiempo: ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} seg`;
        } else if (score <= 12) {
            message = `Que cerca!!!, llegaste a Semi Final.<br>Tu puntaje: ${score}<br>Tiempo: ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} seg`;
        } else if (score === 13) {
            message = `Casi Casi!!! llegaste a la final.<br>Tu puntaje: ${score}<br>Tiempo: ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} seg`;
        }
        displayGameOverText(message);
    }, 2000); // Esperar 2 segundos para la transición a blanco y negro
}

function winGame() {
    clearInterval(game);
    backgroundMusic.pause(); // Pausar la música de fondo al ganar
    victoryMusic.play(); // Reproducir música de victoria
    clearInterval(timerInterval); // Detener el temporizador
    checkAndUpdateRecord(); // Comprobar y actualizar el récord al finalizar el juego
    gameInfo.style.display = 'none';
    // Eliminar la serpiente y la comida
    snake = [];
    food = {};
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById('background').classList.add('fade-out');
    victoryImage.style.opacity = 0;
    setTimeout(() => {
        victoryImage.classList.add('fade-in');
        victoryImage.style.opacity = 1;
        const message = `Lograste la 6ta junto a Diego, en ${secondsDisplay.textContent}.${centisecondsDisplay.textContent} segundos`;
        displayGameOverText(message);
    }, 2000); // Esperar 2 segundos antes de mostrar el mensaje
}

// Dibujar la pantalla inicial con la imagen de fondo
function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); // Dibujar la imagen de fondo en el canvas
}

function drawInitialScreen() {
    initialScreen.style.display = 'flex';
    startScreen.style.display = 'none';
    headerText.style.display = 'block'; // Asegurarse de que el texto se muestre
    // Dibujar la imagen de fondo una vez cargada
    backgroundImage.onload = function() {
        drawStartScreen();
    }
}

backgroundImage.src = 'background.png'; // Asegurarse de que la imagen se cargue
victoryImage.src = 'victory.jpg'; // Asegurarse de que la imagen se cargue

// Reproducir la música de la pantalla inicial y dibujar la pantalla inicial
initGame();
drawInitialScreen(); // Dibujar la pantalla inicial al cargar la página
