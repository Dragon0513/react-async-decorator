import { create } from '../src/fetcher';
import { TSyncPromise } from '../src/promise';
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

test('fetcher asyncSet', async () => {
	type DeleteT = { type: 'delete' };
	type UpdateT = { type: 'update'; name: string };
	const fetcher = createFetcher<DeleteT | UpdateT, { name: string }>(() => Promise.resolve({ name: 'lexich' }));
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
	const fetcher = createFetcher<any, typeof obj, number, string>((id, arg) => {
		pId = id;
		pArg = arg;
		return api.fetch();
	});
	api.resolve(obj);
	const data = await fetcher.asyncGet(1, 'hello');
	expect(pId).toEqual(1);
	expect(pArg).toEqual('hello');
	expect(data).toEqual({ id: 1 });
});
