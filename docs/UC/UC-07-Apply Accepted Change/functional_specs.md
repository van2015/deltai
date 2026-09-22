# UC-07 — Apply Accepted Change

## 1. Objective

Permitir al desarrollador aceptar una propuesta de cambio y aplicar sus modificaciones al proyecto.

El caso de uso transforma una **Change Proposal** previamente revisada por el desarrollador en cambios efectivos sobre el proyecto.

La aceptación se realiza sobre la propuesta semántica, no sobre el estado visual de la vista.

Las modificaciones pertenecientes exclusivamente al `View State` no deben interpretarse como cambios sobre el proyecto.

El `View Context` que haya sido incorporado por el desarrollador puede haber contribuido a generar la propuesta, pero no se aplica directamente al proyecto.

---

# 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* Change Proposal
* Project
* Project Model
* View State
* View Context

---

# 3. Preconditions

* Existe un proyecto abierto.
* Existe una propuesta de cambio.
* La propuesta ha sido revisada por el desarrollador.
* La propuesta corresponde a un estado identificable del proyecto.
* El desarrollador ha indicado explícitamente que acepta la propuesta.
* La propuesta puede transformarse en cambios aplicables al proyecto.

---

# 4. Postconditions

### Successful execution

* Los cambios de la propuesta han sido aplicados al proyecto.
* El proyecto refleja el estado resultante de la propuesta.
* El modelo semántico puede actualizarse para reflejar el nuevo estado.
* La propuesta queda registrada como aplicada.
* La relación entre estado anterior, propuesta y nuevo estado queda preservada.
* El `View State` utilizado durante la revisión no se interpreta como modificación adicional del proyecto.

### Failed execution

* El proyecto no queda en un estado parcialmente aplicado sin estar identificado como tal.
* La propuesta no se marca como completamente aplicada si no lo ha sido.
* El desarrollador recibe información sobre el fallo.
* La información necesaria para recuperar o continuar el proceso queda preservada.

---

# 5. Scenarios

## SC-01 — Accept and apply a valid proposal

### Given

* Existe una propuesta válida.
* El desarrollador ha revisado el delta.
* El desarrollador acepta la propuesta.

### When

* Solicita aplicar el cambio.

### Then

* DeltaI verifica que la propuesta sigue siendo aplicable al estado actual.
* Aplica los cambios al proyecto.
* Actualiza el modelo semántico.
* Registra el nuevo estado del proyecto.
* Marca la propuesta como aplicada.

---

## SC-02 — Reject the proposal

### Given

* Existe una propuesta pendiente de aceptación.

### When

* El desarrollador la rechaza.

### Then

* La propuesta no se aplica.
* El proyecto permanece sin cambios.
* La propuesta queda registrada como rechazada.

---

## SC-03 — Proposal is outdated

### Given

* La propuesta fue generada sobre un estado anterior.
* El proyecto ha cambiado desde entonces.

### When

* El desarrollador intenta aceptar la propuesta.

### Then

* DeltaI detecta que la propuesta no corresponde al estado actual.
* No aplica automáticamente la propuesta.
* Informa al desarrollador de la discrepancia.
* El desarrollador debe decidir cómo continuar.

---

## SC-04 — Proposal contains multiple changes

### Given

* La propuesta contiene varios cambios relacionados.

### When

* El desarrollador la acepta.

### Then

* DeltaI aplica el conjunto de cambios como una única operación lógica.
* Los cambios se mantienen coherentes entre sí.
* El nuevo estado del proyecto representa el conjunto completo de modificaciones.

---

## SC-05 — View State contains visual modifications

### Given

* El desarrollador ha modificado la posición, tamaño, visibilidad u otras propiedades visuales de elementos de la vista.
* Dichas modificaciones pertenecen exclusivamente al `View State`.

### When

* El desarrollador acepta la propuesta.

### Then

* Las modificaciones visuales no se aplican al código ni al modelo semántico.
* La aceptación se basa exclusivamente en la propuesta semántica.
* El `View State` puede conservarse independientemente.

Ejemplo:

```text
View State:

Order ───────────────> Payment
   ↑
   │
Developer moved Order
```

Mover `Order` visualmente no implica modificar `Order` en el proyecto.

---

## SC-06 — View Context influenced the proposal

### Given

* El desarrollador realizó modificaciones semánticas o anotaciones en la vista.
* Estas modificaciones fueron transformadas en `View Context`.
* El agente utilizó dicho contexto para generar una nueva propuesta.

### When

* El desarrollador acepta la nueva propuesta.

### Then

* Se aplican los cambios contenidos en la propuesta.
* No se vuelve a aplicar el `View Context` de forma independiente.
* El resultado deriva exclusivamente de la propuesta aceptada.

---

## SC-07 — Proposal includes a change rejected in View Context

### Given

* El desarrollador indicó previamente que no quería un determinado cambio.
* El agente genera una propuesta que todavía contiene dicho cambio.

### When

* El desarrollador revisa la propuesta.

### Then

* DeltaI permite identificar que el cambio continúa presente.
* El desarrollador puede rechazar la propuesta o volver a proporcionar feedback.
* El cambio no se aplica sin aceptación explícita.

---

## SC-08 — Application succeeds partially

### Given

* La propuesta contiene múltiples modificaciones.
* Algunas modificaciones pueden aplicarse y otras fallan.

### When

* DeltaI intenta aplicar la propuesta.

### Then

* DeltaI no presenta el proyecto como completamente actualizado.
* El estado resultante queda identificado.
* El desarrollador recibe información sobre las modificaciones aplicadas y las que no pudieron aplicarse.
* El sistema conserva suficiente información para continuar o recuperar la operación.

---

## SC-09 — Application fails before modifying the project

### Given

* Existe una propuesta válida.
* Se produce un error antes de aplicar cualquier modificación.

### When

* DeltaI intenta aplicar la propuesta.

### Then

* El proyecto permanece sin cambios.
* La propuesta permanece pendiente.
* Se informa del error.

---

## SC-10 — Developer accepts after reviewing only part of the delta

### Given

* Existe una propuesta con múltiples cambios.
* El desarrollador ha inspeccionado solamente parte del delta.

### When

* Acepta la propuesta completa.

### Then

* La propuesta completa se considera aceptada.
* Todos sus cambios se aplican.
* La vista o selección utilizada para inspeccionarla no limita implícitamente el alcance de la aceptación.

---

## SC-11 — Developer wants to accept only part of the proposal

### Given

* Existe una propuesta con múltiples cambios.
* El desarrollador quiere aplicar solamente algunos.

### When

* Selecciona determinados cambios y solicita aplicarlos.

### Then

* DeltaI genera una propuesta parcial o una nueva propuesta derivada.
* La aplicación se realiza sobre la propuesta resultante.
* Los cambios excluidos permanecen sin aplicar.

> La forma exacta de seleccionar y dividir propuestas queda pendiente de definición.

---

## SC-12 — Project changes during application

### Given

* DeltaI está aplicando una propuesta.
* El proyecto cambia durante la operación.

### When

* DeltaI detecta la modificación.

### Then

* DeltaI detecta la discrepancia.
* Evita presentar el resultado como una aplicación normal si la operación puede haber quedado invalidada.
* El estado de la aplicación queda identificado.

---

## SC-13 — Application generates a new model state

### Given

* La propuesta se aplica correctamente.

### When

* Finaliza la operación.

### Then

* Existe un nuevo estado del proyecto.
* El modelo semántico representa el nuevo estado.
* El nuevo estado queda relacionado con el estado anterior y la propuesta aplicada.

---

## SC-14 — Application produces changes that invalidate the current View State

### Given

* Existe una vista UML asociada al estado anterior.
* La propuesta modifica elementos representados en esa vista.

### When

* La propuesta se aplica.

### Then

* El `View State` anterior se identifica como potencialmente obsoleto.
* No se interpreta automáticamente que sus propiedades visuales siguen siendo válidas.
* DeltaI puede regenerar o actualizar la representación en un caso de uso posterior.

---

# 6. Business Rules

### BR-001 — Explicit acceptance

Una propuesta solo puede aplicarse mediante una aceptación explícita del desarrollador.

### BR-002 — Proposal is authoritative for application

El objeto que se aplica es la propuesta semántica, no la vista.

### BR-003 — View State is not semantic

Las modificaciones pertenecientes exclusivamente al `View State` no constituyen cambios del proyecto.

### BR-004 — View Context is not directly applied

El `View Context` utilizado para generar una propuesta no se aplica directamente al proyecto.

### BR-005 — Proposal lineage

Una propuesta aplicada debe mantener la relación con:

* La petición original.
* La propuesta anterior, si existe.
* El contexto utilizado.
* El estado sobre el que fue generada.

### BR-006 — State validation

Antes de aplicar una propuesta debe comprobarse que el estado sobre el que fue generada sigue siendo compatible con el estado actual.

### BR-007 — Atomicity

La aplicación de una propuesta debería ser atómica siempre que la naturaleza de los cambios lo permita.

### BR-008 — No implicit visual semantics

Una modificación visual no debe adquirir significado semántico simplemente porque el desarrollador acepte una propuesta.

### BR-009 — New project state

Una aplicación correcta produce un nuevo estado identificable del proyecto.

### BR-010 — Reproducibility

Debe ser posible determinar qué propuesta produjo un determinado estado del proyecto.

### BR-011 — Partial acceptance

Si el sistema permite aceptar solamente una parte de una propuesta, el resultado debe convertirse en una propuesta explícita y diferenciada antes de su aplicación.

---

# 7. Input

El caso de uso requiere:

* Change Proposal.
* Estado actual del proyecto.
* Aceptación explícita del desarrollador.

Contexto relacionado:

* Original Request.
* Previous Proposal.
* View Context.
* Change Delta.

No se utiliza directamente para aplicar:

* View State.

---

# 8. Output

El resultado principal es un nuevo estado del proyecto.

```text
Current Project State
        │
        │
        │ Accept Proposal
        ↓
Change Proposal
        │
        ↓
Apply
        │
        ↓
New Project State
```

La trazabilidad completa puede representarse como:

```text
User Intent
    │
    ↓
Proposal₁
    │
    ↓
View Context
    │
    ↓
Proposal₂
    │
    │ Accept
    ↓
Applied Change
    │
    ↓
Project State₂
```

---

# 9. View State vs View Context

Esta distinción es especialmente importante para este caso de uso.

## View State

Representa el estado de la interfaz visual.

Ejemplos:

* posición de una clase;
* tamaño;
* zoom;
* elementos visibles;
* orden visual;
* agrupaciones;
* colores;
* expansión/colapso;
* selección actual.

Estas modificaciones **no modifican el proyecto**.

```text
View State
     │
     └──► UI representation
```

## View Context

Representa información que el desarrollador quiere comunicar al proceso de modificación.

Ejemplos:

* "Esta clase no debería depender de Payment."
* "Quiero composición en lugar de herencia."
* eliminar una relación;
* añadir una relación;
* cambiar una responsabilidad;
* imponer una restricción.

Esta información puede utilizarse para generar una nueva propuesta.

```text
View Context
     │
     ↓
Agent
     │
     ↓
Change Proposal
```

Por tanto:

```text
              UML View
                 │
        ┌────────┴────────┐
        │                 │
   View State        View Context
        │                 │
        ↓                 ↓
     Visual UI          Agent
                          │
                          ↓
                   Change Proposal
                          │
                          ↓
                       Apply
```

---

# 10. State Transitions

### Proposal accepted

```text
Proposal Available
       │
       │ Accept
       ↓
Validating
       │
       ↓
Applying
       │
       ↓
Applied
       │
       ↓
New Project State
```

### Outdated proposal

```text
Proposal Available
       │
       │ Accept
       ↓
Validating
       │
       │ State mismatch
       ↓
Application Blocked
```

### Application failure

```text
Applying
   │
   │ Failure
   ↓
Application Failed
```

---

# 11. Side Effects

### Permitted

* Modificar archivos del proyecto.
* Actualizar el modelo semántico.
* Crear un nuevo estado del proyecto.
* Registrar la aplicación de la propuesta.
* Invalidar vistas asociadas al estado anterior.

### Not permitted

* Aplicar modificaciones pertenecientes únicamente al `View State`.
* Aplicar directamente el `View Context`.
* Aplicar una propuesta sin aceptación explícita.
* Sobrescribir silenciosamente cambios concurrentes.

---

# 12. External Dependencies

Puede utilizar:

* File System.
* Project Model.
* Change Proposal.
* Repository/workspace.

La utilización concreta de Git queda fuera de este caso de uso.

Git no es necesario conceptualmente para aplicar el cambio.

---

# 13. Non-Functional Requirements

### NFR-001 — Safety

La aplicación debe minimizar el riesgo de perder cambios existentes.

### NFR-002 — Atomicity

Siempre que sea técnicamente posible, la aplicación de una propuesta debe ser atómica.

### NFR-003 — Traceability

Debe ser posible identificar qué propuesta produjo los cambios.

### NFR-004 — Recoverability

Un fallo durante la aplicación no debería dejar un estado desconocido sin posibilidad de determinar qué ocurrió.

### NFR-005 — Consistency

El código y el modelo semántico deben representar el mismo estado después de una aplicación correcta.

### NFR-006 — Non-interference

Las propiedades exclusivamente visuales no deben alterar el resultado de la aplicación.

---

# 14. Acceptance Criteria

### AC-001 — Explicit acceptance

Una propuesta no se aplica sin aceptación explícita.

### AC-002 — Successful application

Una propuesta válida y aceptada modifica el proyecto según sus cambios.

### AC-003 — Model update

Después de una aplicación correcta, el modelo semántico representa el nuevo estado.

### AC-004 — View State isolation

Modificar posiciones, tamaños, zoom o visibilidad de elementos no modifica el proyecto.

### AC-005 — View Context isolation

El `View Context` no se aplica directamente; únicamente puede influir en una propuesta.

### AC-006 — State validation

Una propuesta basada en un estado incompatible con el actual no se aplica automáticamente.

### AC-007 — Multiple changes

Una propuesta con múltiples cambios puede aplicarse como una operación coherente.

### AC-008 — Application failure

Un fallo se comunica claramente y la propuesta no se marca como aplicada si no lo está.

### AC-009 — Traceability

El nuevo estado puede relacionarse con la propuesta que lo produjo.

### AC-010 — View invalidation

Las vistas asociadas a un estado anterior pueden identificarse como obsoletas después de aplicar cambios estructurales.

### AC-011 — Partial acceptance

Si se permite aceptar parcialmente una propuesta, los cambios seleccionados se convierten en una modificación explícita antes de aplicarse.

---

# 15. Edge Cases

* El proyecto ha cambiado desde que se generó la propuesta.
* La propuesta modifica un archivo que el usuario ha editado manualmente.
* Dos propuestas intentan modificar el mismo elemento.
* Una propuesta elimina un elemento utilizado por otros elementos.
* Una propuesta contiene cambios incompatibles entre sí.
* El modelo semántico no puede actualizarse después de modificar el código.
* La aplicación falla a mitad de la operación.
* La vista contiene cambios visuales pendientes.
* El `View Context` contiene información que contradice la propuesta.
* La propuesta fue generada a partir de una vista obsoleta.
* El usuario acepta una propuesta mientras existe otra propuesta pendiente.
* El usuario intenta aplicar parcialmente una propuesta.

---

# 16. Out of Scope

Este caso de uso no incluye:

* Generación de la propuesta.
* Visualización del delta.
* Edición del UML.
* Generación del `View Context`.
* Comunicación con el agente para obtener una nueva propuesta.
* Ejecución de tests.
* Validación funcional completa del cambio.
* Commit de Git.
* Push remoto.
* Resolución automática de conflictos complejos.

---

# 17. Dependencies on Other Use Cases

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
        │
        ↓
UC-05 Show Change Delta
        │
        ↓
UC-06 Refine Change with View Context
        │
        ↓
     New Proposal
        │
        ↓
UC-07 Apply Accepted Change
        │
        ↓
New Project State
```

`UC-07` puede recibir directamente una propuesta de `UC-04` o una propuesta refinada mediante `UC-06`.

---

# 18. Traceability

```text
UC-07 Apply Accepted Change
│
├── SC-01 Accept proposal
├── SC-02 Reject proposal
├── SC-03 Outdated proposal
├── SC-04 Multiple changes
├── SC-05 View State modifications
├── SC-06 View Context
├── SC-07 Rejected change remains
├── SC-08 Partial application
├── SC-09 Failure before modification
├── SC-10 Partial review
├── SC-11 Partial acceptance
├── SC-12 Concurrent project change
├── SC-13 New model state
└── SC-14 View State invalidation
│
├── BR-001 Explicit acceptance
├── BR-002 Proposal authority
├── BR-003 View State is not semantic
├── BR-004 View Context is not directly applied
├── BR-005 Proposal lineage
├── BR-006 State validation
├── BR-007 Atomicity
├── BR-008 No implicit visual semantics
├── BR-009 New project state
└── BR-010 Reproducibility
│
└── Acceptance Criteria
    ├── AC-001 Explicit acceptance
    ├── AC-002 Successful application
    ├── AC-003 Model update
    ├── AC-004 View State isolation
    ├── AC-005 View Context isolation
    ├── AC-006 State validation
    ├── AC-007 Multiple changes
    ├── AC-008 Application failure
    ├── AC-009 Traceability
    ├── AC-010 View invalidation
    └── AC-011 Partial acceptance
```
