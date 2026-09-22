# UC-01 — Open Project

## 1. Objective

Permitir al desarrollador abrir un proyecto existente en DeltaI y establecerlo como el proyecto activo sobre el que se realizarán las operaciones posteriores.

Abrir un proyecto proporciona a DeltaI el contexto necesario para trabajar posteriormente con el proyecto.

---

## 2. Actors

### Primary Actor

* Developer

### Secondary Actors

* File System

---

## 3. Preconditions

* DeltaI está disponible para el desarrollador.
* El desarrollador conoce la ubicación del proyecto que desea abrir.
* El desarrollador tiene acceso a dicha ubicación.

---

## 4. Postconditions

### Successful execution

* El proyecto seleccionado está abierto en DeltaI.
* El proyecto seleccionado es el proyecto activo.
* DeltaI conoce la ubicación del proyecto.
* DeltaI dispone del estado del proyecto en el momento de su apertura.
* El proyecto está disponible para los casos de uso posteriores.

### Failed execution

* El proyecto seleccionado no se convierte en el proyecto activo.
* El proyecto activo anterior permanece sin cambios.
* El desarrollador recibe información sobre el motivo del fallo.

---

# 5. Scenarios

## SC-01 — Open a valid project

### Given

* Existe un proyecto en la ubicación seleccionada.
* La ubicación es accesible.
* El proyecto es compatible con DeltaI.

### When

* El desarrollador selecciona la ubicación del proyecto.
* El desarrollador solicita abrir el proyecto.

### Then

* DeltaI abre el proyecto.
* El proyecto pasa a ser el proyecto activo.
* DeltaI registra el estado del proyecto en el momento de la apertura.
* El proyecto queda disponible para las operaciones posteriores.

---

## SC-02 — Selected location does not exist

### Given

* El desarrollador selecciona una ubicación que no existe.

### When

* El desarrollador solicita abrir el proyecto.

### Then

* DeltaI no abre el proyecto.
* El proyecto activo anterior permanece sin cambios.
* DeltaI informa al desarrollador de que la ubicación no existe.

---

## SC-03 — Selected location is not accessible

### Given

* La ubicación seleccionada existe.
* DeltaI no puede acceder a ella.

### When

* El desarrollador solicita abrir el proyecto.

### Then

* DeltaI no abre el proyecto.
* El proyecto activo anterior permanece sin cambios.
* DeltaI informa al desarrollador de que la ubicación no es accesible.

---

## SC-04 — Selected location is not a supported project

### Given

* La ubicación seleccionada existe.
* La ubicación es accesible.
* DeltaI no puede identificar un proyecto compatible.

### When

* El desarrollador solicita abrir el proyecto.

### Then

* DeltaI no abre el proyecto.
* El proyecto activo anterior permanece sin cambios.
* DeltaI informa al desarrollador de que la ubicación no contiene un proyecto compatible.

---

## SC-05 — Open the currently active project

### Given

* Existe un proyecto activo.
* El desarrollador selecciona nuevamente ese proyecto.

### When

* El desarrollador solicita abrirlo.

### Then

* El proyecto continúa siendo el proyecto activo.
* DeltaI no crea un nuevo proyecto lógico.
* El estado del proyecto no se modifica como consecuencia de la operación.

---

## SC-06 — Open another project

### Given

* Existe un proyecto activo.
* Existe otro proyecto válido y accesible.

### When

* El desarrollador solicita abrir el segundo proyecto.

### Then

* DeltaI abre el segundo proyecto.
* El segundo proyecto pasa a ser el proyecto activo.
* El primer proyecto deja de ser el proyecto activo.
* El estado del primer proyecto no se modifica como consecuencia de la operación.

---

## SC-07 — Project state changes while opening

### Given

* El proyecto existe y es accesible.
* El estado del proyecto cambia mientras DeltaI está realizando la operación de apertura.

### When

* El desarrollador solicita abrir el proyecto.

### Then

* DeltaI debe establecer de forma consistente cuál es el estado que representa al proyecto abierto.
* El estado registrado como estado inicial debe corresponder a un estado coherente del proyecto.
* DeltaI no debe combinar información perteneciente a estados diferentes del proyecto.

---

# 6. Business Rules

### BR-001 — Single active project

DeltaI sólo puede tener un proyecto activo en un momento determinado.

### BR-002 — Opening is non-destructive

Abrir un proyecto no debe modificar su contenido.

### BR-003 — Project location identifies the project

La ubicación seleccionada por el desarrollador debe permitir identificar el proyecto que se desea abrir.

### BR-004 — Preserve previous active project on failure

Si la apertura de un proyecto falla, el proyecto activo anteriormente debe permanecer activo.

### BR-005 — No implicit changes

Abrir un proyecto no debe generar cambios sobre el proyecto.

### BR-006 — Consistent initial state

El estado registrado al abrir el proyecto debe representar un estado coherente del proyecto en un momento determinado.

---

# 7. Input

El caso de uso requiere:

* Ubicación del proyecto seleccionada por el desarrollador.

---

# 8. Output

### Success

* Proyecto abierto.
* Proyecto establecido como proyecto activo.
* Estado inicial del proyecto identificado.

### Failure

* El proyecto no se abre.
* El proyecto activo anterior permanece sin cambios.
* Se proporciona una razón comprensible del fallo.

---

# 9. State Transitions

### No project active

```text
No Active Project
       │
       │ Open valid project
       ↓
Active Project
```

### Switch project

```text
Project A active
       │
       │ Open Project B
       ↓
Project B active
```

### Failed opening

```text
Project A active
       │
       │ Open invalid Project B
       ↓
Project A active
```

---

# 10. Side Effects

### Permitted

* Registrar la apertura del proyecto.
* Registrar el estado inicial del proyecto.

### Not permitted

* Modificar archivos del proyecto.
* Crear archivos dentro del proyecto.
* Eliminar archivos del proyecto.
* Modificar el contenido del proyecto.
* Ejecutar cambios solicitados por el agente.
* Generar cambios semánticos sobre el proyecto.

---

# 11. External Dependencies

* File System

La forma concreta en que DeltaI acceda al sistema de archivos queda fuera de esta especificación.

---

# 12. Non-Functional Requirements

### NFR-001 — Feedback

DeltaI debe proporcionar información sobre el progreso cuando la operación de apertura pueda tardar perceptiblemente.

### NFR-002 — Error clarity

Los errores deben comunicarse de forma comprensible para el desarrollador.

### NFR-003 — Non-destructive operation

La apertura de un proyecto no debe modificar su contenido.

### NFR-004 — Consistency

El proyecto debe quedar en un estado coherente después de una apertura correcta o, en caso de error, conservarse el estado anterior.

---

# 13. Acceptance Criteria

### AC-001 — Valid project

Dada una ubicación que contiene un proyecto válido y accesible, al abrirla, el proyecto se convierte en el proyecto activo.

### AC-002 — Non-existent location

Dada una ubicación inexistente, al intentar abrirla, ningún proyecto nuevo se convierte en activo.

### AC-003 — Inaccessible location

Dada una ubicación inaccesible, al intentar abrirla, ningún proyecto nuevo se convierte en activo.

### AC-004 — Invalid project

Dada una ubicación que no contiene un proyecto compatible, al intentar abrirla, ningún proyecto nuevo se convierte en activo.

### AC-005 — Already active

Dado un proyecto que ya está activo, al volver a abrirlo, continúa siendo el proyecto activo sin crear un nuevo proyecto lógico.

### AC-006 — Switch project

Dado un proyecto A activo y un proyecto B válido, al abrir B, B se convierte en el proyecto activo y A deja de estar activo.

### AC-007 — Failure preservation

Dado un proyecto A activo, si la apertura de B falla, A continúa siendo el proyecto activo.

### AC-008 — Non-destructive

Abrir un proyecto no modifica su contenido.

### AC-009 — Initial state

Cuando un proyecto se abre correctamente, DeltaI identifica un estado inicial coherente del proyecto.

---

# 14. Edge Cases

Los siguientes casos requieren consideración adicional:

* Proyecto vacío.
* Proyecto extremadamente grande.
* Directorio que contiene varios proyectos.
* Proyecto parcialmente incompatible.
* Proyecto que está siendo modificado simultáneamente por otro proceso.
* Proyecto ubicado en un sistema de archivos remoto.
* Proyecto que ha sido movido desde su última sesión en DeltaI.
* Proyecto previamente abierto en DeltaI.
* Proyecto cuyo estado cambia durante la apertura.

Estos casos no deben resolverse mediante suposiciones durante la implementación; deben convertirse en requisitos explícitos cuando corresponda.

---

# 15. Out of Scope

Este caso de uso no incluye:

* Crear un proyecto.
* Clonar un proyecto.
* Descargar un proyecto.
* Analizar semánticamente el código.
* Generar el modelo semántico completo.
* Generar UML.
* Ejecutar tests.
* Ejecutar el proyecto.
* Modificar código.
* Generar `ChangeSet`.
* Solicitar cambios al agente.
* Aceptar o rechazar cambios del agente.
* Integración específica con Git.
* Hacer commits.
* Hacer push o pull.
* Gestionar ramas.

Estas funcionalidades pertenecen a otros casos de uso o a integraciones independientes.

---

# 16. Dependencies on Other Use Cases

### UC-02 — Analyze Project

Después de abrir correctamente un proyecto, DeltaI podrá analizar su contenido.

La especificación de `OpenProject` no determina si el análisis:

* se ejecuta automáticamente,
* se solicita explícitamente,
* o se ejecuta bajo demanda.

Esta decisión pertenece a `UC-02` y a la interacción entre ambos casos de uso.

---

# 17. Traceability

```text
UC-01 Open Project
│
├── SC-01 Open valid project
├── SC-02 Location does not exist
├── SC-03 Location inaccessible
├── SC-04 Unsupported project
├── SC-05 Project already active
├── SC-06 Open another project
└── SC-07 Project changes while opening
│
├── BR-001 Single active project
├── BR-002 Opening is non-destructive
├── BR-003 Project location identifies project
├── BR-004 Preserve previous project on failure
├── BR-005 No implicit changes
└── BR-006 Consistent initial state
│
└── Acceptance Criteria
    ├── AC-001 Valid project
    ├── AC-002 Non-existent location
    ├── AC-003 Inaccessible location
    ├── AC-004 Invalid project
    ├── AC-005 Already active
    ├── AC-006 Switch project
    ├── AC-007 Failure preservation
    ├── AC-008 Non-destructive
    └── AC-009 Initial state
```
