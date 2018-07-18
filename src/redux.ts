import { create } from './fetcher';
import { MiddlewareAPI, Dispatch, IDataItem, IActionFetch, typeFetcherFn } from './interfaces';
import { IOptionStore, createReducer, IOptionReducer } from './reduxReducer';
export { MiddlewareAPI, Dispatch, IDataItem, IActionFetch };

export function initRedux<State>() {
	function createReduxFetcher(opt: IOptionStore) {
		let api: MiddlewareAPI;

		function use(aApi: MiddlewareAPI): void {
			api = aApi;
		}

		const store: MiddlewareAPI = {
			getState() {
				return api.getState();
			},
			dispatch(action: any) {
				return api.dispatch(action);
			},
		};

    // reducer initialize after create call
    let reducer: (state: State, act: IActionFetch) => State;

    // it's sync callback which call after create call
    function createStore(opt: IOptionReducer<any>): MiddlewareAPI {
      reducer = createReducer<State>(opt);
      return store;
    }

		const fn = create({ ...opt, createStore }) as any;
		return { use, reducer, createFetcher: fn as typeof typeFetcherFn };
	}
	return createReduxFetcher;
}
