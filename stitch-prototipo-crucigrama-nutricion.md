# Documentacion Para Stitch: Prototipo De Crucigrama Y Conceptos De Nutricion

## 1. Objetivo Del Prototipo

Crear un prototipo interactivo para un serious game educativo sobre nutricion. El prototipo debe presentar conceptos basicos de alimentacion saludable y despues reforzarlos mediante un crucigrama jugable.

El objetivo principal es que ninos, jovenes o estudiantes comprendan de forma clara y amigable conceptos como:

- Calorias
- Energia
- Carbohidratos
- Proteinas
- Grasas
- Fibra
- Macronutrientes
- Vitaminas
- Minerales
- Agua
- Plato equilibrado

El prototipo debe sentirse como una actividad educativa moderna, calida, visual, limpia y facil de usar.

## 2. Contexto Del Producto

Este prototipo pertenece a un juego educativo de nutricion con estetica de cocina, huerto y pixel art. La experiencia debe combinar aprendizaje con interaccion ludica.

La aplicacion existente usa una tematica de:

- Cocina educativa
- Huerto saludable
- Alimentos en pixel art
- Plato del Bien Comer
- Retos por niveles
- Feedback positivo al completar actividades

El nuevo prototipo debe poder funcionar como una pantalla adicional del juego, por ejemplo despues de los niveles principales o como una seccion de refuerzo educativo.

## 3. Publico Objetivo

El publico objetivo son estudiantes de primaria alta, secundaria o jovenes que estan aprendiendo conceptos basicos de nutricion.

El lenguaje debe ser:

- Claro
- Breve
- Amigable
- No tecnico en exceso
- Didactico
- Visualmente apoyado con iconos o alimentos

Evitar explicaciones medicas complejas. El enfoque debe ser educativo general, no diagnostico ni terapeutico.

## 4. Estilo Visual Deseado

La interfaz debe sentirse como un serious game educativo premium, no como una pagina informativa simple.

### Personalidad Visual

- Calida
- Organica
- Limpia
- Divertida
- Didactica
- Inspirada en cocina y huerto
- Con detalles de videojuego educativo

### Estetica

- Pixel art suave o semi-pixel art
- Bordes redondeados
- Sombras suaves
- Tarjetas con efecto interactivo
- Paneles tipo madera o tablero educativo
- Fondos claros y descansados
- Detalles de verduras, frutas, cereales o utensilios de cocina

## 5. Paleta De Colores

Usar esta paleta como base principal:

| Rol | Color | Uso |
| --- | --- | --- |
| Primary | `#76A665` | Seleccion, progreso, botones principales, estados correctos |
| Secondary | `#D9A066` | Botones secundarios, pistas, acentos calidos, navegacion auxiliar |
| Tertiary | `#5E412F` | Titulos, bordes, encabezados, texto fuerte, estructura visual |
| Neutral | `#F9F6EF` | Fondos, tarjetas, paneles principales, superficies de lectura |

### Distribucion Visual Recomendada

- 50% Neutral
- 25% Tertiary
- 15% Primary
- 10% Secondary

### Reglas De Color

- El fondo general debe ser `#F9F6EF`.
- Los titulos deben usar `#5E412F`.
- Los botones principales deben usar `#76A665`.
- Los botones secundarios o de pista deben usar `#D9A066`.
- Los paneles deben tener fondo claro con bordes marron.
- El verde no debe saturar toda la pantalla; debe indicar accion, avance o seleccion.

## 6. Tipografia

Usar fuentes amigables y legibles.

Recomendacion:

- Titulos: Pixelify Sans, Press Start 2P, o una fuente pixelada suave.
- Texto de lectura: VT323, Nunito, Atkinson Hyperlegible o una fuente redondeada legible.

Si se usa una fuente pixelada, cuidar que el texto largo sea suficientemente grande y comodo de leer.

## 7. Estructura General Del Prototipo

El prototipo debe tener dos grandes partes:

1. Presentacion interactiva de conceptos de nutricion.
2. Crucigrama educativo para reforzar lo aprendido.

Flujo sugerido:

1. Pantalla de bienvenida del modulo.
2. Carrusel o tarjetas de conceptos.
3. Mini resumen visual de macronutrientes.
4. Pantalla de instrucciones del crucigrama.
5. Crucigrama interactivo.
6. Pantalla de felicitacion y retroalimentacion.

## 8. Pantalla 1: Bienvenida Del Modulo

### Objetivo

Introducir la actividad de manera amigable.

### Contenido

Titulo:

`Mision Nutricion: descubre los nutrientes`

Subtitulo:

`Aprende que le da energia a tu cuerpo y resuelve el crucigrama saludable.`

Boton principal:

`Comenzar`

Boton secundario:

`Ver conceptos`

### Elementos Visuales

- Fondo de cocina o huerto suave.
- Personaje guia o mascota si el prototipo lo permite.
- Ilustraciones de alimentos: fruta, pan, huevo, agua, verduras.
- Barra de progreso del modulo: Conceptos -> Crucigrama -> Resultado.

## 9. Pantalla 2: Presentacion De Conceptos

### Objetivo

Explicar conceptos clave antes del crucigrama.

### Layout Recomendado

Usar una vista tipo carrusel o tarjetas expandibles:

- Columna izquierda: lista de conceptos.
- Area central: tarjeta grande del concepto seleccionado.
- Parte inferior: boton `Siguiente concepto`.
- Indicador de progreso: `Concepto 1 / 8`.

### Interacciones

- Al hacer click en un concepto, la tarjeta se expande.
- Hover suave sobre cada tarjeta.
- Animacion de entrada al cambiar de concepto.
- Boton para avanzar al siguiente concepto.
- Boton para iniciar el crucigrama cuando se hayan revisado todos.

### Conceptos A Presentar

#### 9.1 Calorias

Titulo:

`Calorias`

Definicion corta:

`Las calorias son una forma de medir la energia que los alimentos le dan al cuerpo.`

Explicacion amigable:

`Tu cuerpo usa esa energia para moverse, pensar, jugar, crecer y realizar sus funciones diarias.`

Ejemplos visuales:

- Fruta
- Cereal
- Leche
- Comida completa

Mensaje clave:

`No se trata solo de contar calorias, sino de elegir alimentos que tambien aporten nutrientes.`

#### 9.2 Energia

Titulo:

`Energia`

Definicion corta:

`La energia es lo que permite que tu cuerpo funcione durante el dia.`

Explicacion amigable:

`La obtienes de los alimentos. Dormir bien, tomar agua y comer variado tambien ayuda a mantenerte activo.`

Mensaje clave:

`Una comida equilibrada ayuda a tener energia estable.`

#### 9.3 Carbohidratos

Titulo:

`Carbohidratos`

Definicion corta:

`Son nutrientes que el cuerpo usa principalmente como fuente de energia.`

Explicacion amigable:

`Se encuentran en alimentos como arroz, avena, pan, tortilla, papa, frutas y algunos vegetales.`

Ejemplos:

- Arroz
- Maiz
- Avena
- Papa
- Frutas

Mensaje clave:

`Los carbohidratos son utiles, sobre todo cuando vienen de alimentos nutritivos y variados.`

#### 9.4 Proteinas

Titulo:

`Proteinas`

Definicion corta:

`Ayudan a construir y reparar partes del cuerpo como musculos, piel y tejidos.`

Explicacion amigable:

`Tambien participan en el crecimiento y en muchas funciones importantes del organismo.`

Ejemplos:

- Huevo
- Pollo
- Pescado
- Frijoles
- Lentejas
- Yogur

Mensaje clave:

`Las proteinas pueden venir de alimentos de origen animal y tambien de leguminosas.`

#### 9.5 Grasas

Titulo:

`Grasas`

Definicion corta:

`Son nutrientes que aportan energia y ayudan a proteger el cuerpo.`

Explicacion amigable:

`Algunas grasas ayudan al cerebro y a absorber vitaminas. Es mejor elegir fuentes saludables y comerlas con moderacion.`

Ejemplos:

- Aguacate
- Nueces
- Semillas
- Aceite vegetal
- Pescado

Mensaje clave:

`No todas las grasas son iguales. La calidad y la cantidad importan.`

#### 9.6 Fibra

Titulo:

`Fibra`

Definicion corta:

`La fibra ayuda a la digestion y se encuentra en alimentos de origen vegetal.`

Explicacion amigable:

`Esta presente en frutas, verduras, cereales integrales y leguminosas. Ayuda a que el sistema digestivo trabaje mejor.`

Ejemplos:

- Manzana
- Zanahoria
- Avena
- Frijoles
- Lentejas

Mensaje clave:

`Comer alimentos con fibra ayuda a sentirse satisfecho y cuidar la digestion.`

#### 9.7 Macronutrientes

Titulo:

`Macronutrientes`

Definicion corta:

`Son nutrientes que el cuerpo necesita en mayor cantidad.`

Explicacion amigable:

`Los principales macronutrientes son carbohidratos, proteinas y grasas. Cada uno cumple una funcion diferente.`

Visual sugerido:

Tres columnas:

- Carbohidratos: energia rapida y principal.
- Proteinas: construccion y reparacion.
- Grasas: reserva de energia y proteccion.

Mensaje clave:

`Un plato equilibrado combina diferentes macronutrientes.`

#### 9.8 Vitaminas Y Minerales

Titulo:

`Vitaminas y minerales`

Definicion corta:

`Son micronutrientes que ayudan al cuerpo a funcionar correctamente.`

Explicacion amigable:

`Aunque se necesitan en cantidades pequenas, son importantes para defensas, huesos, sangre, energia y crecimiento.`

Ejemplos:

- Vitamina C en frutas
- Calcio en leche o derivados
- Hierro en leguminosas y alimentos de origen animal
- Potasio en platano

Mensaje clave:

`Comer variado ayuda a obtener diferentes vitaminas y minerales.`

#### 9.9 Agua

Titulo:

`Agua`

Definicion corta:

`El agua ayuda a transportar nutrientes y mantener el cuerpo funcionando.`

Explicacion amigable:

`Tambien ayuda a regular la temperatura y a mantener la hidratacion.`

Mensaje clave:

`Tomar agua simple es una buena eleccion diaria.`

## 10. Pantalla 3: Resumen Visual De Nutrientes

### Objetivo

Mostrar una sintesis antes del crucigrama.

### Layout

Crear un tablero con cuatro tarjetas principales:

1. Energia
2. Construccion
3. Proteccion
4. Digestion

### Asociaciones

| Funcion | Nutrientes Relacionados | Ejemplo Visual |
| --- | --- | --- |
| Energia | Calorias, carbohidratos, grasas | arroz, avena, papa |
| Construccion | Proteinas | huevo, pollo, frijoles |
| Proteccion | Vitaminas, minerales, grasas saludables | frutas, verduras, aguacate |
| Digestion | Fibra, agua | manzana, lentejas, vaso de agua |

### Boton

`Resolver crucigrama`

## 11. Pantalla 4: Instrucciones Del Crucigrama

### Objetivo

Explicar como se juega.

### Texto

`Lee las pistas y completa las palabras del crucigrama. Cada respuesta esta relacionada con los conceptos de nutricion que acabas de aprender.`

### Reglas

- Selecciona una casilla para escribir.
- Puedes cambiar entre pistas horizontales y verticales.
- Usa el boton de pista si necesitas ayuda.
- Presiona validar cuando completes una palabra.
- Completa todas las palabras para terminar la mision.

### Botones

- `Iniciar crucigrama`
- `Repasar conceptos`

## 12. Pantalla 5: Crucigrama Interactivo

### Objetivo

Crear una actividad jugable para reforzar vocabulario nutricional.

### Layout Recomendado

Pantalla dividida en dos zonas:

#### Zona Izquierda

- Tablero del crucigrama.
- Casillas claras con borde marron.
- Casilla activa en verde.
- Casillas correctas con borde verde.
- Casillas incorrectas con acento terracota o secondary.

#### Zona Derecha

- Panel de pistas.
- Pista actual destacada.
- Lista de pistas horizontales.
- Lista de pistas verticales.
- Botones:
  - `Validar palabra`
  - `Pista`
  - `Limpiar`
  - `Terminar`

### Comportamiento Del Tablero

- El usuario puede seleccionar una casilla.
- Al escribir una letra, debe avanzar automaticamente a la siguiente casilla de la palabra activa.
- Debe permitir borrar letras.
- Debe permitir cambiar de direccion horizontal/vertical.
- Debe mostrar visualmente la palabra activa.
- Debe marcar aciertos con una animacion suave.
- Debe evitar que se escriban numeros o caracteres especiales.
- Las respuestas deben aceptarse sin acentos.

### Feedback

Correcto:

`Muy bien, esa palabra es correcta.`

Incorrecto:

`Revisa la pista e intenta otra vez.`

Pista:

`La palabra empieza con la letra: [letra].`

Al completar todo:

`Completaste el crucigrama saludable.`

## 13. Palabras Del Crucigrama

Para el prototipo, usar estas palabras. En el tablero se recomienda escribirlas sin acentos para evitar problemas de input.

| Palabra En Tablero | Texto Visible | Concepto |
| --- | --- | --- |
| CALORIA | Caloria | Energia de los alimentos |
| ENERGIA | Energia | Capacidad para moverse y funcionar |
| CARBOHIDRATO | Carbohidrato | Fuente principal de energia |
| PROTEINA | Proteina | Construccion y reparacion |
| GRASA | Grasa | Energia y proteccion |
| FIBRA | Fibra | Digestion |
| MACRONUTRIENTE | Macronutriente | Nutriente requerido en mayor cantidad |
| VITAMINA | Vitamina | Micronutriente importante |
| MINERAL | Mineral | Micronutriente importante |
| AGUA | Agua | Hidratacion |

## 14. Pistas Del Crucigrama

### Horizontales

1. `CALORIA`: Unidad que mide la energia que aportan los alimentos.
2. `PROTEINA`: Nutriente que ayuda a construir y reparar tejidos del cuerpo.
3. `FIBRA`: Componente de frutas, verduras y leguminosas que ayuda a la digestion.
4. `AGUA`: Bebida esencial para mantener la hidratacion.
5. `MINERAL`: Micronutriente como calcio, hierro o potasio.

### Verticales

1. `ENERGIA`: Lo que el cuerpo usa para moverse, pensar y jugar.
2. `CARBOHIDRATO`: Nutriente que suele ser una fuente principal de energia.
3. `GRASA`: Nutriente que aporta energia y ayuda a proteger el cuerpo.
4. `MACRONUTRIENTE`: Tipo de nutriente que el cuerpo necesita en mayor cantidad.
5. `VITAMINA`: Micronutriente que ayuda a muchas funciones del organismo.

## 15. Datos Sugeridos Para El Prototipo

Stitch puede usar una estructura similar a esta para representar las palabras:

```json
[
  {
    "id": "h1",
    "answer": "CALORIA",
    "display": "Caloria",
    "direction": "horizontal",
    "clue": "Unidad que mide la energia que aportan los alimentos.",
    "concept": "calorias"
  },
  {
    "id": "h2",
    "answer": "PROTEINA",
    "display": "Proteina",
    "direction": "horizontal",
    "clue": "Nutriente que ayuda a construir y reparar tejidos del cuerpo.",
    "concept": "proteinas"
  },
  {
    "id": "h3",
    "answer": "FIBRA",
    "display": "Fibra",
    "direction": "horizontal",
    "clue": "Componente de frutas, verduras y leguminosas que ayuda a la digestion.",
    "concept": "fibra"
  },
  {
    "id": "v1",
    "answer": "ENERGIA",
    "display": "Energia",
    "direction": "vertical",
    "clue": "Lo que el cuerpo usa para moverse, pensar y jugar.",
    "concept": "energia"
  },
  {
    "id": "v2",
    "answer": "CARBOHIDRATO",
    "display": "Carbohidrato",
    "direction": "vertical",
    "clue": "Nutriente que suele ser una fuente principal de energia.",
    "concept": "carbohidratos"
  }
]
```

## 16. Propuesta De Tablero Para Prototipo

Si Stitch no genera un crucigrama real automaticamente, crear una version visual tipo prototipo con una cuadricula fija de 14 x 14.

Requisitos minimos del tablero:

- Casillas cuadradas.
- Letras centradas.
- Numeros pequenos en la esquina superior izquierda de la primera casilla de cada palabra.
- Casillas bloqueadas en color marron suave.
- Casilla seleccionada en verde.
- Palabra activa con fondo verde claro.
- Palabras correctas con animacion de brillo suave.

No es obligatorio que el tablero sea perfecto en la primera version, pero debe comunicar claramente la mecanica del crucigrama.

## 17. Estados Del Crucigrama

### Estado Inicial

- Tablero vacio.
- Primera pista seleccionada.
- Boton validar deshabilitado si la palabra esta vacia.

### Estado Escribiendo

- Casilla activa visible.
- La palabra activa se resalta.
- La pista actual aparece arriba del panel.

### Estado Correcto

- Las letras correctas se bloquean o se marcan con borde verde.
- Mensaje positivo.
- Sonido o microanimacion de acierto si el prototipo lo permite.

### Estado Incorrecto

- La palabra se sacude suavemente.
- Borde en secondary.
- Mensaje que invite a intentar de nuevo.

### Estado Completado

- Todas las palabras marcadas como correctas.
- Pantalla de felicitacion.
- Resumen de conceptos aprendidos.

## 18. Pantalla 6: Felicitacion Final

### Titulo

`Mision completada`

### Mensaje

`Resolviste el crucigrama y reforzaste conceptos importantes de nutricion. Ahora sabes como los alimentos ayudan a dar energia, construir, proteger y cuidar tu cuerpo.`

### Estadisticas

Mostrar:

- Palabras completadas
- Pistas usadas
- Tiempo aproximado
- Conceptos dominados

### Botones

- `Volver a jugar`
- `Repasar conceptos`
- `Continuar`

## 19. Animaciones Y Microinteracciones

Incluir:

- Hover en tarjetas con elevacion suave.
- Transicion entre conceptos.
- Brillo o pulso al seleccionar una casilla.
- Pequeña animacion de acierto al validar una palabra.
- Shake suave en palabra incorrecta.
- Barra de progreso animada.
- Confeti discreto al completar el crucigrama.

Evitar:

- Animaciones demasiado rapidas.
- Efectos que dificulten leer.
- Pantallas saturadas.

## 20. Accesibilidad

El prototipo debe cuidar:

- Contraste alto entre texto y fondo.
- Letras grandes y legibles.
- Botones con area clickeable amplia.
- Estados no dependientes solo del color.
- Textos de pistas claros.
- Posibilidad de jugar con teclado si es viable.

## 21. Requisitos De UX

- El usuario debe entender que hacer en menos de 5 segundos.
- La pantalla no debe sentirse como examen, sino como reto educativo.
- Las pistas deben ayudar, no castigar.
- El feedback debe ser amable.
- El avance debe sentirse visible.
- El crucigrama debe poder completarse sin frustracion.

## 22. Componentes Que Debe Generar Stitch

### Componentes Principales

- `NutritionConceptIntro`
- `ConceptCarousel`
- `ConceptCard`
- `MacronutrientSummary`
- `CrosswordInstructions`
- `CrosswordBoard`
- `CrosswordCell`
- `CluePanel`
- `ProgressHeader`
- `CompletionModal`

### Componentes Secundarios

- Boton principal
- Boton secundario
- Badge de progreso
- Chip de nutriente
- Tarjeta de concepto
- Mensaje de feedback

## 23. Contenido De Las Tarjetas De Concepto

Cada tarjeta debe incluir:

- Nombre del concepto.
- Icono o imagen relacionada.
- Definicion corta.
- Explicacion amigable.
- Ejemplos de alimentos.
- Mensaje clave.

Ejemplo de tarjeta:

```json
{
  "title": "Proteinas",
  "shortDefinition": "Ayudan a construir y reparar partes del cuerpo.",
  "description": "Son importantes para crecer, mantener musculos y apoyar funciones del organismo.",
  "examples": ["Huevo", "Pollo", "Frijoles", "Lentejas"],
  "keyMessage": "Las proteinas pueden venir de alimentos animales y vegetales."
}
```

## 24. Reglas De Contenido Educativo

- No usar mensajes de dieta restrictiva.
- No clasificar alimentos como completamente buenos o malos.
- Evitar culpa o miedo.
- Promover variedad, equilibrio e hidratacion.
- Usar ejemplos cotidianos.
- Mantener un tono positivo y motivador.

## 25. Copy General De La Interfaz

### Encabezado

`Mision Nutricion`

### Texto De Apoyo

`Aprende como los nutrientes ayudan a tu cuerpo y demuestra lo que sabes resolviendo el crucigrama.`

### Botones

- `Comenzar`
- `Siguiente`
- `Anterior`
- `Resolver crucigrama`
- `Validar palabra`
- `Usar pista`
- `Repasar`
- `Continuar`

### Mensajes De Feedback

Correcto:

`Correcto. Esa palabra encaja perfecto.`

Incorrecto:

`Casi. Revisa la pista y prueba otra vez.`

Pista:

`Una ayuda: la palabra empieza con esta letra.`

Completado:

`Excelente. Completaste el reto nutricional.`

## 26. Criterios De Aceptacion Del Prototipo

El prototipo se considera correcto si cumple lo siguiente:

- Presenta conceptos de nutricion en tarjetas claras.
- Incluye al menos 8 conceptos educativos.
- Tiene una pantalla o seccion de resumen visual.
- Incluye un crucigrama interactivo o una simulacion fiel.
- Permite seleccionar casillas y escribir letras.
- Muestra pistas horizontales y verticales.
- Incluye validacion visual de respuestas.
- Muestra una pantalla de felicitacion al finalizar.
- Respeta la paleta de colores.
- Mantiene estetica de cocina, huerto y juego educativo.
- Es legible en escritorio.
- No se siente como una pagina estatica.

## 27. Prompt Resumido Para Stitch

Crear un prototipo interactivo de serious game educativo sobre nutricion con estetica de cocina/huerto pixel art. Debe tener una presentacion de conceptos nutricionales en tarjetas interactivas y un crucigrama final para reforzar lo aprendido.

Usar la paleta:

- Primary `#76A665`
- Secondary `#D9A066`
- Tertiary `#5E412F`
- Neutral `#F9F6EF`

El prototipo debe incluir:

- Pantalla de bienvenida.
- Carrusel de conceptos: calorias, energia, carbohidratos, proteinas, grasas, fibra, macronutrientes, vitaminas, minerales y agua.
- Resumen visual de funciones: energia, construccion, proteccion y digestion.
- Instrucciones del crucigrama.
- Crucigrama interactivo con tablero, pistas, seleccion de casillas, validacion, pistas y feedback.
- Pantalla final de felicitacion.

Debe sentirse calido, moderno, educativo, jugable, limpio y amigable para estudiantes.

## 28. Nota Final

El contenido es educativo general. No debe presentarse como consejo medico personalizado ni como plan de dieta. El objetivo es aprender vocabulario y funciones basicas de los nutrientes de forma divertida.
