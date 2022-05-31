import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { COLORS } from "../GameConfig/colors";
import { Game } from "../GameLogic/AsteroidsGameLogic";

export class Explosion extends Sprite {
    lines: number[][] = [];
    constructor(context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>){
        super({
            spriteColor: COLORS.explosion,
            name: "explosion",
            context,
            grid
        });

        this.lines = [];
        for (let i = 0; i < 5; i++) {
            const rad = 2 * Math.PI * Math.random();
            const x = Math.cos(rad) * Game.dpr;
            const y = Math.sin(rad) * Game.dpr;
            this.lines.push([x, y, x * 2, y * 2]);
        }
    }

    bridgesH = false;
    bridgesV = false;

    draw() {
        if (this.visible && this.context) {
            this.context.save();
            this.context.lineWidth = (1.0 / this.scale) * Game.dpr;
            this.context.beginPath();
            this.context.strokeStyle = COLORS.explosion;
            for (let i = 0; i < 5; i++) {
                const line = this.lines[i];
                this.context.moveTo(line[0], line[1]);
                this.context.lineTo(line[2], line[3]);
            }
            this.context.stroke();
            this.context.restore();
        }
    };

    preMove(delta: number) {
        if (this.visible) {
            this.scale += delta;
        }
        if (this.scale > 8) {
            this.die();
        }
    };
};