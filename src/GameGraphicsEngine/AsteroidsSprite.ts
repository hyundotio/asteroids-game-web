import { Game } from "../GameLogic/AsteroidsGameLogic";
import { GridNode } from "../GameLogic/AsteroidsGrid";
import { Matrix } from "../GameLogic/AsteroidsMatrix";
import { COLORS } from "../GameConfig/colors";

type CART = {
    x: number;
    y: number;
    rot: number;
}

export class Sprite extends GridNode {
    spriteColor;
    points: number[] = [];
    vel: CART = {} as CART;
    acc: CART = {} as CART;

    constructor(params: {
        spriteColor: string,
        name: string,
        context: CanvasRenderingContext2D | null,
        grid: null | Array<Array<Sprite>>,
        points?: number[]
    }) {
        super()
        this.spriteColor = params.spriteColor ? params.spriteColor : COLORS.default;
        this.name = params.name;
        this.points = params.points || [];
        this.context = params.context;
        this.grid = params.grid;

        this.vel = {
            x: 0,
            y: 0,
            rot: 0
        };

        this.acc = {
            x: 0,
            y: 0,
            rot: 0
        };
        
        this.points = this.points.map((point) => { return point * Game.dpr });
    }

    children: {
        [key: string]: Sprite
    } = {};

    reap = false;
    bridgesH = true;
    bridgesV = true;

    collidesWith = [] as string[];

    x = 0;
    y = 0;
    rot = 0;
    scale = 1;

    currentNode: Sprite | null = null;
    transPoints: number[] | null = null;

    preMove(delta: number) { };
    postMove(delta: number) { };
    context: CanvasRenderingContext2D | null = null;
    matrix = new Matrix(2, 3)
    grid: null | Array<Array<Sprite>> = null

    run(delta: number) {

        this.move(delta);
        this.updateGrid();

        this.context?.save();
        this.configureTransform();
        this.draw();

        const canidates = this.findCollisionCanidates();

        this.matrix.configure(this.rot, this.scale, this.x, this.y);
        this.checkCollisionsAgainst(canidates);

        this.context?.restore();

        if (this.bridgesH && this.currentNode && this.currentNode.dupe.horizontal) {
            this.x += this.currentNode.dupe.horizontal;
            this.context?.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context?.restore();
            if (this.currentNode) {
                this.x -= this.currentNode.dupe.horizontal;
            }
        }
        if (this.bridgesV && this.currentNode && this.currentNode.dupe.vertical) {
            this.y += this.currentNode.dupe.vertical;
            this.context?.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context?.restore();
            if (this.currentNode) {
                this.y -= this.currentNode.dupe.vertical;
            }
        }
        if (this.bridgesH && this.bridgesV &&
            this.currentNode &&
            this.currentNode.dupe.vertical &&
            this.currentNode.dupe.horizontal) {
            this.x += this.currentNode.dupe.horizontal;
            this.y += this.currentNode.dupe.vertical;
            this.context?.save();
            this.configureTransform();
            this.draw();
            this.checkCollisionsAgainst(canidates);
            this.context?.restore();
            if (this.currentNode) {
                this.x -= this.currentNode.dupe.horizontal;
                this.y -= this.currentNode.dupe.vertical;
            }
        }
    };

    move(delta: number) {
        if (!this.visible) return;
        this.transPoints = null; // clear cached points
        this.preMove(delta);

        this.vel.x += this.acc.x * delta;
        this.vel.y += this.acc.y * delta;
        this.x += this.vel.x * delta;
        this.y += this.vel.y * delta;
        this.rot += this.vel.rot * delta;
        if (this.rot > 360) {
            this.rot -= 360;
        } else if (this.rot < 0) {
            this.rot += 360;
        }

        this.postMove(delta);
    };

    updateGrid() {
        if (!this.visible || !this.grid) return;
        let gridx = Math.floor(this.x / Game.gridSize);
        let gridy = Math.floor(this.y / Game.gridSize);
        gridx = (gridx >= this.grid.length) ? 0 : gridx;
        gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
        gridx = (gridx < 0) ? this.grid.length - 1 : gridx;
        gridy = (gridy < 0) ? this.grid[0].length - 1 : gridy;
        const newNode = this.grid[gridx][gridy];
        if (newNode !== this.currentNode) {
            if (this.currentNode) {
                this.currentNode.leave(this);
            }
            newNode.enter(this);
            this.currentNode = newNode;
        }

        if (Game.state.KEY_STATUS.g && this.currentNode && this.context) {
            this.context.lineWidth = 3.0;
            this.context.strokeStyle = 'green';
            this.context?.strokeRect(gridx * Game.gridSize + 2, gridy * Game.gridSize + 2, Game.gridSize - 4, Game.gridSize - 4);
            this.context.strokeStyle = 'black';
            this.context.lineWidth = 1.0;
        }
    };

    configureTransform() {
        if (!this.visible) return;

        const rad = (this.rot * Math.PI) / 180;
        this.context?.translate(this.x, this.y);
        this.context?.rotate(rad);
        this.context?.scale(this.scale, this.scale);
    };

    draw() {
        if (!this.visible || !this.context) return;

        this.context.lineWidth = (1.0 / this.scale) * Game.dpr;

        for (const child in this.children) {
            this.children[child].draw();
        }

        this.context.beginPath();

        this.context.moveTo(this.points[0], this.points[1]);
        for (let i = 1; i < this.points.length / 2; i++) {
            const xi = i * 2;
            const yi = xi + 1;
            this.context.lineTo(this.points[xi], this.points[yi]);
        }

        this.context.strokeStyle = this.spriteColor;
        this.context.closePath();
        this.context.stroke();
    };

    findCollisionCanidates() {
        if (!this.visible || !this.currentNode) return [];
        const cn = this.currentNode;
        const canidates = [];
        if (cn.nextSprite) canidates.push(cn.nextSprite);
        if (cn.north?.nextSprite) canidates.push(cn.north.nextSprite);
        if (cn.south?.nextSprite) canidates.push(cn.south.nextSprite);
        if (cn.east?.nextSprite) canidates.push(cn.east.nextSprite);
        if (cn.west?.nextSprite) canidates.push(cn.west.nextSprite);
        if (cn.north?.east?.nextSprite) canidates.push(cn.north.east.nextSprite);
        if (cn.north?.west?.nextSprite) canidates.push(cn.north.west.nextSprite);
        if (cn.south?.east?.nextSprite) canidates.push(cn.south.east.nextSprite);
        if (cn.south?.west?.nextSprite) canidates.push(cn.south.west.nextSprite);
        return canidates
    };

    checkCollisionsAgainst(canidates: Sprite[]) {
        for (let i = 0; i < canidates.length; i++) {
            let ref: Sprite | null = canidates[i];
            do {
                this.checkCollision(ref);
                ref = ref.nextSprite;
            } while (ref)
        }
    };
    checkCollision(other: Sprite) {
        if (!other.visible ||
            this === other ||
            this.collidesWith.indexOf(other.name) === -1) return;
        const trans = other.transformedPoints();
        const count = trans.length / 2;
        for (let i = 0; i < count; i++) {
            let px = trans[i * 2];
            let py = trans[i * 2 + 1];
            // mozilla doesn't take into account transforms with isPointInPath
            if (Game.isFirefox ? this.pointInPolygon(px, py) : this.context?.isPointInPath(px, py)) {
            //if (this.pointInPolygon(px, py)) {
                other.collision(this);
                this.collision(other);
                return;
            }
        }
    };

    collision(sprite: Sprite) {
        throw Error('collision not implemented')
    };

    pointInPolygon(x: number, y: number) {
        const points = this.transformedPoints();
        let j = 2;
        let y0, y1;
        let oddNodes = false;
        for (let i = 0; i < points.length; i += 2) {
            y0 = points[i + 1];
            y1 = points[j + 1];
            if ((y0 < y && y1 >= y) ||
                (y1 < y && y0 >= y)) {
                if (points[i] + (y - y0) / (y1 - y0) * (points[j] - points[i]) < x) {
                    oddNodes = !oddNodes;
                }
            }
            j += 2
            if (j === points.length) j = 0;
        }
        return oddNodes;
    };
    die() {
        this.visible = false;
        this.reap = true;
        if (this.currentNode) {
            this.currentNode.leave(this);
            this.currentNode = null;
        }
    };
    transformedPoints() {
        if (this.transPoints) return this.transPoints;
        const trans = new Array(this.points.length);
        this.matrix.configure(this.rot, this.scale, this.x, this.y);
        for (let i = 0; i < this.points.length / 2; i++) {
            const xi = i * 2;
            const yi = xi + 1;
            const pts = this.matrix.multiply(this.points[xi], this.points[yi], 1);
            trans[xi] = pts[0];
            trans[yi] = pts[1];
        }
        this.transPoints = trans; // cache translated points
        return trans;
    };

    isClear() {
        if (this.collidesWith.length === 0 || !this.grid) return true;
        let cn = this.currentNode;
        if (cn === null) {
            let gridx = Math.floor(this.x / Game.gridSize);
            let gridy = Math.floor(this.y / Game.gridSize);
            gridx = (gridx >= this.grid.length) ? 0 : gridx;
            gridy = (gridy >= this.grid[0].length) ? 0 : gridy;
            cn = this.grid[gridx][gridy];
        }
        return (cn.isEmpty(this.collidesWith) &&
            cn.north?.isEmpty(this.collidesWith) &&
            cn.south?.isEmpty(this.collidesWith) &&
            cn.east?.isEmpty(this.collidesWith) &&
            cn.west?.isEmpty(this.collidesWith) &&
            cn.north?.east?.isEmpty(this.collidesWith) &&
            cn.north?.west?.isEmpty(this.collidesWith) &&
            cn.south?.east?.isEmpty(this.collidesWith) &&
            cn.south?.west?.isEmpty(this.collidesWith));
    };

    wrapPostMove() {
        if (this.x > Game.canvasWidth) {
            this.x = 0;
        } else if (this.x < 0) {
            this.x = Game.canvasWidth;
        }
        if (this.y > Game.canvasHeight) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = Game.canvasHeight;
        }
    };
};