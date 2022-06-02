import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { COLORS } from "../GameConfig/colors";
import { Game } from "../GameLogic/AsteroidsGameLogic";

export class Missile extends Sprite {
    constructor(name = "missile", context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>, points = [0, 0]){
        super({
            spriteColor: COLORS.shipMissile,
            name,
            context,
            grid,
            points
        });
    }
    
    time = 0;
    bridgesH = false;
    bridgesV = false;
    postMove = this.wrapPostMove;
    // asteroid can look for missiles so doesn't have
    // to be other way around
    // collidesWith = ["asteroid"]

    configureTransform() { };
    
    draw() {
        if (this.visible && this.context) {
            const xOffset = Game.dpr * 1;
            const yOffset = Game.dpr * 1;
            const lineWidthVal = 3 * Game.dpr;
            this.context.save();
            this.context.lineWidth = lineWidthVal;
            this.context.strokeStyle = COLORS.shipMissile;
            this.context.beginPath();
            this.context.moveTo(this.x - xOffset, this.y - yOffset);
            this.context.lineTo(this.x + xOffset, this.y + yOffset);
            this.context.moveTo(this.x + xOffset, this.y - yOffset);
            this.context.lineTo(this.x - xOffset, this.y + yOffset);
            this.context.stroke();
            this.context.restore();
        }
    };

    preMove(delta: number) {
        if (this.visible) {
            this.time += delta;
        }
        if (this.time > 50) {
            this.visible = false;
            this.time = 0;
        }
    };

    collision() {
        this.time = 0;
        this.visible = false;
        this.currentNode?.leave(this);
        this.currentNode = null;
    };

    transformedPoints() {
        return [this.x, this.y];
    };

};