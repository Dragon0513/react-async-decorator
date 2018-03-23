import * as React from 'react';
import { asyncClass, createFetcher, Fetcher } from '../index';
import { renderToString } from 'react-dom/server'
import { createApi, IApi } from './helpers';

@asyncClass
class Test extends React.Component<{ fetcher: Fetcher<string>}, {}> {
    render() {
        const data = this.props.fetcher.get();
        return React.createElement('div', {}, data);
    }
    renderLoader() {
        return React.createElement('div', {}, 'loading');
    }
    renderError(err: Error) {
        return React.createElement('div', {}, err.message);
    }
}

it('render loading', () => {
    const api = createApi<string>();
    const fetcher = createFetcher(api.fetch);
    const component = renderToString(React.createElement(Test, { fetcher }))
    expect(component).toMatchSnapshot();
});

it('render error', async () => {
    const api = createApi<string>();
    const fetcher = createFetcher(api.fetch);
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
    const fetcher = createFetcher(api.fetch);
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
