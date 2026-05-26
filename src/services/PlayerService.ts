import { BMIService } from './BMIService';
import { ProgressService } from './ProgressService';
import type {
    DatosAntropometricosEntrada,
    DatosAntropometricos,
    DatosRegistroJugador,
    Jugador,
    MedicionAntropometrica,
} from '../types/player-types';
import type { ProgresoJugador } from '../types/progress-types';
import { obtenerFechaISO } from '../utils/dateUtils';
import { generarIdJugador } from '../utils/idUtils';
import { validarDatosAntropometricos, validarDatosJugador } from '../utils/playerValidation';

export const PLAYERS_STORAGE_KEY = 'nutri_game_players';
export const ACTIVE_PLAYER_ID_KEY = 'nutri_game_active_player_id';

function obtenerLocalStorage(): Storage | null {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage;
}

function crearErrorValidacion(errores: string[]): Error {
    return new Error(`Datos de jugador inválidos: ${errores.join(' ')}`);
}

function crearMedicion(
    fecha: string,
    datos: DatosAntropometricosEntrada,
    imc: number,
    clasificacionIMC: string,
    mensajeIMC: string
): MedicionAntropometrica {
    return {
        fecha,
        edad: datos.edad,
        sexo: datos.sexo,
        pesoKg: datos.pesoKg,
        estaturaCm: datos.estaturaCm,
        imc,
        clasificacionIMC,
        mensajeIMC,
        patologia: datos.patologia,
    };
}

function crearDatosAntropometricos(
    fecha: string,
    datos: DatosAntropometricosEntrada
): DatosAntropometricos {
    const resultadoIMC = BMIService.interpretarIMC(datos);

    return {
        edad: datos.edad,
        sexo: datos.sexo,
        pesoKg: datos.pesoKg,
        estaturaCm: datos.estaturaCm,
        imc: resultadoIMC.imc,
        clasificacionIMC: resultadoIMC.clasificacion,
        mensajeIMC: resultadoIMC.mensaje,
        normaReferencia: resultadoIMC.normaReferencia,
        fechaMedicion: fecha,
        patologia: datos.patologia,
    };
}

export class PlayerService {
    static obtenerJugadores(): Jugador[] {
        const storage = obtenerLocalStorage();

        if (!storage) {
            console.warn('localStorage no está disponible. Se devolverá una lista vacía de jugadores.');
            return [];
        }

        const rawPlayers = storage.getItem(PLAYERS_STORAGE_KEY);

        if (!rawPlayers) {
            return [];
        }

        try {
            const parsedPlayers: unknown = JSON.parse(rawPlayers);

            if (!Array.isArray(parsedPlayers)) {
                console.warn('El almacenamiento de jugadores no contiene una lista válida. Se devolverá una lista vacía.');
                return [];
            }

            return parsedPlayers as Jugador[];
        } catch (error) {
            console.warn('No se pudo leer el almacenamiento de jugadores. Se devolverá una lista vacía.', error);
            return [];
        }
    }

    static guardarJugadores(jugadores: Jugador[]): void {
        const storage = obtenerLocalStorage();

        if (!storage) {
            throw new Error('localStorage no está disponible para guardar jugadores.');
        }

        storage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(jugadores));
    }

    static crearJugador(datos: DatosRegistroJugador): Jugador {
        const validacion = validarDatosJugador(datos);

        if (!validacion.valido) {
            throw crearErrorValidacion(validacion.errores);
        }

        const fecha = obtenerFechaISO();
        const datosAntropometricos = crearDatosAntropometricos(fecha, datos);
        const medicion = crearMedicion(
            fecha,
            datos,
            datosAntropometricos.imc,
            datosAntropometricos.clasificacionIMC,
            datosAntropometricos.mensajeIMC
        );

        const jugador: Jugador = {
            id: generarIdJugador(),
            nombre: datos.nombre.trim(),
            fechaCreacion: fecha,
            ultimoAcceso: fecha,
            datosAntropometricos,
            mediciones: [medicion],
            progreso: ProgressService.crearProgresoInicial(),
        };

        const jugadores = PlayerService.obtenerJugadores();
        PlayerService.guardarJugadores([...jugadores, jugador]);
        PlayerService.establecerJugadorActivo(jugador.id);

        return jugador;
    }

    static obtenerJugadorPorId(id: string): Jugador | null {
        return PlayerService.obtenerJugadores().find(jugador => jugador.id === id) ?? null;
    }

    static establecerJugadorActivo(id: string): void {
        const storage = obtenerLocalStorage();
        const jugador = PlayerService.obtenerJugadorPorId(id);

        if (!storage) {
            throw new Error('localStorage no está disponible para establecer el jugador activo.');
        }

        if (!jugador) {
            throw new Error(`No existe un jugador con el id "${id}".`);
        }

        storage.setItem(ACTIVE_PLAYER_ID_KEY, jugador.id);
        PlayerService.actualizarUltimoAcceso(jugador.id);
    }

    static obtenerJugadorActivo(): Jugador | null {
        const storage = obtenerLocalStorage();

        if (!storage) {
            console.warn('localStorage no está disponible. No se puede obtener jugador activo.');
            return null;
        }

        const activePlayerId = storage.getItem(ACTIVE_PLAYER_ID_KEY);

        if (!activePlayerId) {
            return null;
        }

        return PlayerService.obtenerJugadorPorId(activePlayerId);
    }

    static actualizarJugador(jugadorActualizado: Jugador): Jugador | null {
        const jugadores = PlayerService.obtenerJugadores();
        const index = jugadores.findIndex(jugador => jugador.id === jugadorActualizado.id);

        if (index === -1) {
            return null;
        }

        const jugadoresActualizados = [...jugadores];
        jugadoresActualizados[index] = {
            ...jugadorActualizado,
            ultimoAcceso: obtenerFechaISO(),
        };

        PlayerService.guardarJugadores(jugadoresActualizados);

        return jugadoresActualizados[index];
    }

    static actualizarPerfilJugador(id: string, datos: DatosRegistroJugador): Jugador | null {
        const validacion = validarDatosJugador(datos);
        if (!validacion.valido) {
            throw crearErrorValidacion(validacion.errores);
        }

        const jugador = PlayerService.obtenerJugadorPorId(id);
        if (!jugador) return null;

        jugador.nombre = datos.nombre.trim();
        PlayerService.actualizarJugador(jugador);

        return PlayerService.actualizarDatosAntropometricos(id, datos);
    }

    static actualizarDatosAntropometricos(
        id: string,
        datos: DatosAntropometricosEntrada
    ): Jugador | null {
        const validacion = validarDatosAntropometricos(datos);

        if (!validacion.valido) {
            throw crearErrorValidacion(validacion.errores);
        }

        const jugador = PlayerService.obtenerJugadorPorId(id);

        if (!jugador) {
            return null;
        }

        const fecha = obtenerFechaISO();
        const datosAntropometricos = crearDatosAntropometricos(fecha, datos);
        const medicion = crearMedicion(
            fecha,
            datos,
            datosAntropometricos.imc,
            datosAntropometricos.clasificacionIMC,
            datosAntropometricos.mensajeIMC
        );

        return PlayerService.actualizarJugador({
            ...jugador,
            datosAntropometricos,
            mediciones: [...jugador.mediciones, medicion],
            ultimoAcceso: fecha,
        });
    }

    static actualizarProgreso(
        id: string,
        progreso: ProgresoJugador
    ): Jugador | null {
        const jugador = PlayerService.obtenerJugadorPorId(id);

        if (!jugador) {
            return null;
        }

        return PlayerService.actualizarJugador({
            ...jugador,
            progreso: {
                ...progreso,
                ultimaPartida: obtenerFechaISO(),
            },
        });
    }

    static actualizarUltimoAcceso(id: string): void {
        const jugador = PlayerService.obtenerJugadorPorId(id);

        if (!jugador) {
            return;
        }

        const jugadores = PlayerService.obtenerJugadores().map(jugadorActual => {
            if (jugadorActual.id !== id) {
                return jugadorActual;
            }

            return {
                ...jugadorActual,
                ultimoAcceso: obtenerFechaISO(),
            };
        });

        PlayerService.guardarJugadores(jugadores);
    }

    static eliminarJugador(id: string): void {
        const storage = obtenerLocalStorage();
        const jugadores = PlayerService.obtenerJugadores();
        const jugadoresRestantes = jugadores.filter(jugador => jugador.id !== id);

        PlayerService.guardarJugadores(jugadoresRestantes);

        if (storage?.getItem(ACTIVE_PLAYER_ID_KEY) === id) {
            storage.removeItem(ACTIVE_PLAYER_ID_KEY);
        }
    }
}
