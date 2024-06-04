document.getElementById("submitTwitterUser").addEventListener("click", function() {
    const twitterUser = document.getElementById("twitterUser").value;
    if (twitterUser) {
        document.getElementById("initialScreen").style.display = "none";
        document.getElementById("startScreen").style.display = "flex";
        startScreenMusic.play();
    }
});

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameInfo").style.display = "flex";
    document.getElementById("record").style.display = "flex";
    startGame();
    startScreenMusic.pause();
    backgroundMusic.play();
});

document.getElementById("restartButton").addEventListener("click", function() {
    document.getElementById("gameOverScreen").style.display = "none";
    document.getElementById("gameInfo").style.display = "none";
    document.getElementById("record").style.display = "none";
    startGame();
});
