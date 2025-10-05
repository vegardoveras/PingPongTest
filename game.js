const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 20;
const PLAYER_X = 30;
const AI_X = canvas.width - PADDLE_WIDTH - 30;
const PADDLE_SPEED = 7;
const BALL_SPEED = 5;

let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function gameLoop() {
  // Move ball
  ballX += ballVelX;
  ballY += ballVelY;

  // Ball collision with top/bottom walls
  if (ballY <= 0) {
    ballY = 0;
    ballVelY = -ballVelY;
  }
  if (ballY + BALL_SIZE >= canvas.height) {
    ballY = canvas.height - BALL_SIZE;
    ballVelY = -ballVelY;
  }

  // Ball collision with player paddle
  if (
    ballX <= PLAYER_X + PADDLE_WIDTH &&
    ballX >= PLAYER_X &&
    ballY + BALL_SIZE >= playerY &&
    ballY <= playerY + PADDLE_HEIGHT
  ) {
    ballX = PLAYER_X + PADDLE_WIDTH;
    ballVelX = -ballVelX;
    // Add some spin based on where the paddle was hit
    let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
    ballVelY += collidePoint * 0.15;
  }

  // Ball collision with AI paddle
  if (
    ballX + BALL_SIZE >= AI_X &&
    ballX + BALL_SIZE <= AI_X + PADDLE_WIDTH &&
    ballY + BALL_SIZE >= aiY &&
    ballY <= aiY + PADDLE_HEIGHT
  ) {
    ballX = AI_X - BALL_SIZE;
    ballVelX = -ballVelX;
    // Add some spin based on where the paddle was hit
    let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
    ballVelY += collidePoint * 0.15;
  }

  // Ball out of bounds (score)
  if (ballX < 0 || ballX > canvas.width) {
    resetBall();
  }

  // AI paddle movement (basic tracking)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  let ballCenter = ballY + BALL_SIZE / 2;
  if (aiCenter < ballCenter - 10) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballCenter + 10) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle position
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));

  // Draw everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawCircle(ballX + BALL_SIZE/2, ballY + BALL_SIZE/2, BALL_SIZE/2, "#fff");

  requestAnimationFrame(gameLoop);
}

// Mouse control for player paddle
canvas.addEventListener("mousemove", function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Start game
resetBall();
gameLoop();
