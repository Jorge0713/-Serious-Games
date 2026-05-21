# Serious Games - Guía de Desarrollo 🛠️

Este archivo contiene mandatos y flujos de trabajo específicos para el proyecto **Serious Games**.

## 🏗️ Flujo de Trabajo (Vite + Electron)

1.  **Arranque en Desarrollo**:
    ```bash
    npm run start
    ```
    Esto inicia Vite y Electron simultáneamente.

2.  **Compilación y Build**:
    ```bash
    npm run build
    ```
    **Nota**: El proceso de build incluye una verificación estricta de tipos con `tsc`. No se permite código que rompa el tipado en la rama principal.

## 🎨 Estándares de Diseño

-   **Paleta de Colores**: Se utiliza el tema "Bosque Cálido" definido en los módulos de Phaser.
    -   Verde: `#58B15B`
    -   Marrón: `#5D4037`
    -   Crema: `#F5FBF2`
-   **Fuentes**:
    -   `Pixelify Sans`: Para títulos y estética pixel-art.
    -   `VT323`: Para cuerpos de texto y estilo retro-terminal.

## 📱 Responsividad y Escala

-   **Modo de Escala**: Se utiliza `Phaser.Scale.FIT`. Esto garantiza que el juego sea visible en su totalidad en cualquier resolución sin recortar contenido.
-   **Prohibición de ENVELOP**: No usar `Phaser.Scale.ENVELOP`, ya que recorta los bordes (especialmente en Linux) para rellenar la pantalla.
-   **Relación de Aspecto**: El canvas está diseñado para `1920x1080` (16:9). Todos los elementos deben posicionarse relativos a estas dimensiones.
-   **UI de Electron**: Se debe mantener `autoHideMenuBar: true` en el proceso principal para maximizar el espacio vertical disponible.

## ⚠️ Mandatos de Código

-   **Case-Sensitivity**: El proyecto corre tanto en Windows como en Linux. Todas las importaciones DEBEN coincidir exactamente en mayúsculas/minúsculas con el nombre del archivo en disco.
-   **Phaser-React Bridge**: No instanciar múltiples juegos de Phaser. Usar `window.__phaserGame` para referencias globales si es necesario fuera de la escena.
-   **Recursos**: Todos los assets deben vivir en `public/` y referenciarse con rutas absolutas desde la raíz (ej: `/assets/...`).

## 📁 Organización de Escenas

Cada nueva escena debe:
1.  Extender de `Phaser.Scene`.
2.  Agregarse manualmente al arreglo de escenas en `src/game/PhaserGame.ts`.
3.  Utilizar el sistema de `hoverScale` para interactividad de botones para mantener la consistencia.
