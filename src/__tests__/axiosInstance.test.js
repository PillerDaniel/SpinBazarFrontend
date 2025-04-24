import axiosInstance from '../utils/axios';
import MockAdapter from 'axios-mock-adapter';

const setLocalStorageToken = (token) => localStorage.setItem("token", token);
const getLocalStorageToken = () => localStorage.getItem("token");

const mockLocation = { assign: jest.fn() };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('Axios Interceptors', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axiosInstance);
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  test('Request interceptor should add Authorization header if token exists', async () => {
    const token = 'test-token';
    setLocalStorageToken(token);
    mock.onGet('/test').reply(200);

    await axiosInstance.get('/test');

    expect(mock.history.get[0].headers.Authorization).toBe(`Bearer ${token}`);
  });

  test('Request interceptor should NOT add Authorization header if no token exists', async () => {
    mock.onGet('/test').reply(200);

    await axiosInstance.get('/test');

    expect(mock.history.get[0].headers.Authorization).toBeUndefined();
  });

   test('Request interceptor should NOT add Authorization header for /auth/refresh', async () => {
    const token = 'test-token';
    setLocalStorageToken(token);
    mock.onPost('/auth/refresh').reply(200, { token: 'new-token'});

    await axiosInstance.post('/auth/refresh');

    expect(mock.history.post[0].headers.Authorization).toBeUndefined();
  });

  test('Response interceptor should handle successful token refresh (401)', async () => {
    const initialToken = 'expired-token';
    const newToken = 'new-valid-token';
    setLocalStorageToken(initialToken);

    mock.onGet('/protected').replyOnce(401);
    mock.onPost('/auth/refresh').replyOnce(200, { token: newToken });
    mock.onGet('/protected').replyOnce(config => {
        if (config.headers.Authorization === `Bearer ${newToken}`) {
            return [200, { message: 'Success with new token' }];
        }
        return [400, { message: 'Retry failed, wrong token' }];
    });


    const response = await axiosInstance.get('/protected');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'Success with new token' });

    expect(getLocalStorageToken()).toBe(newToken);

    expect(mock.history.get.length).toBe(2);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe('/auth/refresh');
  });

  test('Response interceptor should pass through non-401 errors', async () => {
     mock.onGet('/error').reply(500, { message: 'Server error' });

     await expect(axiosInstance.get('/error')).rejects.toMatchObject({
         response: {
             status: 500,
             data: { message: 'Server error' }
         }
     });
     expect(mock.history.post.filter(req => req.url === '/auth/refresh').length).toBe(0);
  });


  test('Response interceptor should not retry refresh if /auth/refresh itself returns 401', async () => {
      mock.onPost('/auth/refresh').replyOnce(401, { message: 'Refresh token invalid or expired' });

       try {
           await axiosInstance.post('/auth/refresh');
       } catch (error) {
            expect(error.response.status).toBe(401);
       }

      expect(mock.history.post.filter(req => req.url === '/auth/refresh').length).toBe(1);
  });
});