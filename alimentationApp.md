# Serious Games: Alimentación Saludable 🍎

Este proyecto es una aplicación educativa interactiva desarrollada con **Electron**, **React** y **Phaser**. Su objetivo es enseñar conceptos de nutrición a través de minijuegos y dinámicas interactivas.

## 🚀 Arquitectura del Proyecto

El proyecto combina tres tecnologías principales:
1.  **Electron**: Contenedor de escritorio para la aplicación.
2.  **React (Vite)**: Maneja la interfaz de usuario (UI), el registro y la navegación principal.
3.  **Phaser 3**: Motor de videojuegos utilizado para los niveles y minijuegos educativos.

### Estructura de Carpetas

-   `electron/`: Configuración del proceso principal de Electron.
-   `src/game/`: Lógica del motor Phaser.
    -   `scenes/`: Definición de cada nivel o pantalla del juego.
-   `src/ui/`: Componentes de React para la interfaz superpuesta y menús.
-   `src/db/`: Gestión de la base de datos (SQLite/Better-SQLite3).
-   `src/data/`: Datos estáticos de nutrición y configuración.

---

## 🧩 Módulos Principales

### 1. Crucigrama Saludable (`CrucigramaSaludableScene.ts`)
Es un minijuego de lógica donde el usuario debe encontrar palabras clave sobre nutrición.
-   **Características**:
    -   Sistema dinámico de celdas.
    -   Panel de pistas (Hints) integrado.
    -   Feedback visual y sonoro al completar palabras.
    -   Paleta de colores "Bosque Cálido" para coherencia visual.

### 2. Plato Balanceado (`PlatoBalanceadoScene.ts`)
Módulo central donde los usuarios aprenden a armar un plato saludable.
-   **Dinámica**:
    -   Arrastrar y soltar (Drag & Drop) alimentos en el plato.
    -   Clasificación por grupos: Frutas/Verduras, Cereales, Leguminosas/AOA.
    -   Validación de proporciones y nutrición.

### 3. Sistema de Niveles (`Nivel1`, `Nivel2`, `Nivel3`)
Progresión de dificultad que introduce conceptos como:
-   Identificación de grupos alimenticios.
-   Conteo de calorías y energía.
-   Importancia de la hidratación.

### 4. Integración React-Phaser (`App.tsx` & `PhaserGame.ts`)
-   **Comunicación**: Se utiliza el objeto `window` para que Phaser pueda disparar eventos de la UI en React (ej. `window.showTutorial`).
-   **UI Overlay**: Los tutoriales y overlays se renderizan en React sobre el lienzo de Phaser para mayor flexibilidad de diseño.

---

## 🛠️ Tecnologías Utilizadas

-   **Frontend**: React 19, Vite, TypeScript.
-   **Juego**: Phaser 3.8.
-   **Escritorio**: Electron 41.
-   **Base de Datos**: Better-SQLite3.
-   **Estilos**: CSS nativo y paletas personalizadas.

## 📝 Convenciones del Proyecto (GEMINI.md)

Para más detalles sobre flujos de trabajo, comandos y guías de estilo, consulta el archivo [GEMINI.md](./GEMINI.md).
