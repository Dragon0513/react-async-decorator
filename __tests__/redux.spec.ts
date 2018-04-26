import { createReduxFetcher } from '../index';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';


test('empty initial state', async () => {
    const conf = createReduxFetcher('ACTION', 'action');
    const store = createStore(conf.reducer, {
        action: { }
    });
    conf.use(store);
    const fetcher = conf.createFetcher(() => Promise.resolve(123));
    try {
        fetcher.get()
    } catch (e) {}
    await fetcher.awaitAll()
    const state = store.getState();
    expect(state).toMatchSnapshot();
});

test('predefined state shouldns overwrite', async () => {
    const conf = createReduxFetcher('ACTION', 'action');
    const initialState = {"action":{"0":{"":{"d":999}}}};
    const store = createStore(conf.reducer, initialState);
    conf.use(store);
    const fetcher = conf.createFetcher(() => Promise.resolve(123));
    try {
        fetcher.get()
    } catch (e) {}
    await fetcher.awaitAll()
    const state = store.getState();
    expect(state).toMatchSnapshot();
});
