// Mobile Racing Game Logic
let carX = 50;
let carSpeed = 0;
const carWidth = 80;
const carHeight = 40;

let lives = 3;
let score = 0;
let gameActive = true;
let obstacles = [];
let gameLoop;
let hitObstacles = new Set(); // Track which obstacles have been hit

// DOM elements
const car = document.getElementById('car');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Control bar system - barra em baixo para controlo horizontal
const controlBar = document.getElementById('control-bar');

// Keyboard controls for PC
let keyboardSpeed = 0;
const keyboardSpeedMultiplier = 8;

// Keyboard event listeners
window.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            keyboardSpeed = -keyboardSpeedMultiplier;
            e.preventDefault();
            break;
        case 'ArrowRight':
            keyboardSpeed = keyboardSpeedMultiplier;
            e.preventDefault();
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keyboardSpeed = 0;
    }
});

// Quando toca na barra, posiciona o carro diretamente nessa posição
controlBar.addEventListener('touchstart', (e) => {
    if (!gameActive) return;
    
    e.preventDefault();
    
    // Pega na posição do toque na barra
    const touchX = e.touches[0].clientX;
    const barRect = controlBar.getBoundingClientRect();
    
    // Calcula posição relativa na barra (0 a 1)
    const relativeX = (touchX - barRect.left) / barRect.width;
    
    // Converte para posição do carro no ecrã
    carX = relativeX * (window.innerWidth - carWidth - 40) + 20;
    
    // Boundary check
    const maxX = window.innerWidth - carWidth - 20;
    const minX = 20;
    
    if (carX < minX) carX = minX;
    if (carX > maxX) carX = maxX;
    
    // Atualiza posição do carro
    car.style.left = carX + 'px';
    car.style.transform = `translateX(-50%)`;
});

// Para movimento contínuo, usa mousemove/touchmove
controlBar.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    
    e.preventDefault();
    
    const touchX = e.touches[0].clientX;
    const barRect = controlBar.getBoundingClientRect();
    
    // Calcula posição relativa na barra (0 a 1)
    const relativeX = (touchX - barRect.left) / barRect.width;
    
    // Converte para posição do carro no ecrã
    carX = relativeX * (window.innerWidth - carWidth - 40) + 20;
    
    // Boundary check
    const maxX = window.innerWidth - carWidth - 20;
    const minX = 20;
    
    if (carX < minX) carX = minX;
    if (carX > maxX) carX = maxX;
    
    // Atualiza posição do carro
    car.style.left = carX + 'px';
    car.style.transform = `translateX(-50%)`;
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
    
    // Update car position with keyboard
    carX += keyboardSpeed;
    
    // Boundary check
    const maxX = window.innerWidth - carWidth - 20;
    const minX = 20;
    
    if (carX < minX) carX = minX;
    if (carX > maxX) carX = maxX;
    
    car.style.left = carX + 'px';
    car.style.transform = `translateX(-50%)`;
    
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

// Hit obstacle - perde apenas uma vida por colisão
function hitObstacle() {
    if (lives <= 0) return; // Não perde mais vidas se já perdeu todas
    
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
