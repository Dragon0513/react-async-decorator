# react-async-decorator

## Examples
```js
import { asyncClass, createFetcher } from 'react-async-decorator';
@asyncClass
class Test extends React.Component {
    fetcher = createFetcher(() => fetch('/data.json'))
    render() {
        const data = this.props.fetcher.get();
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
import { asyncMethod, createFetcher } from 'react-async-decorator';

class Test extends React.Component {
    fetcher = createFetcher(() => fetch('/data.json'))
    render() {
        // This content will be rendered always
        return <div>{ this.renderContent() }</div>;
    }
    @asyncMethod
    renderContent() {
        const data = this.props.fetcher.get();
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

class Test2 {
    renderWrap: asyncMethod(function() {

    })
}
```

## Documentation
createFetcher - create special fetcher, that return async data synchronously

asyncMethod - wraps class method to use fetcher functionality in it.

asyncClass - wraps class method `render` to use fetcher functionality in it.
