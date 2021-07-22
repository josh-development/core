export function get<D extends Record<string, any>>(data: D | undefined, path: string): D | undefined {
	const fullPath = path.replace(/\[/g, '.').replace(/]/g, '').split('.').filter(Boolean);

	return fullPath.every((step) => !(step && (data = data?.[step]) === undefined)) ? data : undefined;
}
