export class Text {
    context: CanvasRenderingContext2D | null = null;
    face: {
        glyphs: { [key: string]: any },
        resolution: number,
        boundingBox: { xMin: number, xMax: number, yMin: number, yMax: number}
    } = { glyphs: {}, resolution: 0, boundingBox: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 } };

    renderGlyph(char: string) {

        const glyph = this.face.glyphs[char];

        if (glyph.o && this.context) {

            let outline;
            if (glyph.cached_outline) {
                outline = glyph.cached_outline;
            } else {
                outline = glyph.o.split(' ');
                glyph.cached_outline = outline;
            }

            const outlineLength = outline.length;
            for (let i = 0; i < outlineLength;) {

                let action = outline[i++];

                switch (action) {
                    default: 
                        break;
                    case 'm':
                        this.context.moveTo(outline[i++], outline[i++]);
                        break;
                    case 'l':
                        this.context.lineTo(outline[i++], outline[i++]);
                        break;

                    case 'q':
                        const cpx = outline[i++];
                        const cpy = outline[i++];
                        this.context.quadraticCurveTo(outline[i++], outline[i++], cpx, cpy);
                        break;

                    case 'b':
                        const x = outline[i++];
                        const y = outline[i++];
                        this.context.bezierCurveTo(outline[i++], outline[i++], outline[i++], outline[i++], x, y);
                        break;
                }
            }
        }
        if (glyph.ha && this.context) {
            this.context.translate(glyph.ha, 0);
        }
    }

    renderText(options:{
        text: string,
        size: number,
        x: number,
        y: number,
        color: string,
        dpr?: number,
        xCenterVal?: number,
        yCenterVal?: number
    }) {
        if (this.context) {
            this.context.save();

            const chars = options.text.split('');
            const charsLength = chars.length;
            let scale: number;

            if (options.dpr) {
                options.x = options.x * options.dpr;
                options.y = options.y * options.dpr;
                scale = (options.size * (72 * options.dpr) / (this.face.resolution * 100));
                
            } else {
                scale = (options.size * 72 / (this.face.resolution * 100));
            }

            if (options.xCenterVal){
                const fontRatio = (this.face.boundingBox.xMax - this.face.boundingBox.xMin) / (this.face.boundingBox.yMax - this.face.boundingBox.yMin);
                const fontWidth = fontRatio * options.size;
                const fontSpace = fontWidth / 6;
                const textOffset = (options.size * fontRatio * charsLength + (charsLength * fontSpace)) * (options.dpr ? options.dpr : 1);
                options.x = (options.xCenterVal - textOffset) / 2;
            }

            if (options.yCenterVal){
                options.y = (options.yCenterVal / 2) + (options.size * (options.dpr ? options.dpr : 1) / 2);
            }

            this.context.translate(options.x, options.y);
            this.context.scale(scale, -scale);
            this.context.beginPath();
            for (let i = 0; i < charsLength; i++) {
                this.renderGlyph(chars[i]);
            }
            this.context.fillStyle = options.color ? options.color : "#161616";
            this.context.fill();
            this.context.restore();
        }
    }
};