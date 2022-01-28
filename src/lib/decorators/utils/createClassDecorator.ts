export function createClassDecorator<TFunction extends (...args: any[]) => void>(fn: TFunction): ClassDecorator {
  return fn;
}
