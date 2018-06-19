import * as React from 'react';
import { asyncClassFactory } from '../index';
import { Fetcher, create } from '../src/fetcher';
import { renderToString } from 'react-dom/server'
import { createApi, IApi } from './helpers';

const createFetcher = create();

const asyncClass = asyncClassFactory({
    renderLoader: () => React.createElement('div', {}, 'default loader'),
    renderError: err => React.createElement('div', {}, err.message)
});

@asyncClass
class Test extends React.Component<{ fetcher: Fetcher<string>}, {}> {
    render() {
        const data = this.props.fetcher.get();
        return React.createElement('div', {}, data);
    }
    renderLoader() {
        return React.createElement('div', {}, 'overwrite loading');
    }
}

it('render loading', () => {
    const api = createApi<string>();
    const fetcher = createFetcher<string>(api.fetch);
    const component = renderToString(React.createElement(Test, { fetcher }))
    expect(component).toMatchSnapshot();
});

it('render error', async () => {
    const api = createApi<string>();
    const fetcher = createFetcher<string>(api.fetch);
    api.reject(new Error('custom error'));
    try {
        fetcher.get();
        expect(false).toBeTruthy()
    } catch (e) {
        expect(true).toBeTruthy();
    }
    await api.defer.catch(_ => Promise.resolve());
    const component = renderToString(React.createElement(Test, { fetcher }))
    expect(component).toMatchSnapshot();
});

it('render data', async () => {
    const api = createApi<string>();
    const fetcher = createFetcher<string>(api.fetch);
    api.resolve('content');
    try {
        fetcher.get();
        expect(false).toBeTruthy()
    } catch (e) {
        expect(true).toBeTruthy();
    }
    await api.defer;
    const component = renderToString(React.createElement(Test, { fetcher }))
    expect(component).toMatchSnapshot();
});
