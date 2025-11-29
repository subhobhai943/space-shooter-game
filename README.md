# Space Shooter Game

A web-based space shooter game built with HTML5 Canvas and JavaScript. Fight against waves of enemies, defeat the boss, and collect power-ups to survive!

## Features

### Player Mechanics
- **Movement**: WASD keys to move in all directions
- **Shooting**: Aim with mouse, click to shoot
- **Health System**: 100 HP with visual health tracking

### Enemy System
- **Basic Enemies** (Blue): Chase the player, 3 HP, worth 10 points
- **Shooter Enemies** (Red): Fire bullets at the player, 5 HP, worth 25 points
- **Boss Enemy** (Purple): Spawns at 500 points, fires in 8 directions, 50 HP, worth 200 points

### Power-Ups
- **Health** (Green): Restores 50 HP
- **Rapid Fire** (Orange): Doubles fire rate for 10 seconds
- **Shield** (Blue): Protects from all damage for 40 seconds (except boss one-shot)

### Game Mechanics
- Dynamic enemy spawning system
- Health bars for all enemies
- Particle explosion effects
- Score tracking
- Progressive difficulty
- Boss battle at 500 points

## Assets Directory Structure

The `assets/` directory is prepared for custom game assets:

```
assets/
├── images/
│   ├── player.png          (Player spaceship sprite)
│   ├── enemy-basic.png     (Basic enemy sprite)
│   ├── enemy-shooter.png   (Shooter enemy sprite)
│   ├── boss.png            (Boss sprite)
│   ├── bullet-player.png   (Player bullet sprite)
│   ├── bullet-enemy.png    (Enemy bullet sprite)
│   ├── bullet-boss.png     (Boss bullet sprite)
│   ├── powerup-health.png  (Health power-up sprite)
│   ├── powerup-rapid.png   (Rapid fire power-up sprite)
│   ├── powerup-shield.png  (Shield power-up sprite)
│   └── background.png      (Space background)
└── sounds/
    ├── shoot.mp3           (Shooting sound effect)
    ├── explosion.mp3       (Enemy explosion sound)
    ├── powerup.mp3         (Power-up collection sound)
    └── boss-music.mp3      (Boss battle music)
```

## How to Play

1. Open `index.html` in a web browser
2. Use **WASD** to move your spaceship
3. **Move your mouse** to aim
4. **Click** to shoot bullets
5. Destroy enemies to increase your score
6. Collect power-ups for advantages
7. Defeat the boss at 500 points!

## Controls

- **W** - Move Up
- **A** - Move Left
- **S** - Move Down
- **D** - Move Right
- **Mouse** - Aim
- **Click** - Shoot

## Game Tips

1. Keep moving to avoid enemy fire
2. Focus on shooter enemies first as they're more dangerous
3. Collect shield power-ups before fighting the boss
4. Use rapid fire to quickly clear enemy waves
5. Don't let enemies corner you

## Customization

### Adding Custom Assets

1. Create your sprite images and place them in `assets/images/`
2. Create sound effects and place them in `assets/sounds/`
3. Update the game code to load and use these assets instead of programmatic shapes

### Asset Specifications

- **Player sprite**: 30x30px, transparent background
- **Enemy sprites**: 24x24px (basic/shooter), 60x60px (boss)
- **Bullet sprites**: 8x8px
- **Power-up sprites**: 20x20px
- **Background**: 1200x800px
- **Sound formats**: MP3 or OGG for browser compatibility

## Development

The game is built with vanilla JavaScript and HTML5 Canvas API. No external libraries required!

### File Structure

- `index.html` - Main HTML file with canvas setup
- `game.js` - Core game logic and mechanics
- `style.css` - Styling and layout
- `assets/` - Directory for custom sprites and sounds

## Future Enhancements

- [ ] Add custom sprite graphics
- [ ] Implement sound effects and music
- [ ] Add more enemy types
- [ ] Create multiple levels
- [ ] Add high score system with local storage
- [ ] Implement weapon upgrades
- [ ] Add particle trails for bullets
- [ ] Create mobile touch controls

## License

Free to use and modify for personal and commercial projects.

## Credits

Inspired by classic space shooter games and the Python Arcade tutorial by Nitrex Boy.
