
# Documentation
> initFetchers(): (createFetcher() => Fetcher) - create special fetcher, that return `Fetcher` object that allow to construct access to async data.
> initReduxFetchers(): (createFetcher() => Fetcher) - create special fetcher, that return `Fetcher` object that allow to construct access to async data with store it in redux store
> asyncMethod - wraps class method to use fetcher functionality in it.
> asyncClass - wraps class method `render` to use fetcher functionality in it.
> asyncClassFactory(options: IAsyncFetch) - create asyncClass with `options` configurations.
> asyncMethodFactory(options: IAsyncFetch) - create asyncMethod with `options` configurations.
> IAsyncFetch
- renderLoading - (string | Function) name of class method or realization loader behaviour for render loading process.
- renderError - (string | Function) name of class method or realization loader behaviour for render error process.
> Fetcher
- get(...args): Data - must be use in wrapped method by `asyncMethod` or `asyncClass`.
- clear() - clear all previous cached data.
