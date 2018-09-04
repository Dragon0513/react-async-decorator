import { TSyncPromise } from './promise';
export interface Action<T = any> {
	type: T;
}

export interface AnyAction extends Action {
	// Allows any extra properties to be defined in an action.
	[extraProps: string]: any;
}

export interface Dispatch<A extends Action = AnyAction> {
	<T extends A>(action: T): T;
}

export interface IActionFetchClear extends Action {
	name: string;
	action: 'clear';
}

export interface IActionFetchError extends Action {
	name: string;
	action: 'error';
	payload: Record<string, Error>;
}

export interface IActionFetchSet extends Action {
	name: string;
	action: 'set';
	payload: Record<string, any>;
}

export interface IActionFetchRequest extends Action {
	name: string;
	action: 'request';
	keys: string | string[];
}

export type IActionFetch = IActionFetchClear | IActionFetchSet | IActionFetchRequest | IActionFetchError;

export interface IDataItem {
	data?: any;
	error?: {
		name: string;
		message: string;
		stack: string;
	};
	loading?: boolean;
}

export type FetcherItem = Partial<Record<string, IDataItem>>;
export type FetcherState = Partial<Record<string, FetcherItem>>;

export interface MiddlewareAPI<D extends Dispatch = Dispatch<any>, S = Record<string, FetcherState>> {
	dispatch: D;
	getState(): S;
}

export interface IOption {
	name: string;
	action: string; // action for redux
	key: string; // key in store
	store: MiddlewareAPI;
	manual: boolean;
	hashArg?(arg?: any): string;
}

export type AnyResult<T> = T | Promise<T> | TSyncPromise<T> | Promise<T>[] | TSyncPromise<T>[];

export interface IHolder<T> {
	set(params: Record<string, TSyncPromise<T>>): void;
	set(key: string, defer: TSyncPromise<T>): void;
	allow(key: string, defer: TSyncPromise<T>): boolean;
	clear(): void;
	get(key: string): T | undefined;
	has(key: string): boolean;
	isLoading(key: string): boolean | undefined;
	error(key: string): Error | undefined;
	getAwait(key: string): TSyncPromise<T> | undefined;
	await(key: string): TSyncPromise<T>;
	awaitAll(): TSyncPromise<T[]>;
}

export interface IFetcherContext<T> {
	holder: IHolder<T>;
	hash(arg?: any): string;
}
export interface IFetcherFunction<T, GetOptions, SetOptions> {
	load?: IFetcherFnContext<GetOptions, AnyResult<T>>;
	modify?: IFetcherFnContext<SetOptions, AnyResult<T>>;
}

export interface IUpdater {
  addUpdater(fn: () => void, ctx?: any): void;
  removeUpdater(fn: () => void, ctx?: any): void;
}

export interface IFetcherBase<SetOptions, T> extends IUpdater {
	clear(): void;
	await(): TSyncPromise<T>;
	awaitAll(): TSyncPromise<T[]>;
	asyncSet(opts: SetOptions): TSyncPromise<T>;
	implModify(modify: IFetcherFnContext<SetOptions, AnyResult<T> | undefined>): void;
  isLoading(): boolean;
}

export type IFetcherFn<Opt, T> = (arg?: Opt) => T;
export type IFetcherFnContext<Opt, T> = (arg: Opt | undefined, ctx: IFetcherContext<T>) => T;

export interface IFetcher<T, GetOptions = any, SetOptions = any> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFnContext<GetOptions, AnyResult<T>>): void;
	asyncGet: IFetcherFn<GetOptions, TSyncPromise<T>>;
	get: IFetcherFn<GetOptions, T>;
}

export interface IFetcherOption {
	name?: string;
	manualStore?: boolean;
  setItem?(action: IActionFetch): Record<string, any> | undefined;
  hashArg?(arg?: any): string;
}
