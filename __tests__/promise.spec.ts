import { TSyncPromise } from '../src/promise';

test('TSyncPromise.resolve sync', () => {
	const val = TSyncPromise.resolve(1);
	expect(val.data).toEqual({ type: 'resolved', data: 1 });
});

test('TSyncPromise.resolve async', async () => {
	const defer = TSyncPromise.resolve(Promise.resolve(2));
	await defer;
	expect(defer.data).toEqual({ type: 'resolved', data: 2 });
});

test('TSyncPromise.resolve with instance TSyncPromise', () => {
	const result = TSyncPromise.resolve(1);
	const defer = TSyncPromise.resolve(result);
	expect(defer.data).toEqual({ type: 'resolved', data: 1 });
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
	expect(defer.data).toEqual({ type: 'rejected', data: 2 });
});

test('TSyncPromise instanceof', () => {
	const defer = TSyncPromise.resolve(Promise.resolve(1));
	const ok = defer instanceof TSyncPromise;
	expect(ok).toBeTruthy();
});

test('TSyncPromise all', async () => {
	const data = await TSyncPromise.all([Promise.resolve(1), TSyncPromise.resolve(2), 3]);
	expect(data).toEqual([1, 2, 3]);
});

test('TSyncPromise all for empty array', async () => {
	const data = await TSyncPromise.all([]);
	expect(data).toEqual([]);
});

test('TSyncPromise new resolved', () => {
	const promise = new TSyncPromise<number>(resolve => {
		resolve(1);
	});
	expect(promise.data).toEqual({ data: 1, type: 'resolved' });
});

test('TSyncPromise new rejected', () => {
	const err = new Error('error');
	const promise = new TSyncPromise<number>((_, reject) => {
		reject(err);
	});
	expect(promise.data).toEqual({ data: err, type: 'rejected' });
});

test('TSyncPromise then pure value', () => {
	const defer = TSyncPromise.resolve(1).then(d => d + 1);
	expect(defer.data).toEqual({ data: 2, type: 'resolved' });
});

test('TSyncPromise then with TSyncPromise', () => {
	const defer = TSyncPromise.resolve(1).then(d => TSyncPromise.resolve(d + 2));
	expect(defer.data).toEqual({ data: 3, type: 'resolved' });
});

test('TSyncPromise then with TSyncPromise rejected', () => {
	const err = new Error('error');
	const defer = TSyncPromise.reject(err).then(
		() => {
			expect(true).toBeFalsy();
		},
		error => {
			expect(error).toBe(err);
			return 1;
		}
	);
	expect(defer.data).toEqual({ data: 1, type: 'resolved' });
});
