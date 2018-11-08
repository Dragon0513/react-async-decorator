import { IActionFetch, IOptionReducer } from './interfaces';

function setItemDefault(act: IActionFetch): Record<string, any> | undefined | null {
	if (act.action === 'set') {
		return Object.keys(act.payload).reduce((memo, key) => {
			memo[key] = { data: act.payload[key] };
			return memo;
		}, {});
	} else if (act.action === 'error') {
		const { payload } = act;
		return Object.keys(payload).reduce((memo, key) => {
			const error = payload[key];
			if (error instanceof Error) {
				const err = { name: error.name, message: error.message, stack: error.stack };
				memo[key] = { error: err };
			} else {
				memo[key] = { error: { name: 'custom error', message: error, stack: '' } };
			}
			return memo;
		}, {});
	} else {
		return undefined;
	}
}

export function createReducer<State>(opt: IOptionReducer<State>) {
	const KEY = opt.key;
	const ACTION = opt.action;
	const setItem = opt.setItem || setItemDefault;
	function reducer(state: State, act: IActionFetch): State {
		if (act.type === ACTION) {
			const nstate = Object.assign({}, state);
			if (act.action === 'clear') {
				if (nstate[KEY]) {
					nstate[KEY][act.name] = {};
				}
			} else if (act.action === 'set' || act.action === 'error' || act.action === 'request') {
				const { name } = act;
				const data = (nstate[KEY] = Object.assign({}, nstate[KEY]));
				const ptr = (data[name] = Object.assign({}, data[name]));
				if (act.action === 'request') {
					if (Array.isArray(act.keys)) {
						act.keys.forEach(key => (ptr[key] = { ...ptr[key], loading: true }));
					} else {
						ptr[act.keys] = { ...ptr[act.keys], loading: true };
					}
				} else if (act.action === 'set' || act.action === 'error') {
					let dataHash = setItem(act);
					if (dataHash === undefined || dataHash === null) {
						if (setItem !== setItemDefault) {
							dataHash = setItemDefault(act);
						}
					}
					if (dataHash) {
						Object.keys(dataHash).forEach(key => {
							ptr[key] = { ...dataHash[key], loading: false };
						});
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
		};
	} else {
		return reducer;
	}
}
