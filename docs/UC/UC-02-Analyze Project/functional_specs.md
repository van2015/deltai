# UC-02 — Analyze Project

## 1. Objective

Analizar el contenido de un proyecto abierto y construir una representación semántica del mismo que pueda ser utilizada por DeltaI para comprender su estructura y relaciones.

El análisis debe identificar, como mínimo, los elementos necesarios para representar la estructura del código y permitir posteriormente generar vistas y trabajar con cambios sobre el proyecto.

---

# 2. Actors

### Primary Actor

* DeltaI

### Secondary Actor

* Developer
* File System

---

# 3. Preconditions

* Existe un proyecto abierto en DeltaI.
* El proyecto es accesible.
* DeltaI puede acceder al contenido que debe analizar.
* El proyecto utiliza tecnologías soportadas por el analizador.

---

# 4. Postconditions

### Successful execution

* El contenido analizable del proyecto ha sido procesado.
* DeltaI dispone de una representación semántica del proyecto.
* Los elementos identificados están relacionados entre sí de acuerdo con la estructura del código.
* La representación semántica corresponde al estado del proyecto analizado.
* El modelo queda disponible para los casos de uso posteriores.

### Failed execution

* El análisis no se considera completado.
* DeltaI no debe presentar como completo un modelo que no represente correctamente el proyecto.
* El desarrollador recibe información sobre el motivo del fallo.
* El proyecto abierto no se modifica como consecuencia del análisis.

---

# 5. Scenarios

## SC-01 — Analyze a valid project

### Given

* Existe un proyecto abierto.
* El proyecto utiliza tecnologías soportadas.
* El contenido del proyecto es accesible.

### When

* DeltaI inicia el análisis del proyecto.

### Then

* DeltaI analiza el contenido del proyecto.
* Identifica los elementos semánticos soportados.
* Identifica las relaciones entre dichos elementos.
* Construye una representación semántica del proyecto.
* El análisis finaliza correctamente.
* El modelo queda disponible para operaciones posteriores.

---

## SC-02 — Analyze an empty project

### Given

* Existe un proyecto abierto.
* El proyecto no contiene elementos de código analizables.

### When

* DeltaI analiza el proyecto.

### Then

* El análisis finaliza correctamente.
* La representación semántica indica que no existen elementos analizables.
* DeltaI no interpreta la ausencia de elementos como un error.

---

## SC-03 — Analyze a project containing unsupported files

### Given

* Existe un proyecto abierto.
* El proyecto contiene archivos que DeltaI no puede analizar.
* También contiene contenido que sí puede analizar.

### When

* DeltaI analiza el proyecto.

### Then

* DeltaI analiza el contenido soportado.
* El contenido no soportado no impide necesariamente completar el análisis.
* DeltaI identifica o informa de la existencia de contenido no analizado.
* El modelo resultante no presenta el contenido no soportado como si hubiera sido analizado.

---

## SC-04 — Analyze a project using an unsupported language

### Given

* Existe un proyecto abierto.
* El lenguaje principal del proyecto no está soportado por DeltaI.

### When

* DeltaI intenta analizar el proyecto.

### Then

* DeltaI informa de que el lenguaje no está soportado.
* El análisis no se considera completado.
* DeltaI no genera un modelo semántico incorrecto presentándolo como válido.

---

## SC-05 — Source file cannot be analyzed

### Given

* Existe un proyecto abierto.
* Un archivo que debería analizarse no puede ser procesado correctamente.

### When

* DeltaI analiza el proyecto.

### Then

* DeltaI detecta el problema.
* DeltaI identifica el archivo afectado.
* El resultado del análisis indica que existe contenido que no ha podido ser procesado.
* DeltaI no presenta como correctamente analizada la información que no pudo procesar.

Debe determinarse si este escenario permite un análisis parcial o si el fallo de un único archivo debe hacer que todo el análisis falle.

---

## SC-06 — Source code contains syntax errors

### Given

* Existe un proyecto abierto.
* Uno o más archivos contienen errores sintácticos.

### When

* DeltaI analiza el proyecto.

### Then

* DeltaI detecta los errores que pueda identificar.
* DeltaI informa de los archivos afectados.
* DeltaI no debe inventar información semántica que no pueda determinar a partir del código.

Debe determinarse si DeltaI conserva el modelo parcial que pueda construir o considera fallido el análisis completo.

---

## SC-07 — Project changes during analysis

### Given

* Existe un proyecto abierto.
* El contenido del proyecto cambia mientras DeltaI está realizando el análisis.

### When

* DeltaI continúa el análisis.

### Then

* DeltaI debe detectar o evitar producir un modelo que combine información perteneciente a estados incompatibles del proyecto.
* El modelo resultante debe corresponder a un estado coherente del proyecto.
* Si no puede garantizarse dicha coherencia, el análisis no debe considerarse válido.

---

## SC-08 — Re-analyze an already analyzed project

### Given

* Existe un proyecto abierto.
* El proyecto ya ha sido analizado.

### When

* DeltaI vuelve a ejecutar el análisis.

### Then

* DeltaI analiza nuevamente el estado actual del proyecto.
* El modelo resultante representa el estado analizado.
* El análisis anterior no debe provocar que DeltaI ignore cambios existentes en el proyecto.

---

## SC-09 — Analyze after source changes

### Given

* Existe un proyecto abierto y previamente analizado.
* El contenido del proyecto ha cambiado desde el análisis anterior.

### When

* DeltaI ejecuta nuevamente el análisis.

### Then

* DeltaI detecta los elementos relevantes del nuevo estado.
* El modelo resultante representa el nuevo estado del proyecto.
* Los elementos que ya no existen no deben permanecer en el modelo actual.

---

## SC-10 — Analysis is cancelled

### Given

* DeltaI está analizando un proyecto.
* El análisis todavía no ha terminado.

### When

* El desarrollador solicita cancelar el análisis.

### Then

* DeltaI detiene el análisis cuando sea posible.
* El análisis no se considera completado.
* DeltaI no presenta el resultado parcial como un análisis completo.

Debe determinarse posteriormente si el resultado parcial puede conservarse para una futura continuación.

---

# 6. Business Rules

### BR-001 — Representation of the source

El modelo semántico debe representar únicamente información que pueda derivarse del contenido analizado.

### BR-002 — No invented information

DeltaI no debe inventar elementos o relaciones que no puedan determinarse a partir del proyecto analizado.

### BR-003 — State consistency

El modelo semántico debe corresponder a un estado coherente del proyecto.

### BR-004 — Analysis is non-destructive

Analizar un proyecto no debe modificar su contenido.

### BR-005 — Unsupported content

El contenido que DeltaI no pueda analizar no debe representarse como si hubiera sido analizado correctamente.

### BR-006 — Current state

Cuando se realiza un nuevo análisis, el resultado debe representar el estado del proyecto analizado y no conservar elementos obsoletos del análisis anterior.

### BR-007 — Explicit analysis status

DeltaI debe distinguir entre:

* análisis completado,
* análisis parcial,
* análisis fallido,
* análisis cancelado.

### BR-008 — Deterministic representation

Dado el mismo estado del proyecto y las mismas reglas de análisis, DeltaI debería producir una representación semántica equivalente.

---

# 7. Input

El caso de uso requiere:

* Un proyecto abierto.
* El contenido del proyecto que debe analizarse.

El análisis puede considerar:

* archivos fuente,
* estructura de directorios,
* configuración relevante del proyecto,
* tests,
* otros artefactos soportados.

La lista exacta de artefactos soportados deberá definirse según el lenguaje y las tecnologías incluidas en el MVP.

---

# 8. Output

### Success

Una representación semántica del proyecto que contenga, como mínimo, los elementos soportados identificados durante el análisis y sus relaciones.

Conceptualmente:

```text
Project Model
│
├── Elements
│   ├── Classes
│   ├── Interfaces
│   ├── Methods
│   ├── Properties
│   └── ...
│
└── Relationships
    ├── Inheritance
    ├── Implementation
    ├── Dependency
    └── ...
```

### Partial

Un modelo que representa únicamente el contenido que pudo analizarse correctamente, acompañado de información sobre las partes no analizadas.

### Failure

* No existe un modelo válido resultante del análisis.
* Se informa del motivo del fallo.

---

# 9. State Transitions

### Initial analysis

```text
Not Analyzed
      │
      │ Analyze
      ↓
  Analyzing
      │
      ↓
   Analyzed
```

### Partial analysis

```text
Analyzing
    │
    │ Some content cannot be analyzed
    ↓
Partially Analyzed
```

### Failed analysis

```text
Analyzing
    │
    │ Analysis cannot produce a valid model
    ↓
   Failed
```

### Re-analysis

```text
Analyzed
    │
    │ Re-analyze
    ↓
Analyzing
    │
    ↓
Analyzed
```

---

# 10. Side Effects

### Permitted

* Leer el contenido del proyecto.
* Crear o actualizar la representación semántica del proyecto.
* Registrar información relacionada con el resultado del análisis.

### Not permitted

* Modificar archivos fuente.
* Crear archivos dentro del proyecto.
* Eliminar archivos.
* Modificar la configuración del proyecto.
* Modificar el estado del proyecto.
* Modificar Git.
* Aplicar cambios.
* Crear un `ChangeSet`.

---

# 11. External Dependencies

* File System

El caso de uso puede depender de herramientas capaces de interpretar los lenguajes soportados.

La tecnología concreta utilizada para realizar el análisis queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Progress feedback

DeltaI debe proporcionar información sobre el progreso cuando el análisis pueda tardar perceptiblemente.

### NFR-002 — Error clarity

Los errores de análisis deben identificar, cuando sea posible:

* el tipo de error,
* el archivo afectado,
* información suficiente para que el desarrollador pueda comprender el problema.

### NFR-003 — Non-destructive

El análisis no debe modificar el proyecto.

### NFR-004 — Consistency

El modelo generado debe representar un estado coherente del proyecto.

### NFR-005 — Scalability

El análisis debe poder ejecutarse sobre proyectos suficientemente grandes para los objetivos definidos para el MVP.

El tamaño máximo concreto queda pendiente de definición.

---

# 13. Acceptance Criteria

### AC-001 — Valid project

Dado un proyecto abierto y soportado, cuando se analiza, se genera una representación semántica válida del proyecto.

### AC-002 — Elements

El modelo resultante contiene los elementos soportados que pueden determinarse a partir del código.

### AC-003 — Relationships

El modelo contiene las relaciones soportadas que pueden determinarse entre los elementos analizados.

### AC-004 — Empty project

Un proyecto sin elementos analizables puede analizarse correctamente y produce un modelo vacío.

### AC-005 — Unsupported files

Los archivos no soportados no se presentan como analizados correctamente.

### AC-006 — Unsupported language

Un proyecto cuyo lenguaje no está soportado no produce un modelo semántico válido.

### AC-007 — Syntax errors

Los errores sintácticos detectados se comunican al desarrollador y no se generan elementos semánticos que no puedan determinarse correctamente.

### AC-008 — Re-analysis

Al volver a analizar un proyecto modificado, el modelo resultante representa el nuevo estado y no conserva elementos obsoletos.

### AC-009 — Non-destructive

El análisis no modifica el contenido del proyecto.

### AC-010 — Consistent state

El modelo generado corresponde a un estado coherente del proyecto.

### AC-011 — Analysis status

DeltaI distingue correctamente entre análisis completado, parcial, fallido y cancelado.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* Proyecto extremadamente grande.
* Proyecto con miles de archivos.
* Proyecto con múltiples lenguajes.
* Archivos parcialmente soportados.
* Archivos corruptos.
* Errores sintácticos múltiples.
* Dependencias externas no disponibles.
* Código generado automáticamente.
* Archivos duplicados o enlaces simbólicos.
* Cambios simultáneos durante el análisis.
* Archivos que cambian mientras están siendo analizados.
* Análisis interrumpido.
* Proyecto previamente analizado.
* Modelo semántico previamente existente pero desactualizado.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Modificar el código.
* Corregir errores del código.
* Generar código.
* Generar `ChangeSet`.
* Solicitar cambios al agente.
* Generar una propuesta de implementación.
* Generar diagramas UML.
* Ejecutar tests.
* Ejecutar el proyecto.
* Analizar repositorios Git.
* Hacer commits.
* Gestionar ramas.
* Inferir intención del desarrollador.
* Inferir arquitectura que no pueda determinarse del código.

---

# 16. Dependencies on Other Use Cases

### UC-01 — Open Project

`Analyze Project` requiere que exista un proyecto abierto.

```text
UC-01 Open Project
        │
        ↓
UC-02 Analyze Project
```

### Future use cases

El resultado de `Analyze Project` será utilizado posteriormente por casos de uso relacionados con:

* Visualización del modelo.
* Generación de UML.
* Selección de elementos.
* Generación de ChangeSets.
* Interacción con el agente.

---

# 17. Traceability

```text
UC-02 Analyze Project
│
├── SC-01 Analyze valid project
├── SC-02 Analyze empty project
├── SC-03 Unsupported files
├── SC-04 Unsupported language
├── SC-05 Source file cannot be analyzed
├── SC-06 Syntax errors
├── SC-07 Project changes during analysis
├── SC-08 Re-analyze project
├── SC-09 Analyze after source changes
└── SC-10 Analysis cancelled
│
├── BR-001 Representation of source
├── BR-002 No invented information
├── BR-003 State consistency
├── BR-004 Analysis is non-destructive
├── BR-005 Unsupported content
├── BR-006 Current state
├── BR-007 Explicit analysis status
└── BR-008 Deterministic representation
│
└── Acceptance Criteria
    ├── AC-001 Valid project
    ├── AC-002 Elements
    ├── AC-003 Relationships
    ├── AC-004 Empty project
    ├── AC-005 Unsupported files
    ├── AC-006 Unsupported language
    ├── AC-007 Syntax errors
    ├── AC-008 Re-analysis
    ├── AC-009 Non-destructive
    ├── AC-010 Consistent state
    └── AC-011 Analysis status
```
