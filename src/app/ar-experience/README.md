# AR Experience

The `/ar-experience` page has two parts: a 3D scene of me surrounded by my work, and Bug Catcher, a
short game. A QR code on the page opens the scene on a phone; it runs in any browser with WebGL and
needs no app or camera.

## The 3D scene

`src/app/components/ARScene.tsx`, styles in `src/app/components/ar-scene.css`.

- **Me, drawn and animated** (`src/app/components/ar/avatar.ts`). A flat illustration drawn from
  my photo (swept wavy hair, brown cat-eye sunglasses, a full beard, the grey-green plaid shirt with
  rolled sleeves, black jeans, a watch and the red thread at my neck, plus boots for Twisted X). It
  is drawn on a 2D canvas each frame and mapped into the scene, rigged at the neck, shoulders,
  elbows and wrists. I breathe and sway, look towards the pointer or the card under it, wave when
  the scene opens or when tapped, and turn to present each card as it comes to the front. I always
  face the viewer and stand on the platform with a soft shadow under my boots.
- **Ten cards in orbit** around my waist: my current role, a result from each job (Twisted X,
  JPMorgan Chase, Colombo AI, HCL) and four projects with their cover pictures. The ring passes in
  front low down and slips behind my back; cards further away shrink and dim.
- **Every card faces the viewer.** Cards are drawn into canvas textures and turned square to the
  camera every frame, so text is never mirrored or seen edge on. They redraw when the theme changes.
- **Moving it.** The ring rests on each card for a few seconds, then turns to the next. Drag or
  swipe sideways to spin it, flick it to let it coast, or tap a card to bring it to the front.
  Hovering a card stops the ring. The camera leans gently with the pointer. Tapping me
  brings my intro card to the front.
- **The card in front is spelled out** in the panel beside the scene (below it on phones), with its
  links and previous/next buttons.
- **Everything in the ring** lists all ten cards under the scene, with the project pictures; choosing
  one turns the ring to it. Between the panel and the list, everything reads and works from the
  keyboard, and without WebGL.
- **Calm by request.** A Pause button stops the ring, the dust and my idle motion (a tap still gets a
  wave); with reduced motion set, nothing moves on its own. Rendering stops while the scene is off screen or the tab is hidden.

### Changing the cards

Card content lives in the `CARDS` list at the top of `ARScene.tsx`. Project cards are built from
`src/app/resources/showcase.ts` by name with `projectCard('…')`; figure cards take a big number, a
line under it and a footer, plus the `detail` shown in the panel.

### Changing how I look

The colours are in the `C` table at the top of `avatar.ts`, and every shape is an SVG path string in
`buildPaths()`, drawn in a 400 × 1000 space centred on x = 200 (the canvas is wider so a wave fits).
Poses are angles for each joint; `ARM_L_WAVE` and `ARM_R_PRESENT` are the two gestures.

## Bug Catcher

`src/app/components/BugCatcherGame.tsx`. Catch as many bugs as you can in 60 seconds. Fifteen bugs
start on the board and a new one appears for each one caught. Bugs are worth different points:
syntax errors 10, logic bugs 15, runtime errors 20 and performance issues 25.

## Built with

Three.js and React Three Fiber for the scene, `qrcode` for the QR code, Next.js 14 and TypeScript.
