# UC-05 — Show Change Delta

## 1. Objective

Permitir al desarrollador visualizar las diferencias entre el estado actual del proyecto y el estado resultante de aplicar una propuesta de cambio generada por el agente.

El delta debe representar los cambios desde una perspectiva semántica y permitir visualizarlos mediante las vistas disponibles en DeltaI.

En el MVP, la vista principal será una **vista UML del delta**.

El caso de uso no aplica los cambios al proyecto.

---

# 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* Change Proposal
* Project Model
* UML View

---

# 3. Preconditions

* Existe un proyecto abierto.
* Existe un modelo semántico del proyecto.
* Existe una propuesta de cambio generada por `UC-04`.
* La propuesta está asociada a un estado conocido del proyecto.
* DeltaI puede determinar el estado anterior y el estado propuesto.

---

# 4. Postconditions

### Successful execution

* DeltaI ha identificado las diferencias entre el estado actual y el estado propuesto.
* Existe una representación del delta.
* El desarrollador puede visualizar el delta mediante UML.
* Los elementos añadidos, modificados y eliminados pueden distinguirse.
* El proyecto original no ha sido modificado.

### Failed execution

* No se presenta un delta incorrecto como válido.
* El proyecto permanece sin modificaciones.
* El desarrollador recibe información sobre el motivo del fallo.

---

# 5. Scenarios

## SC-01 — Show a valid change delta

### Given

* Existe un estado actual del proyecto.
* Existe una propuesta de cambio válida.
* La propuesta puede transformarse en un estado propuesto.

### When

* El desarrollador solicita visualizar el cambio.

### Then

* DeltaI determina las diferencias entre ambos estados.
* Genera el delta.
* Genera una vista UML del delta.
* El desarrollador puede visualizar los cambios.

---

## SC-02 — Add an element

### Given

* El estado propuesto contiene un elemento que no existe en el estado actual.

### When

* DeltaI genera el delta.

### Then

* El nuevo elemento aparece como añadido.
* La vista UML permite distinguirlo de los elementos existentes.

Ejemplo:

```text
Before

Order
  │
  └── validate()


After

Order
  │
  ├── validate()
  └── cancel()

+ cancel()
```

---

## SC-03 — Remove an element

### Given

* El estado actual contiene un elemento que no existe en el estado propuesto.

### When

* DeltaI genera el delta.

### Then

* El elemento aparece como eliminado.
* La vista permite distinguirlo de los elementos que permanecen.

---

## SC-04 — Modify an element

### Given

* Un elemento existe en ambos estados.
* Sus propiedades o estructura han cambiado.

### When

* DeltaI genera el delta.

### Then

* El elemento aparece como modificado.
* La vista permite identificar qué aspecto del elemento ha cambiado.

---

## SC-05 — Add a relationship

### Given

* Una relación no existe en el estado actual.
* La relación existe en el estado propuesto.

### When

* DeltaI genera el delta.

### Then

* La relación aparece como añadida.
* La vista UML representa dicha relación como un cambio.

---

## SC-06 — Remove a relationship

### Given

* Una relación existe en el estado actual.
* La relación no existe en el estado propuesto.

### When

* DeltaI genera el delta.

### Then

* La relación aparece como eliminada.
* La vista permite distinguirla de las relaciones existentes.

---

## SC-07 — Modify multiple elements

### Given

* La propuesta afecta a varios elementos relacionados.

### When

* DeltaI genera el delta.

### Then

* Todos los cambios relevantes aparecen en el delta.
* Las relaciones entre los elementos afectados se representan de forma coherente.
* El desarrollador puede comprender el cambio como una única modificación.

---

## SC-08 — No semantic changes

### Given

* La propuesta no produce diferencias entre el estado actual y el estado propuesto.

### When

* DeltaI genera el delta.

### Then

* DeltaI informa de que no existen cambios semánticos.
* No se presenta un delta inexistente como si contuviera modificaciones.

---

## SC-09 — Proposal is based on an outdated state

### Given

* La propuesta fue generada sobre un estado anterior del proyecto.
* El proyecto ha cambiado desde entonces.

### When

* El desarrollador solicita visualizar el delta.

### Then

* DeltaI detecta la discrepancia entre el estado de referencia de la propuesta y el estado actual.
* El delta no se presenta como correspondiente inequívocamente al estado actual.
* El desarrollador recibe información sobre la discrepancia.

---

## SC-10 — Partial project model

### Given

* El modelo actual o propuesto es parcial.

### When

* DeltaI genera el delta.

### Then

* DeltaI representa los cambios que puede determinar.
* La vista indica que la información disponible es parcial cuando sea necesario.
* La ausencia de información no se interpreta como una eliminación o modificación.

---

## SC-11 — Change cannot be represented semantically

### Given

* La propuesta contiene cambios que DeltaI no puede representar mediante su modelo semántico actual.

### When

* DeltaI genera el delta.

### Then

* DeltaI representa los cambios que sí puede determinar.
* Los cambios no representables no se presentan mediante una representación semántica incorrecta.
* El desarrollador recibe información sobre las limitaciones de la representación.

---

## SC-12 — Developer inspects the delta

### Given

* Existe una vista UML del delta.

### When

* El desarrollador inspecciona la vista.

### Then

* Puede identificar elementos añadidos.
* Puede identificar elementos eliminados.
* Puede identificar elementos modificados.
* Puede identificar relaciones añadidas o eliminadas.
* Puede inspeccionar los elementos afectados.

---

## SC-13 — Developer switches between current and proposed state

### Given

* Existe un delta válido.
* Existen las representaciones del estado actual y propuesto.

### When

* El desarrollador solicita visualizar uno de los estados.

### Then

* DeltaI permite visualizar el estado correspondiente.
* El desarrollador puede comparar el estado actual y el propuesto.

---

## SC-14 — Delta generation fails

### Given

* Existe una propuesta de cambio.
* DeltaI no puede determinar un delta válido.

### When

* El desarrollador solicita visualizarlo.

### Then

* DeltaI informa del fallo.
* No presenta una representación incompleta como un delta válido.
* El proyecto permanece sin modificaciones.

---

# 6. Business Rules

### BR-001 — Two-state comparison

El delta debe determinarse comparando un estado de referencia con un estado propuesto.

### BR-002 — Current state

El estado de referencia debe corresponder al estado sobre el que se pretende evaluar la propuesta.

### BR-003 — Semantic delta

El delta debe representar cambios semánticos siempre que puedan determinarse.

### BR-004 — No invented changes

DeltaI no debe presentar como cambio una diferencia que no pueda determinarse a partir de los estados comparados.

### BR-005 — Change classification

Los cambios deben poder clasificarse, como mínimo, como:

* Added
* Removed
* Modified

### BR-006 — Relationship changes

Las relaciones entre elementos también forman parte del delta.

### BR-007 — No implicit application

Mostrar el delta no aplica ningún cambio al proyecto.

### BR-008 — Original state preservation

El estado original del proyecto permanece disponible mientras se inspecciona el delta.

### BR-009 — Proposal state

El estado propuesto debe poder identificarse independientemente del estado actual.

### BR-010 — Partial information

La ausencia de información no debe interpretarse automáticamente como una eliminación.

### BR-011 — View is derived

La vista UML del delta es una representación del delta semántico y no su fuente de verdad.

---

# 7. Input

El caso de uso requiere:

* Estado actual del proyecto.
* Propuesta de cambio.
* Estado o modelo propuesto derivable de la propuesta.

Opcionalmente:

* Selección de elementos.
* Filtros.
* Configuración de visualización.

---

# 8. Output

El resultado principal es un **Change Delta**.

Conceptualmente:

```text
Current Model
      │
      │
      ├──────────────┐
      │              │
      │        Change Proposal
      │              │
      │              ↓
      │        Proposed Model
      │              │
      └───────┬──────┘
              ↓
        Change Delta
              │
              ↓
          UML View
```

El delta puede contener:

```text
Change Delta
│
├── Added
│   ├── Elements
│   └── Relationships
│
├── Removed
│   ├── Elements
│   └── Relationships
│
└── Modified
    ├── Elements
    └── Relationships
```

---

# 9. State Transitions

### Generate delta

```text
Proposal Available
       │
       │ Generate Delta
       ↓
Generating Delta
       │
       ↓
Delta Available
```

### Outdated proposal

```text
Proposal Available
       │
       │ Project changed
       ↓
Potentially Outdated
       │
       │ Reconcile / Regenerate
       ↓
Delta Available
```

### Failed generation

```text
Generating Delta
       │
       │ Cannot determine delta
       ↓
Generation Failed
```

---

# 10. Side Effects

### Permitted

* Crear una representación del delta.
* Crear una vista UML del delta.
* Registrar información relacionada con la visualización.

### Not permitted

* Modificar el código fuente.
* Modificar el proyecto.
* Aplicar la propuesta.
* Modificar el modelo actual.
* Crear commits.
* Modificar Git.
* Alterar la propuesta original.

---

# 11. External Dependencies

Este caso de uso no requiere necesariamente dependencias externas.

Puede utilizar:

* Project Model.
* Change Proposal.
* UML renderer.

La tecnología concreta queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Readability

El delta debe poder interpretarse visualmente sin requerir inspección directa del código para comprender los cambios principales.

### NFR-002 — Visual distinction

Los elementos añadidos, eliminados y modificados deben poder distinguirse claramente.

### NFR-003 — Responsiveness

La generación y navegación del delta deben ser suficientemente rápidas para permitir una interacción fluida en proyectos incluidos en el alcance del MVP.

### NFR-004 — Consistency

La vista debe representar fielmente el delta semántico.

### NFR-005 — Traceability

Cada cambio mostrado debe poder relacionarse con el elemento correspondiente del modelo.

### NFR-006 — Non-destructive

Visualizar el delta no debe modificar el proyecto.

---

# 13. Acceptance Criteria

### AC-001 — Valid delta

Dado un estado actual y un estado propuesto válidos, DeltaI genera un delta que representa sus diferencias.

### AC-002 — Added element

Cuando existe un elemento en el estado propuesto que no existe en el actual, aparece como añadido.

### AC-003 — Removed element

Cuando existe un elemento en el estado actual que no existe en el propuesto, aparece como eliminado.

### AC-004 — Modified element

Cuando un elemento existe en ambos estados pero ha cambiado, aparece como modificado.

### AC-005 — Added relationship

Cuando se añade una relación, aparece como cambio añadido.

### AC-006 — Removed relationship

Cuando se elimina una relación, aparece como cambio eliminado.

### AC-007 — Multiple changes

Una propuesta que afecta a múltiples elementos produce un único delta coherente que contiene todos los cambios relevantes.

### AC-008 — No changes

Cuando los dos estados son semánticamente equivalentes, DeltaI informa de que no existen cambios.

### AC-009 — Outdated proposal

Si la propuesta está basada en un estado diferente del actual, DeltaI detecta la discrepancia.

### AC-010 — Partial model

La información desconocida o no analizada no se interpreta automáticamente como una eliminación.

### AC-011 — UML representation

El delta puede representarse mediante una vista UML.

### AC-012 — Inspection

El desarrollador puede inspeccionar los elementos afectados por el delta.

### AC-013 — State comparison

El desarrollador puede comparar el estado actual con el estado propuesto.

### AC-014 — Non-destructive

Generar y visualizar el delta no modifica el proyecto.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* Un elemento se elimina y otro se crea con el mismo nombre.
* Un elemento cambia de ubicación.
* Una clase cambia de nombre.
* Una relación desaparece porque se elimina uno de sus extremos.
* Una modificación produce simultáneamente cambios en múltiples relaciones.
* Cambios anidados.
* Cambios muy grandes.
* Miles de cambios.
* Dos cambios semánticamente diferentes producen estructuras similares.
* El modelo actual es parcial.
* El modelo propuesto es parcial.
* La propuesta está basada en un estado obsoleto.
* El proyecto cambia mientras se genera el delta.
* El delta contiene cambios que no tienen representación UML directa.
* El delta contiene cambios puramente textuales sin efecto semántico.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Aplicar cambios al proyecto.
* Aceptar la propuesta.
* Rechazar la propuesta.
* Modificar la vista UML.
* Añadir anotaciones del desarrollador.
* Enviar contexto modificado al agente.
* Resolver conflictos entre la propuesta y cambios posteriores.
* Ejecutar tests.
* Validar completamente la implementación.
* Integración con Git.
* Crear commits.
* Generar nuevas propuestas.

Estas operaciones pertenecen a casos de uso posteriores.

---

# 16. Dependencies on Other Use Cases

### UC-01 — Open Project

Proporciona el proyecto activo.

### UC-02 — Analyze Project

Proporciona el modelo semántico del proyecto.

### UC-03 — Generate UML View

Proporciona el mecanismo de representación UML.

### UC-04 — Request Change

Proporciona la propuesta de cambio que será comparada.

La secuencia queda:

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
Change Proposal
        │
        ↓
UC-05 Show Change Delta
```

### Future use cases

El resultado de UC-05 será utilizado posteriormente para:

* Editar/anotar la vista.
* Seleccionar cambios.
* Añadir contexto.
* Enviar feedback al agente.
* Aceptar o rechazar cambios.

---

# 17. Traceability

```text
UC-05 Show Change Delta
│
├── SC-01 Valid change delta
├── SC-02 Add element
├── SC-03 Remove element
├── SC-04 Modify element
├── SC-05 Add relationship
├── SC-06 Remove relationship
├── SC-07 Multiple elements
├── SC-08 No semantic changes
├── SC-09 Outdated proposal
├── SC-10 Partial model
├── SC-11 Unrepresentable change
├── SC-12 Inspect delta
├── SC-13 Compare states
└── SC-14 Delta generation failure
│
├── BR-001 Two-state comparison
├── BR-002 Current state
├── BR-003 Semantic delta
├── BR-004 No invented changes
├── BR-005 Change classification
├── BR-006 Relationship changes
├── BR-007 No implicit application
├── BR-008 Original state preservation
├── BR-009 Proposal state
├── BR-010 Partial information
└── BR-011 View is derived
│
└── Acceptance Criteria
    ├── AC-001 Valid delta
    ├── AC-002 Added element
    ├── AC-003 Removed element
    ├── AC-004 Modified element
    ├── AC-005 Added relationship
    ├── AC-006 Removed relationship
    ├── AC-007 Multiple changes
    ├── AC-008 No changes
    ├── AC-009 Outdated proposal
    ├── AC-010 Partial model
    ├── AC-011 UML representation
    ├── AC-012 Inspection
    ├── AC-013 State comparison
    └── AC-014 Non-destructive
```
