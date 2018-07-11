import { create, typeFetcherFn } from './fetcher';
import { MiddlewareAPI, IActionFetch, IDataItem } from './interfaces';
export { IDataItem };


export interface IOptionStore {
  action: string;
  key: string;
}

export type TReducer<State> = (state: State, action: IActionFetch) => State;

export interface IOptionReducer<State> extends IOptionStore {
  middleware?(state: State, action: IActionFetch, reducer: TReducer<State>): State;
}

export function createReducer<State>(opt: IOptionReducer<State>) {
  const KEY = opt.key;
  const ACTION = opt.action;
  function reducer(state: State, act: IActionFetch): State {
    if (act.type === ACTION) {
      const nstate = Object.assign({}, state);
      if (act.action === 'clear') {
        if (nstate[KEY]) {
          nstate[KEY][act.name] = {};
        }
      } else if (act.action === 'set' || act.action === 'error' || act.action === 'request') {
        const { name, key } = act;
        const data = (nstate[KEY] = Object.assign({}, nstate[KEY]));
        const ptr = (data[name] = Object.assign({}, data[name]));
        if (act.action === 'request') {
          ptr[key] = { ...ptr[key], loading: true };
        } else if (act.action === 'set') {
          ptr[key] = { data: act.value, loading: false };
        } else if (act.action === 'error') {
          const { error } = act;
          if (error instanceof Error) {
            const err = { name: error.name, message: error.message, stack: error.stack };
            ptr[key] = { error: err, loading: false };
          } else {
            ptr[key] = { error: { name: 'custom error', message: error, stack: '' }, loading: false };
          }
        }
      }
      return nstate;
    }
    return state;
  }
  if (opt.middleware) {
    return function(state: State, act: IActionFetch): State {
      return opt.middleware(state, act, reducer);
    }
  } else {
    return reducer;
  }
}

export function initRedux<State>() {
  function createReduxFetcher(opt: IOptionStore) {
    let api: MiddlewareAPI;

    function use(aApi: MiddlewareAPI) {
      api = aApi;
      return function(next: any) {
        return function(action: any) {
          return next(action);
        };
      };
    }

    function getApi(): MiddlewareAPI {
      if (!api) {
        throw new Error('add middleware to redux');
      }
      return api;
    }

    const reducer = createReducer<State>(opt);

    const fn = create({
      ...opt,
      store: getApi as any, // TODO: fix maybe
    }) as any;
    return { use, reducer, createFetcher: fn as typeof typeFetcherFn };
  }
  return createReduxFetcher;
}
