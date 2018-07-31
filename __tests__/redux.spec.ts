import { createStore } from 'redux';
import { initRedux } from '../src/redux';
import { IOptionStore } from '../src/reduxReducer';

const OPTIONS: IOptionStore = { action: 'ACTION', key: 'action' };

test('empty initial state', async () => {
	const conf = initRedux(OPTIONS);
	const store = createStore(conf.reducer, {
		action: {},
	});
	conf.use(store as any);
	const fetcher = conf.createFetcher(() => Promise.resolve(123));
	try {
		fetcher.get();
	} catch (e) {}
	await fetcher.awaitAll();
	const state = store.getState();
	expect(state).toMatchSnapshot();
});

test('predefined state shouldns overwrite', async () => {
	const conf = initRedux(OPTIONS);
	const initialState = { action: { test: { '': { d: 999 } } } };
	const store = createStore(conf.reducer, initialState);
	conf.use(store as any);
	const fetcher = conf.createFetcher(() => Promise.resolve(123), 'test');
	try {
		fetcher.get();
	} catch (e) {}
	await fetcher.awaitAll();
	const state = store.getState();
	expect(state).toMatchSnapshot();
});

test('test impl for createFetcher', async () => {
	const conf = initRedux(OPTIONS);
	const initialState = { action: { test: { '': { d: 999 } } } };
	const store = createStore(conf.reducer, initialState);
	conf.use(store as any);
	const fetcher = conf.createFetcher(undefined, 'test');
	fetcher.impl(() => Promise.resolve(123));
	try {
		fetcher.get();
	} catch (e) {}
	await fetcher.awaitAll();
	const state = store.getState();
	expect(state).toMatchSnapshot();
});

test('test awaitAll to cache', async () => {
	const conf = initRedux(OPTIONS);
	const store = createStore(conf.reducer, {});
	conf.use(store as any);
	const fetcher = conf.createFetcher(() => Promise.resolve(123), 'test');
	await fetcher.awaitAll();
	const state = store.getState();
	expect(state).toMatchSnapshot();
});
