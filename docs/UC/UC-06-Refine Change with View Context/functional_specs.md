# UC-06 — Refine Change with View Context

## 1. Objective

Permitir al desarrollador modificar o anotar la representación visual de un cambio y utilizar dicha información como contexto adicional para solicitar al agente una nueva propuesta.

El desarrollador puede expresar correcciones, restricciones o cambios de intención directamente sobre la vista UML.

La información proporcionada mediante la vista debe convertirse en contexto comprensible por el agente.

El caso de uso no determina cómo se implementará finalmente el cambio ni lo aplica automáticamente al proyecto.

---

# 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* AI Agent
* Change Delta
* UML View
* Project Model

---

# 3. Preconditions

* Existe un proyecto abierto.
* Existe un modelo semántico del proyecto.
* Existe una propuesta de cambio.
* Existe un delta correspondiente a la propuesta.
* Existe una vista UML del delta.
* El desarrollador puede interactuar con la vista.

---

# 4. Postconditions

### Successful execution

* El desarrollador ha realizado una o más modificaciones o anotaciones sobre la vista.
* DeltaI ha interpretado dichas modificaciones como contexto estructurado.
* El contexto queda asociado al cambio que se está refinando.
* El contexto se envía al agente junto con la información necesaria para comprender la petición.
* El agente recibe una nueva solicitud de modificación.
* El proyecto original permanece sin modificaciones.

### Failed execution

* El contexto del desarrollador no se presenta al agente como válido si no pudo interpretarse correctamente.
* El proyecto permanece sin modificaciones.
* El desarrollador recibe información sobre el problema.

---

# 5. Scenarios

## SC-01 — Refine a proposed change

### Given

* Existe un delta generado por el agente.
* El desarrollador identifica un cambio que desea modificar.

### When

* El desarrollador modifica la vista UML.
* El desarrollador solicita al agente que tenga en cuenta dicha modificación.

### Then

* DeltaI identifica las modificaciones realizadas sobre la vista.
* Las transforma en contexto.
* Envía el contexto al agente.
* El agente recibe la nueva información como parte de la solicitud.
* El proyecto original no se modifica.

---

## SC-02 — Add an annotation to an element

### Given

* La vista contiene un elemento representado en UML.

### When

* El desarrollador añade una anotación al elemento.

Por ejemplo:

```text id="84gkqa"
Order

[Developer]
"Esta clase no debe conocer PaymentGateway"
```

### Then

* DeltaI registra la anotación.
* La anotación queda asociada al elemento.
* La anotación puede enviarse al agente como contexto.
* El agente puede utilizarla para generar una nueva propuesta.

---

## SC-03 — Modify an element in the view

### Given

* La vista muestra un elemento afectado por la propuesta.

### When

* El desarrollador modifica una propiedad representada en la vista.

Por ejemplo:

```text id="8m4f5e"
Antes:

Order
  └── cancel()

Después:

Order
  └── cancel(reason)
```

### Then

* DeltaI identifica la modificación.
* La modificación se representa como una instrucción o restricción estructurada.
* El cambio puede utilizarse como contexto para una nueva solicitud al agente.

---

## SC-04 — Remove a proposed change

### Given

* El delta contiene un cambio propuesto por el agente.

### When

* El desarrollador indica sobre la vista que dicho cambio no debe realizarse.

### Then

* DeltaI registra que el cambio ha sido rechazado o excluido.
* Esta información se incluye en el contexto enviado al agente.
* El agente recibe explícitamente que dicho cambio no debe formar parte de la siguiente propuesta.

---

## SC-05 — Request additional change from the view

### Given

* Existe una vista UML del delta.

### When

* El desarrollador añade información que implica un cambio adicional.
* El desarrollador solicita al agente que adapte la propuesta.

### Then

* DeltaI identifica el contexto asociado a la nueva modificación.
* Envía la información al agente.
* El agente genera una nueva propuesta basada en la petición original y el nuevo contexto.

---

## SC-06 — Select elements as context

### Given

* La vista contiene múltiples elementos.

### When

* El desarrollador selecciona determinados elementos y los utiliza como contexto para la siguiente petición.

### Then

* DeltaI registra los elementos seleccionados.
* La selección forma parte del contexto enviado al agente.
* Los elementos seleccionados pueden utilizarse para limitar o ampliar el ámbito de la siguiente propuesta.

---

## SC-07 — Add a constraint

### Given

* Existe un elemento o relación en la vista.

### When

* El desarrollador añade una restricción.

Por ejemplo:

```text id="2q0m8n"
Order ──→ Payment

Constraint:
Order must not depend directly on Payment
```

### Then

* DeltaI registra la restricción.
* La restricción queda asociada a los elementos correspondientes.
* La restricción se transmite al agente como contexto.

---

## SC-08 — Modify multiple elements

### Given

* La propuesta afecta a varios elementos.

### When

* El desarrollador modifica varios elementos de la vista antes de enviar el contexto.

### Then

* DeltaI registra todas las modificaciones.
* Las modificaciones se mantienen como una única interacción coherente.
* El agente recibe el conjunto de cambios como contexto.

---

## SC-09 — Developer adds free-text feedback

### Given

* Existe una vista UML.

### When

* El desarrollador añade una explicación textual adicional.

Por ejemplo:

```text id="7x7j6p"
"No quiero introducir una nueva jerarquía de clases.
Prefiero composición."
```

### Then

* DeltaI conserva el texto.
* El texto queda asociado a la interacción.
* El texto se transmite al agente junto con el contexto estructural de la vista.

---

## SC-10 — Developer sends context without modifying the view

### Given

* Existe una vista UML.
* El desarrollador considera que la propuesta debe cambiar pero no necesita modificar elementos visuales.

### When

* El desarrollador proporciona únicamente texto o instrucciones adicionales.

### Then

* DeltaI envía la información textual al agente.
* La vista original permanece sin modificaciones.

---

## SC-11 — Invalid view modification

### Given

* El desarrollador realiza una modificación que no puede interpretarse de forma válida.

### When

* Solicita enviar el contexto al agente.

### Then

* DeltaI identifica la modificación como no interpretable.
* No la presenta al agente como información estructurada válida.
* El desarrollador recibe información sobre el problema.

---

## SC-12 — Context is ambiguous

### Given

* El desarrollador realiza una anotación o modificación.
* DeltaI no puede determinar inequívocamente a qué elemento se refiere.

### When

* El desarrollador intenta enviar el contexto.

### Then

* DeltaI solicita aclaración o conserva la información como texto no estructurado.
* No inventa la relación entre la anotación y un elemento.

---

## SC-13 — Agent receives refined context

### Given

* Existe una modificación válida de la vista.
* El contexto ha sido construido correctamente.

### When

* El desarrollador solicita continuar con el agente.

### Then

* DeltaI envía al agente:

  * la petición original,
  * el estado relevante del proyecto,
  * la propuesta anterior,
  * el delta,
  * las modificaciones realizadas por el desarrollador,
  * las anotaciones y restricciones relevantes.

* El agente utiliza este contexto para producir una nueva propuesta.

---

## SC-14 — Agent generates a new proposal

### Given

* El agente ha recibido correctamente el contexto refinado.

### When

* El agente procesa la nueva solicitud.

### Then

* Se genera una nueva propuesta.
* La nueva propuesta queda relacionada con la anterior.
* La nueva propuesta incorpora el contexto proporcionado por el desarrollador.
* El proyecto original continúa sin modificaciones.

---

## SC-15 — Developer abandons the refinement

### Given

* El desarrollador ha realizado modificaciones sobre la vista.

### When

* Decide no enviarlas al agente.

### Then

* El contexto permanece local a la interacción actual o se descarta según la acción seleccionada.
* No se envía una nueva solicitud.
* El proyecto permanece sin modificaciones.

---

## SC-16 — Project changes before sending context

### Given

* El desarrollador ha modificado la vista.
* El proyecto cambia antes de enviar el contexto al agente.

### When

* El desarrollador solicita continuar.

### Then

* DeltaI detecta la discrepancia entre el estado utilizado por la vista y el estado actual.
* El contexto no se presenta como aplicable inequívocamente al nuevo estado.
* El desarrollador recibe información sobre la discrepancia.

---

# 6. Business Rules

### BR-001 — View modifications are contextual

Una modificación realizada sobre la vista representa información proporcionada por el desarrollador al proceso de generación del cambio.

### BR-002 — No implicit code modification

Modificar la vista nunca modifica directamente el código fuente.

### BR-003 — Context traceability

Toda información enviada al agente debe poder relacionarse con la interacción del desarrollador que la originó.

### BR-004 — Preserve original request

El contexto adicional no sustituye necesariamente la petición original; ambas informaciones deben poder distinguirse.

### BR-005 — Explicit rejection

Cuando el desarrollador excluye un cambio propuesto, dicha exclusión debe poder comunicarse explícitamente al agente.

### BR-006 — Element association

Cuando una modificación afecta a un elemento concreto, el contexto debe conservar esa asociación.

### BR-007 — Relationship association

Cuando una modificación afecta a una relación, el contexto debe conservar la relación entre sus elementos.

### BR-008 — No invented associations

Si DeltaI no puede determinar a qué elemento corresponde una anotación, no debe inventar dicha asociación.

### BR-009 — Context composition

El contexto enviado al agente puede estar compuesto por:

* petición original,
* modelo del proyecto,
* propuesta anterior,
* delta,
* modificaciones de la vista,
* anotaciones,
* restricciones,
* selección de elementos,
* texto adicional.

### BR-010 — New proposal

Una nueva propuesta generada a partir del feedback debe poder distinguirse de la propuesta anterior.

### BR-011 — Non-destructive interaction

La interacción con la vista no modifica directamente el proyecto.

---

# 7. Input

El caso de uso puede recibir:

* Modificaciones realizadas sobre la vista UML.
* Selección de elementos.
* Selección de relaciones.
* Anotaciones.
* Restricciones.
* Exclusiones de cambios.
* Texto libre.
* Petición original del desarrollador.
* Propuesta anterior.
* Delta anterior.

---

# 8. Output

El resultado principal es un **Refined Change Context**.

Conceptualmente:

```text id="d5j0sp"
Original Request
       │
       ├───────────────┐
       │               │
       ↓               ↓
Previous Proposal   UML Delta
       │               │
       └───────┬───────┘
               ↓
       Developer Changes
               │
               ↓
       Refined Context
               │
               ↓
             Agent
               │
               ↓
        New Proposal
```

El contexto puede contener:

```text id="a8v2f7"
Refined Context
│
├── Original Request
├── Selected Elements
├── Added Elements
├── Removed Elements
├── Modified Elements
├── Added Relationships
├── Removed Relationships
├── Constraints
├── Rejected Changes
└── Free-text Feedback
```

---

# 9. State Transitions

### Start refinement

```text id="1n7k4s"
Delta Available
      │
      │ Edit View
      ↓
Refining
```

### Send context

```text id="g7r1zc"
Refining
   │
   │ Send Context
   ↓
Context Submitted
   │
   ↓
Agent Processing
```

### Generate new proposal

```text id="0c8s8k"
Agent Processing
      │
      ↓
New Proposal Available
```

### Cancel refinement

```text id="2yq7ae"
Refining
   │
   │ Cancel
   ↓
Delta Available
```

### Invalid context

```text id="9g2w6a"
Refining
   │
   │ Invalid / ambiguous modification
   ↓
Context Error
```

---

# 10. Side Effects

### Permitted

* Crear modificaciones sobre la representación de la vista.
* Crear anotaciones.
* Crear contexto estructurado.
* Registrar la interacción del desarrollador.
* Enviar contexto al agente.
* Generar una nueva propuesta.

### Not permitted

* Modificar directamente el código.
* Aplicar la propuesta.
* Modificar el proyecto.
* Modificar Git.
* Crear commits.
* Alterar silenciosamente la propuesta anterior.

---

# 11. External Dependencies

* AI Agent.
* UML View.
* Project Model.

La tecnología concreta utilizada para representar la vista y comunicarse con el agente queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Interaction responsiveness

Las operaciones básicas de edición de la vista deben ser suficientemente rápidas para permitir una interacción fluida.

### NFR-002 — Context fidelity

El contexto enviado al agente debe conservar fielmente las modificaciones realizadas por el desarrollador.

### NFR-003 — Traceability

Debe ser posible identificar el origen de cada modificación contextual.

### NFR-004 — Explicitness

El contexto estructurado no debe ocultar información relevante sobre lo que el desarrollador modificó.

### NFR-005 — Non-destructive

Modificar la vista y enviar contexto no debe modificar directamente el proyecto.

### NFR-006 — Persistence

Las modificaciones de contexto deberían poder conservarse durante la interacción hasta que el desarrollador decida enviarlas, descartarlas o sustituirlas.

---

# 13. Acceptance Criteria

### AC-001 — View modification

El desarrollador puede modificar elementos de la vista UML y esas modificaciones quedan registradas.

### AC-002 — Annotation

El desarrollador puede añadir una anotación asociada a un elemento.

### AC-003 — Constraint

El desarrollador puede expresar una restricción asociada a elementos o relaciones.

### AC-004 — Change rejection

El desarrollador puede indicar que un cambio propuesto no debe realizarse.

### AC-005 — Element selection

El desarrollador puede seleccionar elementos para utilizarlos como contexto.

### AC-006 — Free text

El desarrollador puede proporcionar feedback textual adicional.

### AC-007 — Context generation

DeltaI puede transformar las modificaciones de la vista en contexto estructurado.

### AC-008 — Context association

El contexto conserva la asociación entre una modificación y el elemento o relación al que afecta.

### AC-009 — Ambiguous context

Una modificación cuya asociación no puede determinarse inequívocamente no se transforma en una asociación inventada.

### AC-010 — Submit context

El desarrollador puede enviar el contexto al agente.

### AC-011 — Original request preserved

La nueva interacción conserva la relación con la petición original.

### AC-012 — New proposal

El agente puede utilizar el contexto refinado para generar una nueva propuesta.

### AC-013 — Proposal lineage

La nueva propuesta queda relacionada con la propuesta anterior.

### AC-014 — Non-destructive

Ninguna modificación de la vista ni el envío del contexto modifica directamente el proyecto.

### AC-015 — Cancel

El desarrollador puede descartar el refinamiento sin enviar una nueva solicitud al agente.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* El usuario mueve un elemento sin pretender cambiar su estructura.
* El usuario cambia una propiedad visual pero no una propiedad semántica.
* El usuario modifica un elemento que ya había sido añadido por el agente.
* El usuario elimina un elemento que existía originalmente.
* El usuario modifica una relación propuesta.
* El usuario crea una relación que no existe en el modelo.
* Una anotación no puede asociarse inequívocamente a un elemento.
* El usuario realiza cambios contradictorios.
* El usuario realiza múltiples modificaciones sobre el mismo elemento.
* El usuario deshace parcialmente sus modificaciones.
* El usuario modifica la vista mientras el agente está procesando.
* El proyecto cambia mientras se prepara el contexto.
* El modelo utilizado por la vista queda obsoleto.
* El contexto resultante es demasiado grande para enviarlo al agente.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Aplicar cambios al código.
* Ejecutar tests.
* Hacer commit.
* Gestionar Git.
* Validar completamente la nueva implementación.
* Determinar si la propuesta del agente es correcta.
* Resolver conflictos entre cambios.
* Generar directamente código.
* Persistir definitivamente la modificación en el proyecto.

---

# 16. Dependencies on Other Use Cases

### UC-01 — Open Project

Proporciona el proyecto activo.

### UC-02 — Analyze Project

Proporciona el modelo semántico.

### UC-03 — Generate UML View

Proporciona la representación UML.

### UC-04 — Request Change

Proporciona la propuesta inicial.

### UC-05 — Show Change Delta

Proporciona el delta sobre el que trabaja el desarrollador.

La secuencia completa pasa a ser:

```text id="bq9q6h"
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
        │
        ↓
Change Proposal
        │
        ↓
UC-05 Show Change Delta
        │
        ↓
UML Delta View
        │
        ↓
UC-06 Refine Change with View Context
        │
        ↓
Refined Context
        │
        ↓
AI Agent
        │
        ↓
New Change Proposal
```

---

# 17. Traceability

```text id="zq9x0j"
UC-06 Refine Change with View Context
│
├── SC-01 Refine proposed change
├── SC-02 Add annotation
├── SC-03 Modify element
├── SC-04 Remove proposed change
├── SC-05 Request additional change
├── SC-06 Select elements
├── SC-07 Add constraint
├── SC-08 Modify multiple elements
├── SC-09 Free-text feedback
├── SC-10 Context without view modification
├── SC-11 Invalid modification
├── SC-12 Ambiguous context
├── SC-13 Send refined context
├── SC-14 Generate new proposal
├── SC-15 Abandon refinement
└── SC-16 Project changes before submission
│
├── BR-001 View modifications are contextual
├── BR-002 No implicit code modification
├── BR-003 Context traceability
├── BR-004 Preserve original request
├── BR-005 Explicit rejection
├── BR-006 Element association
├── BR-007 Relationship association
├── BR-008 No invented associations
├── BR-009 Context composition
├── BR-010 New proposal
└── BR-011 Non-destructive interaction
│
└── Acceptance Criteria
    ├── AC-001 View modification
    ├── AC-002 Annotation
    ├── AC-003 Constraint
    ├── AC-004 Change rejection
    ├── AC-005 Element selection
    ├── AC-006 Free text
    ├── AC-007 Context generation
    ├── AC-008 Context association
    ├── AC-009 Ambiguous context
    ├── AC-010 Submit context
    ├── AC-011 Original request preserved
    ├── AC-012 New proposal
    ├── AC-013 Proposal lineage
    ├── AC-014 Non-destructive
    └── AC-015 Cancel
```
