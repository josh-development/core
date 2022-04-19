export function PreProvider(): MethodDecorator {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata('pre', target.constructor)) Reflect.defineMetadata('pre', [], target.constructor);

    const methods = Reflect.getMetadata('pre', target.constructor);

    if (Array.isArray(methods)) methods.push(propertyKey);
  };
}
