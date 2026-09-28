import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import { InMemoryActiveProjectRegistry } from '@/application/open-project/in-memory-active-project-registry.js';
import { OpenProjectCommand } from '@/application/open-project/open-project-command.js';
import { OpenProject } from '@/application/open-project/open-project.js';
import { NodeProjectWorkspace } from '@/infrastructure/filesystem/node-project-workspace.js';

import { FakeProjectSupportDetector } from '../support/fakes/fake-project-support-detector.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ));
});

describe('OpenProject with NodeProjectWorkspace', () => {
  it('opens a real supported directory without analyzing or modifying it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'deltai-open-project-'));
    temporaryDirectories.push(directory);
    const openProject = new OpenProject(
      new NodeProjectWorkspace(new FakeProjectSupportDetector(true)),
      new InMemoryActiveProjectRegistry(),
    );

    const project = await openProject.execute(new OpenProjectCommand(directory));

    expect(project.location?.path).toBe(directory);
    expect(project.currentState.getElements()).toEqual([]);
    expect(project.currentState.getRelationships()).toEqual([]);
  });
});
