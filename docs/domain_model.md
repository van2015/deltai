```mermaid
classDiagram

    class Project {
        <<Aggregate Root>>
        ProjectId id
        ProjectState currentState
    }

    class ProjectState {
        <<Entity / Snapshot>>
        ProjectStateId id
        ProjectModel model
    }

    class ProjectModel {
        <<Domain Model>>
        Element[] elements
        Relationship[] relationships
    }

    class ChangeRequest {
        <<Aggregate Root>>
        RequestId id
        String instruction
        SemanticContext context
    }

    class ChangeProposal {
        <<Aggregate Root>>
        ProposalId id
        ProjectState sourceState
        ProjectState targetState
        ProposalStatus status
    }

    class ChangeDelta {
        <<Value Object>>
        ProjectState sourceState
        ProjectState targetState
        Change[] changes
    }

    class Change {
        <<Value Object>>
        ChangeType type
    }

    class SemanticContext {
        <<Value Object>>
        Constraint[] constraints
        SemanticChange[] changes
        RejectedChange[] rejectedChanges
    }

    Project "1" --> "1..*" ProjectState
    ProjectState "1" --> ProjectStateId
    ProjectState "1" --> ProjectModel

    ChangeRequest "1" --> RequestId
    ChangeRequest "0..1" --> SemanticContext

    ChangeProposal "1" --> ProposalId
    ChangeProposal "1" --> ProjectState : source
    ChangeProposal "1" --> ProjectState : target

    ChangeDelta "1" --> ProjectState : source
    ChangeDelta "1" --> ProjectState : target
    ChangeDelta "1" --> "*" Change

    ChangeDelta ..> ChangeProposal : derived from
    ```