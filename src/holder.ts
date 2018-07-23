import {
	IOption,
	IDataItem,
	IHolder,
	IActionFetchRequest,
	IActionFetchSet,
	IActionFetchError,
	IActionFetch,
} from './interfaces';
import { TSyncPromise } from './promise';

export class Holder<T> implements IHolder<T> {
	private container: Partial<Record<string, TSyncPromise<T>>> = {};
	static notExist = TSyncPromise.reject<any>(new Error("Doesn't exist"));

	constructor(private props: IOption) {}

	set(params: Record<string, TSyncPromise<T>>): void;
	set(key: string, defer: TSyncPromise<T>): void;
	set(aKey: any, aDefer?: any) {
		const { store, name, action } = this.props;
		if (aDefer !== undefined) {
			if (!this.props.manual) {
				const act: IActionFetchRequest = { type: action, action: 'request', name, keys: aKey };
				store.dispatch(act);
				aDefer.then(
					payload => {
						if (!this.allow(aKey, aDefer)) {
							return;
						}
						const act2: IActionFetchSet = {
							type: action,
							action: 'set',
							name,
							payload: { [aKey]: payload },
						};
						store.dispatch(act2);
					},
					error => {
						if (!this.allow(aKey, aDefer)) {
							return;
						}
						const act2: IActionFetchError = {
							type: action,
							action: 'error',
							name,
							payload: { [aKey]: error },
						};
						store.dispatch(act2);
					}
				);
			}
			this.container[aKey] = aDefer;
		} else {
			const keys = Object.keys(aKey);
			const params: Record<string, TSyncPromise<T>> = aKey;
			const act: IActionFetch = { type: action, action: 'request', name, keys };
			store.dispatch(act);
			const defers = keys.map(key => {
				this.container[key] = params[key];
				return params[key];
			});
			TSyncPromise.all<T>(defers).then(
				payloads => {
					const allowKeys = keys.filter(key => this.allow(key, params[key]));
					const indexes = allowKeys.map(key => keys.indexOf(key));
					const payload: Record<string, T> = {};
					indexes.forEach(id => {
						payload[keys[id]] = payloads[id];
					});
					if (indexes.length) {
						const act2: IActionFetchSet = {
							type: action,
							action: 'set',
							name,
							payload,
						};
						store.dispatch(act2);
					}
				},
				error => {
					const allowKeys = keys.filter(key => this.allow(key, params[key]));
					const indexes = allowKeys.map(key => keys.indexOf(key));
					const payload: Record<string, Error> = {};
					indexes.forEach(id => {
						payload[keys[id]] = error;
					});
					const act2: IActionFetchError = {
						type: action,
						action: 'error',
						name,
						payload,
					};
					store.dispatch(act2);
				}
			);
		}
	}

	allow(key: string, defer: TSyncPromise<T>): boolean {
		return this.container[key] === defer;
	}

	clear(): void {
		const { store, action, name } = this.props;
		store.dispatch({ type: action, action: 'clear', name });
		this.container = {};
	}

	private getDataBlob(aKey: string): IDataItem | undefined {
		const { store, key, name } = this.props;

		const state = store.getState();
		if (!state) {
			return;
		}
		const holderState = state[key];
		if (!holderState) {
			return;
		}
		const ptr = holderState[name];
		if (!ptr) {
			return;
		}
		return ptr[aKey];
	}

	get(key: string): T | undefined {
		const blob = this.getDataBlob(key);
		return blob ? blob.data : undefined;
	}

	has(key: string): boolean {
		const blob = this.getDataBlob(key);
		return blob ? (blob.loading === true ? false : true) : false;
	}

	isLoading(key: string): boolean | undefined {
		const blob = this.getDataBlob(key);
		return blob ? blob.loading : undefined;
	}

	error(key: string): Error | undefined {
		const blob = this.getDataBlob(key);
		const error = blob ? blob.error : undefined;
		if (error) {
			const err = new Error();
			err.message = error.message;
			err.stack = error.stack;
			err.name = error.name;
			return err;
		}
	}

	getAwait(key: string): TSyncPromise<T> | undefined {
		return this.container[key];
	}

	await(key: string): TSyncPromise<T> {
		const ret = this.getAwait(key);
		return ret || Holder.notExist;
	}

	awaitAll(): TSyncPromise<T[]> {
		const allDefers = Object.keys(this.container).map(key => this.container[key]);
		return TSyncPromise.all<T>(allDefers);
	}
}
