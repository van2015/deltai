describe("Project", () => {

    it("starts with an initial state")
})

given:
    initialState = State₀

when:
    project = Project.create(initialState)

then:
    project.currentState == State₀



describe("Project.apply", () => {

    it("moves the project to the proposal target state")
})


given:

    State₀

    Proposal:
        source = State₀
        target = State₁

    Project:
        currentState = State₀

when:

    project.apply(proposal)

then:

    project.currentState == State₁



it("rejects a proposal whose source state is not the current state")
given:

    Project.currentState = State₂

    Proposal:
        source = State₀
        target = State₁

when:

    project.apply(proposal)

then:

    application fails
    project.currentState == State₂