import { IOption, MiddlewareAPI, FetcherState, AnyResult, IFetcherFunction, typeFetcherFn, IActionFetch } from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { IOptionReducer, createReducer } from './reduxReducer';
function notImpl() {
	const msg = new Error("Fetcher wasn't implemented");
	return TSyncPromise.reject(msg);
}

export class Fetcher<SetOptions, T> {
	private load: (...args: any[]) => AnyResult<T>;
	private modify: (opt: SetOptions) => AnyResult<T>;
	private holder: Holder<T>;
	private mapper?: Partial<Record<string, Fetcher<SetOptions, T>>>;
	private keyPersist: string = '';

	constructor(opts: IOption, fn: IFetcherFunction<T>) {
		this.holder = new Holder<T>(opts);
		const impl = fn.load || notImpl;
		this.impl(impl as any);
	}

	impl(load: (...args: any[]) => AnyResult<T>): void {
		this.load = load;
	}

	implModify(modify: (opt: SetOptions) => AnyResult<T> | undefined): void {
		this.modify = modify;
	}

	clear(): void {
		return this.holder.clear();
	}

	init(key: string, args: any[]): void {
		const load = this.load;
		if (!load) {
			return;
		}
		if (this.holder.has(key)) {
			return;
		}
		if (!this.holder.getAwait(key)) {
			const defer = load(...args);
			const syncDefer = (Array.isArray(defer) ? TSyncPromise.all(defer) : TSyncPromise.resolve(defer)) as TSyncPromise<
				T
			>;

			this.holder.set(key, syncDefer);
		}
	}

	isLoading(): boolean {
		return this.holder.isLoading(this.keyPersist);
	}

	awaitAll(): TSyncPromise<T[]> {
		return this.holder.awaitAll();
	}

	await(): TSyncPromise<T> {
		const args = Array.prototype.slice.apply(arguments);
		return this.holder.await(this.keyPersist);
	}

	asyncGet(...args: any[]): TSyncPromise<T> {
		this.init(this.keyPersist, args);
		return this.holder.await(this.keyPersist);
	}

	store(key: string): Fetcher<SetOptions, T> {
		const keyPersist = this.keyPersist || '';
		const mapper = this.mapper || (this.mapper = { [keyPersist]: this });
		if (mapper[key]) {
			return mapper[key];
		} else {
			const copy: Fetcher<SetOptions, T> = Object.create(this);
			copy.keyPersist = key;
			mapper[key] = copy;
			return copy;
		}
	}

	get(...args: any[]): T {
		const key = this.keyPersist;
		this.init(key, args);
		const error = this.holder.error(key);
		if (error !== undefined) {
			throw error;
		}
		if (!this.holder.has(key)) {
			throw this.holder.await(key);
		}
		return this.holder.get(key);
	}

	asyncSet(opt: SetOptions): TSyncPromise<T> {
		const newDefer = this.modify(opt);
		const syncDefer =
			newDefer === undefined
				? TSyncPromise.reject<T>('unsupported')
				: ((Array.isArray(newDefer) ? TSyncPromise.all(newDefer) : TSyncPromise.resolve(newDefer)) as TSyncPromise<T>);
		this.holder.set(this.keyPersist, syncDefer);
		return syncDefer;
	}
}

function createMemoryStore(opt: IOptionReducer<any>): MiddlewareAPI {
	const { key } = opt;
	const reducer = createReducer(opt);
	let state: any = { [key]: {} };
	const ret: MiddlewareAPI = {
		getState() {
			return state;
		},
		dispatch(action: any): any {
			state = reducer(state, action);
			return action;
		},
	};
	return ret;
}



export interface IFetcherOption {
  name?: string;
  setItem?(action: IActionFetch): Record<string, any> | undefined;
}

export type TFetcherFn<T> = IFetcherFunction<T> | ((...args: any[]) => AnyResult<T>);

export interface ICreateOption {
	createStore: typeof createMemoryStore;
	action: string;
	key: string;
}

export function create(opts?: ICreateOption): typeof typeFetcherFn {
	let counter = 0;
	function getName(option?: string | IFetcherOption): string {
		return option === undefined || option === null
			? '' + counter++
			: typeof option === 'string'
				? option
				: getName(option.name);
  }
  function getIterceptor(option?: string | IFetcherOption) {
    return (option && typeof option !== 'string') ? option.setItem : undefined;
  }
	const action = opts ? opts.action : 'action';
	const key = opts ? opts.key : 'local';

  const createStore = (opts && opts.createStore) ? opts.createStore : createMemoryStore;
  const setItemInterceptor: Partial<Record<string, typeof setItem>> = {};
  function setItem(action: IActionFetch): Record<string, any> | undefined {
    const iterceptor = setItemInterceptor[action.name];
    return iterceptor ? iterceptor(action) : undefined;
  }
  const store = createStore({ action, key, setItem });
	function createFetcherImpl<T, SetOptions = any>(
		fns?: TFetcherFn<T>,
		option?: string | IFetcherOption
	): Fetcher<SetOptions, T> {
    const interceptor = getIterceptor(option);
    const name = getName(option);
    if (interceptor) {
      setItemInterceptor[name] = interceptor;
    }
		return new Fetcher<SetOptions, T>(
			{ store, action, key, name },
			!fns ? {} : typeof fns === 'function' ? { load: fns } : fns
		);
	}
	return createFetcherImpl as any;
}
