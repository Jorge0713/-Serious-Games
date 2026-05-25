import type { ProgresoJugador, SeccionJuego } from '../types/progress-types';
import { obtenerFechaISO } from '../utils/dateUtils';

const NIVELES_DEL_JUEGO = [1, 2, 3];

function normalizarNiveles(niveles: number[]): number[] {
    return [...new Set(niveles)]
        .filter(nivel => NIVELES_DEL_JUEGO.includes(nivel))
        .sort((a, b) => a - b);
}

function contieneTodos(nivelesCompletados: number[], nivelesRequeridos: number[]): boolean {
    return nivelesRequeridos.every(nivel => nivelesCompletados.includes(nivel));
}

export class ProgressService {
    static readonly SECCIONES: SeccionJuego[] = [
        {
            id: 1,
            nombre: 'Verduras vs Frutas',
            descripcion: 'Aprende y clasifica entre verduras y frutas.',
            niveles: [1],
            desbloqueadaPorDefecto: true,
        },
        {
            id: 2,
            nombre: 'Leguminosas vs Cereales',
            descripcion: 'Diferencia entre proteína vegetal y fuentes de energía.',
            niveles: [2],
            desbloqueadaPorDefecto: false,
        },
        {
            id: 3,
            nombre: 'Origen animal vs Comida chatarra',
            descripcion: 'Reto final: Detecta las trampas y elige lo mejor.',
            niveles: [3],
            desbloqueadaPorDefecto: false,
        },
    ];

    static crearProgresoInicial(): ProgresoJugador {
        return {
            seccionActiva: 1,
            nivelActivo: 1,
            nivelesCompletados: [],
            seccionesDesbloqueadas: [1],
            puntuaciones: {},
            intentos: {},
            ultimaPartida: obtenerFechaISO(),
            juegoCompletado: false,
        };
    }

    static completarNivel(
        progreso: ProgresoJugador,
        nivel: number,
        puntuacion: number
    ): ProgresoJugador {
        const nivelesCompletados = normalizarNiveles([...progreso.nivelesCompletados, nivel]);
        const puntuaciones = {
            ...progreso.puntuaciones,
            [String(nivel)]: Math.max(progreso.puntuaciones[String(nivel)] ?? 0, puntuacion),
        };

        return {
            ...progreso,
            nivelesCompletados,
            puntuaciones,
            seccionesDesbloqueadas: ProgressService.calcularSeccionesDesbloqueadas(nivelesCompletados),
            nivelActivo: ProgressService.calcularNivelActivo(nivelesCompletados),
            seccionActiva: ProgressService.calcularSeccionActiva(nivelesCompletados),
            ultimaPartida: obtenerFechaISO(),
            juegoCompletado: ProgressService.estaJuegoCompletado(nivelesCompletados),
        };
    }

    static registrarPuntuacion(
        progreso: ProgresoJugador,
        nivel: number,
        puntuacion: number
    ): ProgresoJugador {
        return {
            ...progreso,
            puntuaciones: {
                ...progreso.puntuaciones,
                [String(nivel)]: Math.max(progreso.puntuaciones[String(nivel)] ?? 0, puntuacion),
            },
            ultimaPartida: obtenerFechaISO(),
        };
    }

    static registrarIntento(
        progreso: ProgresoJugador,
        nivel: number
    ): ProgresoJugador {
        const nivelKey = String(nivel);

        return {
            ...progreso,
            intentos: {
                ...progreso.intentos,
                [nivelKey]: (progreso.intentos[nivelKey] ?? 0) + 1,
            },
            ultimaPartida: obtenerFechaISO(),
        };
    }

    static calcularSeccionesDesbloqueadas(
        nivelesCompletados: number[]
    ): number[] {
        const nivelesNormalizados = normalizarNiveles(nivelesCompletados);
        const seccionesDesbloqueadas = [1];

        if (contieneTodos(nivelesNormalizados, [1])) {
            seccionesDesbloqueadas.push(2);
        }

        if (contieneTodos(nivelesNormalizados, [2])) {
            seccionesDesbloqueadas.push(3);
        }

        return seccionesDesbloqueadas;
    }

    static calcularNivelActivo(
        nivelesCompletados: number[]
    ): number {
        const nivelesNormalizados = normalizarNiveles(nivelesCompletados);
        const siguienteNivel = NIVELES_DEL_JUEGO.find(nivel => !nivelesNormalizados.includes(nivel));

        return siguienteNivel ?? NIVELES_DEL_JUEGO[NIVELES_DEL_JUEGO.length - 1];
    }

    static calcularSeccionActiva(
        nivelesCompletados: number[]
    ): number {
        const nivelActivo = ProgressService.calcularNivelActivo(nivelesCompletados);
        const seccionActiva = ProgressService.SECCIONES.find(seccion => seccion.niveles.includes(nivelActivo));

        return seccionActiva?.id ?? 1;
    }

    static puedeEntrarASeccion(
        progreso: ProgresoJugador,
        seccionId: number
    ): boolean {
        return progreso.seccionesDesbloqueadas.includes(seccionId);
    }

    static estaJuegoCompletado(
        nivelesCompletados: number[]
    ): boolean {
        const nivelesNormalizados = normalizarNiveles(nivelesCompletados);

        return contieneTodos(nivelesNormalizados, NIVELES_DEL_JUEGO);
    }
}
