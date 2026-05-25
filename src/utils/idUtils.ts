export function generarIdJugador(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 7);

    return `jugador_${timestamp}_${random}`;
}
