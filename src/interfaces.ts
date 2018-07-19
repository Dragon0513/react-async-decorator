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
	key: string;
	error: Error;
}

export interface IActionFetchSet extends Action {
	name: string;
	action: 'set';
	key: string;
	value: any;
}

export interface IActionFetchRequest extends Action {
	name: string;
	action: 'request';
	key: string;
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
  hashArg?<T>(arg?: T): string;
}


export type AnyResult<T> = T | Promise<T> | TSyncPromise<T> | Promise<T>[] | TSyncPromise<T>[];

export interface IFetcherContext {

}
export interface IFetcherFunction<T, GetOptions, SetOptions> {
  load?: IFetcherFnContext<GetOptions, AnyResult<T>>;
  modify?: IFetcherFnContext<SetOptions, AnyResult<T>>;
}

export interface IFetcherBase<SetOptions, T> {
	clear(): void;
	await(): TSyncPromise<T>;
	awaitAll(): TSyncPromise<T[]>;
	asyncSet(opts: SetOptions): TSyncPromise<T>;
	implModify(modify: IFetcherFnContext<SetOptions, AnyResult<T> | undefined>): void;
	isLoading(): boolean;
}

export type IFetcherFn<Opt, T> = (arg?: Opt) => T;
export type IFetcherFnContext<Opt, T> = (ctx: IFetcherContext, arg?: Opt) => T;

export interface IFetcher<T, GetOptions = any, SetOptions = any> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFnContext<GetOptions, AnyResult<T>>): void;
	asyncGet: IFetcherFn<GetOptions, TSyncPromise<T>>;
	get: IFetcherFn<GetOptions, T>;
}

export interface IFetcherOption {
  name?: string;
  setItem?(action: IActionFetch): Record<string, any> | undefined;
}
