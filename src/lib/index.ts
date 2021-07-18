import path from 'path';
import findImports from '@ad2302/find-imports';
import parseGlob from 'gitignore-globs';
import pathExists from 'path-exists';

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
  let ignore = [];
  const gitignorePath = path.join(cwd, '.gitignore');
  const npmignores = path.join(cwd, '.npmignore');
  if (pathExists.sync(gitignorePath)) {
    ignore = ignore.concat(parseGlob(gitignorePath));
  }
  if (pathExists.sync(npmignores)) {
    ignore = ignore.concat(parseGlob(npmignores));
  }
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
        packageImports: false,
        ignore,
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
