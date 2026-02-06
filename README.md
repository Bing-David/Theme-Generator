# VS Code Theme Generator

Una extensión para Visual Studio Code que permite crear, personalizar y exportar temas visuales personalizados con control total sobre la paleta de colores.

---

## Descripción General

VS Code Theme Generator es una herramienta completa para desarrolladores que desean crear temas visuales únicos y personalizados. La extensión proporciona un generador inteligente de paletas de colores basado en teoría cromática, junto con un editor visual interactivo que permite ajustar cada aspecto del tema en tiempo real.

---

## Funcionalidades Principales

### Generación Automática de Paletas

La extensión implementa seis tipos diferentes de armonías cromáticas para generar automáticamente paletas coherentes y visualmente atractivas:

- **Paleta Complementaria**: Colores opuestos en la rueda cromática para máximo contraste
- **Paleta Análoga**: Colores adyacentes para una apariencia armónica y cohesiva
- **Paleta Tríada**: Tres colores equidistantes para equilibrio visual
- **Paleta Tetrádica**: Cuatro colores para variedad controlada
- **Paleta Monocromática**: Variaciones de un único color
- **Paleta Aleatoria**: Combinaciones inesperadas para inspiración creativa

### Editor Visual Interactivo

Interface intuitiva con controles precisos para ajustar la paleta generada:

- **Deslizadores de Saturación**: Controla la intensidad de los colores
- **Controles de Luminosidad**: Ajusta el brillo de cada color
- **Variación de Tonalidad**: Modifica sutilmente la base cromática
- **Vista Previa en Tiempo Real**: Observa los cambios inmediatamente en VS Code

### Validación de Accesibilidad

Todos los colores generados cumplen con los estándares de contraste "WCAG AA", garantizando que los temas sean accesibles para usuarios con diferentes capacidades visuales.

### Gestión de Paletas Personalizadas

- **Guardar Paletas**: Almacena tus paletas favoritas localmente
- **Cargar Paletas Previas**: Recupera paletas guardadas anteriormente
- **Editar Existentes**: Modifica cualquier paleta guardada

### Importación y Exportación

- **Importar Temas**: Lee archivos de tema JSON existentes
- **Exportar Temas**: Guarda tus creaciones como temas de VS Code instalables
- **Compatibilidad Completa**: Los temas exportados funcionan nativamente en VS Code

---

## Características Técnicas

### Requisitos del Sistema

- Visual Studio Code: **1.50.0** o superior
- Node.js: **14.0.0** o superior
- npm: **6.0.0** o superior

### Dependencias Principales

```json
{
  "vscode": "^1.50.0",
  "chroma-js": "^2.4.2",
  "wcag-contrast": "^4.0.0"
}
```

### Tecnologías Utilizadas

- **TypeScript**: Desarrollo seguro y escalable
- **VS Code API**: Integración profunda con el editor
- **Webview**: Interface visual moderna y responsiva
- **HTML5 / CSS3**: Diseño limpio y profesional

---

## Estructura del Repositorio

```
Theme-Generator/
├── src/
│   ├── extension.ts              # Punto de entrada y registro de comandos
│   ├── colorGenerator.ts         # Motor de generación de paletas
│   ├── themeExporter.ts          # Conversión paleta → tema VS Code
│   ├── customPalette.ts          # Gestión de persistencia local
│   ├── webviewPanel.ts           # Control del panel webview
│   ├── sidebarProvider.ts        # Proveedor de la vista de árbol
│   ├── webviewHtml.ts            # Template HTML de la interface
│   ├── webviewStyle.ts           # Estilos CSS del webview
│   └── webviewScript.ts          # Lógica cliente-side del webview
├── package.json                   # Metadatos y configuración
├── tsconfig.json                  # Configuración de TypeScript
├── webpack.config.js             # Empaquetación y bundling
└── README.md                      # Documentación del proyecto
```

### Descripción de Módulos Principales

**extension.ts**
Punto de entrada de la extensión. Registra todos los comandos de VS Code y gestiona el ciclo de vida de la aplicación.

**colorGenerator.ts**
Implementa la lógica de generación de paletas cromáticas. Contiene algoritmos basados en teoría del color para crear combinaciones armónicas y validar contraste WCAG.

**themeExporter.ts**
Mapea la paleta de colores generada al formato de tema nativo de VS Code. Maneja tanto la exportación de temas como la importación de archivos existentes.

**customPalette.ts**
Gestiona el almacenamiento persistente de paletas en el estado global de VS Code, permitiendo recuperar paletas guardadas entre sesiones.

**webviewPanel.ts**
Controla el ciclo de vida del panel webview y gestiona la comunicación entre la extensión y la interface visual.

**sidebarProvider.ts**
Proporciona el árbol de vistas que aparece en la barra lateral de VS Code, mostrando paletas disponibles y opciones rápidas.

---

## Instalación y Configuración

### Instalación de Dependencias

```bash
npm install
```

### Compilación

```bash
npm run build
```

O utiliza el atajo de teclado **Ctrl+Shift+B** en VS Code.

### Ejecución en Modo Debug

Presiona **F5** para ejecutar la extensión en una instancia de desarrollo de VS Code.

---

## Uso Básico

**1. Abrir Theme Generator**

Presiona **Ctrl+Shift+P** para abrir la paleta de comandos y busca "Theme Generator".

**2. Generar una Paleta**

Selecciona el tipo de armonía cromática deseada y el generador creará automáticamente una paleta.

**3. Personalizar**

Utiliza los controles de la barra lateral para ajustar saturación, luminosidad y variación según tus preferencias.

**4. Guardar**

Guarda la paleta para uso futuro o exporta directamente como tema de VS Code.

---

## Configuración

La extensión respeta los ajustes estándar de VS Code. Accede a los parámetros de configuración presionando **Ctrl+,** y busca "Theme Generator" para ver las opciones disponibles.

---

## Problemas Conocidos

No hay problemas conocidos reportados en la versión actual.

---

## Notas de Versión

### Versión 1.0.0

Lanzamiento inicial con funcionalidad completa:

- Generador de paletas con 6 tipos de armonía
- Editor visual interactivo
- Validación de accesibilidad WCAG AA
- Importación y exportación de temas
- Almacenamiento persistente de paletas
- Interface webview responsiva

---

## Contribuciones

Las contribuciones son bienvenidas y valoradas. Para reportar problemas o sugerir mejoras:

1. Abre un **Issue** describiendo el problema o sugerencia
2. Envía un **Pull Request** con tus cambios
3. Asegúrate de seguir los estándares de código existentes

---

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo LICENSE para más detalles.

---

## Autor

**Jeiler David**

Desarrollador y creador de Theme Generator.

- GitHub: [@Bing-david](https://github.com/Bing-david)

---

## Soporte y Contacto

Si encuentras problemas o tienes preguntas, por favor abre un issue en el repositorio de GitHub 
