# Plan de Implementación de DeltaI

## 1. Estado Actual

La base de dominio implementada incluye:

- `Project` y `ProjectState`.
- Elementos y relaciones del modelo semántico.
- `ChangeProposal` con ciclo de vida completo.
- `Change` y `ChangeDelta`.
- Aplicación conceptual de un delta.
- `ViewContext` con selección, anotaciones, texto libre y rechazo de cambios.
- `SourceCode` y `RefactoringProposal`.
- `AgentGateway` y `LlmAgentGateway`.
- `AnalyzeRefactorings` y `AnalyzeRefactoringsCommand`.
- `AcceptRefactoring` y `AcceptRefactoringCommand`.
- `RefactoringEngine` y `WorkspaceWriter` como puertos.
- Fakes para agentes, engines, repositorios y workspace.

La suite actual cuenta con 117 tests, con typecheck y build limpios.

## 2. Objetivo Arquitectónico

DeltaI debe mantener el dominio independiente de JEV y de cualquier proveedor concreto de inteligencia.

```text
UI
 |
 Commands / Application Services
 |
 Project + ProjectState + Proposals + Views
 |
 AgentGateway / Workspace / FileSystem ports
 |                         |
 JEVAdapter                WorkspaceAdapter
 |                         |
 JEV                       Project files
```

JEV, OpenAI, modelos locales y otros sistemas serán adaptadores intercambiables. No deben modificar directamente `Project` ni `ProjectState`.

El flujo principal será:

```text
ProjectState + UserIntent
        |
        v
AgentGateway
        |
        v
RefactoringProposal[]
        |
  decisión del usuario
        |
        v
ChangeProposal
        |
        v
RefactoringEngine + Workspace
        |
        v
ProjectState nuevo
```

## 3. Fase 1: Reforzar Invariantes

### 3.1. Inmutabilidad real de `ProjectState`

Implementar snapshots defensivos al crear un estado:

- Copiar el modelo recibido.
- Copiar arrays de elementos y relaciones.
- Impedir que modificaciones externas alteren el estado.
- Mantener getters que devuelvan copias o vistas readonly seguras.

Tests:

- Modificar el modelo original no modifica `ProjectState`.
- Modificar los arrays originales no modifica `ProjectState`.
- Modificar elementos devueltos por un getter no modifica `ProjectState`.

### 3.2. Unicidad de identidades

Validar que no existan dos elementos o relaciones con el mismo ID dentro de un estado.

Tests:

- Crear un estado con IDs duplicados falla.
- Modelos con IDs distintos no se consideran iguales aunque tengan el mismo nombre.

### 3.3. Validación de `ChangeDelta.applyTo`

Un delta solo debe poder aplicarse sobre su estado fuente válido.

Tests:

- Aplicar sobre el source correcto reconstruye el target.
- Aplicar sobre otro estado falla explícitamente.
- Un cambio incompatible no se ignora silenciosamente.

## 4. Fase 2: OpenProject

Crear los puertos y servicios necesarios para abrir proyectos sin acoplar el dominio al sistema de archivos.

Componentes previstos:

- `FileSystem` o `ProjectWorkspace` port.
- `OpenProjectCommand`.
- `OpenProject` application service.
- `ProjectRepository` real o adaptador en memoria.
- Error de ubicación inexistente.
- Error de proyecto no soportado.
- Error de acceso.

Comportamiento:

- Abrir un proyecto válido produce un `Project` con estado inicial.
- Abrir un proyecto inválido no modifica el proyecto activo anterior.
- Abrir el proyecto activo es idempotente.
- Cambiar de proyecto reemplaza el activo solo después de validar el nuevo.
- Abrir un proyecto no modifica sus archivos.

Tests principales:

- Proyecto válido.
- Ubicación inexistente.
- Ubicación inaccesible.
- Proyecto inválido.
- Proyecto activo existente.
- Fallo sin pérdida del proyecto anterior.

## 5. Fase 3: AnalyzeProject

Separar el análisis estructural del código del análisis de oportunidades de refactorización.

`AnalyzeProject` debe producir el modelo semántico de un proyecto. `RefactoringAnalyzer` debe consumir código/modelo para proponer refactorizaciones.

Componentes previstos:

- `ProjectAnalyzer` port.
- `AnalyzeProjectCommand`.
- `AnalyzeProject` application service.
- Estados de análisis:
  - `NotAnalyzed`.
  - `Analyzing`.
  - `Analyzed`.
  - `PartiallyAnalyzed`.
  - `Failed`.
  - `Cancelled`.
- Resultado de análisis con elementos, relaciones y errores parciales.

Comportamiento:

- Un proyecto válido produce un modelo semántico.
- Un proyecto vacío produce un modelo vacío válido.
- Archivos no soportados no se presentan como analizados.
- Errores sintácticos no producen elementos inventados.
- El reanálisis elimina elementos obsoletos.
- El análisis no modifica los archivos fuente.

## 6. Fase 4: ChangeRequest y Trazabilidad

Introducir la petición original que da origen a una propuesta.

Componentes previstos:

- `ChangeRequest`.
- `RequestId`.
- Intención del usuario.
- Asociación con `ProjectId`.
- Asociación con `ProjectStateId`.
- Asociación con `AgentSession` cuando exista.

Una propuesta debe poder responder:

- Qué petición la originó.
- Sobre qué proyecto se generó.
- Sobre qué estado se generó.
- Qué elementos afecta.
- Qué agente la produjo.

Reglas:

- Generar una propuesta no modifica el proyecto.
- Una petición sin cambios produce un resultado explícito de no cambio.
- Una propuesta creada sobre un estado antiguo es potencialmente obsoleta.
- Un error del agente no produce una propuesta parcial válida.

## 7. Fase 5: RequestChange y AgentGateway

Completar el flujo de solicitud al agente usando únicamente el puerto `AgentGateway`.

El flujo será:

```text
ChangeRequest
      |
      v
ProjectState + contexto
      |
      v
AgentGateway
      |
      v
AgentResponse
      |
      v
ChangeProposal / RefactoringProposal
```

Implementar:

- Resultado `NoChange`.
- Resultado `WaitingForContext`.
- Errores de agente no disponible.
- Errores de generación.
- Timeout y cancelación.
- Validación de estado al recibir la respuesta.
- Asociación de la propuesta con source state.

El `LlmClient` será un detalle interno de adapters. La aplicación no dependerá directamente de él.

## 8. Fase 6: ShowChangeDelta

Convertir la funcionalidad de `ChangeDelta` en un caso de uso completo.

Componentes previstos:

- `ShowChangeDeltaCommand`.
- `ShowChangeDelta` application service.
- Validación de propuesta obsoleta.
- Filtros de cambios.
- Selección de cambios visibles.
- Inspección individual de cambios.

Debe garantizar:

- El delta se deriva de estados válidos.
- La propuesta original no se modifica.
- El proyecto no se modifica.
- Las vistas son derivadas del delta y no fuente de verdad.
- Los cambios mantienen trazabilidad hacia sus elementos.

## 9. Fase 7: View y ViewState

Separar representación visual de semántica de proyecto.

Componentes previstos:

- `View` fuera del dominio core.
- `ViewState` para posiciones, tamaños, zoom y visibilidad.
- Renderer UML.
- Vista de delta.
- Vista de modelo actual.
- Vista de modelo parcial.
- Invalidación de vistas tras un cambio estructural.

Reglas:

- Cambiar posición o zoom no modifica `ProjectState`.
- Una vista siempre deriva de un estado o delta concreto.
- Una vista asociada a un estado anterior puede identificarse como obsoleta.
- El modelo semántico sigue siendo la fuente de verdad.

## 10. Fase 8: Completar ViewContext

Extender `ViewContext` para cubrir todo UC-06.

Pendiente:

- `Constraint` asociado a elementos o relaciones.
- Modificaciones semánticas de la vista.
- Contexto estructurado completo.
- Asociación con la petición original.
- Envío del contexto al agente.
- Generación de una nueva propuesta.
- Lineage entre propuestas.
- Cancelación de edición.
- Detección de asociaciones ambiguas.
- Persistencia durante la interacción.

El contexto puede contener:

- petición original
- elementos seleccionados
- anotaciones
- restricciones
- cambios añadidos
- cambios eliminados
- cambios modificados
- cambios rechazados
- texto libre

Nunca debe modificar directamente el proyecto.

## 11. Fase 9: AcceptRefactoring y RefactoringEngine

La primera parte ya está implementada:

```text
RefactoringProposal
        |
        v
RefactoringEngine
        |
        v
ChangeProposal
```

Pendiente:

- Engine real que transforme código.
- Traducción de una propuesta de agente a cambios semánticos.
- Validación de que el resultado pertenece al mismo proyecto.
- Generación de `targetState` coherente.
- Soporte para múltiples propuestas aceptadas.
- Aplicación parcial mediante una nueva propuesta explícita.

Una propuesta de agente no debe modificar el proyecto por sí sola.

## 12. Fase 10: ApplyChangeProposal

La aplicación transaccional del agregado ya existe y debe integrarse con un workspace real.

Pendiente:

- Adaptador de filesystem/workspace.
- Aplicación real sobre archivos fuente.
- Reanálisis posterior.
- Verificación de que código y modelo coinciden.
- Rollback o estrategia de recuperación.
- Detección de cambios manuales concurrentes.
- Invalidación de vistas del estado anterior.
- Registro de trazabilidad.
- Aplicación atómica cuando sea posible.

Flujo esperado:

```text
Accepted ChangeProposal
        |
        v
WorkspaceWriter
        |
        v
Código modificado
        |
        v
AnalyzeProject
        |
        v
ProjectState nuevo
```

## 13. Fase 11: AgentSession

Introducir sesiones solo cuando el flujo de refinamiento necesite persistir conversación y lineage.

Conceptos previstos:

- `AgentSessionId`.
- `AgentSession`.
- `AgentMessage`.
- peticiones.
- respuestas.
- propuestas generadas.
- contextos enviados.
- lineage entre propuestas.

Una sesión no debe mezclarse con `ProjectState`. Puede pertenecer al agregado `Project` o mantenerse como agregado independiente.

## 14. Fase 12: Adapters Externos

Implementar adapters intercambiables detrás de puertos:

- `JevAgentGateway`.
- `OpenAiAgentGateway`.
- `LocalLlmAgentGateway`.
- otros sistemas compatibles.

Todos deben cumplir el mismo contrato `AgentGateway`.

Los tests de dominio y aplicación deben continuar usando fakes, sin levantar JEV ni realizar HTTP.

## 15. Casos De Uso MVP Pendientes

Según `docs/mvp.md`, todavía deben completarse:

1. `OpenProject`.
2. `AnalyzeProject`.
3. `CreateChangeIntent`.
4. `InspectProject`.
5. `ProposeChangeSet`.
6. `ApplyChangeSet`.
7. `RunTests`.
8. `ViewChangeSet`.
9. `ViewUML`.
10. `EditUML`.
11. `ExtractViewChanges`.
12. `ReviseChangeSet`.

## 16. Riesgos Técnicos A Resolver

- `ProjectState` debe protegerse contra aliasing del modelo de entrada.
- `ProjectState` debe validar IDs duplicados.
- `ChangeDelta.applyTo()` debe validar el source state.
- Las propuestas deben mantener `projectId`, `sourceStateId` y trazabilidad de la petición.
- `AgentGateway` debe ser la frontera pública; `LlmClient` no debe filtrarse a la aplicación.
- `WorkspaceWriter` debe soportar fallos y recuperación reales.
- Debe definirse la política para propuestas obsoletas y cambios concurrentes.
- Debe definirse la semántica de aceptación parcial.

## 17. Criterio De Finalización

El sistema podrá considerarse funcionalmente completo para el flujo principal cuando pueda ejecutar este escenario sin JEV real:

```text
Abrir proyecto
      |
      v
Analizar proyecto
      |
      v
Crear ChangeRequest
      |
      v
FakeAgentGateway
      |
      v
Mostrar propuestas
      |
      v
Aceptar propuesta
      |
      v
Crear ChangeProposal
      |
      v
Mostrar ChangeDelta
      |
      v
Aplicar propuesta aceptada
      |
      v
Modificar workspace
      |
      v
Reanalizar proyecto
      |
      v
Registrar ProjectState nuevo
```

Cada transición debe estar cubierta por tests de aplicación y dominio, y debe conservar estas invariantes:

- Ningún análisis modifica el proyecto.
- Ninguna propuesta se aplica sin aceptación explícita.
- Ninguna vista modifica la semántica del proyecto.
- Una propuesta siempre identifica el estado sobre el que fue creada.
- Un fallo de aplicación no marca la propuesta como aplicada.
- JEV nunca es una dependencia del dominio core.
