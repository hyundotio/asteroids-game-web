import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { Missile } from "./AsteroidsMissile";
import { COLORS } from "../GameConfig/colors";
import { Game } from "../GameLogic/AsteroidsGameLogic";

export class AlienMissile extends Missile {
    constructor(context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>){
        super("alienmissile", context, grid);
    }

    draw() {
        if (this.visible && this.context) {
            const lineWidthVal = 2 * Game.dpr;
            this.context.save();
            this.context.lineWidth = lineWidthVal;
            this.context.strokeStyle = COLORS.alienMissile;
            this.context.beginPath();
            this.context.moveTo(this.x, this.y);
            this.context.lineTo(this.x - this.vel.x, this.y - this.vel.y);
            this.context.stroke();
            this.context.restore();
        }
    };
};