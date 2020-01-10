
import { ReflectiveInjector } from 'injection-js';

export const resolveDeps = (input: new (...args: any[]) => any) => {
  const deps = new Set<new (...args: any[]) => any>();

  const resolver = (klass: new (...args: any[]) => any) => {
    if (deps.has(klass)) return;

    deps.add(klass);

    ReflectiveInjector.resolve([klass])
      .reduce((a, x: any) => a.concat(x.resolvedFactories), [])
      .reduce((a, r: any) => a.concat(r.dependencies), [])
      .forEach((d: any) => resolver(d.key.token));
  };

  resolver(input);

  return Array.from(deps);
};
