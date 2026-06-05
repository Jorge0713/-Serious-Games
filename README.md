# Serious Games: Alimentacion App

## Descripcion del proyecto
## Plachef
Es un Serious Game educativo de escritorio creado para enseñar conceptos basicos de nutricion mediante una experiencia interactiva. El proyecto utiliza el tema del Plato del Bien Comer para guiar al usuario por los principales grupos de alimentos y reforzar el aprendizaje con recursos visuales, dialogos, animaciones y secciones explorables.

Plachef fue desarrollado para el Centro de Salud Las Tinas de Jáltipan, en colaboración con la Dra. Angélica Irais Machorro Martínez. Su finalidad es servir como herramienta de apoyo en pláticas y consultas con los pacientes, ayudándolos a aprender cómo mejorar su alimentación y permitiendo que la doctora identifique de qué manera llevan su dieta.
El juego está diseñado con tutoriales y niveles que enseñan los conceptos básicos de una alimentación balanceada. Al avanzar, el paciente llega a la sección “Arma tu plato”, donde aplica lo aprendido. A partir de sus elecciones, la aplicación puede mostrarle si está armando un plato adecuado o si necesita mejorar algunos aspectos de su alimentación.
Además, Plachef toma en cuenta enfermedades que requieren mayor control en la dieta, como la diabetes o la hipertensión, con el objetivo de orientar al paciente sobre cómo regular mejor su forma de comer de manera correcta y saludable.

La aplicacion combina una interfaz desarrollada con React y TypeScript con escenas interactivas construidas en Phaser. Desde el menu principal, el usuario puede acceder al tutorial del plato, interactuar con sus secciones y consultar informacion nutricional sobre frutas y verduras. El objetivo es que el aprendizaje sobre alimentacion saludable sea mas dinamico, visual y facil de recordar.

## Objetivo

Promover el conocimiento sobre una alimentacion equilibrada a traves de un serious game que permita aprender jugando. La aplicacion busca apoyar la comprension de los grupos alimenticios, sus beneficios y la importancia de combinarlos correctamente en la vida diaria.

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Phaser
- Electron
- CSS

## Estructura general

- `src/game`: escenas y logica interactiva del juego en Phaser.
- `src/ui`: paginas y componentes visuales de React.
- `src/data`: informacion nutricional utilizada en los tutoriales.
- `electron`: configuracion principal para abrir la aplicacion de escritorio.
- `public`: recursos graficos, sonidos e imagenes usados por el juego.
