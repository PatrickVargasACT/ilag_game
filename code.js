const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width = 600;
const canvasHeight = canvas.height = 600;
const obstacles = [];

let gameOver = false;
let lastTime = 0;
let spawnTimer = 0;
let score = 0;
let xpBar = 0;
let level = 1;

function randomColor() {
	const colors = ['red', 'blue', 'green', 'yellow', 'orange'];
	
	const randomNumber = Math.floor(Math.random() * colors.length);
	
	return colors[randomNumber];
}

class InputHandler {
	constructor() {
		this.keys = [];
		
		window.addEventListener("keydown", e => {
			if ((e.key === 'a' || 
				e.key === 'd') &&
				this.keys.indexOf(e.key) === -1) {
					this.keys.push(e.key);
				}
		});
		
		window.addEventListener("keyup", e => {
			if (e.key === 'a' || 
				e.key === 'd') {
					this.keys.splice(this.keys.indexOf(e.key), 1);
				}

		});
		
	}
}

class Obstacle {
	constructor() {
		this.maxWidth = 400;
		this.minWidth = 150;
		this.width = Math.floor(Math.random() * (this.maxWidth - this.minWidth + 1)) + this.minWidth;
		this.height = 30;
		this.x = Math.floor(Math.random() * (canvasWidth - this.width));
		this.y = -this.height;
		this.weight = 500 + (level * 100);
		this.color = randomColor();
		this.toppingsHeight = this.height / 3;
		this.toppingsColor = randomColor();
	}
	
	draw() {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, this.y, canvasWidth, this.height);
		ctx.fillStyle = this.toppingsColor;
		ctx.fillRect(0, this.y, canvasWidth, this.toppingsHeight);
		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y-10, this.width, this.height+10);
	}
	
	fall(deltaTime) {
		this.y += this.weight * deltaTime;
	}
	
	atBottom() {
		if (this.y > canvasHeight) {
			return true;
		}
	}
	
	
	update(deltaTime) {
		this.draw();
		this.fall(deltaTime);
	}
}

class Player {
	constructor() {
		this.height = 20;
		this.width = 100;
		this.x = canvasWidth / 2 - this.width / 2;
		this.gap = 20;
		this.y = canvasHeight - this.height - this.gap;
		this.color = "white";
		this.speed = 1000;
		this.img = new Image();
		this.img.src = "player.webp";
	}
	
	draw() {
		ctx.fillStyle = this.color;
		ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
		// ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	
	move(input, deltaTime) {
		if (input.indexOf('a') > -1) {
			this.x += -this.speed * deltaTime;
		} else if (input.indexOf('d') > -1) {
			this.x += this.speed * deltaTime;
		}
	}
	
	border() {
		if (this.x <= 0) {
			this.x = 0;
		} else if (this.x + this.width >= canvasWidth) {
			this.x = canvasWidth - this.width;
		}
	}
	
	hasCollided(obstacle) {
		if (obstacle.y <= this.y &&
			obstacle.y + obstacle.height >= this.y
		) 
		{
			if (
				this.x >= 0 &&
				this.x <= obstacle.x
			) {
				gameOver = true;
			}
			
			if (
				obstacle.x + obstacle.width <= this.x + this.width
			) 
			{
				gameOver = true;
			}
		}
	}
	
	levelManager() {
		if (xpBar == 10) {
			xpBar = 0;
			level++;
		}
	}
	
	update(input, deltaTime) {
		this.levelManager();
		this.move(input, deltaTime);
		this.draw();
		this.border();
	}
	
}

function spawner(deltaTime) {
	let spawnPerSecond = 2;
	
	if (spawnTimer < spawnPerSecond) {
		spawnTimer += deltaTime;
	} else if (spawnTimer > spawnPerSecond) {
		spawnTimer = 0;
		obstacles.push(new Obstacle);
		
	}
}

function objectUpdate(deltaTime) {
	for (let i = 0; i < obstacles.length; i++) {
		obstacles[i].update(deltaTime);
		
		if (obstacles[i].atBottom()) {
			obstacles.splice(i, 1);
			score++;
			xpBar++;
			i--;
			continue;
		}
		player.hasCollided(obstacles[i]);
	}
	
}

function displayText(context) {
	ctx.textBaseLine = "alphabetic";
	ctx.textAlign = "start";
	ctx.fillStyle = "white";
	ctx.font = "30px Comic Sans MS";
	ctx.fillText(context, 30, 50);
	ctx.fillText("Level: " + level, canvasWidth - 200, 50);
}

function afterGame() {
	ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "30px Tahoma";
	ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2 - 20);
	ctx.font = "20px Arial";
	ctx.fillText("Score: " + score, canvasWidth / 2, canvasHeight / 2 + 20);
	
	canvas.onclick = function() {
		gameOver = false;
		score = -1;
		level = 1;
		xpBar = 0;
		requestAnimationFrame(gameLoop);
	}
	
}

const input = new InputHandler();
const player = new Player();

function gameLoop(time) {
	let deltaTime = (time - lastTime) / 1000;
	lastTime = time;
	ctx.clearRect(0,0,canvasWidth,canvasWidth);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	spawner(deltaTime);
	objectUpdate(deltaTime);
	player.update(input.keys, deltaTime);
	displayText("Score: " + score);
	if (!gameOver) requestAnimationFrame(gameLoop);
	if (gameOver) {
		afterGame();
	}
}

requestAnimationFrame(gameLoop);