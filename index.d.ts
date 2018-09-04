import { StatelessComponent } from "react";

export interface IAsyncFetch {
	renderLoader?: string | (() => any);
	renderError?: string | ((err: Error) => any);
}

export interface BaseT {
	new(...args: any[]): {};
}

import { create as initFetchers } from './lib/fetcher' ;
import { IUpdater } from './lib/interfaces';

export function asyncClass(fetchers?: IUpdater | IUpdater[] | any): <T extends BaseT>(c: T) => T;

export function asyncClassFactory(opts?: IAsyncFetch): typeof asyncClass;

export const listenTo: (ctx: any, fetchers?: IUpdater | IUpdater[]) => void;
export const listenClass: <T extends BaseT>(fetchers?: IUpdater | IUpdater[]) => (c: T) => T;
export const asyncMethod: (target: any, propertyKey: string) => void;
export function asyncMethodFactory(opts?: IAsyncFetch): typeof asyncMethod

import { initRedux as initReduxFetchers } from './lib/redux';
export { initFetchers, initReduxFetchers, IUpdater };
