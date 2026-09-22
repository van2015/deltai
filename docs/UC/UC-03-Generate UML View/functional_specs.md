# UC-03 — Generate UML View

## 1. Objective

Permitir al desarrollador visualizar, mediante un diagrama UML, una representación del modelo semántico de un proyecto previamente analizado.

La vista UML debe permitir al desarrollador comprender la estructura y las relaciones relevantes del proyecto sin necesidad de inspeccionar directamente todo el código fuente.

La vista generada representa el estado del modelo analizado y no modifica el proyecto.

---

# 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* Project Model

---

# 3. Preconditions

* Existe un proyecto abierto en DeltaI.
* El proyecto ha sido analizado, al menos parcialmente.
* Existe un modelo semántico disponible.
* El modelo contiene información que puede representarse mediante UML.

---

# 4. Postconditions

### Successful execution

* Existe una vista UML del proyecto o de la parte seleccionada del proyecto.
* La vista representa los elementos y relaciones disponibles en el modelo semántico.
* El desarrollador puede visualizar e inspeccionar la vista.
* La vista no modifica el proyecto ni su modelo semántico.

### Failed execution

* No se presenta una vista UML incorrecta como si fuera válida.
* El modelo semántico permanece sin modificaciones.
* El desarrollador recibe información sobre el motivo por el que no se pudo generar la vista.

---

# 5. Scenarios

## SC-01 — Generate UML view from a valid model

### Given

* Existe un modelo semántico válido.
* El modelo contiene elementos representables mediante UML.

### When

* El desarrollador solicita visualizar el modelo mediante UML.

### Then

* DeltaI genera una vista UML.
* La vista contiene los elementos representables del modelo.
* La vista contiene las relaciones representables entre dichos elementos.
* El desarrollador puede visualizar el diagrama.

---

## SC-02 — Generate UML view from a partially analyzed project

### Given

* Existe un modelo semántico parcial.
* El modelo contiene elementos que han sido analizados correctamente.

### When

* El desarrollador solicita la vista UML.

### Then

* DeltaI genera la vista utilizando la información disponible.
* Los elementos no analizados no se presentan como si hubieran sido correctamente analizados.
* La vista indica, cuando sea necesario, que la representación es parcial.

---

## SC-03 — Model contains no UML-representable elements

### Given

* Existe un modelo semántico válido.
* El modelo no contiene elementos que puedan representarse mediante la vista UML.

### When

* El desarrollador solicita generar la vista UML.

### Then

* DeltaI no genera un diagrama vacío presentándolo como una representación significativa del proyecto.
* El desarrollador recibe información indicando que no existen elementos representables.

---

## SC-04 — Generate UML for a selected subset

### Given

* Existe un modelo semántico con múltiples elementos.
* El desarrollador selecciona un subconjunto de elementos.

### When

* El desarrollador solicita generar una vista UML para la selección.

### Then

* DeltaI genera una vista que contiene los elementos seleccionados.
* La vista incluye las relaciones relevantes entre ellos.
* Los elementos que no forman parte de la selección no aparecen salvo que sean necesarios para representar una relación explícita.

La definición exacta de qué elementos relacionados deben incluirse queda pendiente.

---

## SC-05 — Generate UML including related elements

### Given

* El desarrollador ha seleccionado uno o varios elementos.
* Existen otros elementos relacionados con ellos.

### When

* El desarrollador solicita ampliar la vista.

### Then

* DeltaI incorpora los elementos relacionados que correspondan.
* Las relaciones relevantes quedan representadas.
* La vista continúa representando el modelo semántico de forma coherente.

---

## SC-06 — Model contains unsupported UML relationships

### Given

* El modelo contiene relaciones que no pueden representarse mediante la notación UML soportada por DeltaI.

### When

* El desarrollador solicita generar la vista.

### Then

* DeltaI representa las relaciones que sí puede representar.
* Las relaciones no soportadas no se representan incorrectamente.
* Cuando sea relevante, DeltaI informa de las relaciones omitidas.

---

## SC-07 — UML view already exists

### Given

* Existe una vista UML del modelo.
* El desarrollador solicita nuevamente generar la vista.

### When

* DeltaI genera la vista.

### Then

* La vista representa el estado actual del modelo.
* DeltaI no genera vistas duplicadas innecesariamente.

---

## SC-08 — Model has changed since the previous UML view

### Given

* Existe una vista UML previamente generada.
* El modelo semántico ha cambiado desde su generación.

### When

* El desarrollador solicita generar nuevamente la vista UML.

### Then

* DeltaI genera una vista correspondiente al nuevo estado del modelo.
* Los elementos eliminados del modelo no permanecen en la nueva vista.
* Los nuevos elementos representables aparecen en la nueva vista.
* Las relaciones se actualizan para representar el nuevo estado.

---

## SC-09 — UML generation fails

### Given

* Existe un modelo semántico válido.
* DeltaI no puede generar una vista UML válida.

### When

* El desarrollador solicita generar la vista.

### Then

* DeltaI informa del error.
* No presenta una vista incompleta o incorrecta como resultado válido.
* El modelo semántico permanece sin modificaciones.

---

## SC-10 — Developer navigates the UML view

### Given

* Existe una vista UML válida.

### When

* El desarrollador interactúa con la vista.

### Then

* Puede inspeccionar los elementos representados.
* Puede identificar las relaciones entre los elementos.
* La navegación de la vista no modifica el proyecto.

---

# 6. Business Rules

### BR-001 — Model is the source of truth

La vista UML debe representar el modelo semántico disponible y no realizar una interpretación independiente del código fuente.

### BR-002 — No invented elements

La vista no debe contener elementos que no existan en el modelo semántico.

### BR-003 — No invented relationships

La vista no debe representar relaciones que no estén presentes en el modelo semántico.

### BR-004 — Representation consistency

Los elementos y relaciones representados deben corresponder al mismo estado del modelo.

### BR-005 — Non-destructive visualization

Generar o visualizar un diagrama UML no modifica el proyecto ni el modelo semántico.

### BR-006 — Partial model

Cuando el modelo sea parcial, la vista no debe representar como completos los elementos cuya información no haya sido analizada.

### BR-007 — Current model

Una nueva generación de la vista debe utilizar el estado actual del modelo.

### BR-008 — View is a representation

La vista UML es una representación del modelo, no una nueva fuente de información semántica.

---

# 7. Input

El caso de uso requiere:

* Modelo semántico del proyecto.

Opcionalmente:

* Selección de elementos.
* Criterios de filtrado.
* Configuración de la vista.

La definición concreta de estas opciones queda pendiente.

---

# 8. Output

### Success

Una vista UML que representa el modelo semántico seleccionado.

Conceptualmente:

```text
Project Model
      │
      │ Generate UML View
      ↓
   UML View
      │
      ├── Elements
      └── Relationships
```

### Failure

* No se genera una vista válida.
* El modelo permanece sin modificaciones.
* Se informa del motivo del fallo.

---

# 9. State Transitions

### Generate initial view

```text
Analyzed Model
      │
      │ Generate UML
      ↓
UML View Available
```

### Regenerate after model change

```text
UML View
    │
    │ Model changed
    ↓
Outdated UML View
    │
    │ Regenerate
    ↓
Current UML View
```

### Failed generation

```text
Analyzed Model
      │
      │ Generate UML
      ↓
Generation Failed
```

---

# 10. Side Effects

### Permitted

* Crear una representación visual del modelo.
* Guardar información asociada a la vista, si DeltaI necesita persistirla.

### Not permitted

* Modificar archivos fuente.
* Modificar el modelo semántico.
* Modificar el proyecto.
* Modificar el código.
* Aplicar cambios.
* Crear `ChangeSet`.
* Inferir y añadir elementos inexistentes en el modelo.

---

# 11. External Dependencies

Este caso de uso no requiere necesariamente dependencias externas.

Puede utilizar internamente:

* Un mecanismo de representación UML.
* Un sistema de renderizado gráfico.

La tecnología concreta utilizada queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Responsiveness

La interacción básica con la vista UML debe ser suficientemente fluida para permitir explorar el modelo.

### NFR-002 — Readability

Los elementos y relaciones deben presentarse de forma que puedan ser identificados por el desarrollador.

### NFR-003 — Consistency

La vista debe mantener una correspondencia coherente con el modelo semántico.

### NFR-004 — Scalability

La vista debe poder manejar proyectos suficientemente grandes para los objetivos del MVP.

La cantidad máxima de elementos visible simultáneamente queda pendiente de definición.

### NFR-005 — Non-destructive

La visualización no debe modificar el proyecto ni su modelo semántico.

---

# 13. Acceptance Criteria

### AC-001 — Valid model

Dado un modelo semántico válido, cuando el desarrollador solicita una vista UML, se genera una representación UML válida.

### AC-002 — Elements

Los elementos representables del modelo aparecen en la vista.

### AC-003 — Relationships

Las relaciones representables del modelo aparecen correctamente en la vista.

### AC-004 — No invented information

La vista no contiene elementos ni relaciones que no existan en el modelo.

### AC-005 — Partial model

Un modelo parcial puede representarse sin presentar como analizada la información que no está disponible.

### AC-006 — Empty model

Un modelo sin elementos representables informa al desarrollador de que no existe contenido que mostrar.

### AC-007 — Selection

Cuando el desarrollador selecciona un subconjunto de elementos, puede generar una vista correspondiente a dicha selección.

### AC-008 — Current model

Cuando el modelo cambia y se regenera la vista, la nueva vista representa el nuevo estado del modelo.

### AC-009 — Non-destructive

Generar y visualizar UML no modifica el proyecto ni el modelo semántico.

### AC-010 — Navigation

El desarrollador puede inspeccionar los elementos y relaciones representados en la vista.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* Proyecto con miles de elementos.
* Diagrama con demasiados elementos para una representación legible.
* Elementos sin relaciones.
* Relaciones circulares.
* Jerarquías de herencia muy profundas.
* Relaciones entre elementos parcialmente analizados.
* Elementos duplicados o ambiguos.
* Modelo parcialmente analizado.
* Modelo modificado mientras se genera la vista.
* Modelo modificado mientras el desarrollador está visualizando el diagrama.
* Elementos eliminados desde la generación anterior.
* Elementos nuevos desde la generación anterior.
* Relaciones demasiado numerosas para una representación legible.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Analizar código fuente.
* Modificar código.
* Generar código.
* Solicitar cambios al agente.
* Aplicar cambios.
* Crear `ChangeSet`.
* Determinar la intención del desarrollador.
* Corregir el modelo semántico.
* Inventar relaciones que no puedan determinarse del modelo.
* Ejecutar tests.
* Integración con Git.
* Gestión de versiones.
* Edición semántica del modelo.

La edición interactiva de la vista y la transmisión de ese contexto al agente pertenecen a casos de uso posteriores.

---

# 16. Dependencies on Other Use Cases

### UC-01 — Open Project

Proporciona el proyecto sobre el que se realizará el análisis.

```text
UC-01 Open Project
        │
        ↓
UC-02 Analyze Project
        │
        ↓
UC-03 Generate UML View
```

### UC-02 — Analyze Project

`UC-03` depende del modelo semántico producido por `UC-02`.

### Future use cases

La vista UML será posteriormente utilizada por casos de uso relacionados con:

* Interacción con la vista.
* Selección de elementos.
* Edición/anotación de la vista.
* Generación de contexto para el agente.
* Visualización del delta producido por el agente.

---

# 17. Traceability

```text
UC-03 Generate UML View
│
├── SC-01 Generate UML from valid model
├── SC-02 Partial model
├── SC-03 No representable elements
├── SC-04 Selected subset
├── SC-05 Related elements
├── SC-06 Unsupported relationships
├── SC-07 Existing UML view
├── SC-08 Changed model
├── SC-09 Generation failure
└── SC-10 Navigate UML view
│
├── BR-001 Model is source of truth
├── BR-002 No invented elements
├── BR-003 No invented relationships
├── BR-004 Representation consistency
├── BR-005 Non-destructive visualization
├── BR-006 Partial model
├── BR-007 Current model
└── BR-008 View is a representation
│
└── Acceptance Criteria
    ├── AC-001 Valid model
    ├── AC-002 Elements
    ├── AC-003 Relationships
    ├── AC-004 No invented information
    ├── AC-005 Partial model
    ├── AC-006 Empty model
    ├── AC-007 Selection
    ├── AC-008 Current model
    ├── AC-009 Non-destructive
    └── AC-010 Navigation
```
