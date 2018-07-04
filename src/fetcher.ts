import { IOption, MiddlewareAPI, FetcherState } from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { createReducer } from './redux';
function notImpl() {
  const msg = new Error("Fetcher wasn't implemented");
  return TSyncPromise.reject(msg);
}


export type AnyResul<T> = T | Promise<T> | TSyncPromise<T> | Promise<T>[] | TSyncPromise<T>[];

export interface IFetcherBase<T> {
  clear(): void;
  init(key: string, args: any[]): void;
  await(): TSyncPromise<T>
  awaitAll(): TSyncPromise<T[]>
}

export type IFetcherFn0<T> = () => AnyResul<T>;
export interface IFetcher0<T> extends IFetcherBase<T> {
  impl(load: () => AnyResul<T>): void;
  asyncGet(): TSyncPromise<T>;
  get(): T
}

export type IFetcherFn1<T, A1> = (a1: A1) => AnyResul<T>;
export interface IFetcher1<T, A1> extends IFetcherBase<T> {
  impl(load: IFetcherFn1<T, A1>): void;
  asyncGet(a1: A1): TSyncPromise<T>;
  get(a1: A1): T
}

export type IFetcherFn2<T, A1, A2> = (a1: A1, a2: A2) => AnyResul<T>;
export interface IFetcher2<T, A1, A2> extends IFetcherBase<T> {
  impl(load: IFetcherFn2<T, A1, A2>): void;
  asyncGet(a1: A1, a2: A2): TSyncPromise<T>;
  get(a1: A1, a2: A2): T
}

export type IFetcherFn3<T, A1, A2, A3> = (a1: A1, a2: A2, a3: A3) => AnyResul<T>;
export interface IFetcher3<T, A1, A2, A3> extends IFetcherBase<T> {
  impl(load: IFetcherFn3<T, A1, A2, A3>): void;
  asyncGet(a1: A1, a2: A2, a3: A3): TSyncPromise<T>;
  get(a1: A1, a2: A2, a3: A3): T
}

export type IFetcherFn4<T, A1, A2, A3, A4> = (a1: A1, a2: A2, a3: A3, a4: A4) => AnyResul<T>;
export interface IFetcher4<T, A1, A2, A3, A4> extends IFetcherBase<T> {
  impl(load: IFetcherFn4<T, A1, A2, A3, A4>): void;
  asyncGet(a1: A1, a2: A2, a3: A3, a4: A4): TSyncPromise<T>;
  get(a1: A1, a2: A2, a3: A3, a4: A4): T
}

export type IFetcherFn5<T, A1, A2, A3, A4, A5> = (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => AnyResul<T>;
export interface IFetcher5<T, A1, A2, A3, A4, A5> extends IFetcherBase<T> {
  impl(load: IFetcherFn5<T, A1, A2, A3, A4, A5>): void;
  asyncGet(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): TSyncPromise<T>;
  get(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): T
}

export type IFetcherFn6<T, A1, A2, A3, A4, A5, A6> = (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => AnyResul<T>;
export interface IFetcher6<T, A1, A2, A3, A4, A5, A6> extends IFetcherBase<T> {
  impl(load: IFetcherFn6<T, A1, A2, A3, A4, A5, A6>): void;
  asyncGet(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): TSyncPromise<T>;
  get(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6): T
}


export class Fetcher<T> {
  private load: (...args: any[]) => AnyResul<T>;
  private holder: Holder<T>;

  constructor(opts: IOption, load?: (...args: any[]) => AnyResul<T>) {
    this.holder = new Holder<T>(opts);
    const impl = load || notImpl;
    this.impl(impl as any);
  }

  impl(load: (...args: any[]) => AnyResul<T>): void {
    this.load = load;
    this.holder.clear();
  }

  clear(): void {
    return this.holder.clear();
  }

  init(key: string, args: any[]): void {
    if (!this.holder.has(key) && !this.holder.getAwait(key)) {
      const defer = this.load.apply(null, args);
      const syncDefer = Array.isArray(defer)
        ? TSyncPromise.all(defer)
        : TSyncPromise.resolve(defer);
      this.holder.set(key, syncDefer);
    }
  }

  awaitAll(): TSyncPromise<T[]> {
    return this.holder.awaitAll();
  }

  await(): TSyncPromise<T> {
    const args = Array.prototype.slice.apply(arguments);
    const key = args.length ? JSON.stringify(args) : '';
    return this.holder.await(key);
  }

  asyncGet(...args: any[]): TSyncPromise<T> {
    const key = args.length ? JSON.stringify(args) : '';
    this.init(key, args);
    return this.holder.await(key);
  }

  get(...args: any[]): T {
    const key = args.length ? JSON.stringify(args) : '';
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

export interface ICreateOption {
  store: MiddlewareAPI;
  action: string;
  key: string;
}

function createMemoryStore(action: string, key: string): MiddlewareAPI {
  const reducer = createReducer({ action, key });
  let state: any = { [key]: {} };
  const ret: MiddlewareAPI = {
    getState() {
      return state;
    },
    dispatch(action: any): any {
      state = reducer(state, action);
      return action;
    }
  };
  return ret;
}

export function typeFetcherFn<T>(
  load?: IFetcherFn0<AnyResul<T>>,
  name?: string
): IFetcher0<T>;
export function typeFetcherFn<T, A1>(
  load?: IFetcherFn1<AnyResul<T>, A1>,
  name?: string
): IFetcher1<T, A1>;
export function typeFetcherFn<T, A1, A2>(
  load?: IFetcherFn2<AnyResul<T>, A1, A2>,
  name?: string
): IFetcher2<T, A1, A2>;
export function typeFetcherFn<T, A1, A2, A3>(
  load?: IFetcherFn3<AnyResul<T>, A1, A2, A3>,
  name?: string
): IFetcher3<T, A1, A2, A3>;
export function typeFetcherFn<T, A1, A2, A3, A4>(
  load?: IFetcherFn4<AnyResul<T>, A1, A2, A3, A4>,
  name?: string
): IFetcher4<T, A1, A2, A3, A4>;
export function typeFetcherFn<T, A1, A2, A3, A4, A5>(
  load?: IFetcherFn5<AnyResul<T>, A1, A2, A3, A4, A5>,
  name?: string
): IFetcher5<T, A1, A2, A3, A4, A5>;
export function typeFetcherFn<T, A1, A2, A3, A4, A5, A6>(
  load?: IFetcherFn6<AnyResul<T>, A1, A2, A3, A4, A5, A6>,
  name?: string
): IFetcher6<T, A1, A2, A3, A4, A5, A6>;
export function typeFetcherFn<T>(load?: (...args: any[]) => AnyResul<T>, name?: string): Fetcher<T> {
  return null as any;
}

export interface IFetcherOption {
  name?: string;
}

export function create(opts?: ICreateOption): typeof typeFetcherFn {
  let counter = 0;
  function getName(option?: string | IFetcherOption): string {
    return (option === undefined || option === null) ? ('' + counter++) :
        typeof option === 'string' ? option : getName(option.name);
  }
  const action = opts ? opts.action : 'action';
  const key = opts ? opts.key : 'local';
  const ptrStore = opts ? undefined : createMemoryStore('action', 'local');
  const store = opts ? opts.store : () => ptrStore!;

  function createFetcherImpl<T>(load?: (...args: any[]) => AnyResul<T>, option?: string | IFetcherOption): Fetcher<T> {
    return new Fetcher<T>(
      { store: store as any, action, key, name: getName(option) },
      load
    );
  };
  return createFetcherImpl as any;
}
