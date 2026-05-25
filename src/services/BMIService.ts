import type { DatosParaIMC, ResultadoIMC } from '../types/bmi.types';
import type { Sexo } from '../types/player-types';

const NORMA_REFERENCIA = 'NOM-043-SSA2-2012' as const;
const AVISO_EDUCATIVO = 'Resultado educativo basado en la NOM-043-SSA2-2012. No sustituye una valoración médica o nutricional.';
const MENSAJE_MENORES = 'En menores de 20 años, la interpretación del IMC debe realizarse con tablas de crecimiento por edad y sexo. Este resultado es únicamente educativo.';

export class BMIService {
    static calcularIMC(pesoKg: number, estaturaCm: number): number {
        if (!Number.isFinite(pesoKg) || pesoKg <= 0) {
            throw new Error('El peso debe ser un número mayor a 0.');
        }

        if (!Number.isFinite(estaturaCm) || estaturaCm <= 0) {
            throw new Error('La estatura debe ser un número mayor a 0.');
        }

        const estaturaMetros = estaturaCm / 100;
        const imc = pesoKg / (estaturaMetros * estaturaMetros);

        return Math.round(imc * 100) / 100;
    }

    static interpretarIMC(datos: DatosParaIMC): ResultadoIMC {
        const imc = BMIService.calcularIMC(datos.pesoKg, datos.estaturaCm);
        const esAdulto = BMIService.esAdulto(datos.edad);
        const esEstaturaBaja = esAdulto && BMIService.esAdultoDeEstaturaBaja(datos.sexo, datos.estaturaCm);

        if (!esAdulto) {
            return {
                imc,
                clasificacion: 'Interpretación con tablas de crecimiento requerida',
                mensaje: `${MENSAJE_MENORES} ${AVISO_EDUCATIVO}`,
                normaReferencia: NORMA_REFERENCIA,
                esAdulto,
                esEstaturaBaja,
            };
        }

        const clasificacion = esEstaturaBaja
            ? BMIService.clasificarAdultoEstaturaBaja(imc)
            : BMIService.clasificarAdulto(imc);

        return {
            imc,
            clasificacion,
            mensaje: AVISO_EDUCATIVO,
            normaReferencia: NORMA_REFERENCIA,
            esAdulto,
            esEstaturaBaja,
        };
    }

    static esAdulto(edad: number): boolean {
        return edad >= 20;
    }

    static esAdultoDeEstaturaBaja(sexo: Sexo, estaturaCm: number): boolean {
        if (sexo === 'femenino') {
            return estaturaCm < 150;
        }

        return estaturaCm < 160;
    }

    private static clasificarAdulto(imc: number): string {
        if (imc < 16) return 'Delgadez severa';
        if (imc < 17) return 'Delgadez moderada';
        if (imc < 18.5) return 'Delgadez leve';
        if (imc < 25) return 'Intervalo normal';
        if (imc < 30) return 'Sobrepeso / pre-obesidad';
        if (imc < 35) return 'Obesidad grado I';
        if (imc < 40) return 'Obesidad grado II';

        return 'Obesidad grado III';
    }

    private static clasificarAdultoEstaturaBaja(imc: number): string {
        if (imc < 18.5) return 'Bajo peso';
        if (imc < 23) return 'Intervalo normal';
        if (imc <= 25) return 'Sobrepeso';

        return 'Obesidad';
    }
}
