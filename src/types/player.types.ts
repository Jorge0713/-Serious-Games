import type { ProgresoJugador } from './progress.types';

export type Sexo = 'masculino' | 'femenino';

export type NormaReferencia = 'NOM-043-SSA2-2012';

export type DatosAntropometricos = {
    edad: number;
    sexo: Sexo;
    pesoKg: number;
    estaturaCm: number;
    imc: number;
    clasificacionIMC: string;
    mensajeIMC: string;
    normaReferencia: NormaReferencia;
    fechaMedicion: string;
};

export type MedicionAntropometrica = {
    fecha: string;
    edad: number;
    sexo: Sexo;
    pesoKg: number;
    estaturaCm: number;
    imc: number;
    clasificacionIMC: string;
    mensajeIMC: string;
};

export type Jugador = {
    id: string;
    nombre: string;
    fechaCreacion: string;
    ultimoAcceso: string;
    datosAntropometricos: DatosAntropometricos;
    mediciones: MedicionAntropometrica[];
    progreso: ProgresoJugador;
};

export type DatosRegistroJugador = {
    nombre: string;
    edad: number;
    sexo: Sexo;
    pesoKg: number;
    estaturaCm: number;
};

export type DatosAntropometricosEntrada = {
    edad: number;
    sexo: Sexo;
    pesoKg: number;
    estaturaCm: number;
};
