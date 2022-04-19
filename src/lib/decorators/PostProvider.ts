export function PostProvider(): MethodDecorator {
  return (target, propertyKey) => {
    if (!Reflect.hasMetadata('post', target.constructor)) Reflect.defineMetadata('post', [], target.constructor);

    const methods = Reflect.getMetadata('post', target.constructor);

    if (Array.isArray(methods)) methods.push(propertyKey);
  };
}
