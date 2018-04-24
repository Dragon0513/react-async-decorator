export class Fetcher<T> {
    clear(): void;
    get(...args: any[]): T;
    asyncGet(...args: any[]): Promise<T>;
    awaitAll(): Promise<T[]>;
    await(...args: any[]): Promise<T>;
}
export function createFetcher<T>(fn: (...args: any[]) => Promise<T>): Fetcher<T>;

export class Fetcher1<T, A1> {
    clear(): void;
    get(a: A1): T;
}
export function createFetcher<T, A1>(fn: (a1: A1) => Promise<T>): Fetcher1<T, A1>;

export class Fetcher2<T, A1, A2> {
    clear(): void;
    get(a1: A1, a2: A2): T;
}
export function createFetcher<T, A1, A2>(fn: (a1: A1, a2: A2) => Promise<T>): Fetcher2<T, A1, A2>;

export class Fetcher3<T, A1, A2, A3> {
    clear(): void;
    get(a1: A1, a2: A2, a3: A3): T;
}
export function createFetcher<T, A1, A2, A3>(
    fn: (a1: A1, a2: A2, a3: A3) => Promise<T>
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

export interface IHasher {
    get(...args: any[]): number;
    clear(): void;
}
export function createHasher(): IHasher;
