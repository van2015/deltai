# UC-04 — Request Change

## 1. Objective

Permitir al desarrollador solicitar al agente un cambio sobre el proyecto utilizando lenguaje natural y el contexto disponible en DeltaI.

El agente debe interpretar la petición, analizar el contexto relevante del proyecto y producir una propuesta de cambio.

La propuesta no se considera aplicada hasta que sea aceptada mediante un caso de uso posterior.

---

# 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* AI Agent
* Project
* Project Model
* UML View

---

# 3. Preconditions

* Existe un proyecto abierto en DeltaI.
* El proyecto dispone de un modelo semántico, al menos parcialmente.
* El agente está disponible.
* El desarrollador puede introducir una petición.

---

# 4. Postconditions

### Successful execution

* La petición del desarrollador ha sido recibida por el agente.
* El agente ha procesado la petición utilizando el contexto disponible.
* Existe una propuesta de cambio.
* La propuesta está asociada al proyecto y al estado sobre el que fue generada.
* El proyecto original no ha sido modificado como consecuencia de la generación de la propuesta.

### Failed execution

* No existe una propuesta válida.
* El proyecto permanece sin modificaciones.
* El desarrollador recibe información sobre el motivo por el que no se pudo generar la propuesta.

---

# 5. Scenarios

## SC-01 — Request a valid change

### Given

* Existe un proyecto abierto y analizado.
* El agente está disponible.
* El desarrollador tiene una petición de cambio válida.

### When

* El desarrollador envía la petición al agente.

### Then

* DeltaI proporciona al agente el contexto necesario.
* El agente procesa la petición.
* El agente genera una propuesta de cambio.
* La propuesta queda asociada al estado del proyecto sobre el que fue generada.
* El proyecto no se modifica todavía.

---

## SC-02 — Request change using natural language

### Given

* El desarrollador describe el cambio utilizando lenguaje natural.
* La petición es suficientemente clara para que el agente pueda interpretarla.

### When

* El desarrollador envía la petición.

### Then

* El agente interpreta la intención de la petición.
* Identifica los elementos del proyecto afectados.
* Genera una propuesta de cambio coherente con la petición.

---

## SC-03 — Request change referring to project elements

### Given

* El desarrollador hace referencia a elementos concretos del proyecto.

Por ejemplo:

```text
"Extrae la lógica de validación de Order a una nueva clase."
```

### When

* El desarrollador envía la petición.

### Then

* El agente identifica los elementos relevantes del modelo.
* Utiliza dichos elementos como contexto.
* Genera una propuesta relacionada con ellos.

---

## SC-04 — Request change with insufficient context

### Given

* El desarrollador realiza una petición.
* El contexto disponible no permite determinar qué debe modificarse.

### When

* El desarrollador envía la petición.

### Then

* El agente identifica la ambigüedad.
* No genera una propuesta arbitraria presentándola como correcta.
* Solicita información adicional al desarrollador.

---

## SC-05 — Request change that cannot be implemented

### Given

* El desarrollador realiza una petición suficientemente clara.
* El agente determina que no puede producir una implementación válida con el estado actual del proyecto.

### When

* El desarrollador envía la petición.

### Then

* El agente informa de que no puede generar una propuesta válida.
* Explica, cuando sea posible, las restricciones que impiden realizarla.
* El proyecto permanece sin modificaciones.

---

## SC-06 — Agent needs additional project context

### Given

* El desarrollador realiza una petición válida.
* El contexto inicialmente proporcionado al agente no es suficiente.

### When

* El agente procesa la petición.

### Then

* El agente puede solicitar o acceder al contexto adicional disponible en el proyecto.
* El agente utiliza dicho contexto para continuar la generación de la propuesta.
* El resultado queda asociado a la petición original.

---

## SC-07 — Agent proposes a change affecting multiple elements

### Given

* La petición afecta a varios elementos del proyecto.

### When

* El agente genera la propuesta.

### Then

* La propuesta contempla todos los elementos afectados que el agente haya identificado.
* Las relaciones entre los cambios quedan preservadas.
* La propuesta representa una única modificación coherente del proyecto.

---

## SC-08 — Agent proposes no changes

### Given

* El desarrollador realiza una petición.
* El agente determina que el proyecto ya satisface la petición o que no es necesario modificarlo.

### When

* El agente procesa la petición.

### Then

* El agente informa de que no es necesario realizar cambios.
* No se genera una propuesta de modificación.
* El proyecto permanece sin modificaciones.

---

## SC-09 — Developer submits a new request after a proposal

### Given

* Existe una propuesta de cambio generada por una petición anterior.
* El desarrollador realiza una nueva petición.

### When

* El desarrollador envía la nueva petición.

### Then

* La nueva petición se procesa como una nueva interacción.
* El contexto relevante de la interacción anterior puede utilizarse cuando corresponda.
* La nueva propuesta queda diferenciada de la anterior.

---

## SC-10 — Project changes while the agent is working

### Given

* El agente está procesando una petición.
* El estado del proyecto cambia antes de finalizar la generación de la propuesta.

### When

* El agente termina de generar la propuesta.

### Then

* DeltaI detecta que el estado sobre el que se generó la propuesta puede haber quedado obsoleto.
* La propuesta no debe presentarse como aplicable al estado actual sin advertir dicha situación.
* El desarrollador recibe información sobre la discrepancia de estados.

---

## SC-11 — Agent cannot be reached

### Given

* Existe una petición válida.
* El agente no está disponible.

### When

* El desarrollador envía la petición.

### Then

* DeltaI informa de que el agente no está disponible.
* La petición no se considera procesada.
* El proyecto permanece sin modificaciones.

---

## SC-12 — Agent generation fails

### Given

* El agente está disponible.
* La petición ha sido recibida.
* Se produce un error durante la generación de la propuesta.

### When

* El proceso de generación termina de forma incorrecta.

### Then

* DeltaI informa del fallo.
* No se presenta una propuesta incompleta como válida.
* El proyecto permanece sin modificaciones.

---

# 6. Business Rules

### BR-001 — No implicit application

Generar una propuesta no implica aplicar el cambio al proyecto.

### BR-002 — Project state association

Toda propuesta debe estar asociada al estado del proyecto sobre el que fue generada.

### BR-003 — No arbitrary interpretation

El agente no debe presentar como propuesta válida una interpretación arbitraria cuando la petición no proporciona contexto suficiente.

### BR-004 — No source modification

La generación de una propuesta no debe modificar el proyecto.

### BR-005 — Proposal represents intended change

La propuesta debe representar el cambio que el agente considera necesario para satisfacer la petición del desarrollador.

### BR-006 — Contextual interpretation

El agente debe poder utilizar el contexto disponible del proyecto para interpretar la petición.

### BR-007 — Multiple-element changes

Una propuesta puede afectar a múltiples elementos del proyecto y debe mantener la coherencia entre ellos.

### BR-008 — State validity

Una propuesta generada sobre un estado que ya no coincide con el estado actual del proyecto debe considerarse potencialmente obsoleta.

### BR-009 — Explicit no-change result

El agente puede determinar que una petición no requiere modificaciones y debe poder expresarlo explícitamente.

---

# 7. Input

El caso de uso requiere:

* Petición del desarrollador.

Contexto disponible:

* Proyecto abierto.
* Modelo semántico.
* Estado actual del proyecto.
* Información de la interacción con el desarrollador.
* Contexto adicional seleccionado por el desarrollador, cuando exista.

La forma concreta en que este contexto se entregue al agente queda fuera de esta especificación.

---

# 8. Output

### Success

Una propuesta de cambio asociada a:

* La petición del desarrollador.
* El proyecto.
* El estado del proyecto sobre el que se generó.
* Los elementos afectados identificados por el agente.

Conceptualmente:

```text
Change Request
      │
      ↓
    Agent
      │
      ↓
Change Proposal
      │
      ├── Affected Elements
      ├── Intended Changes
      └── Project State
```

### No change

El agente determina que no es necesario modificar el proyecto.

### Failure

* No existe una propuesta válida.
* El proyecto permanece sin modificaciones.
* Se informa del motivo del fallo.

---

# 9. State Transitions

### Request processing

```text
Ready
  │
  │ Submit request
  ↓
Processing
  │
  ↓
Proposal Available
```

### Insufficient context

```text
Processing
    │
    │ Insufficient context
    ↓
Waiting for Context
    │
    │ Additional context
    ↓
Processing
```

### No change

```text
Processing
    │
    │ No changes required
    ↓
No Change
```

### Failed

```text
Processing
    │
    │ Generation failed
    ↓
Failed
```

---

# 10. Side Effects

### Permitted

* Crear una propuesta de cambio.
* Registrar la petición del desarrollador.
* Registrar el contexto utilizado.
* Registrar el estado del proyecto sobre el que se generó la propuesta.
* Registrar información de la interacción con el agente.

### Not permitted

* Modificar el código fuente.
* Modificar el modelo semántico.
* Modificar el proyecto.
* Aplicar automáticamente la propuesta.
* Crear commits.
* Modificar Git.
* Sustituir el estado actual del proyecto.

---

# 11. External Dependencies

* AI Agent
* File System, cuando sea necesario obtener contexto del proyecto.

La tecnología concreta utilizada para comunicarse con el agente queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Responsiveness

DeltaI debe proporcionar información sobre el progreso mientras el agente está procesando una petición.

### NFR-002 — Error clarity

Los errores deben comunicarse de forma comprensible para el desarrollador.

### NFR-003 — Context transparency

El desarrollador debe poder identificar, cuando corresponda, qué contexto se utilizó para generar la propuesta.

### NFR-004 — Non-destructive

La generación de una propuesta no debe modificar el proyecto.

### NFR-005 — Traceability

Debe ser posible relacionar una propuesta con la petición que la originó y con el estado del proyecto utilizado.

---

# 13. Acceptance Criteria

### AC-001 — Valid request

Dada una petición válida, cuando el desarrollador la envía, el agente genera una propuesta de cambio.

### AC-002 — Project context

La propuesta se genera utilizando el contexto relevante disponible del proyecto.

### AC-003 — No automatic application

La generación de una propuesta no modifica el proyecto.

### AC-004 — Ambiguous request

Cuando la petición no proporciona suficiente información, el agente solicita contexto adicional en lugar de generar una interpretación arbitraria.

### AC-005 — Impossible request

Cuando el agente determina que no puede generar una propuesta válida, informa del motivo y no modifica el proyecto.

### AC-006 — Multiple affected elements

Una propuesta puede afectar a múltiples elementos y mantiene la coherencia entre dichos cambios.

### AC-007 — No change

El agente puede indicar explícitamente que una petición no requiere cambios.

### AC-008 — State association

Una propuesta identifica el estado del proyecto sobre el que fue generada.

### AC-009 — Stale proposal

Si el proyecto cambia mientras se genera una propuesta, DeltaI detecta la posible obsolescencia de la propuesta.

### AC-010 — Agent unavailable

Si el agente no está disponible, la petición no modifica el proyecto y se informa al desarrollador.

### AC-011 — Generation failure

Si la generación falla, no se presenta una propuesta incompleta como válida.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* Petición extremadamente ambigua.
* Petición que afecta a una gran parte del proyecto.
* Petición contradictoria con otra petición anterior.
* Petición que requiere información que no está disponible.
* Petición sobre elementos inexistentes.
* Petición que requiere modificar múltiples módulos.
* Proyecto modificado durante la generación.
* Modelo semántico parcialmente analizado.
* Propuesta generada a partir de información desactualizada.
* Agente que devuelve una propuesta parcialmente válida.
* Agente que propone cambios fuera del alcance de la petición.
* Agente que no puede determinar una solución única.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Aplicar la propuesta al proyecto.
* Mostrar el delta de la propuesta.
* Generar la vista UML del delta.
* Aceptar o rechazar la propuesta.
* Editar la propuesta.
* Modificar manualmente el código.
* Hacer commits.
* Gestionar Git.
* Ejecutar tests.
* Verificar completamente que la implementación propuesta sea correcta.

Estas operaciones pertenecen a casos de uso posteriores.

---

# 16. Dependencies on Other Use Cases

### UC-01 — Open Project

Proporciona el proyecto sobre el que se solicita el cambio.

```text
UC-01 Open Project
        │
        ↓
UC-02 Analyze Project
        │
        ↓
UC-03 Generate UML View
        │
        ↓
UC-04 Request Change
```

### UC-02 — Analyze Project

El modelo semántico proporciona contexto para interpretar la petición.

### UC-03 — Generate UML View

La vista UML puede proporcionar contexto seleccionado por el desarrollador para la petición.

### Future use case — Apply/Generate Change

La propuesta generada por UC-04 será utilizada por un caso de uso posterior que producirá y/o aplicará el cambio.

---

# 17. Traceability

```text
UC-04 Request Change
│
├── SC-01 Valid change request
├── SC-02 Natural language request
├── SC-03 Project element reference
├── SC-04 Insufficient context
├── SC-05 Cannot implement
├── SC-06 Additional context
├── SC-07 Multiple affected elements
├── SC-08 No changes required
├── SC-09 New request after proposal
├── SC-10 Project changes during processing
├── SC-11 Agent unavailable
└── SC-12 Generation failure
│
├── BR-001 No implicit application
├── BR-002 Project state association
├── BR-003 No arbitrary interpretation
├── BR-004 No source modification
├── BR-005 Proposal represents intended change
├── BR-006 Contextual interpretation
├── BR-007 Multiple-element changes
├── BR-008 State validity
└── BR-009 Explicit no-change result
│
└── Acceptance Criteria
    ├── AC-001 Valid request
    ├── AC-002 Project context
    ├── AC-003 No automatic application
    ├── AC-004 Ambiguous request
    ├── AC-005 Impossible request
    ├── AC-006 Multiple affected elements
    ├── AC-007 No change
    ├── AC-008 State association
    ├── AC-009 Stale proposal
    ├── AC-010 Agent unavailable
    └── AC-011 Generation failure
```
