# AR Portfolio Experience 🌐

An immersive Augmented Reality experience showcasing projects, skills, and interactive demonstrations using cutting-edge web technologies.

## Features ✨

### 🎭 3D Hologram Avatar
- Wireframe 3D character that introduces you
- Animated with floating motion effects
- Interactive hover states
- Holographic scanning effects

### 👆 Gesture-Controlled Navigation
- Drag to rotate the scene
- Pinch/scroll to zoom
- Tap on objects to interact
- Intuitive mobile-first controls

### 💻 Floating Code Snippets
- Animated code samples orbiting in 3D space
- Multiple programming languages
- Glowing effects and smooth animations
- Interactive on hover

### 🏗️ Interactive 3D Architecture
- Multi-layered system architecture visualization
- Frontend, API, Backend, and Database layers
- Rotating 3D model with hover interactions
- Educational and visually engaging

### 🐛 Bug Catcher Mini Game
- Test your debugging skills
- Catch different types of bugs (Syntax, Logic, Runtime, Performance)
- Time-based challenge with scoring system
- Different point values for different bug types
- Leaderboard-ready

### 📱 Mobile Ready
- Fully responsive design
- Touch-optimized controls
- WebXR support detection
- Fallback mode for unsupported devices
- No app installation required

## Tech Stack 🛠️

- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **AR.js** - Marker-based AR tracking
- **WebXR API** - Web-based AR/VR capabilities
- **QRCode.js** - QR code generation
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety

## How It Works 🔧

### QR Code Flow
1. QR code is generated with the AR experience URL
2. Users scan the QR code with their smartphone
3. Opens directly in the browser (no app needed)
4. WebXR/AR.js initializes the AR experience
5. 3D content overlays on the camera view

### Scene Architecture
```
ARScene
├── 3D Hologram Avatar (animated wireframe)
├── Floating Code Snippets (orbiting)
├── Architecture Diagrams (rotating layers)
├── Project Panels (interactive cards)
└── Environment (lighting, grid, effects)
```

### Game Mechanics
- **Spawn System**: 15 initial bugs, new ones spawn when caught
- **Bug Types**: 4 types with different point values
- **Timer**: 60-second countdown
- **Scoring**: Points based on bug type difficulty
- **Physics**: Bugs move with velocity and boundary collision

## Browser Support 🌍

### Full AR Support
- Chrome/Edge (Android)
- Safari (iOS 13+)

### Fallback 3D View
- All modern browsers
- Desktop and mobile
- Mouse/touch controls

## Performance Optimizations ⚡

- Dynamic imports to reduce initial bundle size
- Suspense boundaries for loading states
- Efficient render loops with useFrame
- Object pooling for game entities
- CSS animations offloaded to GPU
- Responsive asset loading

## Usage 📖

### Basic Navigation
```tsx
// Navigate to AR Experience
/ar-experience

// Direct AR mode
/ar-experience?mode=ar

// Launch game directly
Click "Play Bug Catcher Game" button
```

### Integration
```tsx
import ARScene from '@/app/components/ARScene';
import BugCatcherGame from '@/app/components/BugCatcherGame';

// Use in your component
<ARScene />
<BugCatcherGame onExit={() => handleExit()} />
```

## Customization 🎨

### Adding New Projects
Edit `ARScene.tsx` and update the `projects` array:

```tsx
const projects = [
  {
    title: 'Your Project',
    description: 'Project description',
    tech: ['React', 'Node.js', 'MongoDB'],
  },
  // ... more projects
];
```

### Adjusting Game Difficulty
Edit `BugCatcherGame.tsx`:

```tsx
// Change initial bug count
spawnBugs(20); // default: 15

// Adjust time limit
setTimeLeft(90); // default: 60

// Modify bug speeds
velocity: new THREE.Vector3(
  (Math.random() - 0.5) * 0.2, // increase for faster
  (Math.random() - 0.5) * 0.2,
  (Math.random() - 0.5) * 0.2
)
```

### Styling
Customize colors in CSS files:
- `ar-experience.css` - Main page styles
- `ar-scene.css` - 3D scene UI elements
- `bug-catcher.css` - Game interface

## Future Enhancements 🚀

- [ ] AR marker-based object placement
- [ ] Multi-player bug catching
- [ ] Voice commands
- [ ] Hand tracking gestures
- [ ] AR filters and effects
- [ ] Social media sharing
- [ ] Achievement system
- [ ] Persistent leaderboards

## Troubleshooting 🔍

### Camera not working
- Check browser permissions
- Ensure HTTPS connection (required for camera access)
- Try different browsers

### 3D not rendering
- Update graphics drivers
- Enable hardware acceleration in browser
- Check WebGL support: `https://get.webgl.org/`

### Performance issues
- Close other browser tabs
- Reduce graphics quality settings
- Use a more powerful device

## Credits 💝

Built with ❤️ using free and open-source technologies:
- Three.js community
- React Three Fiber team
- AR.js contributors
- Open source community

## License 📄

Free to use and modify for personal portfolios.

---

**Note**: This AR experience works on any modern smartphone without requiring app installation. Simply scan the QR code and start exploring!

