import { mainLoop } from "../GameApp/AsteroidsApp";
import { Game } from "../GameLogic/AsteroidsGameLogic";

export const gameKeyDown = (e: KeyboardEvent): void => {
    const eKeyVal = e.key.toLowerCase();
    if (Game.state.KEY_STATUS[eKeyVal] !== undefined) {
        const toggleVal = true;
        Game.state.KEY_STATUS[eKeyVal] = toggleVal;
        if (e.key === ' ') Game.state.KEY_STATUS['space'] = toggleVal;
        if (e.key === 'p') {
            if (Game.state.isPaused) {
                Game.state.isPaused = false;
                mainLoop();
            } else {
                if(Game.innerState !== ("waiting" || "boot" || "reset")) Game.state.isPaused = true;
            }
        }
    }
};

export const gameKeyUp = (e: KeyboardEvent): void => {
    const eKeyVal = e.key.toLowerCase();
    if (Game.state.KEY_STATUS[eKeyVal] !== undefined) {
        e.preventDefault();
        const toggleVal = false;
        Game.state.KEY_STATUS[eKeyVal] = toggleVal;
        if (e.key === ' ') Game.state.KEY_STATUS['space'] = toggleVal;
    }
};