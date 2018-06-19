import { IOption, MiddlewareAPI, FetcherState } from './interfaces';
import { Holder } from './holder';
import { TSyncPromise } from './promise';
import { createReducer } from './redux';
function notImpl() {
  const msg = new Error("Fetcher wasn't implemented");
  return TSyncPromise.reject(msg);
}

export interface FetcherFn<T> {
  <T>(): T;
  <T, A1>(a1: A1): T;
  <T, A1, A2>(a1: A1, a2: A2): T;
  <T, A1, A2, A3>(a1: A1, a2: A2, a3: A3): T;
  <T, A1, A2, A3, A4>(a1: A1, a2: A2, a3: A3, a4: A4): T;
  <T, A1, A2, A3, A4, A5>(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): T;
  <T, A1, A2, A3, A4, A5, A6>(
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6
  ): T;
  <T, A1, A2, A3, A4, A5, A6, A7>(
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6,
    a7: A7
  ): T;
}

export class Fetcher<T> {
  private load: FetcherFn<T>;
  private holder: Holder<T>;

  constructor(opts: IOption<T>, load?: FetcherFn<T>) {
    this.holder = new Holder<T>(opts);
    this.impl(load || notImpl);
  }

  impl(load: FetcherFn<T>): void {
    this.load = load;
    this.holder.clear();
  }

  clear(): void {
    return this.holder.clear();
  }

  init(key: string, args: any[]) {
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

  asyncGet(...args: any[]) {
    const key = args.length ? JSON.stringify(args) : '';
    this.init(key, args);
    return this.holder.await(key);
  }

  get(...args: any[]) {
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
  const reducer = createReducer(action, key);
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

export function create(opts?: ICreateOption) {
  let counter = 0;
  const action = opts ? opts.action : 'action';
  const key = opts ? opts.key : 'local';
  const ptrStore = opts ? undefined : createMemoryStore('action', 'local');
  const store = opts ? opts.store : () => ptrStore!;
  return function createFetcher<T>(load?: FetcherFn<T>, name?: string) {
    const pname = name === undefined || name === null ? '' + counter++ : name;
    return new Fetcher<T>(
      { store: store as any, action, key, name: pname },
      load
    );
  };
}
