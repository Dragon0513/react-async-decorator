import { Holder } from '../src/holder';
import { MiddlewareAPI } from '../src/interfaces';
import { TSyncPromise } from '../src/promise';


test('Holder::(set, clear)', () => {
  const actions: any[] = [];
  const store: MiddlewareAPI = {
    getState() { return {} },
    dispatch(action: any) {
      actions.push(action);
      return action;
    }
  };

  const holder = new Holder<any>({
    name: 'test',
    action: 'action',
    key: 'key',
    store() { return store; }
  });

  holder.set('success', TSyncPromise.resolve(1));
  holder.set('error', TSyncPromise.reject(new Error('error')));
  holder.clear();
  expect(actions).toMatchSnapshot();
});

test('Holder::get', () => {
  const store: MiddlewareAPI = {
    getState() {
      return {
        key: {
          test: {
            item2: {
              data: 'value2'
            },
            item3: {
              error: new Error('error')
            }
          }
        }
      }
    },
    dispatch(action: any) {
      return action;
    }
  };
  const holder = new Holder<any>({
    name: 'test',
    action: 'action',
    key: 'key',
    store() { return store; }
  });

  const has1 = holder.has('item1');
  expect(has1).toBeFalsy();

  const item1 = holder.get('item1');
  expect(item1).toBeUndefined();

  const has2 = holder.has('item2');
  expect(has2).toBeTruthy();

  const item2 = holder.get('item2');
  expect(item2).toEqual('value2');

  const has3 = holder.has('item3');
  expect(has3).toBeTruthy();

  const item3 = holder.get('item3');
  expect(item3).toBeUndefined();

  const error3 = holder.error('item3');
  expect(error3).toBeInstanceOf(Error);
});

test('Holder::(set, clear)', () => {
  const actions: any[] = [];
  const store: MiddlewareAPI = {
    getState() { return {} },
    dispatch(action: any) {
      actions.push(action);
      return action;
    }
  };

  const holder = new Holder<any>({
    name: 'test',
    action: 'action',
    key: 'key',
    store() { return store; }
  });

  const defer = TSyncPromise.resolve(1);
  holder.set('success', defer);
  expect(defer).toBe(holder.await('success'));
  expect(Holder.notExist).toBe(holder.await('missing'));

  const all = holder.awaitAll();
  expect({ data: [1], type: 'resolved'}).toEqual(all.data);
});
