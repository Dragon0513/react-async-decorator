export class Fetcher<T> {
    clear(): void;
    has(defer: Promise<T>): boolean;
    set(defer: Promise<T>): void;
    get(): T;
}

export interface IAsyncFetch {
	renderLoader?: string | (() => any);
	renderError?: string | ((err: Error) => any);
}

export interface BaseT {
	new(...args: any[]): {};
}

export function asyncClassFactory(opts?: IAsyncFetch): <T extends BaseT>(c: T) => T;

export const asyncClass: <T extends BaseT>(c: T) => T;

export function asyncMethodFactory(opts?: IAsyncFetch): (target: any, propertyKey: string) => void;
export const asyncMethod: (target: any, propertyKey: string) => void;
export function createFetcher<T>(fn: () => Promise<T>): Fetcher<T>;
