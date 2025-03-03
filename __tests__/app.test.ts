import request from 'supertest';
import app from '../src/app';
import { login, loginAdmin, loginPremium } from './helpers/utils';

describe('Tests', () => {
  let token: string;
  let tokenPrem: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    const [userToken, userPremiumToken, userAdminToken] = await Promise.all([
      login(app),
      loginPremium(app),
      loginAdmin(app)
    ]);
    token = userToken;
    tokenPrem = userPremiumToken;
    tokenAdmin = userAdminToken;
  });

  it('Movies: getMovie', async () => {
    const res = await request(app)
      .get('/api/movies/573a1390f29313caabcd42e8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body._id).toBe('573a1390f29313caabcd42e8');
  });

  it('Movies: mostRated', async () => {
    const res = await request(app)
      .get('/api/movies/mostRated?amount=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Movies: mostCommented', async () => {
    const res = await request(app)
      .get('/api/movies/mostCommented?amount=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Movies: request limit', async () => {
    const res = await request(app)
      .get('/api/movies/573a1390f29313caabcd42e8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(429); // Config limit: 3req/10s (its 4)
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('Movies: rate', async () => {
    const res = await request(app)
      .put('/api/movies/rate')
      .send({ id: 439, rating: 5 })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(typeof res.body.updated).toBe('number');
  });



  // Comments
  it('Comments: getCommentsByMovie', async () => {
    const res = await request(app)
      .get('/api/comments/movies/573a1390f29313caabcd42e8')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Comments: getCommentsByUser', async () => {
    const res = await request(app)
      .get('/api/comments/users/test%40test.com')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Comments: add,edit,delete', async () => {
    const resAdd = await request(app)
      .post('/api/comments')
      .send({
        movieId: '573a1390f29313caabcd42e8',
        text: 'test comment'
      })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resAdd.status).toBe(200);
    expect(resAdd.headers['content-type']).toMatch(/json/);
    expect(resAdd.body.movie_id).toBe('573a1390f29313caabcd42e8');
    expect(resAdd.body.text).toBe('test comment');

    const commentId = resAdd.body._id;

    const resEdit = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({
        text: 'test comment edited'
      })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resEdit.status).toBe(200);
    expect(resEdit.headers['content-type']).toMatch(/json/);
    expect(resEdit.body.movie_id).toBe('573a1390f29313caabcd42e8');
    expect(resEdit.body.text).toBe('test comment edited');

    const resDelete = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.headers['content-type']).toMatch(/json/);
    expect(resDelete.body.movie_id).toBe('573a1390f29313caabcd42e8');
  });


  // Favorites
  it('Favorites: get', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('Favorites: add,edit,delete', async () => {
    const resAdd = await request(app)
      .post('/api/favorites')
      .send({
        movieId: '573a1390f29313caabcd42e8',
        feedBack: 'erunda',
        viewed: true
      })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resAdd.status).toBe(200);
    expect(resAdd.headers['content-type']).toMatch(/json/);
    expect(resAdd.body.movie_id).toBe('573a1390f29313caabcd42e8');
    expect(resAdd.body.feed_back).toBe('erunda');
    expect(resAdd.body.viewed).toBe(true);

    const resAddRepeat = await request(app)
      .post('/api/favorites')
      .send({
        movieId: '573a1390f29313caabcd42e8',
        feedBack: 'erunda',
        viewed: true
      })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resAddRepeat.status).toBe(409);
    expect(resAddRepeat.headers['content-type']).toMatch(/json/);

    const favoriteId = resAdd.body._id;

    const resEdit = await request(app)
      .put(`/api/favorites/${favoriteId}`)
      .send({
        feedBack: 'good',
        viewed: false
      })
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resEdit.status).toBe(200);
    expect(resEdit.headers['content-type']).toMatch(/json/);
    expect(resEdit.body._id).toBe(favoriteId);
    expect(resEdit.body.feed_back).toBe('good');
    expect(resEdit.body.viewed).toBe(false);

    const resDelete = await request(app)
      .delete(`/api/favorites/${favoriteId}`)
      .set('Authorization', `Bearer ${tokenPrem}`);

    expect(resDelete.status).toBe(200);
    expect(resDelete.headers['content-type']).toMatch(/json/);
    expect(resDelete.body._id).toBe(favoriteId);
    expect(resDelete.body.feed_back).toBe('good');
    expect(resDelete.body.viewed).toBe(false);
  });



  // Accounts
  it('Accounts: add,edit,delete ', async () => {
    const randomNum = Math.floor(Math.random() * (999999999 - 100000000 + 1)) + 100000000;
    const email = `Test_${randomNum}@test.com`;
    const emailUri = `Test_${randomNum}%40test.com`;
    const name = 'Test Generated';
    const password = `Test.${randomNum}`;
    const newPassword = `Test.${randomNum}.new`;
    let testToken = null;
  
    const resAdd = await request(app)
      .post('/api/accounts')
      .send({ email, name, password });
    expect(resAdd.status).toBe(200);
    expect(resAdd.headers['content-type']).toMatch(/json/);
    expect(resAdd.body._id).toBe(email);
    expect(resAdd.body.name).toBe(name);
    expect(resAdd.body.role).toBe('USER');

    const resAddRepeat = await request(app)
      .post('/api/accounts')
      .send({ email, name, password });
    expect(resAddRepeat.status).toBe(409);
    expect(resAddRepeat.headers['content-type']).toMatch(/json/);

    const resLogin = await request(app)
      .post('/api/accounts/login')
      .send({ email, password });
    expect(resLogin.status).toBe(200);
    expect(resLogin.headers['content-type']).toMatch(/json/);
    expect(typeof resLogin.body.token).toBe('string');
    testToken = resLogin.body.token;

    const resGet = await request(app)
      .get(`/api/accounts/${emailUri}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(resGet.status).toBe(200);
    expect(resGet.headers['content-type']).toMatch(/json/);
    expect(resGet.body._id).toBe(email);

    const resChangeRole = await request(app)
      .patch(`/api/accounts/${emailUri}/role`)
      .send({ role: 'PREMIUM_USER'})
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resChangeRole.status).toBe(200);
    expect(resChangeRole.headers['content-type']).toMatch(/json/);
    expect(resChangeRole.body._id).toBe(email);
    expect(resChangeRole.body.role).toBe('PREMIUM_USER');

    const resBlock = await request(app)
      .patch(`/api/accounts/${emailUri}/block`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resBlock.status).toBe(200);
    expect(resBlock.headers['content-type']).toMatch(/json/);
    expect(resBlock.body._id).toBe(email);
    expect(resBlock.body.blocked).toBe(true);

    const resLoginBlocked = await request(app)
      .post('/api/accounts/login')
      .send({ email, password });
    expect(resLoginBlocked.status).toBe(401);
    expect(resLoginBlocked.headers['content-type']).toMatch(/json/);

    const resUnblock = await request(app)
      .patch(`/api/accounts/${emailUri}/unblock`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resUnblock.status).toBe(200);
    expect(resUnblock.headers['content-type']).toMatch(/json/);
    expect(resUnblock.body._id).toBe(email);
    expect(resUnblock.body.blocked).toBe(false);

    const resChangePassword = await request(app)
      .patch(`/api/accounts/${emailUri}/password`)
      .send({ password: newPassword })
      .set('Authorization', `Bearer ${testToken}`);
    expect(resChangePassword.status).toBe(200);
    expect(resChangePassword.headers['content-type']).toMatch(/json/);
    expect(resChangePassword.body._id).toBe(email);

    const resLoginNew = await request(app)
      .post('/api/accounts/login')
      .send({ email, password: newPassword });
    expect(resLoginNew.status).toBe(200);
    expect(resLoginNew.headers['content-type']).toMatch(/json/);
    expect(typeof resLoginNew.body.token).toBe('string');
    testToken = resLoginNew.body.token;

    const resDelete = await request(app)
      .delete(`/api/accounts/${emailUri}`)
      .set('Authorization', `Bearer ${testToken}`);
    expect(resDelete.status).toBe(200);
    expect(resDelete.headers['content-type']).toMatch(/json/);

    const resGetNotExist = await request(app)
      .get(`/api/accounts/${emailUri}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(resGetNotExist.status).toBe(404);
    expect(resGetNotExist.headers['content-type']).toMatch(/json/);
  });

});

