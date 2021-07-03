export class JoshError extends Error {
	public constructor(message: string, name?: string) {
		super();
		this.name = name ?? 'JoshError';
		this.message = message;
	}
}
