
# Documentation

`react-async-decorators` library consists of 2 main parts. Decorators and fetchers. `Decorators` allow to work with asynchronous operations in react components with synchronous way. `Fetchers` build right arhitecture to interact with your data. Also it's very important to point to possibility of integration with [redux](https://redux.js.org/).

## Decorators

### asyncClass

This library has 2 ways to decorate your component. The Simplest way to use `asyncClass`. It patch your `react component` method render.

```doc
decorates your react component to use fetchers inside.

asyncClass(fetchers)(ReactComponent)
- fetchers - can be single fetcher or array of fetchers. If fetchers would be updated outside component, to rerender current component.
- ReactComponent - your react component
```

```js
// pseudocode
render() {
  try {
    return originalRender.call(this); // your original render method with fetchers calling
  } catch (e) {
    if (e instanceof Promise) {
      return this.renderLoading(); // await data and render loading state
    } else {
      return this.renderError(e); // render error state
    }
  }
}
```

### asyncMethod

Second way use `asyncMethod`. It may be usefull to decorate method with returns `JSX` but calls from render method. It's wrapped the same way as `asyncClass`.

```js
render() {
  return <div>{this.renderBody()}</div>
}
@asyncMethod(fetcher)
renderBody() {
  return <div>{ fetcher.get() }</div>
}
```

By default `asyncClass` and `asyncMethod` have predefined behaviour. They use `renderLoading` method for rendering loading state and `renderError(error)` method for error state. This methods should implement in your component. If they would miss, it means, they will be returns `null` (empty conentent for `react`). It's not very convinient to implement `renderLoading` and `renderError(error)` in every component.


## Fetchers

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
