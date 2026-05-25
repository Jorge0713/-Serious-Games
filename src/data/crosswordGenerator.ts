export interface WordConfig {
    id: string;
    answer: string;
    hint: string;
    startX: number;
    startY: number;
    horizontal: boolean;
}

export const CROSSWORD_DICTIONARY = [
    { answer: 'CARBOHIDRATOS', hint: 'Principal fuente de energía del cuerpo, como el pan o la pasta.' },
    { answer: 'MANZANA', hint: 'Fruta roja, verde o amarilla, muy común y saludable.' },
    { answer: 'PROTEINAS', hint: 'Ayudan a formar músculos; se encuentran en carne, huevo y leguminosas.' },
    { answer: 'CALORIAS', hint: 'Medida de la energía que nos aportan los alimentos.' },
    { answer: 'ENERGIA', hint: 'Lo que nos da la comida para poder jugar, correr y pensar.' },
    { answer: 'HIDRATACION', hint: 'Acción de tomar suficiente agua para mantener el cuerpo sano.' },
    { answer: 'BROCOLI', hint: 'Vegetal verde que parece un arbolito.' },
    { answer: 'VERDURAS', hint: 'Alimentos ricos en vitaminas y minerales, como la zanahoria y el brócoli.' },
    { answer: 'CEREALES', hint: 'Alimentos como el arroz, trigo y avena que nos dan energía.' },
    { answer: 'FRUTA', hint: 'Alimento dulce natural, como la manzana o el plátano.' },
    { answer: 'LEGUMINOSAS', hint: 'Semillas como frijoles y lentejas, ricas en proteínas.' },
    { answer: 'ZANAHORIA', hint: 'Verdura anaranjada que ayuda a la vista.' },
    { answer: 'PEPINO', hint: 'Verdura verde y muy refrescante, casi todo es agua.' },
    { answer: 'LECHUGA', hint: 'Hoja verde muy común en las ensaladas.' },
    { answer: 'CEBOLLA', hint: 'Verdura que da mucho sabor, a veces hace llorar al cortarla.' },
    { answer: 'CHILE', hint: 'Da un sabor picante a la comida.' },
    { answer: 'PLATANO', hint: 'Fruta amarilla, larga y rica en potasio.' },
    { answer: 'COCO', hint: 'Fruta tropical con agua refrescante en su interior.' },
    { answer: 'LIMON', hint: 'Cítrico verde o amarillo de sabor muy ácido.' },
    { answer: 'NARANJA', hint: 'Fruta cítrica redonda, excelente fuente de vitamina C.' },
    { answer: 'DURAZNO', hint: 'Fruta dulce con piel suave y un hueso grande en el centro.' },
    { answer: 'PERA', hint: 'Fruta jugosa, verde o amarilla, con forma de campana.' },
    { answer: 'TOMATE', hint: 'Fruta roja usada como verdura en salsas y ensaladas.' },
    { answer: 'SANDIA', hint: 'Fruta grande, verde por fuera y roja por dentro, con mucha agua.' },
    { answer: 'JENGIBRE', hint: 'Raíz con sabor picante, usada para té o dar sabor.' },
    { answer: 'AVENA', hint: 'Cereal muy nutritivo, ideal para el desayuno.' },
    { answer: 'ARROZ', hint: 'Cereal blanco o integral, base de la alimentación en muchos países.' },
    { answer: 'PAPA', hint: 'Tubérculo que crece bajo tierra, muy versátil en la cocina.' },
    { answer: 'HUEVO', hint: 'Alimento rico en proteínas, viene de la gallina.' },
    { answer: 'POLLO', hint: 'Carne blanca muy popular y versátil.' },
    { answer: 'PESCADO', hint: 'Carne de animales acuáticos, rica en omega 3.' },
    { answer: 'QUESO', hint: 'Derivado de la leche, hay de muchos tipos y sabores.' },
    { answer: 'TOCINO', hint: 'Carne de cerdo con mucha grasa, se come frito.' },
    { answer: 'FRIJOL', hint: 'Leguminosa muy consumida en México, de diferentes colores.' },
    { answer: 'LENTEJA', hint: 'Leguminosa pequeña, en forma de disco, rica en hierro.' },
    { answer: 'CACAHUATES', hint: 'Semilla que crece bajo tierra, se come como botana o crema.' }
];

export function generateDynamicCrossword(maxWords: number = 7): WordConfig[] {
    let bestGrid: WordConfig[] = [];

    // Intentar varias veces para obtener el crucigrama más denso posible
    for (let attempt = 0; attempt < 10; attempt++) {
        const pool = [...CROSSWORD_DICTIONARY].sort(() => Math.random() - 0.5);
        const placed: WordConfig[] = [];
        const grid: Map<string, string> = new Map();

        const addWord = (wordObj: {answer: string, hint: string}, startX: number, startY: number, horizontal: boolean) => {
            const id = (placed.length + 1) + (horizontal ? 'H' : 'V');
            placed.push({ ...wordObj, id, startX, startY, horizontal });
            for (let i = 0; i < wordObj.answer.length; i++) {
                const x = horizontal ? startX + i : startX;
                const y = horizontal ? startY : startY + i;
                grid.set(`${x},${y}`, wordObj.answer[i]);
            }
        };

        function canPlace(word: string, startX: number, startY: number, horizontal: boolean): boolean {
            let intersections = 0;
            for (let i = 0; i < word.length; i++) {
                const x = horizontal ? startX + i : startX;
                const y = horizontal ? startY : startY + i;
                const key = `${x},${y}`;
                const cellLetter = grid.get(key);

                if (cellLetter) {
                    if (cellLetter !== word[i]) return false; // Clash
                    intersections++;
                } else {
                    // Check adjacent cells
                    const adj1 = horizontal ? `${x},${y - 1}` : `${x - 1},${y}`;
                    const adj2 = horizontal ? `${x},${y + 1}` : `${x + 1},${y}`;
                    if (grid.has(adj1) || grid.has(adj2)) return false;
                }
            }

            // Check ends of the word
            const beforeX = horizontal ? startX - 1 : startX;
            const beforeY = horizontal ? startY : startY - 1;
            if (grid.has(`${beforeX},${beforeY}`)) return false;

            const afterX = horizontal ? startX + word.length : startX;
            const afterY = horizontal ? startY : startY + word.length;
            if (grid.has(`${afterX},${afterY}`)) return false;

            return intersections > 0 || placed.length === 0;
        }

        // Place first word
        if (pool.length > 0) {
            addWord(pool[0], 0, 0, true);
            pool.splice(0, 1);
        }

        // Try placing remaining words
        for (const wordObj of pool) {
            if (placed.length >= maxWords) break;

            const word = wordObj.answer;
            let bestPlacement: { x: number, y: number, horizontal: boolean, score: number } | null = null;

            for (const p of placed) {
                for (let i = 0; i < word.length; i++) {
                    // Saltar la primera letra de la palabra nueva para evitar ambigüedad de inicio
                    if (i === 0) continue;

                    const char = word[i];
                    for (let j = 0; j < p.answer.length; j++) {
                        // Saltar la primera letra de la palabra ya colocada para evitar ambigüedad de inicio
                        if (j === 0) continue;

                        if (p.answer[j] === char) {                            const intersectX = p.horizontal ? p.startX + j : p.startX;
                            const intersectY = p.horizontal ? p.startY : p.startY + j;

                            const horizontal = !p.horizontal;
                            const startX = horizontal ? intersectX - i : intersectX;
                            const startY = horizontal ? intersectY : intersectY - i;

                            if (canPlace(word, startX, startY, horizontal)) {
                                const score = Math.abs(startX) + Math.abs(startY);
                                if (!bestPlacement || score < bestPlacement.score) {
                                    bestPlacement = { x: startX, y: startY, horizontal, score };
                                }
                            }
                        }
                    }
                }
            }

            if (bestPlacement) {
                addWord(wordObj, bestPlacement.x, bestPlacement.y, bestPlacement.horizontal);
            }
        }

        // Normalize coordinates
        let minX = Infinity, minY = Infinity;
        for (const p of placed) {
            if (p.startX < minX) minX = p.startX;
            if (p.startY < minY) minY = p.startY;
        }
        for (const p of placed) {
            p.startX -= minX;
            p.startY -= minY;
        }

        // Si este intento logró colocar más palabras que el anterior, lo guardamos
        if (placed.length > bestGrid.length) {
            bestGrid = placed;
        }

        // Si ya conseguimos el máximo de palabras deseadas, terminamos la búsqueda
        if (bestGrid.length === maxWords) {
            break;
        }
    }

    return bestGrid;
}
