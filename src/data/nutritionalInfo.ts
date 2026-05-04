export interface FoodItem {
    id: string;
    name: string;
    nameES: string;
    category: 'fruit' | 'vegetable';
    image: string;
    description: string;
}

export const nutritionalInfo: FoodItem[] = [
    // VERDURAS
    {
        id: 'artichoke',
        name: 'Artichoke',
        nameES: 'Alcachofa',
        category: 'vegetable',
        image: '/verduras/artichoke.png',
        description: 'Rica en fibra, magnesio y vitamina C. Contiene compuestos antioxidantes que ayudan a proteger el hígado y mejorar la digestión.'
    },
    {
        id: 'bok_choy',
        name: 'Bok Choy',
        nameES: 'Bok Choy',
        category: 'vegetable',
        image: '/verduras/pakchoi.png',
        description: 'Vegetal de hoja verde con alto contenido de vitaminas A, C y K. Excelente fuente de calcio y antioxidantes para fortalecer huesos y sistema inmune.'
    },
    {
        id: 'broccoli',
        name: 'Broccoli',
        nameES: 'Brócoli',
        category: 'vegetable',
        image: '/verduras/broccoli.png',
        description: 'Una porción aporta el 135% de vitamina C y 245% de vitamina K diaria. Es excelente fuente de fibra, folato y compuestos antiinflamatorios que protegen el corazón.'
    },
    {
        id: 'cabbage',
        name: 'Cabbage',
        nameES: 'Col',
        category: 'vegetable',
        image: '/verduras/cabbage.png',
        description: 'Bajo en calorías y rico en vitamina C, K y antioxidantes. Su alto contenido de fibra promueve la salud digestiva y ayuda a reducir la inflamación.'
    },
    {
        id: 'carrot',
        name: 'Carrot',
        nameES: 'Zanahoria',
        category: 'vegetable',
        image: '/verduras/carrot.png',
        description: 'Rica en beta-caroteno que el cuerpo convierte en vitamina A para la salud visual. Una porción mediana aporta el 93% de la vitamina A diaria necesaria.'
    },
    {
        id: 'cucumber',
        name: 'Cucumber',
        nameES: 'Pepino',
        category: 'vegetable',
        image: '/verduras/cucumber.png',
        description: 'Compuesto por 95% de agua, ideal para mantener la hidratación. Contiene vitamina K, C y potasio con muy pocas calorías (16 por taza).'
    },
    {
        id: 'daikon',
        name: 'Daikon',
        nameES: 'Daikon',
        category: 'vegetable',
        image: '/verduras/daikon.png',
        description: 'Rábano japonés bajo en calorías y rico en vitamina C y enzimas digestivas. Contiene compuestos que ayudan a desintoxicar el cuerpo y mejorar la salud intestinal.'
    },
    {
        id: 'ginger',
        name: 'Ginger',
        nameES: 'Jengibre',
        category: 'vegetable',
        image: '/verduras/ginger.png',
        description: 'Posee propiedades antiinflamatorias y antioxidantes potentes. Ayuda a reducir náuseas, mejorar la digestión y fortalecer el sistema inmune.'
    },
    {
        id: 'green_bean',
        name: 'Green Bean',
        nameES: 'Judías Verdes',
        category: 'vegetable',
        image: '/verduras/greenbean.png',
        description: 'Buena fuente de fibra, vitamina C, K y folato. Bajas en calorías y ricas en antioxidantes que protegen la salud celular.'
    },
    {
        id: 'lettuce',
        name: 'Lettuce',
        nameES: 'Lechuga',
        category: 'vegetable',
        image: '/verduras/lettuce.png',
        description: 'Compuesta por 95% de agua, aporta vitamina A (23% DV) y K (47% DV). Ayuda a mantener la hidratación y aporta pocas calorías por porción.'
    },
    {
        id: 'onion',
        name: 'Onion',
        nameES: 'Cebolla',
        category: 'vegetable',
        image: '/verduras/onion.png',
        description: 'Rica en antioxidantes como la quercetina que reduce la inflamación. Contiene compuestos azufrados que benefician la salud cardíaca y la respuesta inmune.'
    },
    {
        id: 'parsnip',
        name: 'Parsnip',
        nameES: 'Chirivía',
        category: 'vegetable',
        image: '/verduras/parsnip.png',
        description: 'Raíz rica en fibra, vitamina C, folato y potasio. Su contenido de antioxidantes ayuda a reducir la inflamación y apoya la salud digestiva.'
    },
    {
        id: 'peas',
        name: 'Peas',
        nameES: 'Guisantes',
        category: 'vegetable',
        image: '/verduras/peas.png',
        description: 'Buena fuente de proteína vegetal, fibra y vitamina K. Ricos en micronutrientes como manganeso, tiamina y folato para la salud celular.'
    },
    {
        id: 'pepper_bell',
        name: 'Bell Pepper',
        nameES: 'Pimiento',
        category: 'vegetable',
        image: '/verduras/bell-pepper.png',
        description: 'Extremadamente rico en vitamina C (más que una naranja). Contiene antioxidantes carotenoides que protegen la salud ocular y reducen la inflamación.'
    },
    {
        id: 'pepper_chili',
        name: 'Chili Pepper',
        nameES: 'Chile',
        category: 'vegetable',
        image: '/verduras/chili.png',
        description: 'Contiene capsaicina que acelera el metabolismo y reduce el apetito. Rico en vitamina C y compuestos antiinflamatorios que benefician el corazón.'
    },
    {
        id: 'potato',
        name: 'Potato',
        nameES: 'Papa',
        category: 'vegetable',
        image: '/cerealesTuberculos/potato.png',
        description: 'Buena fuente de potasio, vitamina C y vitamina B6. Al cocinarse con cáscara aporta fibra y antioxidantes que benefician la salud digestiva.'
    },
    {
        id: 'radish',
        name: 'Radish',
        nameES: 'Rábano',
        category: 'vegetable',
        image: '/verduras/radish.png',
        description: 'Bajo en calorías y rico en vitamina C, potasio y antioxidantes. Contiene compuestos que apoyan la salud hepática y la digestión saludable.'
    },
    {
        id: 'yam',
        name: 'Yam',
        nameES: 'Ñame',
        category: 'vegetable',
        image: '/verduras/yam.png',
        description: 'Rica en potasio, manganeso y vitamina B6 para la salud neuromuscular. Su alto contenido de fibra ayuda a regular los niveles de azúcar en sangre.'
    },
    {
        id: 'zucchini',
        name: 'Zucchini',
        nameES: 'Calabacín',
        category: 'vegetable',
        image: '/verduras/zucchini_green.png',
        description: 'Baja en calorías y rica en vitamina A, C y manganeso. Contiene antioxidantes que protegen el corazón y apoyan la salud digestiva.'
    },
    // FRUTAS
    {
        id: 'banana',
        name: 'Banana',
        nameES: 'Plátano',
        category: 'fruit',
        image: '/frutas/bananas.png',
        description: 'Rica en potasio (422mg por unidad) que regula la presión arterial y función cardíaca. También aporta vitamina B6, vitamina C y fibra para la salud digestiva.'
    },
    {
        id: 'blackberry',
        name: 'Blackberry',
        nameES: 'Mora',
        category: 'fruit',
        image: '/frutas/blackberry.png',
        description: 'Rica en antioxidantes, vitamina C y fibra (8g por taza). Sus antocianinas ayudan a reducir la inflamación y proteger la salud cerebral.'
    },
    {
        id: 'blueberry',
        name: 'Blueberry',
        nameES: 'Arándano',
        category: 'fruit',
        image: '/frutas/blueberry.png',
        description: 'Una de las frutas más ricas en antioxidantes que protegen el corazón. Aporta vitamina C, K y fibra para mejorar la memoria y salud cognitiva.'
    },
    {
        id: 'cherry',
        name: 'Cherry',
        nameES: 'Cereza',
        category: 'fruit',
        image: '/frutas/cherry.png',
        description: 'Rica en antocianinas y antioxidantes antiinflamatorios. Ayuda a reducir el dolor muscular, mejora la calidad del sueño y protege la salud cardíaca.'
    },
    {
        id: 'coconut',
        name: 'Coconut',
        nameES: 'Coco',
        category: 'fruit',
        image: '/frutas/half-coconut.png',
        description: 'Rica en grasas saludables de cadena media (ácido láurico) que apoyan la función cerebral. Aporta fibra, manganeso y energía rápida para el organismo.'
    },
    {
        id: 'eggplant',
        name: 'Eggplant',
        nameES: 'Berenjena',
        category: 'fruit',
        image: '/frutas/eggplant.png',
        description: 'Baja en calorías y rica en fibra, potasio y antioxidantes (nasunina). Beneficia la salud cardíaca y ayuda a regular los niveles de azúcar.'
    },
    {
        id: 'apple',
        name: 'Apple',
        nameES: 'Manzana',
        category: 'fruit',
        image: '/frutas/apple.png',
        description: 'Rica en fibra pectina y antioxidantes como la quercetina. Estudios sugieren que reduce el colesterol LDL y ayuda a regular los niveles de azúcar.'
    },
    {
        id: 'grape',
        name: 'Grape',
        nameES: 'Uva',
        category: 'fruit',
        image: '/frutas/grapes.png',
        description: 'Rica en antioxidantes resveratrol que protegen el corazón y reducen la inflamación. Sus polifenoles apoyan la salud cerebral y la función cognitiva.'
    },
    {
        id: 'kiwi',
        name: 'Kiwi',
        nameES: 'Kiwi',
        category: 'fruit',
        image: '/frutas/kiwi.png',
        description: 'Extremadamente rica en vitamina C (más que una naranja). Contiene fibra, potasio y antioxidantes que apoyan la salud digestiva e inmune.'
    },
    {
        id: 'lemon',
        name: 'Lemon',
        nameES: 'Limón',
        category: 'fruit',
        image: '/frutas/lemon.png',
        description: 'Rica fuente de vitamina C que fortalece el sistema inmune y mejora la absorción de hierro. Sus flavonoides ayudan a reducir la inflamación y proteger el corazón.'
    },
    {
        id: 'lime',
        name: 'Lime',
        nameES: 'Lima',
        category: 'fruit',
        image: '/frutas/lime.png',
        description: 'Rica en vitamina C, antioxidantes y compuestos que apoyan la hidratación. Ayuda a mejorar la digestión y fortalece las defensas del organismo.'
    },
    {
        id: 'olive',
        name: 'Olive',
        nameES: 'Aceituna',
        category: 'fruit',
        image: '/frutas/olive.png',
        description: 'Rica en grasas monoinsaturadas saludables para el corazón. Contiene vitamina E y polifenoles antioxidantes que reducen la inflamación crónica.'
    },
    {
        id: 'orange',
        name: 'Orange',
        nameES: 'Naranja',
        category: 'fruit',
        image: '/frutas/orange.png',
        description: 'Una naranja mediana aporta el 92% de la vitamina C diaria necesaria. También es buena fuente de folato, potasio y fibra para la salud cardiovascular.'
    },
    {
        id: 'peach',
        name: 'Peach',
        nameES: 'Durazno',
        category: 'fruit',
        image: '/frutas/peach.png',
        description: 'Rica en vitamina C, A y fibra para la salud digestiva. Sus antioxidantes ayudan a proteger la piel y reducir la inflamación celular.'
    },
    {
        id: 'pear',
        name: 'Pear',
        nameES: 'Pera',
        category: 'fruit',
        image: '/frutas/pear.png',
        description: 'Excelente fuente de fibra pectina (4g por fruta) que mejora la digestión. Rica en antioxidantes y vitamina C para fortalecer el sistema inmune.'
    },
    {
        id: 'pineapple',
        name: 'Pineapple',
        nameES: 'Piña',
        category: 'fruit',
        image: '/frutas/pineapple.png',
        description: 'Rica en bromelina, una enzima que ayuda a la digestión y reduce la inflamación. Aporta vitamina C, manganeso y compuestos antiinflamatorios.'
    },
    {
        id: 'plum',
        name: 'Plum',
        nameES: 'Ciruela',
        category: 'fruit',
        image: '/frutas/plum.png',
        description: 'Rica en vitamina C, K y antioxidantes que protegen el corazón. Su contenido de fibra ayuda a regular el tránsito intestinal y mejorar la digestión.'
    },
    {
        id: 'raspberry',
        name: 'Raspberry',
        nameES: 'Frambuesa',
        category: 'fruit',
        image: '/frutas/raspberry.png',
        description: 'Rica en fibra (8g por taza) y antioxidantes que reducen la inflamación. Sus elagitaninos pueden ayudar a proteger contra enfermedades cardiovasculares.'
    },
    {
        id: 'star_fruit',
        name: 'Star Fruit',
        nameES: 'Carambola',
        category: 'fruit',
        image: '/frutas/starfruit.png',
        description: 'Baja en calorías y rica en vitamina C, fibra y antioxidantes. Contiene compuestos que apoyan la salud metabólica y ayudan a regular el azúcar.'
    },
    {
        id: 'strawberry',
        name: 'Strawberry',
        nameES: 'Fresa',
        category: 'fruit',
        image: '/frutas/strawberry.png',
        description: 'Una taza aporta el 113% de la vitamina C diaria necesaria. Rica en manganeso, fibra y antocianinas que protegen el corazón y el cerebro.'
    },
    {
        id: 'tomato',
        name: 'Tomato',
        nameES: 'Tomate',
        category: 'fruit',
        image: '/frutas/tomato.png',
        description: 'Rico en licopeno, antioxidante que protege contra el cáncer y enfermedades cardíacas. Aporta vitamina C, K y potasio para la salud general.'
    },
    {
        id: 'watermelon',
        name: 'Watermelon',
        nameES: 'Sandía',
        category: 'fruit',
        image: '/frutas/watermelon.png',
        description: 'Rica en licopeno y vitamina C para la salud cardíaca. Su alto contenido de agua (92%) ayuda a mantener la hidratación óptima.'
    }
];