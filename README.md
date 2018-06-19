# react-async-decorator

[![Build Status](https://travis-ci.org/lexich/react-async-decorator.svg?branch=master)](https://travis-ci.org/lexich/react-async-decorator)

## Examples
```js
import { asyncClass, initFetchers } from 'react-async-decorator';
const config = initFetchers();
@asyncClass
class Test extends React.Component {
    fetcher = config.createFetcher(() => fetch('/data.json'))
    render() {
        const data = this.fetcher.get();
        // This content will be rendered after success response of fetch request
        return <div>{data}</div>;
    }
    renderLoader() {
        // This content will be rendered while fetch request in progress
        return <div>Loading</div>;
    }
    renderError(err) {
        // This content will be rendered after fail response of fetch request
        return <div>{err.message}</div>;
    }
}
```

```js
import { asyncMethod, initFetchers } from 'react-async-decorator';
const config = initFetchers();
class Test extends React.Component {
    fetcher = config.createFetcher(() => fetch('/data.json'))
    render() {
        // This content will be rendered always
        return <div>{ this.renderContent() }</div>;
    }
    @asyncMethod
    renderContent() {
        const data = this.fetcher.get();
        // This content will be rendered after success response of fetch request
        return <div>{data}</div>;
    }
    renderLoader() {
        // This content will be rendered while fetch request in progress
        return <div>Loading</div>;
    }
    renderError(err) {
        // This content will be rendered after fail response of fetch request
        return <div>{err.message}</div>;
    }
}
```
If you don't want to use decorators, it should be replaced next syntax
```js
class Test1 {

}
const WrapTest1 = asyncClass(Test1);
```

## Documentation
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
