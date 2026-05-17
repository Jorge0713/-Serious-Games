export type FoodCategory ='fruit' | 'vegetable' | 'legume' | 'cereal' | 'animal';

export interface FoodItem {
    id: string;
    name: string;
    nameES: string;
    category: FoodCategory;
    image: string;
    description: string;
}

export const nutritionalInfo: FoodItem[] = [
    // ==========================================
    // Vegetales (vegetable)
    // ==========================================    
    {
        id: 'artichoke',
        name: 'Artichoke',
        nameES: 'Alcachofa',
        category: 'vegetable',
        image: 'iconsFood/verduras/artichoke.png',
        description: 'Rica en fibra, magnesio y vitamina C. Contiene compuestos antioxidantes que ayudan a proteger el hígado y mejorar la digestión.'
    },
    {
        id: 'bok_choy',
        name: 'Bok Choy',
        nameES: 'Bok Choy',
        category: 'vegetable',
        image: 'iconsFood/verduras/pakchoi.png',
        description: 'Vegetal de hoja verde con alto contenido de vitaminas A, C y K. Excelente fuente de calcio y antioxidantes para fortalecer huesos y sistema inmune.'
    },
    {
        id: 'broccoli',
        name: 'Broccoli',
        nameES: 'Brócoli',
        category: 'vegetable',
        image: 'iconsFood/verduras/broccoli.png',
        description: 'Una porción aporta el 135% de vitamina C y 245% de vitamina K diaria. Es excelente fuente de fibra, folato y compuestos antiinflamatorios que protegen el corazón.'
    },
    {
        id: 'cabbage',
        name: 'Cabbage',
        nameES: 'Col',
        category: 'vegetable',
        image: 'iconsFood/verduras/cabbage.png',
        description: 'Bajo en calorías y rico en vitamina C, K y antioxidantes. Su alto contenido de fibra promueve la salud digestiva y ayuda a reducir la inflamación.'
    },
    {
        id: 'carrot',
        name: 'Carrot',
        nameES: 'Zanahoria',
        category: 'vegetable',
        image: 'iconsFood/verduras/carrot.png',
        description: 'Rica en beta-caroteno que el cuerpo convierte en vitamina A para la salud visual. Una porción mediana aporta el 93% de la vitamina A diaria necesaria.'
    },
    {
        id: 'cucumber',
        name: 'Cucumber',
        nameES: 'Pepino',
        category: 'vegetable',
        image: 'iconsFood/verduras/cucumber.png',
        description: 'Compuesto por 95% de agua, ideal para mantener la hidratación. Contiene vitamina K, C y potasio con muy pocas calorías (16 por taza).'
    },
    {
        id: 'daikon',
        name: 'Daikon',
        nameES: 'Daikon',
        category: 'vegetable',
        image: 'iconsFood/verduras/daikon.png',
        description: 'Rábano japonés bajo en calorías y rico en vitamina C y enzimas digestivas. Contiene compuestos que ayudan a desintoxicar el cuerpo y mejorar la salud intestinal.'
    },
    {
        id: 'ginger',
        name: 'Ginger',
        nameES: 'Jengibre',
        category: 'vegetable',
        image: 'iconsFood/verduras/ginger.png',
        description: 'Posee propiedades antiinflamatorias y antioxidantes potentes. Ayuda a reducir náuseas, mejorar la digestión y fortalecer el sistema inmune.'
    },
    {
        id: 'green_bean',
        name: 'Green Bean',
        nameES: 'Judías Verdes',
        category: 'vegetable',
        image: 'iconsFood/verduras/greenbean.png',
        description: 'Buena fuente de fibra, vitamina C, K y folato. Bajas en calorías y ricas en antioxidantes que protegen la salud celular.'
    },
    {
        id: 'lettuce',
        name: 'Lettuce',
        nameES: 'Lechuga',
        category: 'vegetable',
        image: 'iconsFood/verduras/lettuce.png',
        description: 'Compuesta por 95% de agua, aporta vitamina A (23% DV) y K (47% DV). Ayuda a mantener la hidratación y aporta pocas calorías por porción.'
    },
    {
        id: 'onion',
        name: 'Onion',
        nameES: 'Cebolla',
        category: 'vegetable',
        image: 'iconsFood/verduras/onion.png',
        description: 'Rica en antioxidantes como la quercetina que reduce la inflamación. Contiene compuestos azufrados que benefician la salud cardíaca y la respuesta inmune.'
    },
    {
        id: 'parsnip',
        name: 'Parsnip',
        nameES: 'Chirivía',
        category: 'vegetable',
        image: 'iconsFood/verduras/parsnip.png',
        description: 'Raíz rica en fibra, vitamina C, folato y potasio. Su contenido de antioxidantes ayuda a reducir la inflamación y apoya la salud digestiva.'
    },
    {
        id: 'pepper_bell',
        name: 'Bell Pepper',
        nameES: 'Pimiento',
        category: 'vegetable',
        image: 'iconsFood/verduras/bell-pepper.png',
        description: 'Extremadamente rico en vitamina C (más que una naranja). Contiene antioxidantes carotenoides que protegen la salud ocular y reducen la inflamación.'
    },
    {
        id: 'pepper_chili',
        name: 'Chili Pepper',
        nameES: 'Chile',
        category: 'vegetable',
        image: 'iconsFood/verduras/chili.png',
        description: 'Contiene capsaicina que acelera el metabolismo y reduce el apetito. Rico en vitamina C y compuestos antiinflamatorios que benefician el corazón.'
    },
    {
        id: 'radish',
        name: 'Radish',
        nameES: 'Rábano',
        category: 'vegetable',
        image: 'iconsFood/verduras/radish.png',
        description: 'Bajo en calorías y rico en vitamina C, potasio y antioxidantes. Contiene compuestos que apoyan la salud hepática y la digestión saludable.'
    },
    {
        id: 'yam',
        name: 'Yam',
        nameES: 'Ñame',
        category: 'vegetable',
        image: 'iconsFood/verduras/yam.png',
        description: 'Rica en potasio, manganeso y vitamina B6 para la salud neuromuscular. Su alto contenido de fibra ayuda a regular los niveles de azúcar en sangre.'
    },
    {
        id: 'zucchini',
        name: 'Zucchini',
        nameES: 'Calabacín',
        category: 'vegetable',
        image: 'iconsFood/verduras/zucchini_green.png',
        description: 'Baja en calorías y rica en vitamina A, C y manganeso. Contiene antioxidantes que protegen el corazón y apoyan la salud digestiva.'
    },
    // ==========================================
    // Frutas (fruit)
    // ==========================================
    {
        id: 'banana',
        name: 'Banana',
        nameES: 'Plátano',
        category: 'fruit',
        image: 'iconsFood/frutas/bananas.png',
        description: 'Rica en potasio (422mg por unidad) que regula la presión arterial y función cardíaca. También aporta vitamina B6, vitamina C y fibra para la salud digestiva.'
    },
    {
        id: 'blackberry',
        name: 'Blackberry',
        nameES: 'Mora',
        category: 'fruit',
        image: 'iconsFood/frutas/blackberry.png',
        description: 'Rica en antioxidantes, vitamina C y fibra (8g por taza). Sus antocianinas ayudan a reducir la inflamación y proteger la salud cerebral.'
    },
    {
        id: 'blueberry',
        name: 'Blueberry',
        nameES: 'Arándano',
        category: 'fruit',
        image: 'iconsFood/frutas/blueberry.png',
        description: 'Una de las frutas más ricas en antioxidantes que protegen el corazón. Aporta vitamina C, K y fibra para mejorar la memoria y salud cognitiva.'
    },
    {
        id: 'cherry',
        name: 'Cherry',
        nameES: 'Cereza',
        category: 'fruit',
        image: 'iconsFood/frutas/cherry.png',
        description: 'Rica en antocianinas y antioxidantes antiinflamatorios. Ayuda a reducir el dolor muscular, mejora la calidad del sueño y protege la salud cardíaca.'
    },
    {
        id: 'coconut',
        name: 'Coconut',
        nameES: 'Coco',
        category: 'fruit',
        image: 'iconsFood/frutas/half-coconut.png',
        description: 'Rica en grasas saludables de cadena media (ácido láurico) que apoyan la función cerebral. Aporta fibra, manganeso y energía rápida para el organismo.'
    },
    {
        id: 'eggplant',
        name: 'Eggplant',
        nameES: 'Berenjena',
        category: 'fruit',
        image: 'iconsFood/frutas/eggplant.png',
        description: 'Baja en calorías y rica en fibra, potasio y antioxidantes (nasunina). Beneficia la salud cardíaca y ayuda a regular los niveles de azúcar.'
    },
    {
        id: 'apple',
        name: 'Apple',
        nameES: 'Manzana',
        category: 'fruit',
        image: 'iconsFood/frutas/apple.png',
        description: 'Rica en fibra pectina y antioxidantes como la quercetina. Estudios sugieren que reduce el colesterol LDL y ayuda a regular los niveles de azúcar.'
    },
    {
        id: 'grape',
        name: 'Grape',
        nameES: 'Uva',
        category: 'fruit',
        image: 'iconsFood/frutas/grapes.png',
        description: 'Rica en antioxidantes resveratrol que protegen el corazón y reducen la inflamación. Sus polifenoles apoyan la salud cerebral y la función cognitiva.'
    },
    {
        id: 'kiwi',
        name: 'Kiwi',
        nameES: 'Kiwi',
        category: 'fruit',
        image: 'iconsFood/frutas/kiwi.png',
        description: 'Extremadamente rica en vitamina C (más que una naranja). Contiene fibra, potasio y antioxidantes que apoyan la salud digestiva e inmune.'
    },
    {
        id: 'lemon',
        name: 'Lemon',
        nameES: 'Limón',
        category: 'fruit',
        image: 'iconsFood/frutas/lemon.png',
        description: 'Rica fuente de vitamina C que fortalece el sistema inmune y mejora la absorción de hierro. Sus flavonoides ayudan a reducir la inflamación y proteger el corazón.'
    },
    {
        id: 'lime',
        name: 'Lime',
        nameES: 'Lima',
        category: 'fruit',
        image: 'iconsFood/frutas/lime.png',
        description: 'Rica en vitamina C, antioxidantes y compuestos que apoyan la hidratación. Ayuda a mejorar la digestión y fortalece las defensas del organismo.'
    },
    {
        id: 'olive',
        name: 'Olive',
        nameES: 'Aceituna',
        category: 'fruit',
        image: 'iconsFood/frutas/olive.png',
        description: 'Rica en grasas monoinsaturadas saludables para el corazón. Contiene vitamina E y polifenoles antioxidantes que reducen la inflamación crónica.'
    },
    {
        id: 'orange',
        name: 'Orange',
        nameES: 'Naranja',
        category: 'fruit',
        image: 'iconsFood/frutas/orange.png',
        description: 'Una naranja mediana aporta el 92% de la vitamina C diaria necesaria. También es buena fuente de folato, potasio y fibra para la salud cardiovascular.'
    },
    {
        id: 'peach',
        name: 'Peach',
        nameES: 'Durazno',
        category: 'fruit',
        image: 'iconsFood/frutas/peach.png',
        description: 'Rica en vitamina C, A y fibra para la salud digestiva. Sus antioxidantes ayudan a proteger la piel y reducir la inflamación celular.'
    },
    {
        id: 'pear',
        name: 'Pear',
        nameES: 'Pera',
        category: 'fruit',
        image: 'iconsFood/frutas/pear.png',
        description: 'Excelente fuente de fibra pectina (4g por fruta) que mejora la digestión. Rica en antioxidantes y vitamina C para fortalecer el sistema inmune.'
    },
    {
        id: 'pineapple',
        name: 'Pineapple',
        nameES: 'Piña',
        category: 'fruit',
        image: 'iconsFood/frutas/pineapple.png',
        description: 'Rica en bromelina, una enzima que ayuda a la digestión y reduce la inflamación. Aporta vitamina C, manganeso y compuestos antiinflamatorios.'
    },
    {
        id: 'plum',
        name: 'Plum',
        nameES: 'Ciruela',
        category: 'fruit',
        image: 'iconsFood/frutas/plum.png',
        description: 'Rica en vitamina C, K y antioxidantes que protegen el corazón. Su contenido de fibra ayuda a regular el tránsito intestinal y mejorar la digestión.'
    },
    {
        id: 'raspberry',
        name: 'Raspberry',
        nameES: 'Frambuesa',
        category: 'fruit',
        image: 'iconsFood/frutas/raspberry.png',
        description: 'Rica en fibra (8g por taza) y antioxidantes que reducen la inflamación. Sus elagitaninos pueden ayudar a proteger contra enfermedades cardiovasculares.'
    },
    {
        id: 'star_fruit',
        name: 'Star Fruit',
        nameES: 'Carambola',
        category: 'fruit',
        image: 'iconsFood/frutas/starfruit.png',
        description: 'Baja en calorías y rica en vitamina C, fibra y antioxidantes. Contiene compuestos que apoyan la salud metabólica y ayudan a regular el azúcar.'
    },
    {
        id: 'strawberry',
        name: 'Strawberry',
        nameES: 'Fresa',
        category: 'fruit',
        image: 'iconsFood/frutas/strawberry.png',
        description: 'Una taza aporta el 113% de la vitamina C diaria necesaria. Rica en manganeso, fibra y antocianinas que protegen el corazón y el cerebro.'
    },
    {
        id: 'tomato',
        name: 'Tomato',
        nameES: 'Tomate',
        category: 'fruit',
        image: 'iconsFood/frutas/tomato.png',
        description: 'Rico en licopeno, antioxidante que protege contra el cáncer y enfermedades cardíacas. Aporta vitamina C, K y potasio para la salud general.'
    },
    {
        id: 'watermelon',
        name: 'Watermelon',
        nameES: 'Sandía',
        category: 'fruit',
        image: 'iconsFood/frutas/watermelon.png',
        description: 'Rica en licopeno y vitamina C para la salud cardíaca. Su alto contenido de agua (92%) ayuda a mantener la hidratación óptima.'
    },
    // ==========================================
    // LEGUMINOSAS (legume)
    // ==========================================
    {
        id: 'beans',
        name: 'Beans',
        nameES: 'Frijoles',
        category: 'legume',
        image: 'iconsFood/leguminosas/beans.png',
        description: 'Excelente fuente de proteína vegetal, fibra y hierro. Ayudan a mantener estables los niveles de azúcar en la sangre y benefician enormemente la microbiota intestinal.'
    },
    {
        id: 'lentils',
        name: 'Lentils',
        nameES: 'Lentejas',
        category: 'legume',
        image: 'iconsFood/leguminosas/lentil.png',
        description: 'Ricas en ácido fólico, hierro, potasio y magnesio. Su alto contenido de fibra promueve la saciedad duradera y favorece la salud del sistema digestivo.'
    },
    {
        id: 'chickpeas',
        name: 'Chickpeas',
        nameES: 'Garbanzos',
        category: 'legume',
        image: 'iconsFood/leguminosas/chickpea.png',
        description: 'Aportan una gran cantidad de vitaminas, minerales y fibra. Son excelentes para la digestión, el control del peso y como fuente de energía sostenida.'
    },
    {
        id: 'peas',
        name: 'Peas',
        nameES: 'Chícharos',
        category: 'legume',
        image: 'iconsFood/leguminosas/green_peas.png',
        description: 'Llenos de antioxidantes y fitonutrientes antiinflamatorios. Son una buena fuente de vitamina C, zinc y proteínas que ayudan a fortalecer el sistema inmunológico.'
    },
    {
        id: 'soybeans',
        name: 'Soybeans',
        nameES: 'Soya',
        category: 'legume',
        image: 'iconsFood/leguminosas/soy.png',
        description: 'Una de las pocas fuentes vegetales que aporta proteína completa. Contiene isoflavonas que pueden reducir el riesgo de enfermedades cardíacas y mejorar la salud ósea.'
    },
    {
        id: 'fava_beans',
        name: 'Fava Beans',
        nameES: 'Habas',
        category: 'legume',
        image: 'iconsFood/leguminosas/broad_beans.png',
        description: 'Ricas en fibra, proteínas y ácido fólico. Ayudan a reducir el colesterol y mejorar la salud del corazón, además de aportar L-dopa, beneficiosa para el sistema nervioso.'
    },
    {
        id: 'peanuts',
        name: 'Peanuts',
        nameES: 'Cacahuates',
        category: 'legume',
        image: 'iconsFood/leguminosas/peanut.png',
        description: 'Aunque a menudo se confunden con nueces, son leguminosas ricas en grasas saludables, proteínas y biotina. Son excelentes para la salud del cerebro y la piel.'
    },
    {
        id: 'mung_beans',
        name: 'Mung Beans',
        nameES: 'Frijol Mungo',
        category: 'legume',
        image: 'iconsFood/leguminosas/mung_beans.png',
        description: 'Destacan por su fácil digestión y alto contenido de antioxidantes. Ricos en potasio y magnesio, son ideales para ayudar a controlar la presión arterial.'
    },
    {
        id: 'feijao_carioca',
        name: 'Carioca Beans',
        nameES: 'Frijol Carioca',
        category: 'legume',
        image: 'iconsFood/leguminosas/feijao_carioca.png',
        description: 'Una de las variedades de frijol más consumidas. Es una excelente fuente de hierro, proteínas vegetales y fibra, ideal para una digestión saludable.'
    },
    {
        id: 'kidney_beans',
        name: 'Kidney Beans',
        nameES: 'Frijol Rojo',
        category: 'legume',
        image: 'iconsFood/leguminosas/kidney_beans.png',
        description: 'Destacan por su alto contenido de antioxidantes, fibra y proteínas. Ayudan a regular el azúcar en la sangre y protegen la salud cardiovascular.'
    },
    {
        id: 'quail_beans',
        name: 'Quail Beans',
        nameES: 'Frijol Pinto',
        category: 'legume',
        image: 'iconsFood/leguminosas/quail_beans.png',
        description: 'Aportan una gran cantidad de ácido fólico y fibra dietética. Son excelentes para mantener la saciedad por horas y mejorar el tránsito intestinal.'
    },
    {
        id: 'runner_beans',
        name: 'Runner Beans',
        nameES: 'Ayocotes',
        category: 'legume',
        image: 'iconsFood/leguminosas/runner_beans.png',
        description: 'Leguminosa de gran tamaño, muy tradicional. Aporta una cantidad importante de proteína, fibra y minerales esenciales como el calcio y el hierro.'
    },
    {
        id: 'runner_beans_white',
        name: 'White Runner Beans',
        nameES: 'Alubias Blancas',
        category: 'legume',
        image: 'iconsFood/leguminosas/runner_beans_white.png',
        description: 'Ricas en potasio, hierro y carbohidratos complejos. Ayudan a reducir el colesterol y a mantener una presión arterial en niveles saludables.'
    },
    {
        id: 'tiger_eye_beans',
        name: 'Tiger Eye Beans',
        nameES: 'Frijol Ojo de Tigre',
        category: 'legume',
        image: 'iconsFood/leguminosas/tiger_eye_beans.png',
        description: 'Variedad muy nutritiva con piel suave. Excelentes para aportar proteínas de origen vegetal y carbohidratos que brindan energía constante al cuerpo.'
    },
    // ==========================================
    // CEREALES Y TUBÉRCULOS (cereal)
    // ==========================================
    {
        id: 'oats',
        name: 'Oats',
        nameES: 'Avena',
        category: 'cereal',
        image: 'iconsFood/cereales/oat.png',
        description: 'Cereal de grano entero excepcionalmente nutritivo. Contiene beta-glucano, una fibra soluble que ayuda a reducir el colesterol y estabilizar el azúcar en la sangre.'
    },
    {
        id: 'rice',
        name: 'Rice',
        nameES: 'Arroz',
        category: 'cereal',
        image: 'iconsFood/cereales/rice.png',
        description: 'Fuente principal de energía gracias a sus carbohidratos. El arroz integral, en particular, conserva su fibra y nutrientes esenciales que favorecen una buena digestión.'
    },
    {
        id: 'corn',
        name: 'Corn',
        nameES: 'Maíz',
        category: 'cereal',
        image: 'iconsFood/cereales/corn_yellow.png',
        description: 'Rico en vitaminas del grupo B y minerales esenciales. Su fibra dietética ayuda al tracto digestivo y sus antioxidantes (luteína) protegen la salud ocular.'
    },
    {
        id: 'wheat',
        name: 'Wheat',
        nameES: 'Trigo',
        category: 'cereal',
        image: 'iconsFood/cereales/wheat.png',
        description: 'Base de muchos alimentos cotidianos. Su versión integral es vital porque aporta fibra, hierro y vitaminas del complejo B, fundamentales para el metabolismo energético.'
    },
    {
        id: 'potato',
        name: 'Potato',
        nameES: 'Papa',
        category: 'cereal',
        image: 'iconsFood/cereales/potato.png',
        description: 'Tubérculo rico en vitamina C, potasio y vitamina B6. Si se consume cocida y con piel (sin freír), es una excelente y saludable fuente de energía y fibra.'
    },
    {
        id: 'quinoa',
        name: 'Quinoa',
        nameES: 'Quinoa',
        category: 'cereal',
        image: 'iconsFood/cereales/quinoa.png',
        description: 'Un pseudocereal que aporta proteína completa (todos los aminoácidos esenciales). Libre de gluten de forma natural, es rica en magnesio, hierro y fibra.'
    },
    {
        id: 'sweet_potato',
        name: 'Sweet Potato',
        nameES: 'Camote',
        category: 'cereal',
        image: 'iconsFood/verduras/camote.png',
        description: 'Tubérculo con un índice glucémico moderado. Destaca por su enorme aporte de betacarotenos (vitamina A), que son vitales para la salud de la vista y la piel.'
    },
    {
        id: 'cassava',
        name: 'Cassava',
        nameES: 'Yuca',
        category: 'cereal',
        image: 'iconsFood/cereales/cassava.png',
        description: 'Excelente fuente de carbohidratos complejos y energía. Contiene vitamina C y almidón resistente que actúa como prebiótico para la flora intestinal.'
    },
    {
        id: 'barley',
        name: 'Barley',
        nameES: 'Cebada',
        category: 'cereal',
        image: 'iconsFood/cereales/barley.png',
        description: 'Destaca por su alta concentración de beta-glucanos, una fibra que ayuda a controlar el colesterol y el azúcar en la sangre. Es muy saciante y nutritiva.'
    },
    {
        id: 'amaranth',
        name: 'Amaranth',
        nameES: 'Amaranto',
        category: 'cereal',
        image: 'iconsFood/cereales/amaranth.png',
        description: 'Grano ancestral excepcionalmente rico en calcio, hierro y proteínas. No contiene gluten y aporta escualeno, un antioxidante que reduce la inflamación.'
    },
    {
        id: 'rye',
        name: 'Rye',
        nameES: 'Centeno',
        category: 'cereal',
        image: 'iconsFood/cereales/rye.png',
        description: 'Grano oscuro que aporta más fibra y micronutrientes que el trigo refinado. Ayuda a mantener la saciedad por mucho más tiempo y regula el tránsito intestinal.'
    },
    // ==========================================
    // PRODUCTOS DE ORIGEN ANIMAL (animal)
    // ==========================================
    {
        id: 'egg',
        name: 'Egg',
        nameES: 'Huevo',
        category: 'animal',
        image: 'iconsFood/animal/egg.png',
        description: 'Alimento muy completo con proteína de la más alta biodisponibilidad. La yema contiene colina, esencial para el cerebro, y luteína para la salud ocular.'
    },
    {
        id: 'chicken',
        name: 'Chicken',
        nameES: 'Pollo',
        category: 'animal',
        image: 'iconsFood/animal/chicken.png',
        description: 'Carne magra que aporta proteínas de alto valor biológico, necesarias para la reparación muscular. Es excelente fuente de vitaminas del complejo B.'
    },
    {
        id: 'fish',
        name: 'Fish',
        nameES: 'Pescado',
        category: 'animal',
        image: 'iconsFood/animal/fish.png',
        description: 'Destaca por su aporte de ácidos grasos Omega-3, fundamentales para la salud cardiovascular y cerebral. También provee vitamina D y proteínas ligeras.'
    },
    {
        id: 'milk',
        name: 'Milk',
        nameES: 'Leche',
        category: 'animal',
        image: 'iconsFood/animal/milk_bottled.png',
        description: 'Excelente fuente de calcio asimilable y vitamina D, esenciales para el desarrollo y mantenimiento de los huesos y dientes. Aporta proteínas e hidratación.'
    },
    {
        id: 'beef',
        name: 'Beef',
        nameES: 'Carne de Res',
        category: 'animal',
        image: 'iconsFood/animal/beef.png',
        description: 'Importante fuente de hierro hemo, fácilmente absorbible por el cuerpo para prevenir la anemia. Contiene zinc y vitamina B12, clave para el sistema nervioso.'
    },
    {
        id: 'cheese',
        name: 'Cheese',
        nameES: 'Queso',
        category: 'animal',
        image: 'iconsFood/animal/cheese.png',
        description: 'Concentrado de los nutrientes de la leche. Ofrece un alto contenido de calcio, proteínas de calidad y grasas, ayudando a mantener la salud ósea y muscular.'
    },
    {
        id: 'tocino',
        name: 'Bacon',
        nameES: 'Tocino',
        category: 'animal',
        image: 'iconsFood/animal/bacon.png',
        description: 'Rica en proteínas y grasas saturadas. Aporta sabor y textura a los platos.'
    },
    {
        id: 'turkey',
        name: 'Turkey',
        nameES: 'Pavo',
        category: 'animal',
        image: 'iconsFood/animal/turkey.png',
        description: 'Carne blanca muy magra y alta en proteínas. Rica en vitaminas del complejo B y selenio, apoyando el metabolismo y la función tiroidea sin aportar mucha grasa.'
    },
    {
        id: 'pork_loin',
        name: 'Pork Loin',
        nameES: 'Lomo de Cerdo',
        category: 'animal',
        image: 'iconsFood/animal/pork_loin.png',
        description: 'Corte magro que es una gran fuente de proteínas de alta calidad, tiamina (vitamina B1), zinc y hierro, fundamentales para la producción de energía celular.'
    },
    {
        id: 'yogurt',
        name: 'Yogurt',
        nameES: 'Yogur',
        category: 'animal',
        image: 'iconsFood/animal/yogurt_plate.png',
        description: 'Producto lácteo fermentado que además de calcio y proteínas, aporta probióticos vivos esenciales para mantener una flora intestinal saludable y una buena digestión.'
    },
    {
        id: 'salmon',
        name: 'Salmon',
        nameES: 'Salmón',
        category: 'animal',
        image: 'iconsFood/animal/salmon.png',
        description: 'Pescado graso famoso por sus altos niveles de ácidos grasos Omega-3 (EPA y DHA). Crucial para reducir la inflamación, y proteger la salud del corazón y el cerebro.'
    },
    {
        id: 'tuna',
        name: 'Tuna',
        nameES: 'Atún',
        category: 'animal',
        image: 'iconsFood/animal/tuna.png',
        description: 'Una de las fuentes más prácticas de proteína magra y Omega-3. Contiene altos niveles de vitamina D y selenio, elementos clave para fortalecer el sistema inmunológico.'
    },
    {
        id: 'shrimp',
        name: 'Shrimp',
        nameES: 'Camarón',
        category: 'animal',
        image: 'iconsFood/animal/shrimp.png',
        description: 'Bajos en calorías pero ricos en proteínas, yodo y antioxidantes potentes como la astaxantina. Apoyan la salud de la glándula tiroides y el cerebro.'
    },
    {
        id: 'sardines',
        name: 'Sardines',
        nameES: 'Sardinas',
        category: 'animal',
        image: 'iconsFood/animal/sardines.png',
        description: 'Pequeños pescados que aportan dosis enormes de calcio, vitamina D y Omega-3. Son excelentes protectores cardiovasculares y benefician la salud de los huesos.'
    }
];