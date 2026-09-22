                    ┌────────────┐
                    │   Project  │
                    └─────┬──────┘
                          │
                          ▼
                    ProjectState
                          │
                          ▼
                    ProjectModel


 ChangeRequest ──→ ChangeProposal
                         │
                   ┌─────┴─────┐
                   ▼           ▼
             sourceState   targetState
                   │           │
                   └─────┬─────┘
                         ▼
                    ChangeDelta
                         │
                         ▼
                       View
                         │
                    ViewContext
                         │
                         ▼
                  ChangeRequest₂




              ┌──────────────────────────┐
              │          DOMAIN          │
              │                          │
              │ Project                  │
              │ ProjectState             │
              │ ProjectModel             │
              │ ChangeRequest             │
              │ ChangeProposal            │
              │ ChangeDelta               │
              │                          │
              └────────────┬─────────────┘
                           │
                 extension points
                    ┌──────┴──────┐
                    ▼             ▼
                 AI Agent       Views