
import {  IActionFetch } from './interfaces';

export interface IOptionStore {
	action: string;
	key: string;
}

export type TReducer<State> = (state: State, action: IActionFetch) => State;
export interface IOptionReducer$<State> {
	middleware?(state: State, action: IActionFetch, reducer: TReducer<State>): State;
	setItem?(action: IActionFetch): Record<string, any> | undefined;
}

export type IOptionReducer<State> = IOptionStore & IOptionReducer$<State>;

function setItemDefault(act: IActionFetch): Record<string, any> | undefined | null {
	if (act.action === 'set') {
		return { [act.key]: { data: act.value } };
	} else if (act.action === 'error') {
		const { error } = act;
		if (error instanceof Error) {
			const err = { name: error.name, message: error.message, stack: error.stack };
			return { [act.key]: { error: err } };
		} else {
			return { [act.key]: { error: { name: 'custom error', message: error, stack: '' } } };
		}
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
				const { name, key } = act;
				const data = (nstate[KEY] = Object.assign({}, nstate[KEY]));
				const ptr = (data[name] = Object.assign({}, data[name]));
				if (act.action === 'request') {
					ptr[key] = { ...ptr[key], loading: true };
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
