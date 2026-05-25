export type ProgresoJugador = {
    seccionActiva: number;
    nivelActivo: number;
    nivelesCompletados: number[];
    seccionesDesbloqueadas: number[];
    puntuaciones: Record<string, number>;
    intentos: Record<string, number>;
    ultimaPartida: string;
    juegoCompletado: boolean;
};

export type SeccionJuego = {
    id: number;
    nombre: string;
    descripcion: string;
    niveles: number[];
    desbloqueadaPorDefecto: boolean;
};
