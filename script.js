// Canvas
const canvas = document.querySelector('canvas');
canvas.width = 600;
canvas.height = 400;
const ctx = canvas.getContext('2d');

// Audio effects
const shootAudio = new Audio('./assets/sound-effects/shoot.mp3');
const playerExplosionAudio = new Audio('./assets/sound-effects/explosion.mp3');
const invaderKilledAudio = new Audio(
  './assets/sound-effects/invaderkilled.mp3'
);
// Helpers functions
const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

/* === GLOBAL VARIABLES === */
// Game
const FPS = 60;
let keyDown = undefined; // Current key being pressed
const GREEN = '#00FF41';

// Ship
const SHIP_WIDTH = 30;
const SHIP_HEIGHT = 12;
const SHIP_DX = 0.5; // Ship x velocity
const SHIP_COLOR = '#00FF41';
const canonPosition = {}; // Track the position of the canon (x & y) used to create missile

// Ship's missile
const MISSILE_DY = 1; // y velocity
const MISSILE_COLOR = '#00FF41';

// Ennemies
const ENNEMY_WIDTH = 20;
const ENNEMY_HEIGHT = 12;
const ENNEMIES_ROWS = 3;
const ENNEMY_HEALTH = 1;

// Obstacles
const OBSTACLE_WIDTH = 100;
const OBSTACLE_HEIGHT = 60;

/* === CLASSES === */
class Ship {
  constructor(x, y, width, height, dx) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dx = dx;
  }

  draw() {
    // Draw the base of the ship
    ctx.fillStyle = SHIP_COLOR;
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

class Missile {
  constructor(x, y, width, height, dy, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.dy = dy;
    this.id = id;
  }
  draw() {
    ctx.fillStyle = MISSILE_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    if (this.y <= -this.height) {
      return (shipMissile = undefined);
    }
    this.y -= this.dy;
    this.draw();
  }
}

class Ennemy {
  constructor(x, y, width, height, health) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
  }

  draw() {
    ctx.fillStyle = '#ffffff';
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

class Obstacle {
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.fillRect;
  }
}

let shipMissile;
let ship;
let ennemies = [];

const createShipMissile = () => {
  const newMissile = new Missile(
    canonPosition.x + 1,
    canonPosition.y,
    4,
    8,
    MISSILE_DY
  );
  shootAudio.play();
  shipMissile = newMissile;
};

const createEnnemies = () => {
  let ennemyY = 60;
  const ennemiesPerRow = 11;

  for (let i = 0; i < ENNEMIES_ROWS; i++) {
    const row = [];

    const totalEnnemiesLength = ennemiesPerRow * ENNEMY_WIDTH * 2;
    let ennemyX = (canvas.width - totalEnnemiesLength) / 2;

    for (let y = 0; y < ennemiesPerRow * 2; y++) {
      const x = ennemyX;
      if (y % 2 === 0) {
        const ennemy = new Ennemy(
          x,
          ennemyY,
          ENNEMY_WIDTH,
          ENNEMY_HEIGHT,
          ENNEMY_HEALTH
        );
        row.push(ennemy);
      }
      ennemyX += ENNEMY_WIDTH;
    }

    ennemies.push(row);
    ennemyY += 20 + ENNEMY_HEIGHT;
  }
};

const init = () => {
  // Create ship instance
  ship = new Ship(
    (canvas.width - SHIP_WIDTH) / 2, // X position (middle of the canvas)
    canvas.height - SHIP_HEIGHT - 20, // Y position (20px above bottom of canvas)
    SHIP_WIDTH,
    SHIP_HEIGHT,
    SHIP_DX // Ship x velocity
  );

  createEnnemies();
};

const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update ship missile position when created
  if (shipMissile) {
    shipMissile.update();
  }

  if (ennemies && ennemies.length) {
    for (let i = 0; i < ennemies.length; i++) {
      if (ennemies[i] && ennemies[i].length) {
        for (let y = 0; y < ennemies[i].length; y++) {
          const currentEnnemy = ennemies[i][y];
          if (
            shipMissile &&
            currentEnnemy.health &&
            shipMissile.y + MISSILE_DY <
              currentEnnemy.y + currentEnnemy.height &&
            shipMissile.x >= currentEnnemy.x &&
            shipMissile.x <= currentEnnemy.x + currentEnnemy.width
          ) {
            currentEnnemy.decreaseHealth();

            if (currentEnnemy.health === 0) {
              invaderKilledAudio.play();
            }
            shipMissile = undefined;
          }
          currentEnnemy.update();
        }
      }
    }
  }

  // Check if key is pressed
  if (keyDown === 'left') {
    ship.moveLeft();
  }

  if (keyDown === 'right') {
    ship.moveRight();
  }

  ship.update();
};

const keyDownHandler = e => {
  // Left key
  if (e.keyCode === 37 || e.which === 37) {
    keyDown = 'left';
  }

  // Right key
  if (e.keyCode === 39 || e.which === 39) {
    keyDown = 'right';
  }

  // Space key
  if (e.keyCode === 32 || e.which === 32) {
    // If no missile currently running, create one
    if (!shipMissile) {
      createShipMissile();
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
};

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

init();
const interval = setInterval(loop, 100 / FPS);
