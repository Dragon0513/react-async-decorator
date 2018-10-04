```js
import { asyncMethod, initFetchers } from 'react-async-decorator';
const config = initFetchers();
const fetcher = config.createFetcher(() => fetch('/data.json'))

class Test extends React.Component {
    render() {
        // This content will be rendered always
        return <div>{ this.renderContent() }</div>;
    }
    @asyncMethod
    renderContent() {
        const data = fetcher.get();
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
