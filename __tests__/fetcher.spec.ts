import { create } from '../src/fetcher';
import { TSyncPromise } from '../src/promise'
import { createApi } from './helpers';
const createFetcher = create();

test('fetcher test', async () => {
  const api = createApi();
  const fetcher = createFetcher(api.fetch);
  try {
    fetcher.get();
    expect(false).toBeTruthy();
  } catch (e) {
    expect(e).toBeInstanceOf(TSyncPromise);
  }
  const sendData = {};
  api.resolve(sendData);
  await api.defer;
  expect(fetcher.get() === sendData).toBeTruthy();
  fetcher.clear();
  try {
    fetcher.get();
    expect(false).toBeTruthy();
  } catch (e) {
    expect(e).toBeInstanceOf(TSyncPromise);
  }
  api.resolve(sendData);
  await api.defer;
  expect(fetcher.get() === sendData).toBeTruthy();
});

test('fetcher asyncGet', async () => {
  const api = createApi();
  const fetcher = createFetcher(api.fetch);
  api.resolve(true);
  const data = await fetcher.asyncGet();
  expect(data).toEqual(true);
});

test('fetcher impl', async () => {
  const obj = { id: 1 };
  const api = createApi<typeof obj>();
  const fetcher = createFetcher<typeof obj>();
  try {
    await fetcher.asyncGet();
    expect(false).toBeTruthy();
  } catch (err) {
    expect(err.message).toEqual("Fetcher wasn't implemented");
  }
  fetcher.impl(api.fetch);

  api.resolve(obj);
  const data = await fetcher.asyncGet();
  expect(data).toBe(obj);
});

test('fetcher with args', async () => {
  const obj = { id: 1};
  const api = createApi<typeof obj>();
  let pId = 0;
  let pArg = '';
  const fetcher = createFetcher<typeof obj, number, string>((id, arg) => {
    pId = id;
    pArg = arg;
    return api.fetch();
  });
  api.resolve(obj);
  const data = await fetcher.asyncGet(1, 'hello');
  expect(pId).toEqual(1);
  expect(pArg).toEqual('hello')
  expect(data).toEqual({ id: 1 });
});
