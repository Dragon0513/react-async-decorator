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
}


export type AnyResult<T> = T | Promise<T> | TSyncPromise<T> | Promise<T>[] | TSyncPromise<T>[];

export interface IFetcherFunction<T> {
	load?(...args: any[]): AnyResult<T>;
	modify?(...args: any[]): AnyResult<T>;
}

export interface IFetcherBase<SetOptions, T> {
	clear(): void;
	await(): TSyncPromise<T>;
	awaitAll(): TSyncPromise<T[]>;
	asyncSet(opts: SetOptions): TSyncPromise<T>;
	implModify(modify: (opt: SetOptions) => AnyResult<T> | undefined): void;
	isLoading(): boolean;
}

export type IFetcherFnAny<T> = (...args: any[]) => T;
export interface IFetcherAny<T> extends IFetcherBase<any, T> {
	impl(load: IFetcherFnAny<AnyResult<T>>): void;
	asyncGet: IFetcherFnAny<TSyncPromise<T>>;
	get: IFetcherFnAny<T>;
	store(key: string): IFetcherAny<T>;
}

export type IFetcherFn0<T> = () => T;
export interface IFetcher0<SetOptions, T> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn0<AnyResult<T>>): void;
	asyncGet: IFetcherFn0<TSyncPromise<T>>;
	get: IFetcherFn0<T>;
	store(key: string): IFetcher0<SetOptions, T>;
}

export type IFetcherFn1<T, A1> = (a1: A1) => T;
export interface IFetcher1<SetOptions, T, A1> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn1<AnyResult<T>, A1>): void;
	asyncGet: IFetcherFn1<TSyncPromise<T>, A1>;
	get: IFetcherFn1<T, A1>;
	store(key: string): IFetcher1<SetOptions, T, A1>;
}

export type IFetcherFn2<T, A1, A2> = (a1: A1, a2: A2) => T;
export interface IFetcher2<SetOptions, T, A1, A2> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn2<AnyResult<T>, A1, A2>): void;
	asyncGet: IFetcherFn2<TSyncPromise<T>, A1, A2>;
	get: IFetcherFn2<T, A1, A2>;
	store(key: string): IFetcher2<SetOptions, T, A1, A2>;
}

export type IFetcherFn3<T, A1, A2, A3> = (a1: A1, a2: A2, a3: A3) => T;
export interface IFetcher3<SetOptions, T, A1, A2, A3> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn3<AnyResult<T>, A1, A2, A3>): void;
	asyncGet: IFetcherFn3<TSyncPromise<T>, A1, A2, A3>;
	get: IFetcherFn3<T, A1, A2, A3>;
	store(key: string): IFetcher3<SetOptions, T, A1, A2, A3>;
}

export type IFetcherFn4<T, A1, A2, A3, A4> = (a1: A1, a2: A2, a3: A3, a4: A4) => T;
export interface IFetcher4<SetOptions, T, A1, A2, A3, A4> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn4<AnyResult<T>, A1, A2, A3, A4>): void;
	asyncGet: IFetcherFn4<TSyncPromise<T>, A1, A2, A3, A4>;
	get: IFetcherFn4<T, A1, A2, A3, A4>;
	store(key: string): IFetcher4<SetOptions, T, A1, A2, A3, A4>;
}

export type IFetcherFn5<T, A1, A2, A3, A4, A5> = (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => T;
export interface IFetcher5<SetOptions, T, A1, A2, A3, A4, A5> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn5<AnyResult<T>, A1, A2, A3, A4, A5>): void;
	asyncGet: IFetcherFn5<TSyncPromise<T>, A1, A2, A3, A4, A5>;
	get: IFetcherFn5<T, A1, A2, A3, A4, A5>;
	store(key: string): IFetcher5<SetOptions, T, A1, A2, A3, A4, A5>;
}

export type IFetcherFn6<T, A1, A2, A3, A4, A5, A6> = (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => T;
export interface IFetcher6<SetOptions, T, A1, A2, A3, A4, A5, A6> extends IFetcherBase<SetOptions, T> {
	impl(load: IFetcherFn6<AnyResult<T>, A1, A2, A3, A4, A5, A6>): void;
	asyncGet: IFetcherFn6<TSyncPromise<T>, A1, A2, A3, A4, A5, A6>;
	get: IFetcherFn6<T, A1, A2, A3, A4, A5, A6>;
	store(key: string): IFetcher6<SetOptions, T, A1, A2, A3, A4, A5, A6>;
}


export function typeFetcherFn<SetOptions, T>(load?: IFetcherFn0<AnyResult<T>>, name?: string): IFetcher0<SetOptions, T>;
export function typeFetcherFn<SetOptions, T, A1>(
	load?: IFetcherFn1<AnyResult<T>, A1>,
	name?: string
): IFetcher1<SetOptions, T, A1>;
export function typeFetcherFn<SetOptions, T, A1, A2>(
	load?: IFetcherFn2<AnyResult<T>, A1, A2>,
	name?: string
): IFetcher2<SetOptions, T, A1, A2>;
export function typeFetcherFn<SetOptions, T, A1, A2, A3>(
	load?: IFetcherFn3<AnyResult<T>, A1, A2, A3>,
	name?: string
): IFetcher3<SetOptions, T, A1, A2, A3>;
export function typeFetcherFn<SetOptions, T, A1, A2, A3, A4>(
	load?: IFetcherFn4<AnyResult<T>, A1, A2, A3, A4>,
	name?: string
): IFetcher4<SetOptions, T, A1, A2, A3, A4>;
export function typeFetcherFn<SetOptions, T, A1, A2, A3, A4, A5>(
	load?: IFetcherFn5<AnyResult<T>, A1, A2, A3, A4, A5>,
	name?: string
): IFetcher5<SetOptions, T, A1, A2, A3, A4, A5>;
export function typeFetcherFn<SetOptions, T, A1, A2, A3, A4, A5, A6>(
	load?: IFetcherFn6<AnyResult<T>, A1, A2, A3, A4, A5, A6>,
	name?: string
): IFetcher6<SetOptions, T, A1, A2, A3, A4, A5, A6>;
export function typeFetcherFn<T>(load?: (...args: any[]) => AnyResult<T>, name?: string): IFetcherAny<T> {
	return null as any;
}
