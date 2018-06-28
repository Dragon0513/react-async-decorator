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

export type IActionFetch =
  | IActionFetchClear
  | IActionFetchSet
  | IActionFetchError;

export interface IDataItem {
  data?: any;
  error?: Error;
}

export type FetcherItem = Partial<Record<string, IDataItem>>;
export type FetcherState = Partial<Record<string, FetcherItem>>;

export interface MiddlewareAPI<
  D extends Dispatch = Dispatch<any>,
  S = Record<string, FetcherState>
> {
  dispatch: D;
  getState(): S;
}

export interface IOption {
  name: string;
  action: string; // action for redux
  key: string; // key in store
  store(): MiddlewareAPI;
}
