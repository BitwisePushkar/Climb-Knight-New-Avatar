const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoree = document.getElementById("score");
const coinse = document.getElementById("coin-score");
const goverlay = document.getElementById("game-overlay");
const msg = document.getElementById("message");
const finalscore = document.getElementById("final-score");
const startbtn = document.getElementById("start-button");
const bgMusic = document.getElementById("bg-music");

let score = 0;
let cscore = 0;
let hscore = 0;
let gstart = false;
let gover = false;
let hplatformY = canvas.height;

const coinImg = new Image();
coinImg.src = "./assets/coins.png";
const monsterImg1 = new Image();
monsterImg1.src = "./assets/monster1.png";
const monsterImg2 = new Image();
monsterImg2.src = "./assets/monster2.png";
const knightImg = new Image();
knightImg.src = "./assets/Knight.png";

let assestl = 0;
const total = 4;
function assetLoaded() {
  assestl++;
  if (assestl === 4) {
    startbtn.disabled = false;
  }
}
coinImg.onload = assetLoaded;
monsterImg1.onload = assetLoaded;
monsterImg2.onload = assetLoaded;
knightImg.onload = assetLoaded;
startbtn.disabled = true;

const player = {
    x: canvas.width / 2 - 60,
    y: 0,
    width: 60,
    height: 80,
    speed: 4,
    climbSpeed: 4,
    velocityX: 0,
    velocityY: 0,
    onLadder: false,
    onGround: false,
    jumpStrength: 11,
};

const gravity = 0.3;
let platforms = [];
let ladders = [];
let obstacles = [];
let coins = [];
const platformh = 15;
let cameraY = 0;

const keys = {
  right: false,
  left: false,
  up: false,
  down: false,
  jump: false,
};

function drawPlayer() {
  ctx.drawImage(
    knightImg,
    player.x,
    player.y - cameraY,
    player.width,
    player.height
  );
}

function drawFloors() {
  ctx.fillStyle = "rgba(91, 54, 46, 1)";
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    ctx.fillRect(
      platform.x,
      platform.y - cameraY,
      platform.width,
      platform.height
    );
  }
}

function drawLadders() {
  const ladderRungColor = "rgba(139, 69, 19, 1)";
  const ladderSideColor = "rgba(90, 45, 12, 1)";
  const ladderWidth = 20;
  for (let i = 0; i < ladders.length; i++) {
    const ladder = ladders[i];
    const x = ladder.x;
    const y = ladder.y - cameraY;
    ctx.fillStyle = ladderSideColor;
    ctx.fillRect(x, y, 4, ladder.height);
    ctx.fillRect(x + ladderWidth - 4, y, 4, ladder.height);
    ctx.fillStyle = ladderRungColor;
    for (let j = 10; j < ladder.height; j += 15) {
      ctx.fillRect(x, y + j, ladderWidth, 5);
    }
  }
}

function drawObstacles() {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.type === 1) {
      ctx.drawImage(monsterImg1, obs.x, obs.y - cameraY, obs.width, obs.height);
    } else {
      ctx.drawImage(monsterImg2, obs.x, obs.y - cameraY, obs.width, obs.height);
    }
  }
}

function drawCoins() {
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    ctx.drawImage(coinImg, coin.x - 16, coin.y - cameraY - 16, 32, 32);
  }
}

function glevel() {
  platforms = [];
  ladders = [];
  obstacles = [];
  coins = [];
  const floorDistance = 250;
  const ladderWidth = 20;
  platforms.push({
    x: 0,
    y: canvas.height - 30,
    width: canvas.width,
    height: platformh,
  });

  for (let i = 1; i < 50; i++) {
    const lastFloorY = platforms[platforms.length - 1].y;
    const newFloorY = lastFloorY - floorDistance;
    const ladderX = Math.random() * (canvas.width - ladderWidth);
    platforms.push({
      x: 0,
      y: newFloorY,
      width: canvas.width,
      height: platformh,
    });
    ladders.push({
      x: ladderX,
      y: newFloorY,
      height: floorDistance,
      width: ladderWidth,
    });

    if (Math.random() < 0.6) {
      const obsWidth = 40;
      const obsHeight = 40;
      const obsX = Math.random() * (canvas.width - obsWidth);
      const monsterType = Math.random() < 0.5 ? 1 : 2;
      obstacles.push({
        x: obsX,
        y: newFloorY - obsHeight,
        width: obsWidth,
        height: obsHeight,
        type: monsterType,
        velocityX: 2,
        direction: 1,
        platformLeft: 0,
        platformRight: canvas.width,
      });
    }

    if (Math.random() < 0.7) {
      const coinX = Math.random() * (canvas.width - 20) + 10;
      coins.push({ x: coinX, y: newFloorY - 40, radius: 8 });
    }
  }
}

function updatescore() {
  scoree.textContent = `Score: ${score}`;
  coinse.textContent = `Coins: ${cscore}`;
}

function update() {
  if (!gstart || gover) return;

  let onLadderZone = false;
  let currentLadder = null;
  for (let i = 0; i < ladders.length; i++) {
    const ladder = ladders[i];
    const ladderc = ladder.x + ladder.width / 2;
    const playerc = player.x + player.width / 2;
    const horizontalAlignment = Math.abs(playerc - ladderc) < 15;
    const ladderPadding = 10;
    if (
      player.x + player.width > ladder.x - ladderPadding &&
      player.x < ladder.x + ladder.width + ladderPadding &&
      player.y + player.height > ladder.y &&
      player.y < ladder.y + ladder.height
    ) {
      onLadderZone = true;
      currentLadder = ladder;
      break;
    }
  }

  if (onLadderZone && (keys.up || keys.down)) {
    player.velocityY = 0;
    if (keys.up) player.y -= player.climbSpeed;
    if (keys.down) player.y += player.climbSpeed;
    if (!keys.left && !keys.right) {
      player.x = currentLadder.x + currentLadder.width / 2 - player.width / 2;
    }
  } else {
    player.velocityX = 0;
    if (keys.left) player.velocityX = -player.speed;
    if (keys.right) player.velocityX = player.speed;
    player.velocityY += gravity;
    player.x += player.velocityX;
    player.y += player.velocityY;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;

  let onAnyPlatform = false;
  if (player.velocityY >= 0) {
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platformh + 10
      ) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        onAnyPlatform = true;

        if (platform.y < hplatformY) {
          hplatformY = platform.y;
          score++;
          updatescore();
        }
      }
    }
  }
  player.onGround = onAnyPlatform;

  if (keys.jump && player.onGround) {
    player.velocityY = -player.jumpStrength;
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (
      player.x < coin.x + coin.radius &&
      player.x + player.width > coin.x - coin.radius &&
      player.y < coin.y + coin.radius &&
      player.y + player.height > coin.y - coin.radius
    ) {
      coins.splice(i, 1);
      cscore++;
      updatescore();
    }
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x += obs.velocityX * obs.direction;
    if (obs.x <= obs.platformLeft || obs.x + obs.width >= obs.platformRight) {
      obs.direction *= -1;
    }

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame();
    }
  }

  const cameraTargetY = player.y - canvas.height / 2 + 100;
  if (cameraTargetY < cameraY) {
    cameraY += (cameraTargetY - cameraY) * 0.1;
  } 

  if (player.y > platforms[0].y + player.height) {
    endGame();
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloors();
  drawLadders();
  drawObstacles();
  drawCoins();
  drawPlayer();
}

function resetGame() {
  score = 0;
  cscore = 0;
  hplatformY = canvas.height;
  cameraY = 0;
  glevel();
  player.x = canvas.width / 2 - player.width / 2;
  player.y = platforms[0].y - player.height;
  player.velocityX = 0;
  player.velocityY = 0;
  player.onLadder = false;
  player.onGround = false;
  updatescore();
}

function endGame() {
  if (gover) return;

  gover = true;

  gstart = false; 

  if (score > hscore) hscore = score;

  msg.textContent = "Game Over!";

  finalscore.textContent = `Score: ${score}\nCoins: ${cscore}\nHighscore: ${hscore}`;

  startbtn.textContent = "Restart";

  goverlay.style.display = "flex";
}

function startGame() {
  resetGame();
  gstart = true;
  gover = false;
  goverlay.style.display = "none";
  bgMusic.currentTime = 0;
  bgMusic
    .play()
    .then(() => {
      console.log("Audio playing");
    })
    .catch((err) => {
      console.warn("Audio play failed:", err);
    });
  update();
}

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowRight":
      keys.right = true;
      break;

    case "ArrowLeft":
      keys.left = true;
      break;

    case "ArrowUp":
      keys.up = true;
      break;

    case "ArrowDown":
      keys.down = true;
      break;

    case "Space":
      keys.jump = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowRight":
      keys.right = false;
      break;

    case "ArrowLeft":
      keys.left = false;
      break;

    case "ArrowUp":
      keys.up = false;
      break;

    case "ArrowDown":
      keys.down = false;
      break;

    case "Space":
      keys.jump = false;
      break;
  }
});

function addMobileTouchListener(id, keyName) {
  const btn = document.getElementById(id);
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[keyName] = true;
  });
  btn.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys[keyName] = false;
  });
}

addMobileTouchListener("left-btn", "left");
addMobileTouchListener("right-btn", "right");
addMobileTouchListener("up-btn", "up");
addMobileTouchListener("down-btn", "down");
addMobileTouchListener("jump-btn", "jump");

startbtn.addEventListener("click", startGame);

updatescore();
