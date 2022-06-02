import React, { useRef, useEffect } from "react";
import { runGame, killGame, initGame } from "./GameApp/AsteroidsApp";
import { gameKeyUp, gameKeyDown } from "./GameInteraction/AsteroidsKeyBindings";

const AsteroidsGame: React.FunctionComponent = () => {
    const canvasRef = useRef(null);
    const gameContainerRef = useRef(null);
    
    useEffect(() => {
        if (canvasRef.current && gameContainerRef.current){
            initGame();
            runGame(canvasRef.current, gameContainerRef.current);
            document.addEventListener('keyup', gameKeyUp);
            document.addEventListener('keydown', gameKeyDown);
        }
        return () => {
            killGame();
            document.removeEventListener('keyup', gameKeyUp);
            document.removeEventListener('keydown', gameKeyDown);
        }
    },[]);

    return (
        <div className="asteroids-game-container" ref={gameContainerRef}>
            <canvas id="asteroids-game-canvas" width="512" height="384" ref={canvasRef} />
        </div>
    );
};

export default AsteroidsGame;