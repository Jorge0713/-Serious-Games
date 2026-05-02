import { useEffect, useRef } from 'react'
import { createGame } from '../../game/PhaserGame'

interface HomePageProps {
    onShowTutorial?: () => void;
}

function HomePage({ onShowTutorial }: HomePageProps) {
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!divRef.current) return
        const game = createGame(divRef.current)
        
        // Registrar el callback para mostrar tutorial
        if (onShowTutorial) {
            (window as any).showTutorial = onShowTutorial
        }
        
        return () => game.destroy(true)
    }, [onShowTutorial])
    return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
}

export default HomePage
// ← ¿tienes esta línea al final?