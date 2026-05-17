import { useEffect, useRef } from 'react'
import { createGame } from '../../game/PhaserGame'

function HomePage() {
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!divRef.current) return

        if (window.__phaserGame) {
            const canvas = window.__phaserGame.canvas

            if (canvas.parentElement !== divRef.current) {
                divRef.current.appendChild(canvas)
            }

            return
        }

        const game = createGame(divRef.current)
        window.__phaserGame = game

        return () => {
            // No destruimos el juego al desmontar para que sobreviva al overlay de React
        }
    }, [])
    return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
}

export default HomePage
