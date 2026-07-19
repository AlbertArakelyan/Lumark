import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

const editorModeSource = await readFile(
  new URL('../src/components/Editor/EditorMode.tsx', import.meta.url),
  'utf8',
);

test('mode selection buttons transition to a hover background', () => {
  const buttonsContent = editorModeSource.slice(
    editorModeSource.indexOf('const buttonsContent'),
    editorModeSource.indexOf('\n\n  return'),
  );

  assert.match(buttonsContent, /hover:bg-gray-200/);
  assert.match(buttonsContent, /transition-colors/);
});
