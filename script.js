const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 400;

// Game variables
const FPS = 120;
let keyDown = undefined; // Current key being pressed
let fired = false; // Weither a shot has been fired
let fire = false; // Weither trigger a shot or not

// Player variables
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 15;
const PLAYER_DX = 1; // Player x velocity
const canonPosition = {}; // Track the position of the canon (x & y) used to create missil
// Player's missils variables
const MISSIL_DY = 4; // Missil y velocity

class Player {
  constructor(x, y, width, height, dx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dx = dx;
  }

  draw() {
    // Draw the base of the ship
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // Draw the canon of the ship
    const canonWidth = 6;
    const canonHeight = canonWidth;
    const canonX = this.x + (this.width - canonWidth) / 2;
    const canonY = this.y - canonHeight;
    ctx.fillRect(canonX, canonY, canonWidth, canonHeight);
    canonPosition.x = canonX;
    canonPosition.y = canonY;
  }

  update() {
    this.draw();
  }

  moveLeft() {
    if (this.x <= 0) {
      return;
    }
    this.x -= this.dx;
  }

  moveRight() {
    if (this.x + this.width >= canvas.width) {
      return;
    }
    this.x += this.dx;
  }
}

class Missil {
  constructor(x, y, width, height, dy) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = dy;
  }
  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.draw();
    this.y -= this.dy;
  }
}

const player = new Player(
  (canvas.width - PLAYER_WIDTH) / 2, // X position (middle of the canvas)
  canvas.height - PLAYER_HEIGHT - 20, // Y position (20px above bottom of canvas)
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_DX // Player x velocity
);

const playerMissils = [];

const createPlayerMissil = () => {
  const newMissil = new Missil(
    canonPosition.x,
    canonPosition.y,
    6,
    6,
    PLAYER_DX
  );
  playerMissils.push(newMissil);
};

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // For each missil, loop through and display
  if (playerMissils && playerMissils.length) {
    for (let i = 0; i < playerMissils.length; i++) {
      playerMissils[i].update();
    }
  }
  if (keyDown === 'left') {
    player.moveLeft();
  }

  if (keyDown === 'right') {
    player.moveRight();
  }

  if (!fired) {
    if (fire) {
      fired = true;
      createPlayerMissil();
    }
  }

  player.update();
};

const keyDownHandler = e => {
  if (e.keyCode === 37 || e.which === 37) {
    keyDown = 'left';
  }

  if (e.keyCode === 39 || e.which === 39) {
    keyDown = 'right';
  }

  if (e.keyCode === 32 || e.which === 32) {
    if (!fired) {
      fire = true;
    }
  }
};

const keyUpHandler = e => {
  if (e.keyCode === 37 || e.which === 37) {
    keyDown = undefined;
  }
  if (e.keyCode === 39 || e.which === 39) {
    keyDown = undefined;
  }

  if (e.keyCode === 32 || e.which === 32) {
    fired = false;
    fire = false;
  }
};

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

const interval = setInterval(loop, 100 / FPS);
