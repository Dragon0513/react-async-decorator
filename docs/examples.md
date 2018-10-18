# Examples

## SimpleExample

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

## Impl

```js
// share code fetchers.js
export const fetcher = config.createFetcher();

// clientside code
import { fetcher } from './fetchers';
fetcher.impl(() => fetch('/data.json'));

// backend code
import { fetcher } from './fetchers';
// loading data direct from DB, or REST call or somethink on backend side
fetcher.impl(() => Data.selectFromDb());
```

## implModify

```js
export const fetcher = config.createFetcher(
  (id) => fetch(`/data/${id}`)
);
fetcher.implModify((opts) => {
  if (opts.type === 'delete') {
    return fetch(`/data/${opts.id}`, { method: 'DELETE', })
  } else if (opts.type === 'update') {
    return fetch(`/data/${opts.id}`, { method: 'POST', body: JSON.stringify( opts.body ) })
  } else {
    return Promise.reject(new Error('Unsupport operation'))
  }
});

// might throws data
const data = fetcher.get(1);

// returns promise
fetcher.asyncGet(2).then(data => console.log(data));

// delete data
fetcher.asyncSet({ type: 'delete', id: 1 });

// update data
fetcher.asyncSet({ type: 'update', id: 2, body: { name: 'Superman' }});
```
