# Documentación de AlimentationApp

## Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Objetivos del Módulo](#objetivos-del-módulo)
3. [Plan de Acción Original](#plan-de-acción-original)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Descripción de Componentes](#descripción-de-componentes)
6. [Integración con Phaser](#integración-con-phaser)
7. [Base de Datos de Alimentos](#base-de-datos-de-alimentos)
8. [Estilos y Diseño](#estilos-y-diseño)
9. [Problemas Resueltos](#problemas-resueltos)
10. [Cómo Usar el Módulo](#cómo-usar-el-módulo)
11. [Commit Realizado](#commit-realizado)
12. [Configuración de Categorías](#configuración-de-categorías)

---

## Resumen del Proyecto

Este proyecto implementa un juego educativo de nutrición llamado **Serious Games** sobre alimentación saludable. Utiliza un "Plato del Bien Comer" interactivo donde los usuarios pueden explorar los 5 grupos de alimentos: Frutas, Verduras, Cereales, Leguminosas y Alimentos de Origen Animal.

**Fecha de implementación:** Mayo 2026
**Rama:** `level1-verduras`
**Tecnologías:** React + TypeScript + Phaser + Electron

---

## Objetivos del Módulo

1. **Mostrar un catálogo visual** de todos los alimentos disponibles en los assets del proyecto
2. **Proporcionar información nutricional** de cada alimento (2-4 líneas por alimento)
3. **Crear una experiencia interactiva** donde el usuario pueda explorar cada alimento en detalle
4. **Mantener modularidad** para permitir integración futura con el "Plato del Bien Comer"
5. **Conservar la estética** del resto del juego (colores verdes y marrón, fondo de cocina)

---

## Plan de Acción Original

El plan fue creado antes de la implementación y seguido durante el desarrollo:

### Fase 1: Archivo de Descripciones Nutricionales
- Investigar los nutrientes de cada fruta/verdura en internet
- Crear archivo con descripciones de 2-4 líneas por alimento
- Formato: HTML/TypeScript para integración con React

### Fase 2: Componentes Modulares (React/TypeScript)
- `FoodGrid.tsx`: Grid de alimentos con imágenes y nombres
- `FoodDetail.tsx`: Vista detallada con imagen grande, nombre y descripción
- `TutorialNav.tsx`: Navegación (botones "Volver al menú" y "Siguiente tutorial")

### Fase 3: Escena de Phaser
- Crear integración con el sistema de tutoriales existente
- Botón en MainMenu para acceder al nuevo tutorial

### Fase 4: Estética y Assets
- Usar `Fondo_Cocina.png` como fondo
- Paleta: Verdes oscuros (#2d5a27, #4a7c3a) y marrones (#8B4513)

### Fase 5: Integración con Sistema Existente
- Hacer el componente modular para permitir que el compañero añada hipervínculos del plato
- No alterar objetivos ya logrados

---

## Estructura de Archivos

```
src/
├── config/
│   ├── categoryConfig.ts        # Labels y emojis por categoría
│   └── categoryColors.ts     # Colores de gradientes y bordes
├── data/
│   └── nutritionalInfo.ts    # Base de datos de alimentos (~383 líneas)
├── ui/
│   └── components/
│       └── tutorial/
│           ├── index.ts        # Exports (4 líneas)
│           ├── FoodDetail.tsx # Vista de detalle (173 líneas)
│           ├── FoodGrid.tsx   # Grid de selección (247 líneas)
│           └── TutorialPage.tsx # Contenedor principal (46 líneas)
├── game/
│   ├── PhaserGame.ts         # Factory de Phaser (24 líneas)
│   ├── Scenes/
│   │   └── MainMenu.ts      # Menú principal (99 líneas)
│   └── scenes/
│       ├── TutorialScene.ts # Tutorial interactivo (462 líneas)
│       └── Nivel1Scene.ts   # Nivel 1 (placeholder)
├── componentes/
│   └── HoverScale.ts       # Utilidad para animaciones hover
└── App.tsx                 # Router principal (48 líneas)
```

---

## Descripción de Componentes

### 1. `src/data/nutritionalInfo.ts`

**Propósito:** Almacenar toda la información de los alimentos en un formato estructurado.

**Estructura del tipo de datos:**

```typescript
export type FoodCategory = 'fruit' | 'vegetable' | 'legume' | 'cereal' | 'animal';

export interface FoodItem {
    id: string;          // Identificador único (ej: 'banana', 'broccoli')
    name: string;       // Nombre en inglés (ej: 'Banana')
    nameES: string;     // Nombre en español (ej: 'Plátano')
    category: FoodCategory;
    image: string;      // Ruta a la imagen (ej: '/frutas/banana.png')
    description: string; // Descripción nutricional (2-4 líneas)
}
```

**Categorías implementadas:**
- Verduras (vegetable)
- Frutas (fruit)
- Leguminosas (legume)
- Cereales (cereal)
- Alimentos de Origen Animal (animal)

---

### 2. `src/config/categoryConfig.ts`

**Propósito:** Definir labels y emojis para cada categoría.

```typescript
export const categoryConfig = {
    fruit: { label: 'Frutas', emoji: '🍎' },
    vegetable: { label: 'Verduras', emoji: '🥦' },
    legume: { label: 'Leguminosas', emoji: '🫘' },
    cereal: { label: 'Cereales', emoji: '🌾' },
    animal: { label: 'Origen Animal', emoji: '🥚' }
};
```

---

### 3. `src/config/categoryColors.ts`

**Propósito:** Definir colores de gradiente y bordes por categoría.

```typescript
export const categoryColors = {
    vegetable: { gradient: ['#2d5a27', '#4a7c3a'], border: '#5a8f5a' },
    legume: { gradient: ['#5c4033', '#8B4513'], border: '#a0522d' },
    cereal: { gradient: ['#b8860b', '#daa520'], border: '#ffd700' },
    animal: { gradient: ['#8b0000', '#dc143c'], border: '#ff6347' }
};
```

---

### 4. `src/componentes/HoverScale.ts`

**Propósito:** Utilidad para animaciones de escala en hover para sprites de Phaser.

```typescript
export function hoverScale(
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image,
    scale: number = 1.1,
    sound?: Phaser.Sound.BaseSound
): void {
    sprite.setInteractive({ useHandCursor: true });
    
    sprite.on('pointerover', () => {
        sprite.scene.tweens.add({
            targets: sprite,
            scaleX: scale,
            scaleY: scale,
            duration: 150
        });
        if (sound) sound.play();
    });
    
    sprite.on('pointerout', () => {
        sprite.scene.tweens.add({
            targets: sprite,
            scaleX: 1,
            scaleY: 1,
            duration: 150
        });
    });
}
```

---

### 5. `src/ui/components/tutorial/FoodGrid.tsx`

**Propósito:** Mostrar el menú principal con todas las frutas y verduras en un grid visual.

**Props requeridas:**
```typescript
interface FoodGridProps {
    foods: FoodItem[];
    onSelectFood: (food: FoodItem) => void;
    onBackToMenu: () => void;
    onNextTutorial?: () => void;
    selectedCategory?: string | string[] | null;
}
```

**Funcionalidades:**
1. Filtra los alimentos por categoría si se especifica
2. Renderiza cada alimento como una tarjeta con imagen + nombre
3. Proporciona botones de navegación
4. Fondo de cocina con gradiente verde

---

### 6. `src/ui/components/tutorial/FoodDetail.tsx`

**Propósito:** Mostrar la información detallada de un alimento específico.

**Props requeridas:**
```typescript
interface FoodDetailProps {
    food: FoodItem;
    onBack: () => void;
}
```

**Elementos visuales:**
1. Imagen grande del alimento
2. Nombre en español (fuente grande, blanco)
3. Nombre en inglés (fuente más pequeña, verde claro)
4. Categoría (badge con emoji + texto)
5. Descripción nutricional completa

---

### 7. `src/ui/components/tutorial/TutorialPage.tsx`

**Propósito:** Componente contenedor que gestiona el estado entre la vista de grid y la vista de detalle.

**Props:**
```typescript
interface TutorialPageProps {
    selectedCategory?: string | string[] | null;
    onBackToMenu: () => void;
    onNextTutorial?: () => void;
}
```

---

### 8. `src/App.tsx`

**Propósito:** Router principal de la aplicación.

```typescript
type Page = 'home' | 'tutorial' | 'cereal' | 'legume';

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [showTutorialUI, setShowTutorialUI] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | string[] | null>(null);

    useEffect(() => {
        // Callback global para que Phaser abra el tutorial
        (window as any).showTutorial = (categories: string | string[]) => {
            setShowTutorialUI(false);
            setSelectedCategory(categories);
            setShowTutorialUI(true);
        };
    }, []);

    // Renderizado según estado...
}
```

---

## Integración con Phaser

### TutorialScene (Phaser)

La escena de tutorial contiene el "Plato del Bien Comer" interactivo con 5 zonas:

1. **Verduras** (parte superior izquierda)
2. **Frutas** (parte superior derecha)
3. **Cereales** (parte inferior izquierda)
4. **Leguminosas** (parte inferior centro)
5. **Origen Animal** (parte inferior derecha)

**Flujo de interacción:**
- Hover sobre el plato: cambio de color y escala
- Click en una sección: se expande mostrando sprites
- Click en sprite expandido: abre el tutorial React con esa categoría
- El callback `(window as any).showTutorial(category)` comunica Phaser con React

```typescript
// Ejemplo de integración en TutorialScene
sprite.on("pointerdown", () => {
    const showTutorial = (window as any).showTutorial;
    if (showTutorial) {
        showTutorial("fruit"); // Pasa la categoría
    }
});
```

---

## Base de Datos de Alimentos

La base de datos contiene **~40 alimentos** con descripciones nutricionales de 2-4 líneas cada uno.

### Categorías disponibles:
- **Frutas (fruit):** Manzana, Plátano, Fresa, Naranja, Uvas, etc.
- **Verduras (vegetable):** Zanahoria, Brócoli, Lechuga, Pepino, etc.
- **Leguminosas (legume):** Frijol, Lenteja, Garbanzo, etc.
- **Cereales (cereal):** Arroz, Trigo, Avena, Maíz, etc.
- **Origen Animal (animal):** Huevo, Leche, Pollo, Carne, Pescado, etc.

---

## Estilos y Diseño

### Paleta de Colores
- **Verde oscuro:** `#1a3d1a`
- **Verde medio:** `#2d5a27`
- **Verde claro:** `#4a7c3a`
- **Marrón:** `#8B4513`
- **Blanco/crema:** `#d4e6d4`, `#e8f0e8`

### Fondo
- Imagen: `/assets/Fondo_Cocina.png`
- Overlay con degradado verde para consistencia visual

### Scrollbar Personalizada
- Ancho: 14px
- Color thumb: `#6b8e23` (verde oliva)
- Color track: `#1a3d1a` (verde oscuro)

---

## Problemas Resueltos

### 1. Error de Case-Sensitivity en Linux
**Problema:** Phaser no podía encontrar `./scenes/MainMenu` porque la carpeta real es `./Scenes/MainMenu` (mayúscula).

**Solución:** Corregido el import en `PhaserGame.ts`:
```typescript
// Antes (incorrecto):
import { MainMenu } from './scenes/MainMenu'

// Después (correcto):
import { MainMenu } from './Scenes/MainMenu'
```

### 2. Scrollbar no visible
**Problema:** El contenido excedía la pantalla pero no había scrollbar visible.

**Solución:** Se añadieron propiedades de overflow y estilos de scrollbar personalizados:
```css
.tutorial-container {
    width: 100%;
    height: 100vh;
    overflow-y: scroll;
    overflow-x: hidden;
}
```

### 3. Errores de TypeScript (variables no usadas)
**Problema:** Errores de compilación por variables declaradas pero no usadas.

**Solución:** Comentar las variables que no se usan o usar `void variable`.

---

## Cómo Usar el Módulo

### Para ejecutar el proyecto:
```bash
cd ~/Proyectos/electron/Serious-Games
npm run dev
```

### Para acceder al tutorial:
1. Ejecutar el proyecto
2. En el menú principal, hacer click en "Tutorial"
3. Click en una sección del plato interactivo
4. Click en el sprite expandirido para ver los alimentos de esa categoría

### Para añadir más alimentos:
1. Editar `src/data/nutritionalInfo.ts`
2. Añadir un nuevo objeto al array:
```typescript
{
    id: 'nuevo-alimento',
    name: 'New Food',
    nameES: 'Alimento Nuevo',
    category: 'fruit', // o 'vegetable', 'legume', 'cereal', 'animal'
    image: '/frutas/nuevo-alimento.png',
    description: 'Descripción nutricional...'
}
```

---

## Estado Actual: Leguminosas (EN DESARROLLO)

El tutorial de leguminosas aún está en desarrollo. Actualmente muestra un placeholder:

```typescript
if (currentPage === 'legume') {
    return (
        <div style={{ /* estilos */ }}>
            <h1>Próximo: Tutorial de Leguminosas</h1>
            <p>Esta sección está en desarrollo...</p>
        </div>
    );
}
```

---

## Commit Realizado

**Hash:** `1bea04c`
**Mensaje:** "Integración al menú interactivo"
**Rama:** `level1-verduras`
**Fecha:** Mayo 2026

### Historial de commits (rama colaboradores):
```
9053933 Interacción de secciones del plato completas
bb0eb24 Mejora del botón de la sección de frutas y verduras
be31de6 Sprites completos del tutorial frutas y verduras
8f26716 Actualizacion de sprites y modulo de tutorial completo
```

---

## Problemas Resueltos (Actualizado)

### Botón "Volver" del menú interactivo
**Problema:** Al presionar "Atrás", el menú del plato dejaba de funcionar porque no se restauraba el estado.

**Solución:** Se implementó la función `restorePlate()` que:
- Destruye los sprites expandidos
- Oculta el botón de volver
- Restaura `isExpanded = false`

### Navegación "Siguiente tutorial"
**Problema:** El botón no funcionaba y el título siempre era "Grupo 1".

**Solución:** 
- App.tsx ahora passa `selectedCategory` explícitamente
- Título cambia según la categoría: "Grupo 1: Frutas y Verduras", "Grupo 2: Cereales", etc.
- Navegación circular: 1 → 2 → 3 → 4 → 1

---

## Notas para Desarrolladores Futuros

1. **Modularidad:** Los componentes React están diseñados para ser reutilizables con cualquier tipo de alimento
2. **Estilo consistente:** Mantener la paleta de colores verdes/marrones para coherencia visual
3. **Integración Phaser-React:** Usar `window.showTutorial(categories)` para comunicar entre los dos mundos
4. **Assets:** Los sprites están organizados por carpeta: `/frutas/`, `/verduras/`, `/cereales/`, `/origenAnimal/`
5. **Config centralizada:** Usar `config/categoryConfig.ts` y `config/categoryColors.ts` para nuevos cambios de estilo

---

*Documentación actualizada: Mayo 2026*
*Proyecto: Serious Games - Alimentación Saludable*