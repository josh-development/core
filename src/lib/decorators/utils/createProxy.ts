// eslint-disable-next-line @typescript-eslint/ban-types
export function createProxy<T extends object>(target: T, handler: Omit<ProxyHandler<T>, 'get'>): T {
  return new Proxy(target, {
    ...handler,
    get: (target, property) => {
      const value = Reflect.get(target, property);

      return typeof value === 'function' ? (...args: readonly unknown[]) => value.apply(target, args) : value;
    }
  });
}
