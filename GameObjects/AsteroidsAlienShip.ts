import { Game } from "../GameLogic/AsteroidsGameLogic";
import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { AlienMissile } from "./AsteroidsAlienMissile";
import { Missile } from "./AsteroidsMissile";
import { COLORS } from "../GameConfig/colors";

export class AlienShip extends Sprite {
    constructor(context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>) {
        super({
            spriteColor: COLORS.alienShip,
            name: "alienship",
            context,
            grid,
            points: [-20, 0,
                     -12, -4,
                     12, -4,
                     20, 0,
                     12, 4,
                     -12, 4,
                     -20, 0,
                     20, 0]
        });
            
        this.children.top.visible = true;
        this.children.bottom.visible = true;
    }

    collidesWith = ["asteroid", "ship", "missile"];
    bridgesH = false;
    missiles: Missile[] = [];
    missileCounter = 0;
    children = {
        top: new Sprite({
            spriteColor: COLORS.alienShip,
            name: "alienship_top",
            context: this.context,
            grid: this.grid,
            points: [-8, -4,
                     -6, -6,
                     6, -6,
                     8, -4]
            }),
        bottom: new Sprite({
            spriteColor: COLORS.alienShip,
            name: "alienship_bottom",
            context: this.context,
            grid: this.grid,
            points: [8, 4,
                     6, 6,
                     -6, 6,
                     -8, 4]
        })
    };

    newPosition() {
        if (Math.random() < 0.5) {
            this.x = -20;
            this.vel.x = 1.5;
        } else {
            this.x = Game.canvasWidth + 20;
            this.vel.x = -1.5;
        }
        this.y = Math.random() * Game.canvasHeight;
    };

    setup() {
        this.newPosition();

        for (let i = 0; i < 3; i++) {
            const alienMissile = new AlienMissile(this.context, this.grid);
            this.missiles.push(alienMissile);
            Game.sprites.push(alienMissile);
        }
    };

    preMove(delta: number) {
        const cn = this.currentNode;
        if (cn === null) return;

        let topCount = 0;
        if (cn.north?.nextSprite) topCount++;
        if (cn.north?.east?.nextSprite) topCount++;
        if (cn.north?.west?.nextSprite) topCount++;

        let bottomCount = 0;
        if (cn.south?.nextSprite) bottomCount++;
        if (cn.south?.east?.nextSprite) bottomCount++;
        if (cn.south?.west?.nextSprite) bottomCount++;

        if (topCount > bottomCount) {
            this.vel.y = 1;
        } else if (topCount < bottomCount) {
            this.vel.y = -1;
        } else if (Math.random() < 0.01) {
            this.vel.y = -this.vel.y;
        }

        this.missileCounter -= delta;
        if (this.missileCounter <= 0) {
            this.missileCounter = 22;
            for (let i = 0; i < this.missiles.length; i++) {
                if (!this.missiles[i].visible) {
                    const missile = this.missiles[i];
                    const rad = 2 * Math.PI * Math.random();
                    const vectorx = Math.cos(rad);
                    const vectory = Math.sin(rad);
                    missile.x = this.x;
                    missile.y = this.y;
                    missile.vel.x = 6 * vectorx;
                    missile.vel.y = 6 * vectory;
                    missile.visible = true;
                    break;
                }
            }
        }

    };

    collision(other: Sprite) {
        if (other.name === "missile") Game.score += 200;
        Game.explosionAt(other.x, other.y);
        this.visible = false;
        this.newPosition();
    };

    postMove() {
        if (this.y > Game.canvasHeight) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = Game.canvasHeight;
        }

        if ((this.vel.x > 0 && this.x > Game.canvasWidth + 20) ||
            (this.vel.x < 0 && this.x < -20)) {
            // why did the alien cross the road?
            this.visible = false;
            this.newPosition();
        }
    }
};