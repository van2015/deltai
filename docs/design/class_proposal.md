| Concepto         | Tipo propuesto                         | Motivo                                                    |
| ---------------- | -------------------------------------- | --------------------------------------------------------- |
| `Project`        | **Aggregate Root / Entity**            | Identidad y ciclo de vida del proyecto                    |
| `ProjectState`   | **Entity / Snapshot**                  | Identifica un estado concreto del proyecto                |
| `ProjectModel`   | **Value / Domain Model**               | Describe la estructura semántica de un estado             |
| `ChangeRequest`  | **Aggregate Root / Entity**            | Representa una intención concreta                         |
| `ChangeProposal` | **Aggregate Root / Entity**            | Tiene ciclo de vida propio y puede ser aceptada/rechazada |
| `ChangeDelta`    | **Value Object**                       | Resultado derivado de comparar dos estados                |
| `Change`         | **Value Object**                       | Describe una diferencia semántica                         |
| `View`           | **fuera del dominio core / extensión** | Es una representación                                     |
| `ViewState`      | **Value Object**                       | Estado de presentación                                    |
| `ViewContext`    | **Value Object**                       | Información contextual aportada por el usuario            |
| `Annotation`     | **Value Object**                       | No necesita identidad propia                              |
| `Constraint`     | **Value Object**                       | Restricción contextual                                    |
| `Selection`      | **Value Object**                       | Selección de elementos                                    |
| `ProjectId`      | **Value Object**                       | Identidad                                                 |
| `ProposalId`     | **Value Object**                       | Identidad                                                 |
| `RequestId`      | **Value Object**                       | Identidad                                                 |
