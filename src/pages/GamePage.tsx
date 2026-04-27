import { useEffect } from "react";
import { Game } from "../game/Game";

export default function GamePage() {
  useEffect(() => {
    const game = new Game();

    return () => {
      game.destroy(true);
    };
  }, []);
  
return (
  <div
    id="game-container"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        background: "#FCEC62",
      }}
    />
);
}