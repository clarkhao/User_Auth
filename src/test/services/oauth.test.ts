import { JsonObject, UserType } from '../../model/type';
import { createOauthUser } from '../../service';
import { describe, expect, jest, it } from '@jest/globals';

describe('createGithubUser', () => {
  const mockUser = {
    login: 'clarkhao',
    id: 3636363636,
    node_id: 'fjkdjfkjdkjfkdjk',
    email: 'clarktotoro@xxx.com'
  } as JsonObject;

  it('should create a new user in the database', async () => {
    const query = await createOauthUser(mockUser, UserType.Github);
    expect(typeof query.id).toEqual('string');
  });
});

describe('createGoogleUser', () => {
  const mockUser = {
    id: '323223232323323',
    email: 'xxxxx@xxx.com',
    verified_email: true,
    name: 'Clark xxxx',
    given_name: 'Clark',
    family_name: 'xxx',
    picture: 'https://lh3.googleusercontent.com/a/xxxxxxc',
    locale: 'xxxx'
  } as JsonObject;

  it('should create a new user in the database', async () => {
    const query = await createOauthUser(mockUser, UserType.Google);
    expect(typeof query.id).toEqual('string');
  });
});