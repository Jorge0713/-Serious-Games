import { useEffect, useRef } from 'react'
import { createGame } from '../../game/PhaserGame'

function HomePage() {
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!divRef.current) return
        // Guardar instancia del juego globalmente para que React pueda comunicarse con ella
        if (!(window as any).__phaserGame) {
            const game = createGame(divRef.current)
            ;(window as any).__phaserGame = game
        }

        return () => {
            // No destruimos el juego al desmontar para que sobreviva al overlay de React
        }
    }, [])
    return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
}

export default HomePage