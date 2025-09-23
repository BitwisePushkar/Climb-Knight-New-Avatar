const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoree = document.getElementById("score");
const coinse = document.getElementById("coin-score");
const goverlay = document.getElementById("game-overlay");
const msg = document.getElementById("message");
const finalscore = document.getElementById("final-score");
const startbtn = document.getElementById("start-button");

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


let assetsl = 0;
const total = 4;
function assetLoaded() {
    assetsl++;
    if (assetsl === 4) {
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
    width: 120,
    height: 100,
    speed: 4,
    climbSpeed: 3,
    velocityX: 0,
    velocityY: 0,
    onLadder: false,
    onGround: false,
    jumpStrength: 11,
    color: "rgba(192, 192, 192, 1)",
    capeColor: "rgba(255, 0, 0, 1)",
};

const gravity = 0.5;
let platforms = [];
let ladders = [];
let obstacles = [];
let coins = [];
const platformh = 15;
let cameraY = 0;

const keys = {
    right: false, left: false, up: false, down: false, jump: false,
};

function drawPlayer() {
    ctx.drawImage(knightImg, player.x, player.y - cameraY, player.width, player.height);
}
