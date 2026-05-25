import type { DatosAntropometricosEntrada, DatosRegistroJugador, Sexo } from '../types/player-types';

export type ResultadoValidacion = {
    valido: boolean;
    errores: string[];
};

const SEXOS_PERMITIDOS: Sexo[] = ['masculino', 'femenino'];
const NOMBRE_PERMITIDO = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?: [A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)*$/;

function crearResultado(errores: string[]): ResultadoValidacion {
    return {
        valido: errores.length === 0,
        errores,
    };
}

function esNumeroFinito(valor: number): boolean {
    return typeof valor === 'number' && Number.isFinite(valor);
}

export function validarNombre(nombre: string): ResultadoValidacion {
    const errores: string[] = [];
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
        errores.push('El nombre o apodo es obligatorio.');
    }

    if (nombreLimpio.length > 0 && nombreLimpio.length < 2) {
        errores.push('El nombre o apodo debe tener al menos 2 caracteres.');
    }

    if (nombreLimpio.length > 20) {
        errores.push('El nombre o apodo no debe superar 20 caracteres.');
    }

    if (nombreLimpio && !NOMBRE_PERMITIDO.test(nombreLimpio)) {
        errores.push('El nombre o apodo solo puede contener letras, números y espacios simples.');
    }

    return crearResultado(errores);
}

export function validarEdad(edad: number): ResultadoValidacion {
    const errores: string[] = [];

    if (!esNumeroFinito(edad)) {
        errores.push('La edad es obligatoria y debe ser un número.');
    } else {
        if (!Number.isInteger(edad)) {
            errores.push('La edad debe ser un número entero.');
        }

        if (edad < 2 || edad > 99) {
            errores.push('La edad debe estar entre 2 y 99 años.');
        }
    }

    return crearResultado(errores);
}

export function validarSexo(sexo: Sexo): ResultadoValidacion {
    const errores: string[] = [];

    if (!SEXOS_PERMITIDOS.includes(sexo)) {
        errores.push('El sexo debe ser "masculino" o "femenino".');
    }

    return crearResultado(errores);
}

export function validarPeso(pesoKg: number): ResultadoValidacion {
    const errores: string[] = [];

    if (!esNumeroFinito(pesoKg)) {
        errores.push('El peso es obligatorio y debe ser un número.');
    } else if (pesoKg < 5 || pesoKg > 300) {
        errores.push('El peso debe estar entre 5 y 300 kg.');
    }

    return crearResultado(errores);
}

export function validarEstatura(estaturaCm: number): ResultadoValidacion {
    const errores: string[] = [];

    if (!esNumeroFinito(estaturaCm)) {
        errores.push('La estatura es obligatoria y debe ser un número.');
    } else if (estaturaCm < 50 || estaturaCm > 250) {
        errores.push('La estatura debe estar entre 50 y 250 cm.');
    }

    return crearResultado(errores);
}

export function validarDatosJugador(datos: DatosRegistroJugador): ResultadoValidacion {
    const validaciones = [
        validarNombre(datos.nombre),
        validarEdad(datos.edad),
        validarSexo(datos.sexo),
        validarPeso(datos.pesoKg),
        validarEstatura(datos.estaturaCm),
    ];

    return crearResultado(validaciones.flatMap(validacion => validacion.errores));
}

export function validarDatosAntropometricos(datos: DatosAntropometricosEntrada): ResultadoValidacion {
    const validaciones = [
        validarEdad(datos.edad),
        validarSexo(datos.sexo),
        validarPeso(datos.pesoKg),
        validarEstatura(datos.estaturaCm),
    ];

    return crearResultado(validaciones.flatMap(validacion => validacion.errores));
}
