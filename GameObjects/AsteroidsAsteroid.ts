import { Game } from "../GameLogic/AsteroidsGameLogic";
import { Sprite } from "../GameGraphicsEngine/AsteroidsSprite";
import { COLORS } from "../GameConfig/colors";

export class Asteroid extends Sprite {
    constructor(context: CanvasRenderingContext2D | null, grid: null | Array<Array<Sprite>>){
        super({
            spriteColor: COLORS.asteroid,
            name: "asteroid",
            context,
            grid,
            points: [-10, 0,
                     -5, 7,
                     -3, 4,
                     1, 10,
                     5, 4,
                     10, 0,
                     5, -6,
                     2, -10,
                     -4, -10,
                     -4, -5]
        });
    }

    visible = true;
    scale = 6;
    postMove = this.wrapPostMove;

    collidesWith = ["ship", "missile", "alienship", "alienmissile"];

    preMove() { }
    collision(other: Sprite) {
        if (other.name === "missile") Game.score += 120 / this.scale;
        // break into fragments
        for (let i = 0; i < 3; i++) {
            const asteroidFrag = new Asteroid(this.context, this.grid)
            asteroidFrag.x = this.x;
            asteroidFrag.y = this.y;
            asteroidFrag.scale = this.scale / 3;
            if (asteroidFrag.scale > 0.5) {
                asteroidFrag.vel.x = Math.random() * 6 - 3;
                asteroidFrag.vel.y = Math.random() * 6 - 3;
                if (Math.random() > 0.5) {
                    asteroidFrag.points?.reverse();
                }
                asteroidFrag.vel.rot = Math.random() * 2 - 1;
                asteroidFrag.move(asteroidFrag.scale * 3); // give them a little push
                Game.sprites.push(asteroidFrag);
            }
        }
        Game.explosionAt(other.x, other.y);
        this.die();
    };
};