import { COLORS } from "../GameConfig/colors";
import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { Game } from "../GameLogic/AsteroidsGameLogic";
import { Missile } from "./AsteroidsMissile";

export class Ship extends Sprite {
    constructor(spriteColor: string, isPlayable: boolean, context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>){
        super({
            spriteColor,
            name: "ship",
            context,
            grid,
            points: [-5, 4,
                     0, -12,
                     5, 4]
        });

        if (isPlayable) {
            this.children = {
                exhaust: new Sprite({
                    spriteColor: COLORS.exhaust,
                    name: "exhaust",
                    context,
                    grid,
                    points: [-3, 6,
                             0, 11,
                             3, 6]
                    })
            };
        }
    }

    missiles: Missile[] = [];

    collidesWith = ["asteroid", "alienship", "alienmissile"];
    missileCounter = 0;
    postMove = this.wrapPostMove;

    preMove(delta: number) {
        if (Game.state.KEY_STATUS.arrowleft) {
            this.vel.rot = -6;
        } else if (Game.state.KEY_STATUS.arrowright) {
            this.vel.rot = 6;
        } else {
            this.vel.rot = 0;
        }

        if (Game.state.KEY_STATUS.arrowup) {
            const rad = ((this.rot - 90) * Math.PI) / 180;
            this.acc.x = 0.5 * Math.cos(rad);
            this.acc.y = 0.5 * Math.sin(rad);
            this.children.exhaust.visible = Math.random() > 0.1;
        } else {
            this.acc.x = 0;
            this.acc.y = 0;
            this.children.exhaust.visible = false;
        }

        if (this.missileCounter > 0) {
            this.missileCounter -= delta;
        }
        if (Game.state.KEY_STATUS.space) {
            if (this.missileCounter <= 0) {
                this.missileCounter = 10;
                for (let i = 0; i < this.missiles.length; i++) {
                    if (!this.missiles[i].visible) {
                        const missile = this.missiles[i];
                        const rad = ((this.rot - 90) * Math.PI) / 180;
                        const vectorx = Math.cos(rad);
                        const vectory = Math.sin(rad);
                        // move to the nose of the ship
                        missile.x = this.x + vectorx * (4 * Game.dpr);
                        missile.y = this.y + vectory * (4 * Game.dpr);
                        missile.vel.x = (6 * Game.dpr) * vectorx + this.vel.x;
                        missile.vel.y = (6 * Game.dpr) * vectory + this.vel.y;
                        missile.visible = true;
                        break;
                    }
                }
            }
        }

        // limit the ship's speed
        if (Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y) > 8) {
            this.vel.x *= 0.95;
            this.vel.y *= 0.95;
        }
    };

    collision(other: Sprite) {
        Game.explosionAt(other.x, other.y);
        Game.innerState = 'player_died';
        this.visible = false;
        this.currentNode?.leave(this);
        this.currentNode = null;
        Game.lives--;
    };

};