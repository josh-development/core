export function isNodeEnvironment(): boolean {
	return process?.versions?.node !== undefined;
}
