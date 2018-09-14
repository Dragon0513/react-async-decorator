import {
	IOption,
	IDataItem,
	IHolder,
  IActionsLifecycle,
  IOptionActions,
  IActionFetchSet,
  IActionFetchError,
  IActionFetch
} from './interfaces';
import { TSyncPromise } from './promise';

export function createActions<T>(opts: IOptionActions, holder: Holder<T>): IActionsLifecycle<T> {
  const { store, name, action } = opts;
  const actions: IActionsLifecycle<T> = {
    success(keys: string[], params: Record<string, TSyncPromise<T>>, payloads: T[]) {
      const allowKeys = keys.filter(key => holder.allow(key, params[key]));
      const indexes = allowKeys.map(key => keys.indexOf(key));
      const payload: Record<string, T> = {};
      indexes.forEach(id => {
        payload[keys[id]] = payloads[id];
      });
      if (indexes.length) {
        const act2: IActionFetchSet = {
          type: action,
          action: 'set',
          name,
          payload,
        };
        store.dispatch(act2);
      }
    },
    error(keys: string[], params: Record<string, TSyncPromise<T>>, error: Error) {
      const allowKeys = keys.filter(key => holder.allow(key, params[key]));
      const indexes = allowKeys.map(key => keys.indexOf(key));
      const payload: Record<string, Error> = {};
      indexes.forEach(id => {
        payload[keys[id]] = error;
      });
      const act2: IActionFetchError = {
        type: action,
        action: 'error',
        name,
        payload,
      };
      store.dispatch(act2);
    },
    request(keys: string[]) {
      const act: IActionFetch = { type: action, action: 'request', name, keys };
      store.dispatch(act);
    }
  };
  return actions;
}

export class Holder<T> implements IHolder<T> {
  private container: Partial<Record<string, TSyncPromise<T>>> = {};
	static notExist = TSyncPromise.reject<any>(new Error("Doesn't exist"));
  public actions: IActionsLifecycle<T>;
	constructor(private props: IOption) {
    this.actions = createActions(props, this);
  }

	set(params: Record<string, TSyncPromise<T>>): void;
	set(key: string, defer: TSyncPromise<T>): void;
	set(aKey: any, aDefer?: any) {

    const isPropsArg = aDefer !== undefined;
    const keys = isPropsArg ? [aKey] : Object.keys(aKey);
    const params: Record<string, TSyncPromise<T>> = isPropsArg ? { [aKey]: aDefer } : aKey;
    const defers = keys.map(key => {
      this.container[key] = params[key];
      return params[key];
    });
    if (!this.props.manual) {
      this.actions.request(keys);
      TSyncPromise.all<T>(defers).then(
        payloads => this.actions.success(keys, params, payloads),
        error => this.actions.error(keys, params, error)
      );
    }
	}

	allow(key: string, defer: TSyncPromise<T>): boolean {
		return this.container[key] === defer;
	}

	clear(): void {
		const { store, action, name } = this.props;
		store.dispatch({ type: action, action: 'clear', name });
		this.container = {};
	}

	private getDataBlob(aKey: string): IDataItem | undefined {
		const { store, key, name } = this.props;

		const state = store.getState();
		if (!state) {
			return;
		}
		const holderState = state[key];
		if (!holderState) {
			return;
		}
		const ptr = holderState[name];
		if (!ptr) {
			return;
		}
		return ptr[aKey];
	}

	get(key: string): T | undefined {
		const blob = this.getDataBlob(key);
		return blob ? blob.data : undefined;
	}

	has(key: string): boolean {
		const blob = this.getDataBlob(key);
		return blob ? (blob.loading === true ? false : true) : false;
	}

	isLoading(key: string): boolean | undefined {
		const blob = this.getDataBlob(key);
		return blob ? blob.loading : undefined;
	}

	error(key: string): Error | undefined {
		const blob = this.getDataBlob(key);
		const error = blob ? blob.error : undefined;
		if (error) {
			const err = new Error();
			err.message = error.message;
			err.stack = error.stack;
			err.name = error.name;
			return err;
		}
	}

	getAwait(key: string): TSyncPromise<T> | undefined {
		return this.container[key];
	}

	await(key: string): TSyncPromise<T> {
		const ret = this.getAwait(key);
		return ret || Holder.notExist;
	}

	awaitAll(): TSyncPromise<T[]> {
		const allDefers = Object.keys(this.container).map(key => this.container[key]);
		return TSyncPromise.all<T>(allDefers);
	}
}
