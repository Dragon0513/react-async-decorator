export class Fetcher<T> {
    private constructor();
    clear(): void;
    awaitAll(): Promise<T[]>;
    await(...args: any[]): Promise<T>;
    asyncGet(...args: any[]): Promise<T>;
    get(...args: any[]): T;
    impl(fn: () => Promise<T>): void;
}
export function createFetcher<T>(fn?: (...args: any[]) => Promise<T>): Fetcher<T>;

export class Fetcher1<T, A1> {
    private constructor();
    clear(): void;
    awaitAll(): Promise<T[]>;
    await(a: A1): Promise<T>;
    asyncGet(a: A1): Promise<T>;
    get(a: A1): T;
    impl(fn: () => Promise<T>): void;
}
export function createFetcher<T, A1>(fn?: (a1: A1) => Promise<T>): Fetcher1<T, A1>;

export class Fetcher2<T, A1, A2> {
    private constructor();
    clear(): void;
    awaitAll(): Promise<T[]>;
    await(a1: A1, a2: A2): Promise<T>;
    asyncGet(a1: A1, a2: A2): Promise<T>;
    get(a1: A1, a2: A2): T;
    impl(fn: () => Promise<T>): void;
}
export function createFetcher<T, A1, A2>(fn?: (a1: A1, a2: A2) => Promise<T>): Fetcher2<T, A1, A2>;

export class Fetcher3<T, A1, A2, A3> {
    private constructor();
    clear(): void;
    awaitAll(): Promise<T[]>;
    await(a1: A1, a2: A2, a3: A3): Promise<T>;
    asyncGet(a1: A1, a2: A2, a3: A3): Promise<T>;
    get(a1: A1, a2: A2, a3: A3): T;
    impl(fn: () => Promise<T>): void;
}
export function createFetcher<T, A1, A2, A3>(
    fn?: (a1: A1, a2: A2, a3: A3) => Promise<T>
): Fetcher3<T, A1, A2, A3>;

export interface IAsyncFetch {
	renderLoader?: string | (() => any);
	renderError?: string | ((err: Error) => any);
}

export interface BaseT {
	new(...args: any[]): {};
}

export const asyncClass: <T extends BaseT>(c: T) => T;
export function asyncClassFactory(opts?: IAsyncFetch): typeof asyncClass;

export const asyncMethod: (target: any, propertyKey: string) => void;
export function asyncMethodFactory(opts?: IAsyncFetch): typeof asyncMethod

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
export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
    dispatch: D;
    getState(): S;
}

export interface IReduxFetcher<State, A extends Action = AnyAction, D extends Dispatch = Dispatch> {
    use(api: MiddlewareAPI<D, State>): void;
    reducer(state: State, action: A): State;
    createFetcher: typeof createFetcher
}

export function createReduxFetcher<State>(
    action: string, key: string
): IReduxFetcher<State>;
