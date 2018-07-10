import { IOption, MiddlewareAPI, FetcherState } from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { createReducer } from './redux';
function notImpl() {
  const msg = new Error("Fetcher wasn't implemented");
  return TSyncPromise.reject(msg);
}

export type AnyResult<T> =
  | T
  | Promise<T>
  | TSyncPromise<T>
  | Promise<T>[]
  | TSyncPromise<T>[];

export interface IFetcherFunction<T> {
  load?(...args: any[]): AnyResult<T>;
  modify?(...args: any[]): AnyResult<T>;
}

export interface IFetcherBase<SetOptions, T> {
  clear(): void;
  await(): TSyncPromise<T>;
  awaitAll(): TSyncPromise<T[]>;
  asyncSet(opts: SetOptions): TSyncPromise<T>
  implModify(modify: (opt: SetOptions) => AnyResult<T>): void;
}


export type IFetcherFn0<T> = () => T;
export interface IFetcher0<SetOptions, T> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn0<AnyResult<T>>): void;
  asyncGet: IFetcherFn0<TSyncPromise<T>>;
  get: IFetcherFn0<T>;
  store(key: string): IFetcher0<SetOptions,T>;
}

export type IFetcherFn1<T, A1> = (
  a1: A1
) => T;
export interface IFetcher1<SetOptions, T, A1> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn1<AnyResult<T>, A1>): void;
  asyncGet: IFetcherFn1<TSyncPromise<T>, A1>;
  get: IFetcherFn1<T, A1>;
  store(key: string): IFetcher1<SetOptions,T, A1>;
}

export type IFetcherFn2<T, A1, A2> = (
  a1: A1,
  a2: A2
) => T;
export interface IFetcher2<SetOptions,T, A1, A2> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn2<AnyResult<T>, A1, A2>): void;
  asyncGet: IFetcherFn2<TSyncPromise<T>, A1, A2>;
  get: IFetcherFn2<T, A1, A2>;
  store(key: string): IFetcher2<SetOptions,T, A1, A2>;
}

export type IFetcherFn3<T, A1, A2, A3> = (
  a1: A1,
  a2: A2,
  a3: A3
) => T;
export interface IFetcher3<SetOptions,T, A1, A2, A3> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn3<AnyResult<T>, A1, A2, A3>): void;
  asyncGet: IFetcherFn3<TSyncPromise<T>, A1, A2, A3>;
  get: IFetcherFn3<T, A1, A2, A3>;
  store(key: string): IFetcher3<SetOptions,T, A1, A2, A3>;
}

export type IFetcherFn4<T, A1, A2, A3, A4> = (
  a1: A1,
  a2: A2,
  a3: A3,
  a4: A4
) => T;
export interface IFetcher4<SetOptions,T, A1, A2, A3, A4> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn4<AnyResult<T>, A1, A2, A3, A4>): void;
  asyncGet: IFetcherFn4<TSyncPromise<T>, A1, A2, A3, A4>;
  get: IFetcherFn4<T, A1, A2, A3, A4>;
  store(key: string): IFetcher4<SetOptions,T, A1, A2, A3, A4>;
}

export type IFetcherFn5<T, A1, A2, A3, A4, A5> = (
  a1: A1,
  a2: A2,
  a3: A3,
  a4: A4,
  a5: A5
) => T;
export interface IFetcher5<SetOptions, T, A1, A2, A3, A4, A5> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn5<AnyResult<T>, A1, A2, A3, A4, A5>): void;
  asyncGet: IFetcherFn5<TSyncPromise<T>, A1, A2, A3, A4, A5>;
  get: IFetcherFn5<T, A1, A2, A3, A4, A5>;
  store(key: string): IFetcher5<SetOptions, T, A1, A2, A3, A4, A5>;
}


export type IFetcherFn6<T, A1, A2, A3, A4, A5, A6> = (
  a1: A1,
  a2: A2,
  a3: A3,
  a4: A4,
  a5: A5,
  a6: A6
) => T;
export interface IFetcher6<SetOptions, T, A1, A2, A3, A4, A5, A6> extends IFetcherBase<SetOptions, T> {
  impl(load: IFetcherFn6<AnyResult<T>, A1, A2, A3, A4, A5, A6>): void;
  asyncGet: IFetcherFn6<TSyncPromise<T>, A1, A2, A3, A4, A5, A6>;
  get: IFetcherFn6<T, A1, A2, A3, A4, A5, A6>;
  store(key: string): IFetcher6<SetOptions,T, A1, A2, A3, A4, A5, A6>;
}

export class Fetcher<SetOptions, T> {
  private load: (...args: any[]) => AnyResult<T>;
  private modify: (opt: SetOptions) => AnyResult<T>;
  private holder: Holder<T>;
  private mapper?: Partial<Record<string, Fetcher<SetOptions, T>>>;
  private keyPersist: string = '';

  constructor(opts: IOption, fn: IFetcherFunction<T>) {
    this.holder = new Holder<T>(opts);
    const impl = fn.load || notImpl;
    this.impl(impl as any);
  }

  impl(load: (...args: any[]) => AnyResult<T>): void {
    this.load = load;
  }

  implModify(modify: (opt: SetOptions) => AnyResult<T>): void {
    this.modify = modify;
  }

  clear(): void {
    return this.holder.clear();
  }

  init(key: string, args: any[]): void {
    const load = this.load;
    if (!load) {
      return;
    }
    if (this.holder.has(key)) {
      return;
    }
    if (!this.holder.getAwait(key)) {
      const defer = load(...args);
      const syncDefer = (Array.isArray(defer)
        ? TSyncPromise.all(defer)
        : TSyncPromise.resolve(defer)) as TSyncPromise<T>;

      this.holder.set(key, syncDefer);
    }
  }

  awaitAll(): TSyncPromise<T[]> {
    return this.holder.awaitAll();
  }

  await(): TSyncPromise<T> {
    const args = Array.prototype.slice.apply(arguments);
    return this.holder.await(this.keyPersist);
  }

  asyncGet(...args: any[]): TSyncPromise<T> {

    this.init(this.keyPersist, args);
    return this.holder.await(this.keyPersist);
  }

  store(key: string): Fetcher<SetOptions, T> {
    const keyPersist = this.keyPersist || '';
    const mapper = this.mapper || (this.mapper = { [keyPersist]: this });
    if (mapper[key]) {
      return mapper[key];
    } else {
      const copy: Fetcher<SetOptions, T> = Object.create(this);
      copy.keyPersist = key;
      mapper[key] = copy;
      return copy;
    }
  }

  get(...args: any[]): T {
    const key = this.keyPersist;
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

  asyncSet(opt: SetOptions): TSyncPromise<T> {
    const newDefer = this.modify(opt);
    const syncDefer = (Array.isArray(newDefer)
      ? TSyncPromise.all(newDefer)
      : TSyncPromise.resolve(newDefer)) as TSyncPromise<T>;
    this.holder.set(this.keyPersist, syncDefer);
    return syncDefer;
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

export function typeFetcherFn<SetOptions, T>(
  load?: IFetcherFn0<AnyResult<T>>,
  name?: string
): IFetcher0<SetOptions, T>;
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
export function typeFetcherFn<T>(
  load?: (...args: any[]) => AnyResult<T>,
  name?: string
): Fetcher<any, T> {
  return null as any;
}

export interface IFetcherOption {
  name?: string;
}

export type TFetcherFn<T> =
  | IFetcherFunction<T>
  | ((...args: any[]) => AnyResult<T>);

export function create(opts?: ICreateOption): typeof typeFetcherFn {
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
  const ptrStore = opts ? undefined : createMemoryStore('action', 'local');
  const store = opts ? opts.store : () => ptrStore!;

  function createFetcherImpl<T, SetOptions = any>(
    fns?: TFetcherFn<T>,
    option?: string | IFetcherOption
  ): Fetcher<SetOptions, T> {
    return new Fetcher<SetOptions, T>(
      { store: store as any, action, key, name: getName(option) },
      !fns ? {} : typeof fns === 'function' ? { load: fns } : fns
    );
  }
  return createFetcherImpl as any;
}
