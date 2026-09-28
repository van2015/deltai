import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import { ProjectLocation } from '@/domain/project/project-location.js';
import { NodeProjectWorkspace } from '@/infrastructure/filesystem/node-project-workspace.js';

import { FakeProjectSupportDetector } from '../../support/fakes/fake-project-support-detector.js';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'deltai-open-project-'));
  temporaryDirectories.push(directory);

  return directory;
};

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ));
});

describe('NodeProjectWorkspace', () => {
  it('inspects an existing supported directory', async () => {
    const directory = await createTemporaryDirectory();
    const detector = new FakeProjectSupportDetector(true);
    const workspace = new NodeProjectWorkspace(detector);

    const inspection = await workspace.inspect(ProjectLocation.of(directory));

    expect(inspection).toEqual({ exists: true, accessible: true, supported: true });
    expect(detector.inspectedPaths).toEqual([directory]);
  });

  it('reports a missing location', async () => {
    const directory = await createTemporaryDirectory();
    const workspace = new NodeProjectWorkspace(new FakeProjectSupportDetector(true));

    const inspection = await workspace.inspect(ProjectLocation.of(join(directory, 'missing')));

    expect(inspection).toEqual({ exists: false, accessible: false, supported: false });
  });

  it('reports a file as an unsupported project location', async () => {
    const directory = await createTemporaryDirectory();
    const file = join(directory, 'project.txt');
    await writeFile(file, 'project');
    const detector = new FakeProjectSupportDetector(true);
    const workspace = new NodeProjectWorkspace(detector);

    const inspection = await workspace.inspect(ProjectLocation.of(file));

    expect(inspection).toEqual({ exists: true, accessible: true, supported: false });
    expect(detector.inspectedPaths).toEqual([]);
  });

  it('delegates compatibility to the configured detector', async () => {
    const directory = await createTemporaryDirectory();
    const detector = new FakeProjectSupportDetector(false);
    const workspace = new NodeProjectWorkspace(detector);

    const inspection = await workspace.inspect(ProjectLocation.of(directory));

    expect(inspection.supported).toBe(false);
    expect(detector.inspectedPaths).toHaveLength(1);
  });

  it('normalizes the location without resolving symlinks', async () => {
    const directory = await createTemporaryDirectory();
    const detector = new FakeProjectSupportDetector(true);
    const workspace = new NodeProjectWorkspace(detector);

    await workspace.inspect(ProjectLocation.of(join(directory, '.')));

    expect(detector.inspectedPaths).toEqual([directory]);
  });

  it('does not modify directory contents', async () => {
    const directory = await createTemporaryDirectory();
    const file = join(directory, 'package.json');
    await writeFile(file, '{"name":"sample"}');
    const contentsBefore = await readdir(directory);
    const workspace = new NodeProjectWorkspace(new FakeProjectSupportDetector(true));

    await workspace.inspect(ProjectLocation.of(directory));

    expect(await readFile(file, 'utf8')).toBe('{"name":"sample"}');
    expect(await readdir(directory)).toEqual(contentsBefore);
  });
});
