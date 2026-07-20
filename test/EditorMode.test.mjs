import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';

const editorModeSource = await readFile(
  new URL('../src/components/Editor/EditorMode.tsx', import.meta.url),
  'utf8',
);

test('mode selection buttons preserve the active background on hover', () => {
  const modeButton = editorModeSource.match(
    /<button\s+key=\{button\.value\}[\s\S]*?className=\{`([^`]*)`\}[\s\S]*?>/,
  );

  assert.ok(modeButton, 'mode button className should be present');
  assert.match(
    modeButton[1],
    /\$\{button\.value === editorMode \? 'bg-gray-300' : 'hover:bg-gray-200'\}/,
    'active and inactive mode colors must be mutually exclusive',
  );
  assert.match(modeButton[1], /\btransition-colors\b/);
});
