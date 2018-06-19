import { TSyncPromise } from '../src/promise';

test('TSyncPromise.resolve sync', () => {
  const val = TSyncPromise.resolve(1);
  expect(val.data).toEqual({ type: 'resolved', data: 1 });
});

test('TSyncPromise.resolve async', async () => {
  const defer = TSyncPromise.resolve(Promise.resolve(2));
  await defer;
  expect(defer.data).toEqual({ type: 'resolved', data: 2 })
});


test('TSyncPromise.reject sync', () => {
  const val = TSyncPromise.reject(1);
  expect(val.data).toEqual({ type: 'rejected', data: 1 });
});

test('TSyncPromise.reject async', async () => {
  const defer = TSyncPromise.resolve(Promise.reject(2));
  try {
    await defer;
    expect(false).toBeTruthy();
  } catch (err) {
    expect(true).toBeTruthy();
  }
  expect(defer.data).toEqual({ type: 'rejected', data: 2 })
});

test('TSyncPromise instanceof', () => {
  const defer = TSyncPromise.resolve(Promise.resolve(1));
  const ok = defer instanceof TSyncPromise;
  expect(ok).toBeTruthy();
});

test('TSyncPromise all', async () => {
  const data = await TSyncPromise.all([Promise.resolve(1), TSyncPromise.resolve(2), 3]);
  expect(data).toEqual([1, 2, 3]);
})

test('TSyncPromise all for empty array', async () => {
  const data = await TSyncPromise.all([]);
  expect(data).toEqual([]);
})
