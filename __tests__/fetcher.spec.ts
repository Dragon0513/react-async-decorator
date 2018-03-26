import { createFetcher } from '../index';
import { createApi, IApi } from './helpers';

test('fetcher test', async () => {
    const api = createApi();
    const fetcher = createFetcher(api.fetch);
    try {
        fetcher.get();
        expect(false).toBeTruthy();
    } catch(e) {
        expect(e).toBeInstanceOf(Promise);
    }
    const sendData = {};
    api.resolve(sendData);
    await api.defer;
    expect(fetcher.get() === sendData).toBeTruthy();
    fetcher.clear();
    try {
        fetcher.get();
        expect(false).toBeTruthy();
    } catch(e) {
        expect(e).toBeInstanceOf(Promise);
    }
    api.resolve(sendData);
    await api.defer;
    expect(fetcher.get() === sendData).toBeTruthy();
});
