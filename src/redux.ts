import { create } from './fetcher';
import { MiddlewareAPI, IActionFetch } from './interfaces';

export function createReducer<State>(ACTION: string, KEY: string) {
  return function(state: State, act: IActionFetch) {
    if (act.type === ACTION) {
      const nstate = Object.assign({}, state);
      if (act.action === 'clear') {
        if (nstate[KEY]) {
          nstate[KEY][act.name] = {};
        }
      } else if (act.action === 'set' || act.action === 'error') {
        const { name, key } = act;
        const data = (nstate[KEY] = Object.assign({}, nstate[KEY]));
        const ptr = (data[name] = Object.assign({}, data[name]));
        if (act.action === 'set') {
          ptr[key] = { data: act.value };
        } else if (act.action === 'error') {
          let error = act.error;
          if (error instanceof Error) {
            error = { name: error.name, message: error.message, stack: error.stack };
          }
          ptr[key] = { error };
        }
      }
      return nstate;
    }
    return state;
  };
}

export function initRedux() {
  function createReduxFetcher(ACTION: string, KEY: string) {
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

    const reducer = createReducer(ACTION, KEY);

    var createFetcher = create({
      store: getApi as any, // TODO: fix maybe
      key: KEY,
      action: ACTION
    });
    return { use, reducer, createFetcher };
  }
  return createReduxFetcher;
}
