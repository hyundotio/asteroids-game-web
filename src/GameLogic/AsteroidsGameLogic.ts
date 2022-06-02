import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { AlienShip } from "../GameObjects/AsteroidsAlienShip";
import { Asteroid } from "../GameObjects/AsteroidsAsteroid";
import { Explosion } from "../GameObjects/AsteroidsExplosion";
import { Ship } from "../GameObjects/AsteroidsShip";
import { Text } from "../GameUI/AsteroidsText";
import { COLORS } from "../GameConfig/colors";

type innerStateTypes = 'boot' | 'waiting' | 'end_game' | 'player_died' | 'new_level' | 'run' | 'reset' | 'start' | 'spawn_ship'

interface State {
    [key: string]: any;
}

class BaseGame {
    context: CanvasRenderingContext2D | null = null;
    gameText = new Text();
    score = 0;
    totalAsteroids = 5;
    lives = 0;
    timer: number | null = null;
    grid: null | Array<Array<Sprite>> = null;
    gridHeight = 0;
    gridWidth = 0;
    lastFrame = 0;

    canvasWidth = 800;
    canvasHeight = 600;
    renderWidth = 800;
    renderHeight = 600;
    dpr = 1;
    gridSize = 60;

    isFirefox = navigator.userAgent.indexOf("Firefox") > 0;

    sprites: Array<Sprite> = [] as Array<Sprite>;
    ship: Ship | null = null;
    extraShip: Ship | null = null;
    AlienShip: AlienShip | null = null;

    nextAlienShipTime = Infinity;

    state: State = {
        KEY_STATUS: {
            'space': false,
            ' ': false,
            'arrowleft': false,
            'arrowup': false,
            'arrowright': false,
            'arrowdown': false,
            'f': false,
            'g': false,
            'h': false,
            'm': false,
            'p': false
        },
        isPaused: false,
        isRunning: true
    };

    innerState: innerStateTypes = 'boot';

    spawnAsteroids(count?: number) {
        if (!count) count = this.totalAsteroids;
        for (let i = 0; i < count; i++) {
            const asteroid = new Asteroid(this.context, this.grid);
            asteroid.x = Math.random() * this.canvasWidth;
            asteroid.y = Math.random() * this.canvasHeight;
            while (!asteroid.isClear()) {
                asteroid.x = Math.random() * this.canvasWidth;
                asteroid.y = Math.random() * this.canvasHeight;
            }
            asteroid.vel.x = Math.random() * 4 - 2;
            asteroid.vel.y = Math.random() * 4 - 2;
            if (Math.random() > 0.5) {
                asteroid.points?.reverse();
            }
            asteroid.vel.rot = Math.random() * 2 - 1;
            this.sprites.push(asteroid);
        }
    }

    explosionAt(x: number, y: number) {
        const explosion = new Explosion(this.context, this.grid);
        explosion.x = x;
        explosion.y = y;
        explosion.visible = true;
        this.sprites.push(explosion);
    }

    boot() {
        this.spawnAsteroids(5);
        this.innerState = 'waiting';
    }

    waiting() {
        Game.gameText.renderText({
            text: 'PRESS SPACE TO START',
            size: 24,
            x: 0,
            y: 0,
            color: COLORS.text,
            dpr: this.dpr,
            xCenterVal: Game.canvasWidth,
            yCenterVal: Game.canvasHeight
        });
        if (this.state.KEY_STATUS.space) {
            this.state.KEY_STATUS.space = false; // hack so we don't shoot right away
            this.innerState = 'start';
        }
    }

    reset() {
        this.lives = 0;
        this.score = 0;
        this.score = 0;
        this.totalAsteroids = 5;
        this.lives = 0;
        this.sprites = [];
        this.ship = null;
        this.AlienShip = null;
        this.nextAlienShipTime = Infinity;
        this.innerState = 'boot';
    }
    start() {
        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].name === 'asteroid') {
                this.sprites[i].die();
            } else if (this.sprites[i].name === 'missile' ||
                this.sprites[i].name === 'AlienShip') {
                this.sprites[i].visible = false;
            }
        }

        this.score = 0;
        this.lives = 2;
        this.totalAsteroids = 2;
        this.spawnAsteroids();

        this.nextAlienShipTime = Date.now() + 30000 + (30000 * Math.random());

        this.innerState = 'spawn_ship';
    }

    spawn_ship() {
        if (this.ship) {
            this.ship.x = this.canvasWidth / 2;
            this.ship.y = this.canvasHeight / 2;
            if (this.ship.isClear()) {
                this.ship.rot = 0;
                this.ship.vel.x = 0;
                this.ship.vel.y = 0;
                this.ship.visible = true;
                this.innerState = 'run';
            }
        }
    }

    run() {
        let newLevel = true;
        for (let i = 0; i < this.sprites.length; i++) {
            if (this.sprites[i].name === 'asteroid') {
                newLevel = false;
                break;
            }
        }

        if (newLevel) {
            this.innerState = 'new_level';
        }

        if (this.AlienShip && !this.AlienShip?.visible && Date.now() > this.nextAlienShipTime) {
            this.AlienShip.visible = true;
            this.nextAlienShipTime = Date.now() + (30000 * Math.random());
        }
    }

    new_level() {
        if (this.timer === null || this.timer === undefined) {
            this.timer = Date.now();
        }
        // wait a second before spawning more asteroids
        if (Date.now() - this.timer > 1000) {
            this.timer = null;
            this.totalAsteroids++;
            if (this.totalAsteroids > 12) this.totalAsteroids = 12;
            this.spawnAsteroids();
            this.innerState = 'run';
        }
    }

    player_died() {
        if (this.lives < 0) {
            this.innerState = 'end_game';
        } else {
            if (this.timer === null || this.timer === undefined) {
                this.timer = Date.now();
            }
            // wait a second before spawning
            if (Date.now() - this.timer > 1000) {
                this.timer = null;
                this.innerState = 'spawn_ship';
            }
        }
    }

    end_game() {
        Game.gameText.renderText({
            text: 'GAME OVER',
            size: 50,
            x: 0,
            y: 0,
            color: COLORS.text,
            dpr: this.dpr,
            xCenterVal: Game.canvasWidth,
            yCenterVal: Game.canvasHeight
        });
        if (this.timer === null || this.timer === undefined) {
            this.timer = Date.now();
        }
        // wait 5 seconds then go back to waiting state
        if (Date.now() - this.timer > 5000) {
            this.timer = null;
            this.innerState = 'waiting';
        }
    }

    execute() {
        this[this.innerState]();
    }
};


export const Game = new BaseGame();
