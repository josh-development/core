export function set<D extends Record<string, any>, V>(data: D, path: string, value: V): D {
	const fullPath = path.replace(/\[/g, '.').replace(/]/g, '').split('.').filter(Boolean);

	fullPath.reduce((previousStep, step, index) => {
		if (typeof previousStep[step] !== 'object') Reflect.deleteProperty(previousStep, step);

		// @ts-expect-error 2536
		if (previousStep[step] === undefined) previousStep[step] = {};

		// @ts-expect-error 2536
		if (index === fullPath.length - 1) previousStep[step] = value;
		return previousStep[step];
	}, data);

	return data;
}
