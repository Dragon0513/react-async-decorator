import { create } from '../src/fetcher';
import { TSyncPromise } from '../src/promise';
import { createApi } from './helpers';
const createFetcher = create();

test('fetcher test', async () => {
	const api = createApi();
	const fetcher = createFetcher(() => api.fetch());
	try {
		fetcher.get();
		expect(false).toBeTruthy();
	} catch (e) {
		expect(e).toBeInstanceOf(TSyncPromise);
	}
	const sendData = { msg: 'Hello' };
	api.resolve(sendData);
	await fetcher.asyncGet();
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

test('fetcher asyncSet', async () => {
	type DeleteT = { type: 'delete' };
	type UpdateT = { type: 'update'; name: string };
	const fetcher = createFetcher<{ name: string }, any, DeleteT | UpdateT>(() => Promise.resolve({ name: 'lexich' }));
	fetcher.implModify(opts => {
		if (opts.type === 'delete') {
			return Promise.resolve({ name: '' });
		} else if (opts.type === 'update') {
			return Promise.resolve({ name: opts.name });
		} else {
			return Promise.reject(new Error('Unsupport operation'));
		}
	});

	const info = await fetcher.asyncGet();
	expect(info).toEqual({ name: 'lexich' });
	const info2 = await fetcher.asyncSet({ type: 'delete' });
	expect(info2).toEqual({ name: '' });
	const info3 = await fetcher.asyncSet({ type: 'update', name: 'user' });
	expect(info3).toEqual({ name: 'user' });
	const data = fetcher.get();
	expect(data).toBe(info3);
});

test('fetcher impl', () => {
	const obj = { id: 1 };
	const api = createApi<typeof obj>();
	const fetcher = createFetcher<any, typeof obj>();
	const msg = fetcher.asyncGet().catch(err => err.message);
	expect(msg.data).toEqual({
		data: "Fetcher wasn't implemented",
		type: 'resolved',
	});
	fetcher.clear();
	fetcher.impl(api.fetch);
	api.resolve(obj);
	return fetcher.asyncGet().then(
		data => {
			expect(data).toEqual(obj);
		},
		err => {
			throw err;
		}
	);
});

test('fetcher with args', async () => {
	const obj = { id: 1 };
	const api = createApi<typeof obj>();
	let pId = 0;
	let pArg = '';

	const fetcher = createFetcher<typeof obj, { id: number; arg: string }, never>(({ id, arg }) => {
		pId = id;
		pArg = arg;
		return api.fetch();
	});
	api.resolve(obj);
	const data = await fetcher.asyncGet({ id: 1, arg: 'hello' });
	expect(pId).toEqual(1);
	expect(pArg).toEqual('hello');
	expect(data).toEqual({ id: 1 });
});

test('fetcher double get', async () => {
	const api = createApi();
	const fetcher = createFetcher(api.fetch);
	try {
		fetcher.get();
		expect(false).toBeTruthy();
	} catch (err) {
		expect(true).toBeTruthy();
	}
	api.resolve('Hello world');
	await fetcher.asyncGet();
	const data = fetcher.get();
	expect(data).toEqual('Hello world');
});

test('manualStore with caching', async () => {
	type User = { id: number; name: string };
	let counter = 0;
	const getUser = (id: number): Promise<User> => {
		counter++;
		return Promise.resolve({ id, name: `User ${id}` });
	};

	const fetcher = createFetcher<User[], number[], never>(
		(ids, { holder, hash }) => {
			const newIds = ids.filter(id => !holder.getAwait(hash(id)));
			const props: Record<string, Promise<User>> = {};
			const pUsers = newIds.map(id => {
				const user = getUser(id);
				props['' + id] = user;
				return user;
			});

			holder.set(props as any);

			return TSyncPromise.all(pUsers).then(() => {
				const users = ids.map(id => {
					const key = hash(id);
					const user = (holder.get(key) as any) as User;
					return user;
				});
				return users;
			});
		},
		{ manualStore: true }
	);

	const user12 = await fetcher.asyncGet([1, 2]);
	expect([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]).toEqual(user12);
	expect(counter).toBe(2);

	const user23 = await fetcher.asyncGet([2, 3]);
	expect([{ id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }]).toEqual(user23);
  expect(counter).toBe(3);

  const userSync = fetcher.get([1, 2, 3]);
  expect([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }, { id: 3, name: 'User 3' }]).toEqual(userSync);
  expect(counter).toBe(3);
});
