# react-async-decorator

New way to organize your asynchronous flow in react applications. inspired by [Dan Abramov: Beyond React 16](https://www.youtube.com/watch?v=nLF0n9SACd4).

[![Build Status](https://travis-ci.org/lexich/react-async-decorator.svg?branch=master)](https://travis-ci.org/lexich/react-async-decorator)

## Getting Started

### Installing

```sh
npm install react-async-decorator
```

If you prefer [yarn](https://yarnpkg.com)

```sh
yarn react-async-decorator
```

### Simple example

```js
import { asyncClass, initFetchers } from 'react-async-decorator';
const config = initFetchers();
const fetcher = config.createFetcher(() => fetch('/data.json'));

// If you don't want to use decorators, it should be replaced next syntax
// const WrapTest = asyncClass(fetcher)(Test);
@asyncClass(fetcher)
class Test extends React.Component {
    render() {
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

## Documentation

- [index.md](index.md)
- [asyncMethod.md](asyncMethod.md)

## Running the tests

All unit tests are in `__tests__` folder. They are written with [jest](https://jestjs.io/).

```sh
npm test
```

## Contributing

We are happy any contributions. Please be aware of all unit-tests and linters passed.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/lexich/react-async-decorator/tags). Thanks for [standard-version](https://github.com/conventional-changelog/standard-version) for automation.

## Authors

* **Efremov Alexey** = [lexich](https://github.com/lexich)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
