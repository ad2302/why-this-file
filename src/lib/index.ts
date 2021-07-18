import path from 'path';

import findImports from 'find-imports';

export function findDependents(
  entryPath: string,
  cwd = process.cwd()
): string[] {
  const result = [];
  const ext = path.extname(entryPath);
  const isAbs = path.isAbsolute(entryPath);
  const absPath = isAbs ? entryPath : path.normalize(path.join(cwd, entryPath));
  const relPath = isAbs ? path.relative(cwd, entryPath) : entryPath;
  let curPath = absPath;
  let dir = path.dirname(curPath);
  //   const absPathWithoutExt = path.join(
  //     dir,
  //     path.basename(absPath, path.extname(absPath))
  //   );
  const relPathWithoutExt = path.join(
    path.dirname(relPath),
    path.basename(relPath, path.extname(relPath))
  );
  const cp = path.dirname(cwd);
  while (dir != cp) {
    if (path.basename(dir) === 'node_modules') {
      continue;
    }
    const modules = findImports(
      [`**/*${ext}`, '!**/node_modules/**'],
      {
        absoluteImports: true,
        relativeImports: true,
        packageImports: false
      },
      dir
    );

    for (const k in modules) {
      const paths = modules[k].map((e) =>
        path.relative(cwd, path.join(path.dirname(k), e))
      );
      if (-1 !== paths.indexOf(relPathWithoutExt)) {
        result.push(path.relative(cwd, path.normalize(path.join(dir, k))));
      }
    }
    curPath = dir;
    dir = path.dirname(curPath);
  }
  return result;
}
