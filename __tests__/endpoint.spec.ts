import { create } from '../src/fetcher';
const createFetcher = create();

test('rest endpoint', async () => {
  interface IUser {
    id: number;
    name: string;
  }
  type SetOpts = { type: 'update', name: string, id: number };

  const userFetcher = createFetcher<IUser, number, SetOpts>((id) => {
    return Promise.resolve({ name: `User ${id}`, id });
  });
  userFetcher.implModify((msg) => {
    if (msg) {
      if (msg.type === 'update') {
        return Promise.resolve({ name: msg.name, id: msg.id });
      }
    }
    return Promise.reject('unknown')
  });

  const user = await userFetcher.asyncGet(1);
  expect(user).toMatchObject({ name: 'User 1', id: 1 });
  const user1 = await userFetcher.asyncSet({ type: 'update', id: 1, name: 'Hello' }, 1);
  expect(user1).toMatchObject({ name: 'Hello', id: 1 });
  const user2 = await userFetcher.asyncGet(1);
  expect(user2).toMatchObject({ name: 'Hello', id: 1 });
});
