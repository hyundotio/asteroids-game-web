import { Game } from "../GameLogic/AsteroidsGameLogic";
import { GridNode } from "../GameLogic/AsteroidsGrid";
import { ASTEROID_FONT } from "../GameAssets/AsteroidsFonts";
import { Missile } from "../GameObjects/AsteroidsMissile";
import { Ship } from "../GameObjects/AsteroidsShip";
import { AlienShip } from "../GameObjects/AsteroidsAlienShip";
import { COLORS } from "../GameConfig/colors";

export function killGame() {
    Game.state.isRunning = false;
}

export function initGame() {
    Game.state.isRunning = true;
    Game.innerState = 'reset';
    Game.execute();
}

export const runGame = function(canvas: HTMLCanvasElement, gameContainer: HTMLDivElement) {
    const canvasRect = canvas.getBoundingClientRect();
    
    Game.dpr = window.devicePixelRatio;
    Game.renderWidth = canvasRect.width;
    Game.renderHeight = canvasRect.height;
    Game.canvasWidth = Game.renderWidth * Game.dpr;
    Game.canvasHeight = Game.renderHeight * Game.dpr;
    Game.gridSize = (Game.canvasWidth > Game.canvasHeight ? Game.canvasWidth : Game.canvasHeight) / 12;
    
    const context = canvas.getContext("2d");
    if (context) context.scale(Game.dpr, Game.dpr);

    canvas.width = Game.canvasWidth;
    canvas.height = Game.canvasHeight;
    canvas.style.width = Game.renderWidth + "px";
    canvas.style.height = Game.renderHeight + "px";
    

    Game.context = context;
    Game.gameText.context = context;
    Game.gameText.face = ASTEROID_FONT;
    
    Game.gridWidth = Math.round(Game.canvasWidth / Game.gridSize);
    Game.gridHeight = Math.round(Game.canvasHeight / Game.gridSize);
    
    const grid = new Array(Game.gridWidth);
    for (let i = 0; i < Game.gridWidth; i++) {
        grid[i] = new Array(Game.gridHeight);
        for (let j = 0; j < Game.gridHeight; j++) {
            grid[i][j] = new GridNode();
        }
    }

    // set up the positional references
    for (let i = 0; i < Game.gridWidth; i++) {
        for (let j = 0; j < Game.gridHeight; j++) {
            const node = grid[i][j];
            node.north = grid[i][(j === 0) ? Game.gridHeight - 1 : j - 1];
            node.south = grid[i][(j === Game.gridHeight - 1) ? 0 : j + 1];
            node.west = grid[(i === 0) ? Game.gridWidth - 1 : i - 1][j];
            node.east = grid[(i === Game.gridWidth - 1) ? 0 : i + 1][j];
        }
    }

    // set up borders
    for (let i = 0; i < Game.gridWidth; i++) {
        grid[i][0].dupe.vertical = Game.canvasHeight;
        grid[i][Game.gridHeight - 1].dupe.vertical = -Game.canvasHeight;
    }

    for (let j = 0; j < Game.gridHeight; j++) {
        grid[0][j].dupe.horizontal = Game.canvasWidth;
        grid[Game.gridWidth - 1][j].dupe.horizontal = -Game.canvasWidth;
    }
    Game.grid = grid;

    const ship = new Ship(COLORS.shipOutline, true, context, grid);

    ship.x = Game.canvasWidth / 2;
    ship.y = Game.canvasHeight / 2;

    Game.sprites.push(ship);

    ship.missiles = [];
    for (let i = 0; i < 10; i++) {
        const missile = new Missile('missile', context, grid);
        ship.missiles.push(missile);
        Game.sprites.push(missile);
    }
    Game.ship = ship;

    const alienShip = new AlienShip(context, grid);
    alienShip.setup();
    Game.sprites.push(alienShip);
    Game.AlienShip = alienShip;

    Game.extraShip = new Ship(COLORS.shipOutline, false, context, grid);
    Game.extraShip.scale = 0.6;
    Game.extraShip.visible = true;

    gameContainer.style.backgroundColor = COLORS.background;
    
    Game.lastFrame = Date.now();
    mainLoop();
};

export const mainLoop = function () {
    let thisFrame;
    let elapsed;
    let delta;

    if (!Game.context) return;
    Game.context.clearRect(0, 0, Game.canvasWidth, Game.canvasHeight);

    Game.execute();

    if (Game.state.KEY_STATUS.g) {
        Game.context.beginPath();
        for (let i = 0; i < Game.gridWidth; i++) {
            Game.context.moveTo(i * Game.gridSize, 0);
            Game.context.lineTo(i * Game.gridSize, Game.canvasHeight);
        }
        for (let j = 0; j < Game.gridHeight; j++) {
            Game.context.moveTo(0, j * Game.gridSize);
            Game.context.lineTo(Game.canvasWidth, j * Game.gridSize);
        }
        Game.context.closePath();
        Game.context.stroke();
    }

    thisFrame = Date.now();
    elapsed = thisFrame - Game.lastFrame;
    Game.lastFrame = thisFrame;
    delta = elapsed / 30;

    for (let i = 0; i < Game.sprites.length; i++) {
        Game.sprites[i].run(delta);

        if (Game.sprites[i].reap) {
            Game.sprites[i].reap = false;
            Game.sprites.splice(i, 1);
            i--;
        }
    }

    // score
    const score_text = '' + Game.score;
    Game.gameText.renderText({
        text: score_text,
        size: 18,
        x: 16,
        y: 32,
        color: COLORS.text,
        dpr: Game.dpr
    });

    // extra ships
    for (let i = 0; i < Game.lives; i++) {
        if (Game.extraShip){
            Game.context.save();
            Game.extraShip.x = (20 * Game.dpr) + (i * 20);
            Game.extraShip.y = 48 * Game.dpr;
            Game.extraShip.configureTransform();
            Game.extraShip.draw();
            Game.context.restore();
        }
    }

    if (Game.state.isPaused) {
        Game.gameText.renderText({
            text: 'PAUSED',
            size: 72,
            x: 0,
            y: 0,
            color: COLORS.text,
            dpr: Game.dpr,
            xCenterVal: Game.canvasWidth,
            yCenterVal: Game.canvasHeight
        });
    }
    if (Game.state.isRunning && !Game.state.isPaused) {
        requestAnimationFrame(() => mainLoop());
    }
};