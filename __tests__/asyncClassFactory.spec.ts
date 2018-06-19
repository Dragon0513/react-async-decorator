import * as React from 'react';
import { asyncClassFactory,  } from '../index';
import { create, Fetcher } from '../src/fetcher';
import { renderToString } from 'react-dom/server'
import { createApi } from './helpers';

const createFetcher = create();

@asyncClassFactory({
    renderLoader: 'loader',
    renderError: err => React.createElement('div', {}, err.message)
})
class Test extends React.Component<{ fetcher: Fetcher<string>}, {}> {
    render() {
        const data = this.props.fetcher.get();
        return React.createElement('div', {}, data);
    }
    loader() {
        return React.createElement('div', {}, 'custom loading');
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
