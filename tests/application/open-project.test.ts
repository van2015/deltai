import { describe, expect, it } from 'vitest';

import { InMemoryActiveProjectRegistry } from '@/application/open-project/in-memory-active-project-registry.js';
import { OpenProjectCommand } from '@/application/open-project/open-project-command.js';
import { OpenProject } from '@/application/open-project/open-project.js';
import { ProjectLocationInaccessibleError } from '@/application/open-project/project-location-inaccessible-error.js';
import { ProjectLocationNotFoundError } from '@/application/open-project/project-location-not-found-error.js';
import { UnsupportedProjectError } from '@/application/open-project/unsupported-project-error.js';

import { FakeProjectWorkspace } from '../support/fakes/fake-project-workspace.js';

const validInspection = { exists: true, accessible: true, supported: true };

describe('OpenProject', () => {
  it('opens a valid project and makes it active', async () => {
    const workspace = new FakeProjectWorkspace(validInspection);
    const activeProjects = new InMemoryActiveProjectRegistry();
    const openProject = new OpenProject(workspace, activeProjects);

    const project = await openProject.execute(new OpenProjectCommand('/projects/orders'));

    expect(activeProjects.get()).toBe(project);
    expect(project.location?.path).toBe('/projects/orders');
  });

  it('creates an empty initial state', async () => {
    const openProject = new OpenProject(
      new FakeProjectWorkspace(validInspection),
      new InMemoryActiveProjectRegistry(),
    );

    const project = await openProject.execute(new OpenProjectCommand('/projects/orders'));

    expect(project.currentState.projectId).toBe('/projects/orders');
    expect(project.currentState.getElements()).toEqual([]);
    expect(project.currentState.getRelationships()).toEqual([]);
  });

  it('normalizes the project location', async () => {
    const workspace = new FakeProjectWorkspace(validInspection);
    const openProject = new OpenProject(
      workspace,
      new InMemoryActiveProjectRegistry(),
    );

    const project = await openProject.execute(
      new OpenProjectCommand('/projects/orders/../orders'),
    );

    expect(project.location?.path).toBe('/projects/orders');
    expect(project.currentState.projectId).toBe('/projects/orders');
  });

  it('returns the same project when the active project is opened again', async () => {
    const workspace = new FakeProjectWorkspace(validInspection);
    const activeProjects = new InMemoryActiveProjectRegistry();
    const openProject = new OpenProject(workspace, activeProjects);
    const firstProject = await openProject.execute(
      new OpenProjectCommand('/projects/orders'),
    );

    const secondProject = await openProject.execute(
      new OpenProjectCommand('/projects/orders/.'),
    );

    expect(secondProject).toBe(firstProject);
    expect(workspace.inspectedLocations).toHaveLength(1);
  });

  it('switches to another valid project', async () => {
    const workspace = new FakeProjectWorkspace(validInspection);
    const activeProjects = new InMemoryActiveProjectRegistry();
    const openProject = new OpenProject(workspace, activeProjects);
    const firstProject = await openProject.execute(
      new OpenProjectCommand('/projects/orders'),
    );

    const secondProject = await openProject.execute(
      new OpenProjectCommand('/projects/customers'),
    );

    expect(secondProject).not.toBe(firstProject);
    expect(activeProjects.get()).toBe(secondProject);
  });

  it('rejects a non-existent location', async () => {
    const activeProjects = new InMemoryActiveProjectRegistry();
    const activeProject = await new OpenProject(
      new FakeProjectWorkspace(validInspection),
      activeProjects,
    ).execute(new OpenProjectCommand('/projects/orders'));
    const openProject = new OpenProject(
      new FakeProjectWorkspace({ exists: false, accessible: true, supported: true }),
      activeProjects,
    );

    await expect(
      openProject.execute(new OpenProjectCommand('/projects/missing')),
    ).rejects.toThrow(ProjectLocationNotFoundError);
    expect(activeProjects.get()).toBe(activeProject);
  });

  it('rejects an inaccessible location', async () => {
    const activeProjects = new InMemoryActiveProjectRegistry();
    const activeProject = await new OpenProject(
      new FakeProjectWorkspace(validInspection),
      activeProjects,
    ).execute(new OpenProjectCommand('/projects/orders'));
    const openProject = new OpenProject(
      new FakeProjectWorkspace({ exists: true, accessible: false, supported: true }),
      activeProjects,
    );

    await expect(
      openProject.execute(new OpenProjectCommand('/projects/private')),
    ).rejects.toThrow(ProjectLocationInaccessibleError);
    expect(activeProjects.get()).toBe(activeProject);
  });

  it('rejects an unsupported project', async () => {
    const activeProjects = new InMemoryActiveProjectRegistry();
    const activeProject = await new OpenProject(
      new FakeProjectWorkspace(validInspection),
      activeProjects,
    ).execute(new OpenProjectCommand('/projects/orders'));
    const openProject = new OpenProject(
      new FakeProjectWorkspace({ exists: true, accessible: true, supported: false }),
      activeProjects,
    );

    await expect(
      openProject.execute(new OpenProjectCommand('/projects/legacy')),
    ).rejects.toThrow(UnsupportedProjectError);
    expect(activeProjects.get()).toBe(activeProject);
  });

  it('does not write to the workspace while opening', async () => {
    const workspace = new FakeProjectWorkspace(validInspection);
    const openProject = new OpenProject(
      workspace,
      new InMemoryActiveProjectRegistry(),
    );

    await openProject.execute(new OpenProjectCommand('/projects/orders'));

    expect(workspace.inspectedLocations).toHaveLength(1);
  });
});
