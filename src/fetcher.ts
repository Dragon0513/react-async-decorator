import { IOption, MiddlewareAPI, IFetcherOption, AnyResult, IFetcherFunction, IFetcher, IActionFetch, IFetcherContext, IFetcherFnContext } from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { IOptionReducer, createReducer } from './reduxReducer';
function notImpl() {
	const msg = new Error("Fetcher wasn't implemented");
	return TSyncPromise.reject(msg);
}

function hashArg<T>(arg?: T): string {
  if (arg === null || arg === undefined) {
    return '';
  }
  return JSON.stringify(arg);
}

export class Fetcher<T, GetOptions, SetOptions> implements IFetcher<T, GetOptions, SetOptions> {
  private load: IFetcherFnContext<GetOptions, AnyResult<T>>;
  private modify: IFetcherFnContext<SetOptions, AnyResult<T>>;

  private hashArg: (opt?: GetOptions) => string;
  private context: IFetcherContext = {};
	private holder: Holder<T>;

	constructor(opts: IOption, fn: IFetcherFunction<T, GetOptions, SetOptions>) {
    this.holder = new Holder<T>(opts);
    this.hashArg = opts.hashArg || hashArg;
		const impl = fn.load || notImpl;
		this.impl(impl as any);
	}

	impl(load: (opt?: GetOptions) => AnyResult<T>): void {
		this.load = load;
	}

	implModify(modify: IFetcherFnContext<SetOptions, AnyResult<T> | undefined>): void {
		this.modify = modify;
	}

	clear(): void {
		return this.holder.clear();
	}

	init(key: string, args?: GetOptions): void {
		const load = this.load;
		if (!load) {
			return;
		}
		if (this.holder.has(key)) {
			return;
		}
		if (!this.holder.getAwait(key)) {
			const defer = load(this.context, args);
			const syncDefer = (Array.isArray(defer) ? TSyncPromise.all(defer) : TSyncPromise.resolve(defer)) as TSyncPromise<
				T
			>;

			this.holder.set(key, syncDefer);
		}
	}

	isLoading(arg?: GetOptions): boolean {
    const key = this.hashArg(arg);
		return this.holder.isLoading(key);
	}

	awaitAll(): TSyncPromise<T[]> {
		return this.holder.awaitAll();
	}

	await(arg?: GetOptions): TSyncPromise<T> {
    const key = this.hashArg(arg);
		return this.holder.await(key);
	}

	asyncGet(args?: GetOptions): TSyncPromise<T> {
    const key = this.hashArg(args);
		this.init(key, args);
		return this.holder.await(key);
	}

	get(args?: GetOptions): T {
		const key = this.hashArg(args);
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

	asyncSet(opt: SetOptions, arg?: GetOptions): TSyncPromise<T> {
    const key = this.hashArg(arg);
		const newDefer = this.modify(this.context, opt);
		const syncDefer =
			newDefer === undefined
				? TSyncPromise.reject<T>('unsupported')
				: ((Array.isArray(newDefer) ? TSyncPromise.all(newDefer) : TSyncPromise.resolve(newDefer)) as TSyncPromise<T>);
		this.holder.set(key, syncDefer);
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

export type TFetcherFn<T, GetOptions, SetOptions> =
  IFetcherFunction<T, GetOptions, SetOptions> |
  IFetcherFnContext<GetOptions, AnyResult<T>>;

export interface ICreateOption {
	createStore: typeof createMemoryStore;
	action: string;
	key: string;
}

export function create(opts?: ICreateOption) {
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
	function createFetcherImpl<T, GetOptions = any, SetOptions = any>(
		fns?: TFetcherFn<T, GetOptions, SetOptions>,
		option?: string | IFetcherOption
	): Fetcher<T, GetOptions, SetOptions> {
    const interceptor = getIterceptor(option);
    const name = getName(option);
    if (interceptor) {
      setItemInterceptor[name] = interceptor;
    }
		return new Fetcher<T, GetOptions, SetOptions>(
			{ store, action, key, name },
			!fns ? {} : typeof fns === 'function' ? { load: fns } : fns
		);
	}
	return createFetcherImpl;
}
