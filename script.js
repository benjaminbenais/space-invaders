const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Helpers functions
const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

canvas.width = 600;
canvas.height = 400;

// Game variables
const FPS = 8;
let keyDown = undefined; // Current key being pressed
let fired = false; // Weither a shot has been fired
let fire = false; // Weither trigger a shot or not

// Player variables
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 12;
const PLAYER_DX = 1; // Player x velocity
const PLAYER_COLOR = '#05dfd7';
const canonPosition = {}; // Track the position of the canon (x & y) used to create missil
// Player's missils variables
const MISSIL_DY = 3; // Missil y velocity
const MISSIL_COLOR = '#fff591';

// Ennemies variables
const ENNEMY_WIDTH = 20;
const ENNEMY_HEIGHT = 12;
const ENNEMIES_ROWS = 3;
const ENNEMY_HEALTH = 1;

/* === CLASSES === */
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
    ctx.fillStyle = PLAYER_COLOR;
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
  constructor(x, y, width, height, dy, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = dy;
    this.id = id;
  }
  draw() {
    ctx.fillStyle = MISSIL_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    if (this.y <= -this.height) {
      return (playerMissil = undefined);
    }
    this.y -= this.dy;
    this.draw();
  }
}

class Ennemy {
  constructor(x, y, width, height, health, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color || '#ffffff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (this.health > 0) {
      this.draw();
    }
  }

  decreaseHealth() {
    if (this.health) {
      this.health -= 1;
    }
  }
}

let playerMissil;

const createPlayerMissil = () => {
  const newMissil = new Missil(
    canonPosition.x + 1,
    canonPosition.y,
    4,
    4,
    MISSIL_DY
  );
  playerMissil = newMissil;
};

let player;
let ennemies = [];

const createEnnemies = () => {
  let ennemyY = 60;
  const colors = ['#00FF41', '#05dfd7', '#fa26a0']; // green, blue, purple
  const ennemiesPerRow = 11;

  for (let i = 0; i < ENNEMIES_ROWS; i++) {
    const row = [];

    let countX = ENNEMY_WIDTH / 2;

    for (let y = 0; y < ennemiesPerRow * 2; y++) {
      const x = countX;
      if (y % 2 !== 0) {
        const ennemy = new Ennemy(
          x,
          ennemyY,
          ENNEMY_WIDTH,
          ENNEMY_HEIGHT,
          ENNEMY_HEALTH,
          colors[i]
        );
        row.push(ennemy);
      }
      countX += ENNEMY_WIDTH;
    }

    ennemies.push(row);
    ennemyY += 20 + ENNEMY_HEIGHT;
  }
};

const init = () => {
  // Create player instance
  player = new Player(
    (canvas.width - PLAYER_WIDTH) / 2, // X position (middle of the canvas)
    canvas.height - PLAYER_HEIGHT - 20, // Y position (20px above bottom of canvas)
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_DX // Player x velocity
  );

  createEnnemies();
};

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player missil position when created
  if (playerMissil) {
    playerMissil.update();
  }

  if (ennemies && ennemies.length) {
    for (let i = 0; i < ennemies.length; i++) {
      if (ennemies[i] && ennemies[i].length) {
        for (let y = 0; y < ennemies[i].length; y++) {
          const currentEnnemy = ennemies[i][y];
          if (
            playerMissil &&
            currentEnnemy.health &&
            playerMissil.y <= currentEnnemy.y + currentEnnemy.height &&
            playerMissil.x >= currentEnnemy.x &&
            playerMissil.x <= currentEnnemy.x + currentEnnemy.width
          ) {
            currentEnnemy.decreaseHealth();
            playerMissil = undefined;
          }
          currentEnnemy.update();
        }
      }
    }
  }

  // Check if key is pressed
  if (keyDown === 'left') {
    player.moveLeft();
  }

  if (keyDown === 'right') {
    player.moveRight();
  }

  if (!fired) {
    if (fire && !playerMissil) {
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

init();
const interval = setInterval(loop, 100 / FPS);
