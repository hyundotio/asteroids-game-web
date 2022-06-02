export class Matrix {
    rows;
    columns;
    data;

    constructor(rows: number, columns: number) {
        this.rows = rows;
        this.columns = columns;

        this.data = [];
        for (let i = 0; i < rows; i++) {
            this.data.push([columns]);
        }
    }

    configure(rot: number, scale: number, transx: number, transy: number) {
        const rad = (rot * Math.PI) / 180;
        const sin = Math.sin(rad) * scale;
        const cos = Math.cos(rad) * scale;
        this.set(cos, -sin, transx, sin, cos, transy);
    };

    set(...args: number[]) {
        let k = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                this.data[i][j] = args[k];
                k++;
            }
        }
    }

    multiply(...args: number[]) {
        const vector = new Array(this.rows);
        for (let i = 0; i < this.rows; i++) {
            vector[i] = 0;
            for (let j = 0; j < this.columns; j++) {
                vector[i] += this.data[i][j] * args[j];
            }
        }
        return vector;
    };
};