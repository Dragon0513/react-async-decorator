
# Documentation

`react-async-decorators` library consists of 2 main parts. Decorators and fetchers. `Decorators` allow to work with asynchronous operations in react components with synchronous way. `Fetchers` build right arhitecture to interact with your data. Also it's very important to point to possibility of integration with [redux](https://redux.js.org/).

## Decorators

### asyncClass

This library has 2 ways to decorate your component. The Simplest way to use `asyncClass`. It patch your `react component` method render.

| method | type | description |
|:-------|:-----|:------------|
| **asyncClass**(fetchers)(ReactComponent) | function | decorates your react component method `render` to use fetchers inside. |
| **fetchers** | fetcher or array of fetchers | If fetchers would be updated outside component, to rerender current component. |
| **ReactComponent** | react component | |

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

| method | type | description |
|:-------|:-----|:------------|
| asyncMethod | function | decorates your react component method to use fetchers inside. You can use it only with decorators syntax |

```js
render() {
  return <div>{this.renderBody()}</div>
}
@asyncMethod
renderBody() {
  return <div>{ fetcher.get() }</div>
}
```

### listenClass

If you need to subscribe component on fetcher's updates, this method helps to do it in declarative way. This decorator should be used when component decorates by `asyncMethod`.

| method | type | description |
|:-------|:-----|:------------|
| **asyncClass**(fetchers)(ReactComponent) | Function | subscribe component on fetcher's updates |
| **fetchers** | fetcher or array of fetchers | If fetchers would be updated outside component, to rerender current component. |
| **ReactComponent** | react component | - |

```js
@listenClass(fetcher)
class Component extends React.Component {
   render() {
      return <div>{this.renderBody()}</div>
   }
   @asyncMethod
   renderBody() {
      return <div>{ fetcher.get() }</div>
   }
}
```

### listenTo

It's internal method, which deliver the same functionality as `listenClass`. May be useful when fetchers brings using props.

| method | type | description |
|:-------|:-----|:------------|
| listenTo(context, fetchers) | Function | subscribe component on fetcher's updates |
| context | instance (`this`) of react component | 
| **fetchers** | fetcher or array of fetchers | If fetchers would be updated outside component, to rerender current component. |

```js
class Component extends React.Component {
   constructor(props, context) {
      super(props, context);
      listenTo(this, props.fetcher);
   }
   render() {
     const data = this.props.fetcher.get();
     return <div>{ data }</div>;
   }
}
```

### asyncClassFactory
By default `asyncClass` and `asyncMethod` have predefined behaviour. They use `renderLoading` method for rendering loading state and `renderError(error)` method for error state. This methods should implement in your component. If they would miss, it means, they will be returns `null` (empty conentent for `react`). It's not very convinient to implement `renderLoading` and `renderError(error)` in every component.


| method | type | description |
|:-------|:-----|:------------|
| asyncClassFactory | Function | configure `asyncClass` decorator (see it [description](#asyncclass) )
| options | Object or `undefined` | By default (`undefined`) User `renderLoading` method for render loading state and `renderError(error)` method for render error state |
| options.renderLoader | String or Function | If uses string value, it defines method name for render loading state, otherwise function definition implements this behaviour by default for all components, which would be used preconfigured decoractor. Also you can overwrite this behaviour by implementing `renderLoading`.
| options.renderError | String or Function | The same behaviour as `options.renderLoader` for render error state.


```js
const customAsyncClass = asyncClassFactory({
   renderLoader: 'renderCustomNameLoading',
   renderError: (err) => (<div>{err.message}</div>)
});
@customAsyncClass
class Component extends React.Component {}
```

### asyncMethodFactory


| method | type | description |
|:-------|:-----|:------------|
| asyncMethodFactory | Function | configure `asyncMethod` decorator (see it [description](#asyncmethod) )
| options | Object or `undefined` | By default (`undefined`) User `renderLoading` method for render loading state and `renderError(error)` method for render error state |
| options.renderLoader | String or Function | If uses string value, it defines method name for render loading state, otherwise function definition implements this behaviour by default for all components, which would be used preconfigured decoractor. Also you can overwrite this behaviour by implementing `renderLoading`.
| options.renderError | String or Function | The same behaviour as `options.renderLoader` for render error state.

```js
const customAsyncMethod = asyncMethodFactory({
   renderLoader: 'renderCustomNameLoading',
   renderError: (err) => (<div>{err.message}</div>)
});
@listenClass(fetchers)
class Component extends React.Component {
  @customAsyncMethod
  renderBody() {}
}
```

## Fetchers

`Fetchers` is core part of `react-async-decorator` library. They allow to organize your data flows. Basicly you can use internal data store which is defined by `initFetchers`. But also it's possible to use it with (redux)[https://redux.js.org]. For this purposes use `initReduxFetchers`

### initFetchers

| method | type | description |
|:-------|:-----|:------------|
| initFetchers(options) | Function | Defines fetcher's creator with internal storage
| options | Object or undefined | if you want to use internal storage, you shouldn't use options at all.
| options.createStore | Function | your implementation of dataStore. Should return object which implements `MiddlewareAPI` from redux library with `dispatch` and `getState` methods. The better way to understand how to write it correctly to read source code.
| options.action | string | name of `redux-like` action ({ type: `action` }) which will be used internally
| options.key | string | reserved name in `redux-like` store where data will be kept.
| return value | () => Fetcher | Fetcher's creator |

```js
const createFetcher = initFetchers();

const fetcher = createFetcher(() => ....);
```

### initReduxFetchers

| method | type | description |
|:-------|:-----|:------------|
| initFetchers(options) | Function | Defines fetcher's creator with redux storage
| options | Object | - 
| options.action | string | name of `redux` action ({ type: `action` }) which will be used internally
| options.key | string | reserved name in `redux` store where data will be kept.
| return | { use, reducer, createFetcher } | - |
| return.use | Function | You should call this method to keep reference to redux store
| return.reducer | Function | Use this `reducer` with other redux reducer
| return.createFetcher | Function | Fetcher's creator

```js
import { createStore } from 'redux';

const FETCHER_ACTION = 'FETCHER_ACTION';
const conf = initReduxFetchers({
   action: FETCHER_ACTION,
   key: 'fetcher_key_store'
});

const store = createStore(conf.reducer, {});
conf.use(store);

const fetcher = conf.createFetcher(() => ....);

```

### createFetcher

TODO

| method | type | description |
|:-------|:-----|:------------|
| createFetcher(fn) | Function | Function which create fetchers
| fn | Function | Function should return `Promise` or `TSyncPromise` or `Fetcher` or Array of these primitives. See [Examples](#examples)
| return | Fetcher | -

### Fetcher

| method | type | description |
| get | - | TODO |
| asyncGet | - | TODO |
| asyncSet | - | TODO |
| impl | - | TODO |
| implModify | - | TODO |
| clear | - | clear all previous cached data. |
| await | - | TODO |
| awaitAll | - | TODO |
| isLoading | - | TODO |


### TSyncPromise

TODO

## Examples

TODO
