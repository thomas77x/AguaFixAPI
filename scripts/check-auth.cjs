const assert = require('node:assert/strict');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { DataSource } = require('typeorm');
const { compare } = require('bcryptjs');
const { AppModule } = require('../dist/app.module');

(async () => {
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  const email = `auth-check-${Date.now()}@example.com`;
  try {
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const post = async (path, body) => {
      const response = await fetch(`${base}/auth/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    };
    const input = { name: 'Auth Test', email, password: 'TestPassword123!', isNotificationEnabled: false };
    const registered = await post('register', input);
    assert.equal(registered.status, 201);
    assert.equal(registered.body.isNotificationEnabled, false);
    assert.equal('password' in registered.body, false);
    const [stored] = await app.get(DataSource).query('SELECT "password" FROM "SYSTEM_USER" WHERE "email" = $1', [email]);
    assert.notEqual(stored.password, input.password);
    assert.equal(await compare(input.password, stored.password), true);
    assert.equal((await post('register', input)).status, 409);
    const login = await post('login', { email: email.toUpperCase(), password: input.password });
    assert.equal(login.status, 200);
    assert.equal('password' in login.body.user, false);
    const invalid = await post('login', { email, password: 'wrong' });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.message, 'Correo o contraseña incorrectos.');
    assert.equal((await post('login', { email: `missing-${email}`, password: 'wrong' })).status, 400);
    assert.equal((await post('register', { ...input, email: 'invalid' })).status, 400);
    assert.equal((await post('register', { ...input, isNotificationEnabled: null })).status, 400);
    assert.equal((await post('register', { ...input, password: 'short' })).status, 400);
    assert.equal((await post('register', { ...input, password: 'é'.repeat(40) })).status, 400);
    assert.equal((await post('register', { ...input, id: 123 })).status, 400);
    console.log('OK: registration, password hashing, login, duplicate email, invalid credentials and DTO validation.');
  } finally {
    try {
      await app.get(DataSource).query('DELETE FROM "SYSTEM_USER" WHERE "email" = $1', [email]);
    } finally {
      await app.close();
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
