Asteroids clone built with HTML5, Canvas, and TypeScript

Based off of [https://github.com/dmcinnes/HTML5-Asteroids](https://github.com/dmcinnes/HTML5-Asteroids) by Doug McInnes

## How to use...
1. HTML: Create a `<canvas>` element and a `<div>` (or something similar) element containing the `<canvas>`
1. JS: Initalize the game with `initGame` function — Imported from `./GameApp/AsteroidsApp`
1. JS: Run the game with `runGame(canvasEl, containerEl)` with `canvasEl`  being the `<canvas>` element/ref and `containerEl` being the `<div>` element/ref — Imported from `./GameApp/AsteroidsApp`
1. JS: Create key bindings for `keyup` and `keydown` to `gameKeyUp` and `gameKeyDown` functions — Imported from `./GameApp/AsteroidsKeyBindings`
1. JS: If you want to kill the game, run `killGame` function  — Imported from `./GameApp/AsteroidsApp`

## Attempted improvements
- TypeScript
- Browser-based DPI rendering 
- Cleaned up Class patterns


## Customization
- You can define the `width` and `height` in the `<canvas>` element that the game will be rendered in.
- Color scheme is in `colors.ts` (If you want the retro look, have everything set to `#FFFFFF` and the `background` to `#161616`)

## Key bindings
- `←` - Turn counter-clockwise
- `→` - Turn clockwise
- `↑` - Accelerate
- `Spacebar` - Fire missile
- `p` - Pause
- `g` - Show collision grid