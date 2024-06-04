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

const backgroundImage = new Image();
backgroundImage.src = 'background.png';

const victoryImage = new Image();
victoryImage.src = 'victory.jpg'; // Nueva imagen de victoria

// Cargar archivos de audio
const backgroundMusic = new Audio('background_music.mp3');
const startScreenMusic = new Audio('start_screen_music.mp3'); // Nueva música para la pantalla inicial
const victoryMusic = new Audio('victory_music.mp3'); // Nueva música para la victoria

submitTwitterUserButton.addEventListener('click', function() {
    const twitterUser = document.getElementById("twitterUser").value;
    if (twitterUser) {
        initialScreen.style.display = 'none';
        startScreen.style.display = 'flex';
        startButton.style.display = 'block'; // Asegurar que el botón se muestre
        headerText.style.display = 'block'; // Mostrar el texto de bienvenida
        recordDisplay.style.display = 'none'; // Ocultar el record
        startScreenMusic.loop = true;
        startScreenMusic.play();
    }
});

startButton.addEventListener('click', function() {
    startScreen.style.display = 'none';
    gameInfo.style.display = 'flex';  // Mostrar el contenedor del puntaje y el temporizador
    headerText.style.display = 'none'; // Ocultar el texto de bienvenida
    recordDisplay.style.display = 'none';
    startScreenMusic.pause();
    backgroundMusic.loop = true;
    backgroundMusic.play();
    startGame();
});

restartButton.addEventListener('click', function() {
    gameOverScreen.style.display = 'none';
    document.querySelector('.game-container').classList.remove('grayscale');
    document.getElementById('victoryBackground').style.opacity = 0; // Ocultar la imagen de victoria
    document.getElementById('background').style.opacity = 1; // Mostrar la imagen de fondo normal
    startGame();
});
