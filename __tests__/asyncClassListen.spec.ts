import * as React from 'react';
import { asyncClass } from '../index';
import { create } from '../src/fetcher';
import * as Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });

const createFetcher = create();

const fetcher = createFetcher<string>(() => {
	return Promise.resolve('Hello');
});
fetcher.implModify(() => {
	return Promise.resolve('world');
});

@asyncClass(fetcher)
class Test extends React.Component<{ fn: () => void }, {}> {
	render() {
		const data = fetcher.get();
		return React.createElement('div', {}, data);
	}
	renderLoader() {
		return React.createElement('div', {}, 'loading');
	}
	renderError(err: Error) {
		return React.createElement('div', {}, err.message);
	}
	forceUpdate() {
		return this.props.fn();
	}
}

it('render data', async () => {
	const data = await fetcher.asyncGet();
	expect(data).toBe('Hello');
	const component = Enzyme.mount(
		React.createElement(Test, {
			fn: () => component.setState({ a: 1 }),
		})
	);
	expect(component.html()).toMatchSnapshot();

	fetcher.asyncSet(undefined);

	const data2 = await fetcher.asyncSet(undefined);
	expect(data2).toBe('world');

	await new Promise(res => setTimeout(res, 1));
	expect(component.html()).toMatchSnapshot();
});
