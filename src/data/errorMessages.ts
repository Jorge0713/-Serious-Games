/**
 * Educational error messages shown when a player places a food in the wrong category.
 *
 * Keys follow the pattern  `{itemCategory}_{wrongZoneCategory}`
 * where categories use the game's internal Spanish names
 * (fruta, verdura, sebo, cereal, leguminosa, animal, chatarra, …).
 *
 * Add new entries here to support future levels without touching the main game code.
 */

type MessageSet = { messages: string[] };

const errorData: Record<string, MessageSet> = {

    // ── Nivel 1: Frutas y Verduras ─────────────────────────────────────────────

    fruta_verdura: {
        messages: [
            'Recuerda que las frutas suelen contener más azúcares naturales y muchas crecen a partir de flores.',
            'Las frutas generalmente contienen semillas y se desarrollan del ovario de la flor.',
            'Aunque algunas frutas parezcan verduras, se caracterizan por crecer a partir de la flor de la planta.',
            'Las frutas aportan vitaminas y antioxidantes importantes para el cuerpo.',
            'Las frutas se originan del ovario maduro de la flor, cuya función es proteger las semillas.',
            '¡Ojo! Alimentos como el jitomate o el pepino son frutas botánicas aunque los usemos como verduras.',
        ],
    },

    verdura_fruta: {
        messages: [
            'Las verduras suelen provenir de raíces, hojas, tallos o bulbos de las plantas.',
            'Recuerda que muchas verduras aportan fibra y minerales esenciales para el organismo.',
            'Las verduras normalmente no se desarrollan a partir de flores con semillas.',
            'Las verduras ayudan al crecimiento y fortalecen el sistema inmunológico.',
            'La mayoría de las verduras son partes vegetativas comestibles: raíces, hojas, bulbos o tallos.',
            '¡Dato curioso! Las verduras son bajas en calorías y ricas en agua y minerales.',
        ],
    },

    sebo_verdura: {
        messages: [
            'Ese alimento no pertenece al grupo de las verduras. ¡Busca su categoría correcta!',
            'Recuerda que las verduras son partes vegetales como raíces, hojas y tallos.',
            '¡Atención! Ese alimento pertenece a otro grupo del plato del buen comer.',
        ],
    },

    sebo_fruta: {
        messages: [
            'Ese alimento no es una fruta. Las frutas crecen a partir del ovario de la flor.',
            '¡Recuerda! Las frutas contienen semillas y se desarrollan del ovario de la flor.',
            'Ese alimento tiene su propio grupo. ¡Sigue buscando su lugar correcto!',
        ],
    },

    // ── Nivel 2: Cereales y Leguminosas ───────────────────────────────────────

    cereal_leguminosa: {
        messages: [
            'Los cereales son semillas de gramíneas como el trigo, maíz y arroz. ¡Van en otro segmento!',
            'Recuerda que los cereales aportan carbohidratos complejos como fuente de energía.',
            'Los cereales tienen almidón, mientras que las leguminosas son ricas en proteínas vegetales.',
            '¡Dato! Los cereales se obtienen de plantas de la familia de las gramíneas.',
        ],
    },

    leguminosa_cereal: {
        messages: [
            'Las leguminosas son semillas que crecen en vainas: frijoles, lentejas, garbanzos.',
            'Recuerda que las leguminosas aportan proteínas vegetales y fibra.',
            'Las leguminosas pertenecen a la familia Fabaceae, diferente a las gramíneas.',
            '¡Dato! Las leguminosas son una de las mejores fuentes de proteína de origen vegetal.',
        ],
    },

    sebo_cereal: {
        messages: [
            'Ese alimento no pertenece al grupo de los cereales. ¡Revisa su categoría!',
            'Los cereales son granos de gramíneas. Ese alimento tiene otro origen.',
        ],
    },

    sebo_leguminosa: {
        messages: [
            'Ese alimento no es una leguminosa. Las leguminosas crecen en vainas.',
            'Recuerda que las leguminosas incluyen frijoles, lentejas y garbanzos.',
        ],
    },

    // ── Nivel 3: Alimentos de Origen Animal ───────────────────────────────────

    chatarra_animal: {
        messages: [
            'Los alimentos de origen animal provienen de animales: carnes, huevos, lácteos y pescados.',
            'Recuerda que los alimentos de origen animal son fuente de proteínas completas.',
            '¡Atención! Los alimentos chatarra tienen poco valor nutricional. ¡No confundas!',
        ],
    },

    animal_chatarra: {
        messages: [
            'Ese alimento de origen animal aporta proteínas, vitaminas y minerales importantes.',
            'Recuerda que los alimentos de origen animal incluyen carnes, huevos y lácteos.',
        ],
    },

    // ── Fallback genérico ─────────────────────────────────────────────────────

    default: {
        messages: [
            'Ese alimento no corresponde a esa categoría. ¡Revisa bien y vuelve a intentarlo!',
            '¡Casi! Pero ese alimento va en otro segmento del plato.',
            'Cada alimento tiene su lugar en el plato del buen comer. ¡Sigue intentando!',
            'Recuerda clasificar cada alimento según su tipo. ¡Tú puedes lograrlo!',
        ],
    },
};

/** Tracks the index last shown per key to avoid consecutive repeats. */
const lastShownIndex: Record<string, number> = {};

/**
 * Returns a non-repeating random educational message for the given error.
 *
 * @param itemCategory   Internal game category of the dragged food  (e.g. 'fruta', 'verdura')
 * @param zoneCategory   Internal game category of the drop zone      (e.g. 'verdura', 'fruta')
 */
export function getErrorMessage(itemCategory: string, zoneCategory: string): string {
    const key   = `${itemCategory}_${zoneCategory}`;
    const entry = errorData[key] ?? errorData['default']!;
    const msgs  = entry.messages;

    if (msgs.length === 1) return msgs[0]!;

    const last = lastShownIndex[key] ?? -1;
    let idx: number;
    do { idx = Math.floor(Math.random() * msgs.length); } while (idx === last);

    lastShownIndex[key] = idx;
    return msgs[idx]!;
}
