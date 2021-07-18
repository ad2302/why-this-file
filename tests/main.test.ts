import test from 'ava';
import { findDependents } from '../src/lib/index';
import path from 'path';

test('should skip directory in glob pattern', (t) => {
  const tPath = path.join(__dirname, '../src/lib/index.ts');
  const cur = __filename;
  const result = findDependents(tPath);
  const i = result.indexOf(path.relative('', cur));
  t.not(i, -1);
});
