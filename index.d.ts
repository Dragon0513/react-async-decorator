import { StatelessComponent } from "react";

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

import { create as initFetchers } from './lib/fetcher' ;
import { initRedux as initReduxFetchers } from './lib/redux';
export { initFetchers, initReduxFetchers };
