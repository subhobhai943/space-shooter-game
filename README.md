# Space Shooter Game

A web-based space shooter game built with HTML5 Canvas and JavaScript. Fight against waves of enemies, defeat the boss, and collect power-ups to survive!

**✨ Now with full mobile support! Play on Android, iOS, tablets, and desktop.**

## Features

### Player Mechanics
- **Movement**: WASD keys (desktop) or Virtual Joystick (mobile)
- **Shooting**: Mouse click (desktop) or Fire Button (mobile)
- **Health System**: 100 HP with visual health tracking
- **Auto-aim**: Smart targeting on mobile devices

### Enemy System
- **Basic Enemies** (Blue): Chase the player, 3 HP, worth 10 points
- **Shooter Enemies** (Red): Fire bullets at the player, 5 HP, worth 25 points
- **Boss Enemy** (Purple): Spawns at 500 points, fires in 8 directions, 50 HP, worth 200 points

### Power-Ups
- **Health** (Green): Restores 50 HP
- **Rapid Fire** (Orange): Doubles fire rate for 10 seconds
- **Shield** (Blue): Protects from all damage for 40 seconds (except boss damage)

### Game Mechanics
- Dynamic enemy spawning system
- Health bars for all enemies
- Particle explosion effects
- Score tracking
- Progressive difficulty
- Boss battle at 500 points
- **Responsive design** - adapts to screen size
- **Touch-optimized controls** for mobile

## Mobile & Desktop Support

### Desktop Controls
- **W/A/S/D** - Move in all directions
- **Mouse Movement** - Aim your ship
- **Mouse Click** - Fire bullets

### Mobile Controls (Auto-detected)
- **Virtual Joystick** (Bottom-left): Drag to move your ship
- **Fire Button** (Bottom-right): Tap and hold to auto-fire
- **Auto-aim**: Ship automatically targets nearest enemy
- **Responsive Canvas**: Adapts to your device screen

### Supported Devices
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ Android phones and tablets
- ✅ iPhone and iPad
- ✅ Touch-enabled laptops and hybrids

## How to Play

### Desktop
1. Open `index.html` in a web browser
2. Use **WASD** to move your spaceship
3. **Move your mouse** to aim
4. **Click** to shoot bullets
5. Destroy enemies to increase your score
6. Collect power-ups for advantages
7. Defeat the boss at 500 points!

### Mobile/Tablet
1. Open `index.html` in your mobile browser (Chrome, Safari)
2. Use the **virtual joystick** (bottom-left) to move
3. Tap the **fire button** (bottom-right) to shoot
4. Your ship auto-aims at the nearest enemy
5. Collect power-ups by moving over them
6. Survive and reach the boss battle!

## Game Tips

1. **Keep moving** to avoid enemy fire
2. **Focus on shooter enemies** first (red ships are more dangerous)
3. **Collect shield power-ups** before fighting the boss
4. **Use rapid fire** to quickly clear enemy waves
5. **Don't get cornered** - always maintain escape routes
6. **Mobile players**: Let the auto-aim help while you focus on dodging

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
- **Background**: 1200x800px (desktop), 800x600px (mobile)
- **Sound formats**: MP3 or OGG for browser compatibility

## Technical Details

### Mobile Optimization
- Automatic device detection
- Responsive canvas sizing
- Touch event handling with multi-touch support
- Virtual joystick with smooth analog control
- Optimized rendering for mobile GPUs
- Prevented zoom and scroll on touch devices
- Auto-aim assistance for touch controls

### Performance
- Vanilla JavaScript - no dependencies
- Hardware-accelerated Canvas rendering
- Efficient particle system
- Optimized collision detection
- 60 FPS target on all devices

## Development

The game is built with vanilla JavaScript and HTML5 Canvas API. No external libraries required!

### File Structure

- `index.html` - Main HTML file with canvas setup and mobile controls
- `game.js` - Core game logic with mobile/desktop detection
- `style.css` - Responsive styling and touch control UI
- `assets/` - Directory for custom sprites and sounds

### Key Features in Code

```javascript
// Automatic mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Touch controls setup
setupMobileControls(); // Virtual joystick + fire button

// Auto-aim for mobile
if (isMobile) {
    // Automatically aim at nearest enemy
}
```

## Browser Compatibility

- Chrome 90+ (Desktop & Mobile)
- Firefox 88+ (Desktop & Mobile)
- Safari 14+ (Desktop & Mobile)
- Edge 90+
- Samsung Internet 14+
- Opera 76+

## Installation & Deployment

### Local Testing
1. Clone the repository
2. Open `index.html` directly in your browser
3. No build process or server required!

### Mobile Testing
1. Host the files on any web server (GitHub Pages, Netlify, etc.)
2. Access the URL on your mobile device
3. For best experience, add to home screen

### GitHub Pages Deployment
1. Go to repository Settings
2. Navigate to Pages section
3. Select `main` branch as source
4. Your game will be live at `https://yourusername.github.io/space-shooter-game`

## Future Enhancements

- [x] Mobile touch controls
- [x] Responsive design
- [x] Auto-aim for mobile
- [ ] Add custom sprite graphics
- [ ] Implement sound effects and music
- [ ] Add more enemy types
- [ ] Create multiple levels
- [ ] Add high score system with local storage
- [ ] Implement weapon upgrades
- [ ] Add particle trails for bullets
- [ ] Leaderboard system
- [ ] Power-up variety expansion

## Troubleshooting

### Mobile Issues
- **Controls not appearing**: Refresh the page
- **Laggy performance**: Close other browser tabs
- **Screen too small**: Rotate to landscape mode
- **Touch not working**: Ensure browser supports touch events

### Desktop Issues
- **Mouse cursor visible**: Game should hide it automatically
- **Low FPS**: Close resource-heavy applications
- **Controls not responding**: Click on the canvas to focus

## License

Free to use and modify for personal and commercial projects.

## Credits

Inspired by classic space shooter games and the Python Arcade tutorial by Nitrex Boy.

---

**Made with ❤️ for both desktop and mobile gamers!**