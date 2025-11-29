// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 ('ontouchstart' in window) || 
                 (navigator.maxTouchPoints > 0);

// Set canvas size based on device
if (isMobile) {
    canvas.width = Math.min(window.innerWidth, 800);
    canvas.height = Math.min(window.innerHeight, 600);
} else {
    canvas.width = 1200;
    canvas.height = 800;
}

// Game state
let gameRunning = true;
let score = 0;
let keys = {};
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let mouseDown = false;

// Mobile controls state
let joystickActive = false;
let joystickDelta = { x: 0, y: 0 };
let fireButtonPressed = false;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    health: 100,
    maxHealth: 100,
    angle: 0,
    speed: isMobile ? 4 : 5,
    fireRate: 250,
    lastShot: 0,
    shielded: false,
    shieldTime: 0,
    rapidFire: false,
    rapidFireTime: 0
};

// Arrays
const bullets = [];
const enemies = [];
const enemyBullets = [];
const powerUps = [];
const particles = [];
let boss = null;
let bossSpawned = false;

// Enemy types
const ENEMY_TYPES = {
    BASIC: { health: 3, color: '#4a90e2', speed: 2, fireRate: 0, points: 10 },
    SHOOTER: { health: 5, color: '#e24a4a', speed: 1.5, fireRate: 2000, points: 25 },
    BOSS: { health: 50, color: '#9b4ae2', speed: 1, fireRate: 1500, points: 200 }
};

// Power-up types
const POWERUP_TYPES = {
    HEALTH: { color: '#4CAF50', size: 10 },
    RAPID_FIRE: { color: '#FF9800', size: 10 },
    SHIELD: { color: '#2196F3', size: 10 }
};

// Spawn timers
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;

// Setup mobile controls if on mobile
if (isMobile) {
    document.getElementById('mobile-controls').style.display = 'block';
    document.getElementById('desktop-controls').style.display = 'none';
    document.getElementById('mobile-controls-text').style.display = 'block';
    canvas.style.cursor = 'default';
    setupMobileControls();
} else {
    // Desktop event listeners
    document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', () => mouseDown = true);
    canvas.addEventListener('mouseup', () => mouseDown = false);
}

document.getElementById('restart-btn').addEventListener('click', restartGame);

// Mobile controls setup
function setupMobileControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    const fireButton = document.getElementById('fire-button');
    
    let joystickTouchId = null;
    const maxDistance = 35;
    
    // Joystick touch handlers
    joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joystickTouchId === null && e.touches.length > 0) {
            joystickTouchId = e.touches[0].identifier;
            joystickActive = true;
            handleJoystickMove(e.touches[0]);
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (joystickTouchId !== null) {
            for (let touch of e.touches) {
                if (touch.identifier === joystickTouchId) {
                    e.preventDefault();
                    handleJoystickMove(touch);
                    break;
                }
            }
        }
    });
    
    document.addEventListener('touchend', (e) => {
        for (let touch of e.changedTouches) {
            if (touch.identifier === joystickTouchId) {
                joystickTouchId = null;
                joystickActive = false;
                joystickDelta = { x: 0, y: 0 };
                joystickStick.style.transform = 'translate(0px, 0px)';
                break;
            }
        }
    });
    
    function handleJoystickMove(touch) {
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let deltaX = touch.clientX - centerX;
        let deltaY = touch.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxDistance;
            deltaY = Math.sin(angle) * maxDistance;
        }
        
        joystickStick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        joystickDelta = {
            x: deltaX / maxDistance,
            y: deltaY / maxDistance
        };
    }
    
    // Fire button handlers
    fireButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fireButtonPressed = true;
        fireButton.classList.add('firing');
    });
    
    fireButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        fireButtonPressed = false;
        fireButton.classList.remove('firing');
    });
    
    fireButton.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        fireButtonPressed = false;
        fireButton.classList.remove('firing');
    });
}

// Utility functions
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Bullet class
class Bullet {
    constructor(x, y, angle, speed = 10, damage = 1, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.radius = isEnemy ? 5 : 4;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.color = isEnemy ? '#ff4444' : '#ffff00';
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

// Enemy class
class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = type === ENEMY_TYPES.BOSS ? 30 : 12;
        this.health = type.health;
        this.maxHealth = type.health;
        this.speed = type.speed;
        this.angle = 0;
        this.lastShot = 0;
        this.fireRate = type.fireRate;
        this.color = type.color;
        this.points = type.points;
    }

    update() {
        // Chase player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.angle = Math.atan2(dy, dx);
        
        const dist = distance(this.x, this.y, player.x, player.y);
        const stopDistance = this.type === ENEMY_TYPES.BOSS ? 200 : 100;
        
        if (dist > stopDistance) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }

        // Shoot if capable
        if (this.fireRate > 0 && Date.now() - this.lastShot > this.fireRate) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }

    shoot() {
        if (this.type === ENEMY_TYPES.BOSS) {
            // Boss shoots in multiple directions
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                enemyBullets.push(new Bullet(this.x, this.y, angle, 6, 25, true));
            }
        } else {
            enemyBullets.push(new Bullet(this.x, this.y, this.angle, 7, 10, true));
        }
    }

    draw() {
        // Draw enemy ship
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius, this.radius * 0.6);
        ctx.lineTo(-this.radius * 0.6, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.6);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();

        // Draw health bar
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
    }

    hit(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
}

// PowerUp class
class PowerUp {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = type.size;
        this.color = type.color;
        this.speed = 2;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y > canvas.height + 20;
    }
}

// Particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = randomRange(-3, 3);
        this.vy = randomRange(-3, 3);
        this.radius = randomRange(2, 5);
        this.life = 1;
        this.decay = randomRange(0.01, 0.03);
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Create explosion particles
function createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Spawn enemy
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch(side) {
        case 0: // Top
            x = randomRange(0, canvas.width);
            y = -20;
            break;
        case 1: // Right
            x = canvas.width + 20;
            y = randomRange(0, canvas.height);
            break;
        case 2: // Bottom
            x = randomRange(0, canvas.width);
            y = canvas.height + 20;
            break;
        case 3: // Left
            x = -20;
            y = randomRange(0, canvas.height);
            break;
    }

    const enemyType = Math.random() < 0.3 ? ENEMY_TYPES.SHOOTER : ENEMY_TYPES.BASIC;
    enemies.push(new Enemy(enemyType, x, y));
}

// Spawn boss
function spawnBoss() {
    boss = new Enemy(ENEMY_TYPES.BOSS, canvas.width / 2, -50);
    enemies.push(boss);
    bossSpawned = true;
}

// Spawn power-up
function spawnPowerUp(x = null, y = null) {
    const types = [POWERUP_TYPES.HEALTH, POWERUP_TYPES.RAPID_FIRE, POWERUP_TYPES.SHIELD];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (x === null) {
        x = randomRange(50, canvas.width - 50);
        y = -20;
    }
    
    powerUps.push(new PowerUp(type, x, y));
}

// Update player
function updatePlayer() {
    // Movement - Desktop or Mobile
    if (isMobile && joystickActive) {
        // Mobile joystick control
        player.x += joystickDelta.x * player.speed;
        player.y += joystickDelta.y * player.speed;
        
        // Update aim direction based on movement or nearest enemy
        if (Math.abs(joystickDelta.x) > 0.1 || Math.abs(joystickDelta.y) > 0.1) {
            player.angle = Math.atan2(joystickDelta.y, joystickDelta.x);
        } else if (enemies.length > 0) {
            // Auto-aim at nearest enemy when not moving
            let nearestEnemy = enemies[0];
            let minDist = distance(player.x, player.y, nearestEnemy.x, nearestEnemy.y);
            
            for (let enemy of enemies) {
                const dist = distance(player.x, player.y, enemy.x, enemy.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = enemy;
                }
            }
            
            player.angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
        }
    } else {
        // Desktop keyboard control
        if (keys['w']) player.y -= player.speed;
        if (keys['s']) player.y += player.speed;
        if (keys['a']) player.x -= player.speed;
        if (keys['d']) player.x += player.speed;
        
        // Aim at mouse
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    }

    // Keep player in bounds
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // Shoot - Desktop click or Mobile fire button
    const shouldShoot = isMobile ? fireButtonPressed : mouseDown;
    const currentFireRate = player.rapidFire ? player.fireRate / 2 : player.fireRate;
    
    if (shouldShoot && Date.now() - player.lastShot > currentFireRate) {
        bullets.push(new Bullet(player.x, player.y, player.angle));
        player.lastShot = Date.now();
    }

    // Update power-up timers
    if (player.rapidFire && Date.now() - player.rapidFireTime > 10000) {
        player.rapidFire = false;
        document.getElementById('rapid-fire-indicator').style.display = 'none';
    }
    
    if (player.shielded && Date.now() - player.shieldTime > 40000) {
        player.shielded = false;
        document.getElementById('shield-indicator').style.display = 'none';
    }
}

// Draw player
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Shield effect
    if (player.shielded) {
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw ship
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius, player.radius * 0.7);
    ctx.lineTo(-player.radius * 0.6, 0);
    ctx.lineTo(-player.radius, -player.radius * 0.7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Draw stars background
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 123.456) % canvas.width;
        const y = (i * 789.012) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();

    // Update player
    updatePlayer();
    drawPlayer();

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        
        if (bullet.isOffScreen()) {
            bullets.splice(index, 1);
        }
    });

    // Update enemy bullets
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        
        if (bullet.isOffScreen()) {
            enemyBullets.splice(index, 1);
            return;
        }

        // Check collision with player
        if (distance(bullet.x, bullet.y, player.x, player.y) < player.radius + bullet.radius) {
            if (!player.shielded) {
                player.health -= bullet.damage;
                updateHUD();
                
                if (player.health <= 0) {
                    gameOver();
                }
            }
            enemyBullets.splice(index, 1);
        }
    });

    // Update enemies
    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        enemy.draw();

        // Check collision with bullets
        bullets.forEach((bullet, bIndex) => {
            if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.radius + bullet.radius) {
                if (enemy.hit(bullet.damage)) {
                    createExplosion(enemy.x, enemy.y, enemy.color, 30);
                    score += enemy.points;
                    updateHUD();
                    
                    // Chance to drop power-up
                    if (Math.random() < 0.3) {
                        spawnPowerUp(enemy.x, enemy.y);
                    }
                    
                    enemies.splice(eIndex, 1);
                    if (enemy === boss) {
                        boss = null;
                        bossSpawned = false;
                    }
                }
                bullets.splice(bIndex, 1);
            }
        });

        // Check collision with player
        if (distance(enemy.x, enemy.y, player.x, player.y) < enemy.radius + player.radius) {
            if (!player.shielded) {
                player.health -= 20;
                updateHUD();
                
                if (player.health <= 0) {
                    gameOver();
                }
            }
            createExplosion(enemy.x, enemy.y, enemy.color);
            enemies.splice(eIndex, 1);
            if (enemy === boss) {
                boss = null;
                bossSpawned = false;
            }
        }
    });

    // Update power-ups
    powerUps.forEach((powerUp, index) => {
        powerUp.update();
        powerUp.draw();
        
        if (powerUp.isOffScreen()) {
            powerUps.splice(index, 1);
            return;
        }

        // Check collision with player
        if (distance(powerUp.x, powerUp.y, player.x, player.y) < player.radius + powerUp.size) {
            if (powerUp.type === POWERUP_TYPES.HEALTH) {
                player.health = Math.min(player.maxHealth, player.health + 50);
            } else if (powerUp.type === POWERUP_TYPES.RAPID_FIRE) {
                player.rapidFire = true;
                player.rapidFireTime = Date.now();
                document.getElementById('rapid-fire-indicator').style.display = 'block';
            } else if (powerUp.type === POWERUP_TYPES.SHIELD) {
                player.shielded = true;
                player.shieldTime = Date.now();
                document.getElementById('shield-indicator').style.display = 'block';
            }
            updateHUD();
            powerUps.splice(index, 1);
        }
    });

    // Update particles
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        
        if (particle.isDead()) {
            particles.splice(index, 1);
        }
    });

    // Spawn enemies
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    // Spawn boss at score 500
    if (score >= 500 && !bossSpawned && !boss) {
        spawnBoss();
    }

    // Spawn power-ups
    powerUpSpawnTimer++;
    if (powerUpSpawnTimer > 300) {
        if (Math.random() < 0.5) {
            spawnPowerUp();
        }
        powerUpSpawnTimer = 0;
    }

    requestAnimationFrame(gameLoop);
}

// Update HUD
function updateHUD() {
    document.getElementById('health').textContent = Math.max(0, player.health);
    document.getElementById('score').textContent = score;
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

// Restart game
function restartGame() {
    // Reset player
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 100;
    player.shielded = false;
    player.rapidFire = false;
    
    // Clear arrays
    bullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    powerUps.length = 0;
    particles.length = 0;
    
    // Reset game state
    score = 0;
    boss = null;
    bossSpawned = false;
    gameRunning = true;
    
    // Update HUD
    updateHUD();
    document.getElementById('rapid-fire-indicator').style.display = 'none';
    document.getElementById('shield-indicator').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    
    gameLoop();
}

// Start game
updateHUD();
gameLoop();