const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const levelLabel = document.getElementById("levelLabel");
const playerScoreLabel = document.getElementById("playerScore");
const aiScoreLabel = document.getElementById("aiScore");

const LEVELS = [
    { ballSpeed: 4.2, aiSpeed: 3.8, reaction: 0.08, winScore: 4 },
    { ballSpeed: 5.1, aiSpeed: 4.8, reaction: 0.11, winScore: 4 },
    { ballSpeed: 5.9, aiSpeed: 5.7, reaction: 0.14, winScore: 5 },
    { ballSpeed: 6.8, aiSpeed: 6.8, reaction: 0.18, winScore: 5 },
    { ballSpeed: 7.8, aiSpeed: 8.0, reaction: 0.23, winScore: 6 }
];
const MAX_CANVAS_WIDTH = 460;

let viewWidth = 360;
let viewHeight = 640;

let paddleWidth = 14;
let paddleHeight = 110;
let ballSize = 16;
let playerX = 16;
let aiX = viewWidth - paddleWidth - 16;

let playerY = 0;
let aiY = 0;
let ballX = 0;
let ballY = 0;
let ballVelX = 0;
let ballVelY = 0;

let levelIndex = 0;
let playerScore = 0;
let aiScore = 0;
let running = false;
let animationFrame = null;
let serving = false;
let waitingForNextLevel = false;

function getCurrentLevel() {
    return LEVELS[levelIndex];
}

function resizeCanvas() {
    const wrap = document.getElementById("gameWrap");
    const cssWidth = Math.min(MAX_CANVAS_WIDTH, wrap.clientWidth || 360);
    const cssHeight = Math.round((cssWidth * 16) / 9);
    const ratio = window.devicePixelRatio || 1;

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    viewWidth = cssWidth;
    viewHeight = cssHeight;

    paddleWidth = Math.max(10, viewWidth * 0.03);
    paddleHeight = Math.min(120, Math.max(90, viewHeight * 0.17));
    ballSize = Math.max(12, viewWidth * 0.045);
    playerX = Math.max(12, viewWidth * 0.04);
    aiX = viewWidth - paddleWidth - playerX;

    playerY = clamp(playerY || viewHeight / 2, 0, viewHeight - paddleHeight);
    aiY = clamp(aiY || viewHeight / 2, 0, viewHeight - paddleHeight);
    ballX = clamp(ballX || viewWidth / 2, 0, viewWidth - ballSize);
    ballY = clamp(ballY || viewHeight / 2, 0, viewHeight - ballSize);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function resetRound(direction = Math.random() > 0.5 ? 1 : -1) {
    const level = getCurrentLevel();
    playerY = (viewHeight - paddleHeight) / 2;
    aiY = (viewHeight - paddleHeight) / 2;
    ballX = (viewWidth - ballSize) / 2;
    ballY = (viewHeight - ballSize) / 2;
    ballVelX = level.ballSpeed * direction;
    ballVelY = (Math.random() * 2 - 1) * level.ballSpeed;
}

function startLevel(levelToStart = levelIndex) {
    cancelAnimationFrame(animationFrame);
    levelIndex = levelToStart;
    waitingForNextLevel = false;
    playerScore = 0;
    aiScore = 0;
    serving = true;
    levelLabel.textContent = String(levelIndex + 1);
    playerScoreLabel.textContent = "0";
    aiScoreLabel.textContent = "0";
    resetRound();
    running = true;

    overlay.classList.remove("show");
    serveDelay();
    gameLoop();
}

function serveDelay() {
    serving = true;
    setTimeout(() => {
        serving = false;
    }, 550);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall() {
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(ballX + ballSize / 2, ballY + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = "rgba(148,163,184,0.45)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(viewWidth / 2, 0);
    ctx.lineTo(viewWidth / 2, viewHeight);
    ctx.stroke();
    ctx.setLineDash([]);
}

function update() {
    if (!running || serving) return;

    const level = getCurrentLevel();

    ballX += ballVelX;
    ballY += ballVelY;

    if (ballY <= 0) {
        ballY = 0;
        ballVelY *= -1;
    } else if (ballY + ballSize >= viewHeight) {
        ballY = viewHeight - ballSize;
        ballVelY *= -1;
    }

    if (
        ballX <= playerX + paddleWidth &&
        ballX + ballSize >= playerX &&
        ballY + ballSize >= playerY &&
        ballY <= playerY + paddleHeight
    ) {
        ballX = playerX + paddleWidth;
        const hitPos = (ballY + ballSize / 2 - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        const speed = Math.min(Math.abs(ballVelX) * 1.05, level.ballSpeed * 1.9);
        ballVelX = speed;
        ballVelY += hitPos * 2.2;
    }

    if (
        ballX + ballSize >= aiX &&
        ballX <= aiX + paddleWidth &&
        ballY + ballSize >= aiY &&
        ballY <= aiY + paddleHeight
    ) {
        ballX = aiX - ballSize;
        const hitPos = (ballY + ballSize / 2 - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
        const speed = Math.min(Math.abs(ballVelX) * 1.04, level.ballSpeed * 1.9);
        ballVelX = -speed;
        ballVelY += hitPos * 2;
    }

    if (ballX < 0) {
        aiScore += 1;
        aiScoreLabel.textContent = String(aiScore);
        checkRoundEnd(-1);
        return;
    }

    if (ballX > viewWidth) {
        playerScore += 1;
        playerScoreLabel.textContent = String(playerScore);
        checkRoundEnd(1);
        return;
    }

    const targetY = ballVelX > 0
        ? ballY + ballSize / 2 - paddleHeight / 2
        : (viewHeight - paddleHeight) / 2;
    const aiTarget = aiY + (targetY - aiY) * level.reaction;
    if (aiTarget > aiY + level.aiSpeed) {
        aiY += level.aiSpeed;
    } else if (aiTarget < aiY - level.aiSpeed) {
        aiY -= level.aiSpeed;
    } else {
        aiY = aiTarget;
    }

    aiY = clamp(aiY, 0, viewHeight - paddleHeight);
}

function checkRoundEnd(lastDirection) {
    const level = getCurrentLevel();

    if (playerScore >= level.winScore) {
        if (levelIndex === LEVELS.length - 1) {
            endGame(true, "You cleared all 5 levels. Great game!");
        } else {
            running = false;
            waitingForNextLevel = true;
            overlayText.textContent = `Level ${levelIndex + 1} cleared! Next: Level ${levelIndex + 2}.`;
            startBtn.textContent = "Next Level";
            overlay.classList.add("show");
        }
        return;
    }

    if (aiScore >= level.winScore) {
        endGame(false, `AI won Level ${levelIndex + 1}. Try again!`);
        return;
    }

    resetRound(-lastDirection);
    serveDelay();
}

function endGame(win, message) {
    running = false;
    cancelAnimationFrame(animationFrame);
    overlayText.textContent = message;
    startBtn.textContent = win ? "Play Again" : "Restart";
    overlay.classList.add("show");
    waitingForNextLevel = false;
    if (win) {
        levelIndex = 0;
    }
}

function render() {
    ctx.clearRect(0, 0, viewWidth, viewHeight);
    drawCenterLine();
    drawRect(playerX, playerY, paddleWidth, paddleHeight, "#38bdf8");
    drawRect(aiX, aiY, paddleWidth, paddleHeight, "#f8fafc");
    drawBall();

    if (serving && running) {
        ctx.save();
        ctx.fillStyle = "rgba(248,250,252,0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 20px Arial";
        ctx.fillText("Get ready...", viewWidth / 2, viewHeight / 2);
        ctx.restore();
    }
}

function gameLoop() {
    update();
    render();
    if (running) {
        animationFrame = requestAnimationFrame(gameLoop);
    }
}

function updatePlayerFromClientY(clientY) {
    const rect = canvas.getBoundingClientRect();
    const y = clientY - rect.top;
    playerY = clamp(y - paddleHeight / 2, 0, viewHeight - paddleHeight);
}

canvas.addEventListener("pointerdown", (event) => {
    updatePlayerFromClientY(event.clientY);
    canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
    updatePlayerFromClientY(event.clientY);
});

startBtn.addEventListener("click", () => {
    if (waitingForNextLevel) {
        startLevel(levelIndex + 1);
        return;
    }

    startBtn.textContent = "Start Game";
    overlayText.textContent = "Touch and drag to control your paddle. Beat 5 levels.";
    startLevel(0);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
render();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
}
