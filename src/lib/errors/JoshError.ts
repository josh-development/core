export class JoshError extends Error {
	public identifier: string;

	public constructor(options: JoshError.Options) {
		super(options.message);

		this.identifier = options.identifier;
	}

	public get name() {
		return 'JoshError';
	}
}

export namespace JoshError {
	export interface Options {
		identifier: string;
		message?: string;
	}
}
