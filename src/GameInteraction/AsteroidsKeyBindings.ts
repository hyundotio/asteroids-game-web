import { mainLoop } from "../GameApp/AsteroidsApp";
import { Game } from "../GameLogic/AsteroidsGameLogic";

export const gameGoForward = function(bool: boolean){
    Game.state.KEY_STATUS['arrowup'] = bool;
}

export const gameTurnLeft = function(bool: boolean){
    Game.state.KEY_STATUS['arrowleft'] = bool;
}

export const gameTurnRight = function(bool: boolean){
    Game.state.KEY_STATUS['arrowright'] = bool;
}

export const gameFire = function(bool: boolean){
    Game.state.KEY_STATUS['space'] = bool;
}

export const handleGamePause = function(){
    if (Game.state.isPaused) {
        Game.state.isPaused = false;
        mainLoop();
    } else {
        if(Game.innerState !== ("waiting" || "boot" || "reset")) Game.state.isPaused = true;
    }
}

export const gameKeyDown = (e: KeyboardEvent): void => {
    const eKeyVal = e.key.toLowerCase();
    if (Game.state.KEY_STATUS[eKeyVal] !== undefined) {
        const toggleVal = true;
        Game.state.KEY_STATUS[eKeyVal] = toggleVal;
        if (e.key === ' ') Game.state.KEY_STATUS['space'] = toggleVal;
        if (e.key === 'p') handleGamePause();
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