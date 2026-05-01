import { useEffect, useRef } from 'react'
import { createGame } from '../../game/PhaserGame'

function HomePage() {
    const divRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!divRef.current) return
        const game = createGame(divRef.current)
        return () => game.destroy(true)
    }, [])
return <div ref={divRef} style={{ width: '100%', height: '100%' }} />
}

export default HomePage 
// ← ¿tienes esta línea al final?