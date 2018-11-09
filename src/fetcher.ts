import {
	IOption,
	MiddlewareAPI,
	IFetcherOption,
	AnyResult,
	IFetcherFunction,
	IFetcher,
	IActionFetch,
	IFetcherContext,
	IFetcherFnContext,
	IUpdater,
	ICreateOption,
} from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { createMemoryStore } from './memory';

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

export interface IUpdaterKeeper {
	ctx?: any;
	fn(): void;
}

export class Fetcher<T, GetOptions, SetOptions> implements IFetcher<T, GetOptions, SetOptions>, IUpdater {
	private load: IFetcherFnContext<GetOptions, AnyResult<T>>;
	private modify: IFetcherFnContext<SetOptions, AnyResult<T>>;

	private hashArg: (opt?: GetOptions) => string;
	private context: IFetcherContext<T>;
	private holder: Holder<T>;
	private manual = false;
	private updates: IUpdaterKeeper[] = [];
	private updateFetcher() {
		this.updates.forEach(item => {
			item.fn.call(item.ctx);
		});
	}

	constructor(opts: IOption<T>, fn: IFetcherFunction<T, GetOptions, SetOptions>) {
		const store = {
			...opts.store,
			dispatch: (action: any) => {
				const result = opts.store.dispatch(action);
				if (action.type === opts.action) {
					const mode = action.action;
					if (mode === 'set' || mode === 'error') {
						this.updateFetcher();
					}
				}
				return result;
			},
		};
		const holderOpts = { ...opts, store };
		const holder = (this.holder = new Holder<T>(holderOpts));
		this.hashArg = opts.hashArg || hashArg;
		const impl = fn.load || notImpl;
		this.impl(impl as any);
		this.context = { holder, hash: this.hashArg, actions: holder.actions };
		this.manual = opts.manual;
	}

	addUpdater(fn: () => void, ctx?: any): void {
		this.updates.push({ fn, ctx });
	}

	removeUpdater(fn: () => void, ctx?: any): void {
		this.updates = this.updates.filter(item => {
			if (ctx && ctx === item.ctx) {
				return false;
			}
			return item.fn !== fn;
		});
	}

	impl(load: IFetcherFnContext<GetOptions, AnyResult<T>>): void {
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

		if (this.holder.has(key)) {
			return;
		}

		if (!this.holder.getAwait(key)) {
			const defer = load(args, this.context);
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
		if (this.manual) {
			const r = this.asyncGet(args);
			if (!r.data) {
				throw r;
			} else if (r.data.type === 'rejected') {
				throw r.data.data;
			} else {
				return r.data.data;
			}
		} else {
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
	}

	asyncSet(opt: SetOptions, arg?: GetOptions): TSyncPromise<T> {
		const key = this.hashArg(arg);
		const newDefer = this.modify(opt, this.context);
		const syncDefer =
			newDefer === undefined
				? TSyncPromise.reject<T>('unsupported')
				: ((Array.isArray(newDefer) ? TSyncPromise.all(newDefer) : TSyncPromise.resolve(newDefer)) as TSyncPromise<T>);
		this.holder.set(key, syncDefer);
		return syncDefer;
	}
}

export type TFetcherFn<T, GetOptions, SetOptions> =
	| IFetcherFunction<T, GetOptions, SetOptions>
	| IFetcherFnContext<GetOptions, AnyResult<T>>;

function getOption<T>(fn: ((opt: IFetcherOption) => T | undefined), option?: string | IFetcherOption): T | undefined {
	return option && typeof option !== 'string' ? fn(option) : undefined;
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

	const action = opts ? opts.action : 'action';
  const key = opts ? opts.key : 'local';
  const initialState = opts ? opts.initialState : undefined;

	const createStore = opts && opts.createStore ? opts.createStore : createMemoryStore;
	const setItemInterceptor: Partial<Record<string, typeof setItem>> = {};
	function setItem(action: IActionFetch): Record<string, any> | undefined {
		const iterceptor = setItemInterceptor[action.name];
		return iterceptor ? iterceptor(action) : undefined;
	}
	const store = createStore({ action, key, setItem }, initialState);
	function createFetcherImpl<T, GetOptions = any, SetOptions = any>(
		fns?: TFetcherFn<T, GetOptions, SetOptions>,
		option?: string | IFetcherOption
	): Fetcher<T, GetOptions, SetOptions> {
		const interceptor = getOption(o => o.setItem, option);
		const manual = !!getOption(o => o.manualStore, option);
		const hashArgFn = getOption(o => o.hashArg, option);
		const name = getName(option);
		if (interceptor) {
			setItemInterceptor[name] = interceptor;
		}

		return new Fetcher<T, GetOptions, SetOptions>(
			{ store, action, key, name, manual, hashArg: hashArgFn },
			!fns ? {} : typeof fns === 'function' ? { load: fns } : fns
		);
	}
	return createFetcherImpl;
}
