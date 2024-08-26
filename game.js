const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 5,
    dx: 0,
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

const bullets = [];
const enemies = [];
const enemySpeed = 2;
const enemySpawnRate = 1000; // milliseconds
let lastEnemySpawn = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

function movePlayer() {
    player.x += player.dx;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function moveEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemySpeed;

        if (enemies[i].y + enemies[i].height > player.y &&
            enemies[i].x < player.x + player.width &&
            enemies[i].x + enemies[i].width > player.x) {
            endGame();
        }

        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            score -= 10; // Reduce score if an enemy reaches the bottom
        }
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 50; // Increase score for hitting an enemy
                break;
            }
        }
    }
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 50);
    enemies.push({ x, y: -50, width: 50, height: 30 });
}

function update() {
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    bullets.forEach(bullet => {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    enemies.forEach(enemy => {
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

function gameLoop(timestamp) {
    if (timestamp - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = timestamp;
    }

    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    gameOver = false;
    score = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height - 60;
    enemies.length = 0; // Clear enemies
    bullets.length = 0; // Clear bullets
    lastEnemySpawn = 0;
    gameLoop();
}

function endGame() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    startGame();
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') player.dx = -player.speed;
    if (e.key === 'ArrowRight') player.dx = player.speed;
    if (e.key === ' ' && !gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - 2.5,
            y: player.y,
            width: 5,
            height: 20,
            speed: 5
        });
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('instructions').style.display = 'block';
});
