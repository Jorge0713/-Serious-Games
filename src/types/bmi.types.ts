import type { NormaReferencia, Sexo } from './player.types';

export type DatosParaIMC = {
    edad: number;
    sexo: Sexo;
    pesoKg: number;
    estaturaCm: number;
};

export type ResultadoIMC = {
    imc: number;
    clasificacion: string;
    mensaje: string;
    normaReferencia: NormaReferencia;
    esAdulto: boolean;
    esEstaturaBaja: boolean;
};
