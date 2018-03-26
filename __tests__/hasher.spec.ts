import { createHasher } from '../index';

test('test hasher', () => {
    const hasher = createHasher();
    expect(hasher.get()).toEqual(0);
    expect(hasher.get()).toEqual(0);
    expect(hasher.get(1, "test")).toEqual(1);
    expect(hasher.get(1, "test")).toEqual(1);
    expect(hasher.get()).toEqual(0);
    expect(hasher.get(1, "test1")).toEqual(2);
    expect(hasher.get(1, "test1")).toEqual(2);
    hasher.clear();
    expect(hasher.get()).toEqual(0);
    expect(hasher.get(1, "test1")).toEqual(1);
});
