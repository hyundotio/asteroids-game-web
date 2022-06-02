export class GridNode {
    north: this | null = null;
    south: this | null = null;
    east: this | null = null;
    west: this | null = null;
    nextSprite: this | null = null;
    visible = false;
    name = '';

    dupe = {
        horizontal: null as number,
        vertical: null as number
    };

    enter(sprite: this) {
        sprite.nextSprite = this.nextSprite;
        this.nextSprite = sprite;
    };

    leave(sprite: this) {
        let ref: this | null = this;
        while (ref && (ref.nextSprite !== sprite)) {
            ref = ref.nextSprite;
        }
        if (ref) {
            ref.nextSprite = sprite.nextSprite;
            sprite.nextSprite = null;
        }
    };

    eachSprite(sprite: this, callback: (spr: this) => void) {
        let ref: this | null = this;
        while (ref.nextSprite) {
            ref = ref.nextSprite;
            callback.call(sprite, ref);
        }
    };

    isEmpty(collidables: string[]) {
        let empty = true;
        let ref: this | null = this;
        while (ref.nextSprite) {
            ref = ref.nextSprite;
            empty = !ref.visible || collidables.indexOf(ref.name) === -1
            if (!empty) break;
        }
        return empty;
    };
};