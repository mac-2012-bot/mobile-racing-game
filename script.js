// Mobile Racing Game Logic
let carX = 50;
let carSpeed = 0;
const carWidth = 60;
const carHeight = 60;

let lives = 3;
let score = 0;
let gameActive = true;
let obstacles = [];
let gameLoop;

// DOM elements
const car = document.getElementById('car');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    // Horizontal movement
    const deltaX = touchX - touchStartX;
    carSpeed = deltaX * 0.2;
    
    // Update car position
    carX += carSpeed;
    
    // Boundary check
    const maxX = window.innerWidth - carWidth;
    if (carX < 0) carX = 0;
    if (carX > maxX) carX = maxX;
    
    car.style.left = carX + 'px';
    car.style.transform = `translateX(-50%)`;
    
    touchStartX = touchX;
}, { passive: false });

document.addEventListener('touchend', () => {
    carSpeed = 0;
});

// Create obstacles
function createObstacle() {
    if (!gameActive) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    const lane = Math.floor(Math.random() * 3);
    let leftPos;
    
    switch(lane) {
        case 0: leftPos = 20; break;
        case 1: leftPos = window.innerWidth / 2 - 30; break;
        case 2: leftPos = window.innerWidth - 80; break;
    }
    
    obstacle.style.left = leftPos + 'px';
    obstacle.style.top = '-60px';
    document.getElementById('game-container').appendChild(obstacle);
    
    obstacles.push({
        element: obstacle,
        x: leftPos,
        y: -60,
        speed: 5 + Math.random() * 3
    });
}

// Game loop
function gameUpdate() {
    if (!gameActive) return;
    
    // Update score
    score++;
    scoreElement.textContent = score;
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += obs.speed;
        obs.element.style.top = obs.y + 'px';
        
        // Check collision
        if (checkCollision(carX, window.innerHeight - carHeight, 
                         obs.x, obs.y, carWidth, carHeight, 60)) {
            hitObstacle();
        }
        
        // Remove if out of screen
        if (obs.y > window.innerHeight) {
            obs.element.remove();
            obstacles.splice(i, 1);
        }
    }
    
    // Spawn new obstacles
    if (Math.random() < 0.02) {
        createObstacle();
    }
}

// Collision detection
function checkCollision(x1, y1, x2, y2, w1, h1, w2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h1 &&
           y1 + h1 > y2;
}

// Hit obstacle
function hitObstacle() {
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
        gameOver();
    }
}

// Update lives display
function updateLivesDisplay() {
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '❤️';
    }
    livesElement.textContent = livesText;
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = `Pontuação: ${score}`;
    gameOverElement.style.display = 'flex';
}

// Restart game
restartBtn.addEventListener('click', () => {
    // Clean up
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    
    // Reset game state
    carX = 50;
    car.style.left = '50%';
    car.style.transform = 'translateX(-50%)';
    lives = 3;
    score = 0;
    gameActive = true;
    
    // Update UI
    scoreElement.textContent = '0';
    updateLivesDisplay();
    gameOverElement.style.display = 'none';
    
    // Restart game loop
    gameLoop = setInterval(gameUpdate, 16);
});

// Start game
gameLoop = setInterval(gameUpdate, 16);

// Initial obstacle
setTimeout(createObstacle, 1000);
