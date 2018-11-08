import { MiddlewareAPI, FetcherState, FetcherItem, TContainer } from './interfaces';
import { IOptionReducer, createReducer } from './reduxReducer';
import { TSyncPromise } from './promise';

export function createMemoryStore(opt: IOptionReducer<any>, initState: FetcherState = {}): MiddlewareAPI {
	const { key } = opt;
	const reducer = createReducer(opt);
	let state: any = { [key]: initState };
	const ret: MiddlewareAPI = {
		getState() {
			return state;
		},
		dispatch(action: any): any {
			state = reducer(state, action);
			return action;
		},
	};
	return ret;
}

export function snapshotStoreFetcher(holderState: FetcherItem): TContainer<any> {
	return Object.keys(holderState).reduce((m2, name) => {
		const ptr = holderState[name];
		if (ptr) {
			m2[name] = new TSyncPromise(resolve => resolve(ptr.data));
		}
		return m2;
	}, {});
}

export function snapshotStore(
	state: FetcherState,
	container: Record<string, TContainer<any>> = {}
): Partial<Record<string, TContainer<any>>> {
	return Object.keys(state).reduce((memo, key) => {
		const holderState = state[key];
		if (!holderState) {
			memo[key] = snapshotStoreFetcher(holderState);
		}
		return memo;
	}, container);
}
