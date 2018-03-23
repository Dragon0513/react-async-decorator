# react-async-decorator
```js
import { asyncClass, createFetcher } from 'react-async-decorator';
@asyncClass
class Test extends React.Component {
    fetcher = createFetcher(() => fetch('/data.json'))
    render() {
        const data = this.props.fetcher.get();
        return <div>{data}</div>; // Render component when ajax request will be finished successfull
    }
    renderLoader() {
        return <div>Loading</div>; // Render component during ajax request
    }
    renderError(err) {
        return <div>{err.message}</div>; // Render component if ajax request will be failed
    }
}
```
