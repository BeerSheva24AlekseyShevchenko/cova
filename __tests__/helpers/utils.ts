import request from 'supertest';

const NAME = "Test Test";
const EMAIL = "test@test.com";
const PASSWORD = "Test.112233";

export const login = (app: any) => request(app)
  .post('/api/accounts/login')
  .send({ email: EMAIL, password: PASSWORD })
  .then((r) => r.body.token);
  
const PREMIUM_NAME = "Premium Test";
const PREMIUM_EMAIL = "testPremium@testPremium.com";
const PREMIUM_PASSWORD = "TestPremium.112233";

export const loginPremium = (app: any) => request(app)
  .post('/api/accounts/login')
  .send({ email: PREMIUM_EMAIL, password: PREMIUM_PASSWORD })
  .then((r) => r.body.token);

  const ADMIN_NAME = "Admin Test";
  const ADMIN_EMAIL = "testAdmin@testAdmin.com";
  const ADMIN_PASSWORD = "TestAdmin.112233";
  
  export const loginAdmin = (app: any) => request(app)
    .post('/api/accounts/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .then((r) => r.body.token);