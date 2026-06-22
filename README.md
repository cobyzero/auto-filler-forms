<div align="center">
  <h1>⚡ FakeFiller Forms Auto</h1>
  <p><i>Rellena y envía Google Forms automáticamente y en bucle con respuestas realistas y control de distribución porcentual.</i></p>

  <p>
    <img src="https://img.shields.io/badge/Platform-Chrome%20Extension-blue.svg?logo=google-chrome&logoColor=white" alt="Chrome Extension" />
    <img src="https://img.shields.io/badge/Manifest-V3-orange.svg" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License MIT" />
  </p>

  <img src="https://raw.githubusercontent.com/cobyzero/auto-filler-forms/refs/heads/main/1.png" alt="Vista previa de FakeFiller Forms Auto" width="480" style="border-radius: 10px;" />
</div>

---

## 📖 ¿Qué es FakeFiller Forms Auto?

**FakeFiller Forms Auto** es una extensión de Chrome (basada en Manifest V3) diseñada para automatizar el rellenado y envío de **Google Forms**. A diferencia de otros rellenadores genéricos, esta herramienta permite configurar **distribuciones porcentuales específicas** para preguntas de opción múltiple y casillas de verificación, lo que resulta ideal para pruebas de carga, simulación de encuestas o pruebas de flujos con respuestas ponderadas de manera realista.

Utiliza la librería **Chance.js** para la generación de datos aleatorios pero realistas (correos, edades y textos variables).

---

## ✨ Características Principales

- 🧠 **Relleno Inteligente de Datos:** Generación dinámica de correos electrónicos realistas, rangos de edades personalizables y textos descriptivos contextuales.
- 📊 **Control Porcentual Ponderado:** Define la probabilidad exacta (de 0% a 100%) para cada opción en preguntas de selección múltiple (Radio Buttons) y casillas (Checkboxes). El sistema valida automáticamente que las opciones sumen **100%** en preguntas exclusivas.
- 🔄 **Bucle de Envío Automatizado (Loop Mode):** Envía un formulario, detecta la confirmación de envío, hace clic en _"Enviar otra respuesta"_ y vuelve a rellenar el formulario de forma continua hasta alcanzar un límite definido o de forma infinita.
- ⚙️ **Configuración Flexible:** Activa la ejecución en modo automático (al cargar la página) o manual (con un solo botón desde el popup).
- 📥 **Importación y Exportación:** Guarda toda tu configuración y distribución de respuestas en archivos JSON para compartirlos o respaldarlos con facilidad.

---

## 🛠️ Instalación (Paso a Paso)

Sigue estos sencillos pasos para instalar la extensión en modo desarrollador:

1. **Descarga o clona** este repositorio en tu computadora.
2. Abre Google Chrome y navega a la sección de extensiones escribiendo `chrome://extensions/` en la barra de direcciones.
3. Activa el **"Modo de desarrollador"** (Developer mode) situado en la esquina superior derecha.
4. Haz clic en el botón **"Cargar descomprimida"** (Load unpacked) en la esquina superior izquierda.
5. Selecciona la carpeta que contiene los archivos del proyecto (donde se encuentra el archivo `manifest.json`).
6. ¡Listo! El icono de **FakeFiller Forms Auto** aparecerá en tu barra de herramientas de extensiones.

---

## 🚀 ¿Cómo se Usa?

### 1. Configuración desde el Popup

Haz clic en el icono de la extensión para abrir el panel de control:

- **Disparador (Trigger):** Elige si el rellenado debe iniciarse **Automáticamente** al abrir un formulario o **Manualmente** mediante un botón.
- **Acción al terminar:** Configura si la extensión solo debe **Rellenar** los campos o si también debe **Enviar (Submit)** el formulario de inmediato.
- **Modo Bucle (Loop):** Si está activado, la extensión continuará rellenando y enviando el formulario indefinidamente o hasta el límite de envíos que especifiques.

### 2. Configurar Ponderación de Respuestas

1. Abre un formulario de Google Forms en tu navegador.
2. Abre el popup de la extensión. Automáticamente se escanearán las preguntas de opción múltiple y casillas de la página actual.
3. Ajusta los porcentajes deseados para cada respuesta:
   - Para **opciones múltiples (Radio Buttons)**, asegúrate de que sumen **100%** (el indicador cambiará a verde).
   - Para **casillas de verificación (Checkboxes)**, puedes asignar el porcentaje individual de probabilidad de ser marcada (de 0% a 100%).

### 3. Ejecutar y Observar

- Si seleccionaste **Automático + Enviar**, abre el formulario y observa cómo la extensión rellena los campos, espera unos segundos aleatorios (para imitar el comportamiento humano) y envía el formulario, repitiendo el proceso en bucle.
- Puedes pausar la automatización en cualquier momento cambiando el disparador a **Manual** o desactivando el modo bucle.

---

## 💾 Respaldo de Ajustes

- **Exportar:** Haz clic en **"Exportar Configuración"** para descargar un archivo `.json` con tus reglas y porcentajes configurados.
- **Importar:** Haz clic en **"Importar Configuración"** para cargar un archivo previamente guardado y replicar la configuración al instante.

---

## 🔒 Licencia

Este proyecto está bajo la licencia **MIT**. Siéntete libre de modificarlo y adaptarlo a tus necesidades.
