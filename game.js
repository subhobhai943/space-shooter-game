// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 ('ontouchstart' in window) || 
                 (navigator.maxTouchPoints > 0);

// Console-optimized canvas size (4:3 aspect ratio)
canvas.width = 480;
canvas.height = 360;

// Sound effects
const sounds = {
    shoot: new Audio('assets/sounds/shoot.mp3'),
    explosion: new Audio('assets/sounds/explosion.mp3'),
    powerup: new Audio('assets/sounds/powerup.mp3'),
    bossMusic: new Audio('assets/sounds/boss-music.mp3')
};

// Set sound volumes
sounds.shoot.volume = 0.3;
sounds.explosion.volume = 0.4;
sounds.powerup.volume = 0.5;
sounds.bossMusic.volume = 0.3;
sounds.bossMusic.loop = true;

// Sound toggle
let soundEnabled = true;
let soundInitialized = false;
const soundBtn = document.getElementById('sound-btn');

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundBtn.classList.toggle('muted');
    
    if (!soundEnabled && sounds.bossMusic) {
        sounds.bossMusic.pause();
    } else if (soundEnabled && boss && sounds.bossMusic) {
        sounds.bossMusic.play().catch(e => console.log('Boss music play failed:', e));
    }
});

function initSound() {
    if (!soundInitialized) {
        // Initialize audio context on user interaction
        Object.values(sounds).forEach(sound => {
            sound.play().then(() => {
                sound.pause();
                sound.currentTime = 0;
            }).catch(e => console.log('Sound init:', e));
        });
        soundInitialized = true;
    }
}

function playSound(sound) {
    if (soundEnabled && soundInitialized && sounds[sound]) {
        sounds[sound].currentTime = 0;
        sounds[sound].play().catch(e => console.log('Audio play failed:', e));
    }
}

function playBossMusic() {
    if (soundEnabled && soundInitialized && sounds.bossMusic) {
        sounds.bossMusic.currentTime = 0;
        sounds.bossMusic.play().catch(e => console.log('Boss music play failed:', e));
    }
}

function stopBossMusic() {
    if (sounds.bossMusic) {
        sounds.bossMusic.pause();
        sounds.bossMusic.currentTime = 0;
    }
}

// Image assets
const images = {
    player: new Image(),
    enemyBasic: new Image(),
    enemyShooter: new Image(),
    boss: new Image(),
    bulletPlayer: new Image(),
    bulletEnemy: new Image(),
    bulletBoss: new Image(),
    powerupHealth: new Image(),
    powerupRapid: new Image(),
    powerupShield: new Image()
};

images.player.src = 'assets/images/player.png';
images.enemyBasic.src = 'assets/images/enemy-basic.png';
images.enemyShooter.src = 'assets/images/enemy-shooter.png';
images.boss.src = 'assets/images/boss.png';
images.bulletPlayer.src = 'assets/images/bullet-player.png';
images.bulletEnemy.src = 'assets/images/bullet-enemy.png';
images.bulletBoss.src = 'assets/images/bullet-boss.png';
images.powerupHealth.src = 'assets/images/powerup-health.png';
images.powerupRapid.src = 'assets/images/powerup-rapid.png';
images.powerupShield.src = 'assets/images/powerup-shield.png';

// Track loaded images
let imagesLoaded = 0;
let totalImages = Object.keys(images).length;
let assetsReady = false;

// Image loading handler
Object.values(images).forEach((img) => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            assetsReady = true;
        }
    };
    img.onerror = () => {
        console.warn('Failed to load image:', img.src);
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            assetsReady = true;
        }
    };
});

// Game state
let gameRunning = false;
let score = 0;
let keys = {};
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let mouseDown = false;

// Mobile controls state
let dpadPressed = { up: false, down: false, left: false, right: false };
let firePressed = false;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    radius: 15,
    health: 100,
    maxHealth: 100,
    angle: 0,
    speed: 4,
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
    BASIC: { health: 3, color: '#4a90e2', speed: 1.5, fireRate: 0, points: 10, image: 'enemyBasic', width: 28, height: 28 },
    SHOOTER: { health: 5, color: '#e24a4a', speed: 1.2, fireRate: 2000, points: 25, image: 'enemyShooter', width: 28, height: 28 },
    BOSS: { health: 50, color: '#9b4ae2', speed: 0.8, fireRate: 1500, points: 200, image: 'boss', width: 60, height: 60 }
};

// Power-up types
const POWERUP_TYPES = {
    HEALTH: { color: '#4CAF50', size: 20, image: 'powerupHealth' },
    RAPID_FIRE: { color: '#FF9800', size: 20, image: 'powerupRapid' },
    SHIELD: { color: '#2196F3', size: 20, image: 'powerupShield' }
};

// Spawn timers
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;

// Initialize HUD
document.getElementById('health').textContent = player.health;
document.getElementById('score').textContent = score;

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
    initSound();
    document.getElementById('start-screen').style.display = 'none';
    startGame();
});

// Setup controls
if (isMobile) {
    document.getElementById('mobile-controls').style.display = 'flex';
    document.getElementById('desktop-instructions').style.display = 'none';
    setupMobileControls();
} else {
    // Desktop event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ' && !gameRunning && assetsReady) {
            if (document.getElementById('start-screen').style.display !== 'none') {
                initSound();
                document.getElementById('start-screen').style.display = 'none';
                startGame();
            } else {
                restartGame();
            }
        }
    });
    document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    canvas.addEventListener('mousedown', () => mouseDown = true);
    canvas.addEventListener('mouseup', () => mouseDown = false);
}

document.getElementById('restart-btn').addEventListener('click', restartGame);

// Mobile controls setup
function setupMobileControls() {
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnFire = document.getElementById('btn-fire');
    
    function setDpad(direction, value) {
        return (e) => {
            e.preventDefault();
            dpadPressed[direction] = value;
        };
    }
    
    btnUp.addEventListener('touchstart', setDpad('up', true), { passive: false });
    btnUp.addEventListener('touchend', setDpad('up', false), { passive: false });
    
    btnDown.addEventListener('touchstart', setDpad('down', true), { passive: false });
    btnDown.addEventListener('touchend', setDpad('down', false), { passive: false });
    
    btnLeft.addEventListener('touchstart', setDpad('left', true), { passive: false });
    btnLeft.addEventListener('touchend', setDpad('left', false), { passive: false });
    
    btnRight.addEventListener('touchstart', setDpad('right', true), { passive: false });
    btnRight.addEventListener('touchend', setDpad('right', false), { passive: false });
    
    btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        firePressed = true;
    }, { passive: false });
    
    btnFire.addEventListener('touchend', (e) => {
        e.preventDefault();
        firePressed = false;
    }, { passive: false });
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
    constructor(x, y, angle, speed = 10, damage = 1, isEnemy = false, isBoss = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.width = isBoss ? 12 : (isEnemy ? 10 : 8);
        this.height = isBoss ? 12 : (isEnemy ? 10 : 8);
        this.radius = this.width / 2;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.isBoss = isBoss;
        this.image = isBoss ? images.bulletBoss : (isEnemy ? images.bulletEnemy : images.bulletPlayer);
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }
    }

    isOffScreen() {
        return this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50;
    }
}

// Enemy class
class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = type.width;
        this.height = type.height;
        this.radius = type.width / 2;
        this.health = type.health;
        this.maxHealth = type.health;
        this.speed = type.speed;
        this.angle = 0;
        this.lastShot = 0;
        this.fireRate = type.fireRate;
        this.color = type.color;
        this.points = type.points;
        this.image = images[type.image];
    }

    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        this.angle = Math.atan2(dy, dx);
        
        const dist = distance(this.x, this.y, player.x, player.y);
        const stopDistance = this.type === ENEMY_TYPES.BOSS ? 150 : 80;
        
        if (dist > stopDistance) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }

        if (this.fireRate > 0 && Date.now() - this.lastShot > this.fireRate) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }

    shoot() {
        if (this.type === ENEMY_TYPES.BOSS) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                enemyBullets.push(new Bullet(this.x, this.y, angle, 5, 25, true, true));
            }
        } else {
            enemyBullets.push(new Bullet(this.x, this.y, this.angle, 6, 10, true, false));
        }
    }

    draw() {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle + Math.PI / 2);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        }

        const barWidth = this.width;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 8, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.height / 2 - 8, barWidth * healthPercent, barHeight);
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
        this.image = images[type.image];
        this.rotation = 0;
    }

    update() {
        this.y += this.speed;
        this.rotation += 0.05;
    }

    draw() {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    isOffScreen() {
        return this.y > canvas.height + 50;
    }
}

// Particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = randomRange(-2, 2);
        this.vy = randomRange(-2, 2);
        this.radius = randomRange(1, 3);
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

function createExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch(side) {
        case 0: x = randomRange(0, canvas.width); y = -30; break;
        case 1: x = canvas.width + 30; y = randomRange(0, canvas.height); break;
        case 2: x = randomRange(0, canvas.width); y = canvas.height + 30; break;
        case 3: x = -30; y = randomRange(0, canvas.height); break;
    }

    const enemyType = Math.random() < 0.3 ? ENEMY_TYPES.SHOOTER : ENEMY_TYPES.BASIC;
    enemies.push(new Enemy(enemyType, x, y));
}

function spawnBoss() {
    boss = new Enemy(ENEMY_TYPES.BOSS, canvas.width / 2, -60);
    enemies.push(boss);
    bossSpawned = true;
    playBossMusic();
}

function spawnPowerUp(x = null, y = null) {
    const types = [POWERUP_TYPES.HEALTH, POWERUP_TYPES.RAPID_FIRE, POWERUP_TYPES.SHIELD];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (x === null) {
        x = randomRange(40, canvas.width - 40);
        y = -15;
    }
    
    powerUps.push(new PowerUp(type, x, y));
}

function updatePlayer() {
    if (isMobile) {
        if (dpadPressed.up) player.y -= player.speed;
        if (dpadPressed.down) player.y += player.speed;
        if (dpadPressed.left) player.x -= player.speed;
        if (dpadPressed.right) player.x += player.speed;
        
        if (enemies.length > 0) {
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
        if (keys['w']) player.y -= player.speed;
        if (keys['s']) player.y += player.speed;
        if (keys['a']) player.x -= player.speed;
        if (keys['d']) player.x += player.speed;
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    const shouldShoot = isMobile ? firePressed : mouseDown;
    const currentFireRate = player.rapidFire ? player.fireRate / 2 : player.fireRate;
    
    if (shouldShoot && Date.now() - player.lastShot > currentFireRate) {
        // Calculate bullet spawn position at the tip of the ship
        const tipOffset = 18; // Distance from center to ship tip
        const bulletX = player.x + Math.cos(player.angle) * tipOffset;
        const bulletY = player.y + Math.sin(player.angle) * tipOffset;
        
        bullets.push(new Bullet(bulletX, bulletY, player.angle, 10, 1, false, false));
        playSound('shoot');
        player.lastShot = Date.now();
    }

    if (player.rapidFire && Date.now() - player.rapidFireTime > 10000) {
        player.rapidFire = false;
        document.getElementById('rapid-fire-indicator').style.display = 'none';
    }
    
    if (player.shielded && Date.now() - player.shieldTime > 40000) {
        player.shielded = false;
        document.getElementById('shield-indicator').style.display = 'none';
    }
}

function drawPlayer() {
    if (player.shielded) {
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    if (images.player.complete && images.player.naturalHeight !== 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle + Math.PI / 2);
        ctx.drawImage(images.player, -player.width / 2, -player.height / 2, player.width, player.height);
        ctx.restore();
    }
}

function drawStarsBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 123.456) % canvas.width;
        const y = (i * 789.012) % canvas.height;
        const size = (i % 3) * 0.4 + 0.4;
        ctx.globalAlpha = 0.3 + (i % 10) * 0.06;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
}

function drawBackground() {
    drawStarsBackground();
}

function gameLoop() {
    if (!gameRunning) return;

    drawBackground();
    updatePlayer();
    drawPlayer();

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.isOffScreen()) bullets.splice(index, 1);
    });

    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        
        if (bullet.isOffScreen()) {
            enemyBullets.splice(index, 1);
            return;
        }

        if (distance(bullet.x, bullet.y, player.x, player.y) < player.radius + bullet.radius) {
            if (!player.shielded) {
                player.health -= bullet.damage;
                updateHUD();
                if (player.health <= 0) gameOver();
            }
            enemyBullets.splice(index, 1);
        }
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.update();
        enemy.draw();

        bullets.forEach((bullet, bIndex) => {
            if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.radius + bullet.radius) {
                if (enemy.hit(bullet.damage)) {
                    createExplosion(enemy.x, enemy.y, enemy.color, 20);
                    playSound('explosion');
                    score += enemy.points;
                    updateHUD();
                    
                    if (Math.random() < 0.3) spawnPowerUp(enemy.x, enemy.y);
                    
                    enemies.splice(eIndex, 1);
                    if (enemy === boss) {
                        boss = null;
                        bossSpawned = false;
                        stopBossMusic();
                    }
                }
                bullets.splice(bIndex, 1);
            }
        });

        if (distance(enemy.x, enemy.y, player.x, player.y) < enemy.radius + player.radius) {
            if (!player.shielded) {
                player.health -= 20;
                updateHUD();
                if (player.health <= 0) gameOver();
            }
            createExplosion(enemy.x, enemy.y, enemy.color);
            enemies.splice(eIndex, 1);
            if (enemy === boss) {
                boss = null;
                bossSpawned = false;
                stopBossMusic();
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        powerUp.update();
        powerUp.draw();
        
        if (powerUp.isOffScreen()) {
            powerUps.splice(index, 1);
            return;
        }

        if (distance(powerUp.x, powerUp.y, player.x, player.y) < player.radius + powerUp.size / 2) {
            playSound('powerup');
            
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

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.isDead()) particles.splice(index, 1);
    });

    enemySpawnTimer++;
    if (enemySpawnTimer > 50) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    if (score >= 500 && !bossSpawned && !boss) spawnBoss();

    powerUpSpawnTimer++;
    if (powerUpSpawnTimer > 250) {
        if (Math.random() < 0.5) spawnPowerUp();
        powerUpSpawnTimer = 0;
    }

    requestAnimationFrame(gameLoop);
}

function updateHUD() {
    document.getElementById('health').textContent = Math.max(0, player.health);
    document.getElementById('score').textContent = score;
}

function gameOver() {
    gameRunning = false;
    stopBossMusic();
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';
}

function restartGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 100;
    player.shielded = false;
    player.rapidFire = false;
    
    bullets.length = 0;
    enemies.length = 0;
    enemyBullets.length = 0;
    powerUps.length = 0;
    particles.length = 0;
    
    score = 0;
    boss = null;
    bossSpawned = false;
    stopBossMusic();
    gameRunning = true;
    
    updateHUD();
    document.getElementById('rapid-fire-indicator').style.display = 'none';
    document.getElementById('shield-indicator').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    
    gameLoop();
}

function startGame() {
    if (!gameRunning && assetsReady) {
        gameRunning = true;
        gameLoop();
    }
}

// Show loading until assets ready (max 3s)
let loadingCount = 0;
const loadingInterval = setInterval(() => {
    if (assetsReady || loadingCount > 30) {
        clearInterval(loadingInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        assetsReady = true;
    } else {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('LOADING...', canvas.width / 2, canvas.height / 2);
        loadingCount++;
    }
}, 100);
