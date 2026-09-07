const assert = require('node:assert/strict');
const { SMTPServer } = require('smtp-server');
const { once } = require('node:events');

(async () => {
  const messages = [];
  let rejectMail = false;
  const smtp = new SMTPServer({
    authOptional: true,
    disabledCommands: ['STARTTLS'],
    onData(stream, session, callback) {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        if (rejectMail) return callback(new Error('Simulated SMTP failure'));
        messages.push({ recipients: session.envelope.rcptTo.map(to => to.address), raw: Buffer.concat(chunks).toString() });
        callback();
      });
    },
  });
  smtp.listen(0, '127.0.0.1');
  await once(smtp.server, 'listening');
  Object.assign(process.env, {
    SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.server.address().port),
    SMTP_SECURE: 'false', SMTP_USER: '', SMTP_PASSWORD: '',
    SMTP_FROM: 'aguafix@example.test', MAINTENANCE_EMAIL: 'cuadrilla@example.test',
  });
  let app;
  const address = `reports-check-${Date.now()}`;
  try {
    const { NestFactory } = require('@nestjs/core');
    const { ValidationPipe } = require('@nestjs/common');
    const { DataSource } = require('typeorm');
    const { AppModule } = require('../dist/app.module');
    const { generateReportTemplate } = require('../dist/reports/templates/report.template');
    app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const post = async body => {
      const response = await fetch(`${base}/reports`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    };
    const input = { address, description: '<script>alert("test")</script> & water', severity: 'high', reporterPhone: '5551234567' };
    const created = await post(input);
    assert.equal(created.status, 201);
    assert.equal(created.body.isResolved, false);
    assert.ok(Number.isInteger(created.body.id));
    assert.ok(Number.isFinite(Date.parse(created.body.createdAt)));
    assert.equal(messages.length, 1);
    assert.deepEqual(messages[0].recipients, ['cuadrilla@example.test']);
    const raw = messages[0].raw.replace(/=\r?\n/g, '');
    for (const value of [address, 'high', input.reporterPhone, '&lt;script&gt;']) assert.ok(raw.includes(value));
    const html = generateReportTemplate(input);
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('&amp; water'));
    assert.ok(!html.includes('<script>'));
    const listed = await fetch(`${base}/reports`);
    assert.equal(listed.status, 200);
    assert.ok((await listed.json()).some(report => report.id === created.body.id));
    for (const change of [{ severity: 'urgent' }, { address: ' ' }, { description: '' }, { reporterPhone: 123 }, { isResolved: true }]) {
      assert.equal((await post({ ...input, ...change })).status, 400);
    }
    assert.equal(messages.length, 1);
    const count = async () => Number((await app.get(DataSource).query('SELECT count(*) FROM "WATER_REPORT" WHERE "address" = $1', [address]))[0].count);
    assert.equal(await count(), 1);
    rejectMail = true;
    const failed = await post(input);
    assert.equal(failed.status, 503);
    assert.ok(Number.isInteger(failed.body.reportId));
    assert.equal(await count(), 2);
    assert.equal(messages.length, 1);
    console.log('OK: persistence, listing, defaults, DTO validation, SMTP delivery, HTML escaping and saved report on SMTP failure.');
  } finally {
    if (app) {
      try {
        const { DataSource } = require('typeorm');
        await app.get(DataSource).query('DELETE FROM "WATER_REPORT" WHERE "address" = $1', [address]);
      } finally { await app.close(); }
    }
    await new Promise(resolve => smtp.close(resolve));
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
