const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const headers = {
      'x-bypass-rate-limit': 'true',
      ...(options.headers || {})
    };
    const reqOptions = { ...options, headers };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

function parseCookie(setCookieHeaders, cookieName = 'trustflow_token') {
  if (!setCookieHeaders) return null;
  const cookies = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  for (const cookieStr of cookies) {
    if (cookieStr.startsWith(`${cookieName}=`)) {
      const parts = cookieStr.split(';');
      const value = parts[0].substring(cookieName.length + 1);
      const isHttpOnly = cookieStr.toLowerCase().includes('httponly');
      return { value, isHttpOnly, raw: cookieStr };
    }
  }
  return null;
}

async function runAuthTests() {
  console.log('--- STARTING TRUSTFLOW AUTHENTICATION & AUTHORIZATION SECURITY TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. MSME Demo Login with HttpOnly Cookie
    console.log('\n[1] Testing Login with Demo MSME credentials & HttpOnly cookie...');
    const msmeLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'msme@trustflow.demo', password: 'TrustFlow@123' }
    );

    assert(msmeLogin.status === 200, 'MSME login status should be 200');
    assert(msmeLogin.body.success === true, 'MSME login response should indicate success');
    assert(!msmeLogin.body.token, 'Login does NOT return JWT unnecessarily in JSON body');
    assert(msmeLogin.body.user.role === 'MSME', 'MSME user role should be MSME');
    assert(msmeLogin.body.user.unitId === 'U001', 'MSME user linked to unit U001');

    const msmeCookie = parseCookie(msmeLogin.headers['set-cookie']);
    assert(Boolean(msmeCookie), 'Login sets trustflow_token cookie');
    assert(msmeCookie?.isHttpOnly === true, 'trustflow_token cookie is HttpOnly');

    // 2. GET /api/auth/me using Cookie
    console.log('\n[2] Testing GET /api/auth/me using HttpOnly Cookie...');
    const meWithCookie = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: `trustflow_token=${msmeCookie.value}` }
    });
    assert(meWithCookie.status === 200, '/api/auth/me works using HttpOnly cookie');
    assert(meWithCookie.body.user.email === 'msme@trustflow.demo', 'Returned user email matches authenticated user');

    // 3. GET /api/auth/me without Cookie
    console.log('\n[3] Testing GET /api/auth/me without Cookie...');
    const meNoCookie = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET'
    });
    assert(meNoCookie.status === 401, '/api/auth/me without cookie returns 401');

    // 4. GET /api/auth/me with Invalid Cookie
    console.log('\n[4] Testing GET /api/auth/me with Invalid Cookie...');
    const meInvalidCookie = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Cookie: 'trustflow_token=invalid_jwt_token_signature' }
    });
    assert(meInvalidCookie.status === 401, 'Invalid cookie returns 401');

    // 5. Logout Clears Cookie
    console.log('\n[5] Testing POST /api/auth/logout clears cookie...');
    const logoutRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: `trustflow_token=${msmeCookie.value}` }
    });
    assert(logoutRes.status === 200, 'Logout status 200');
    assert(logoutRes.body.success === true, 'Logout response contains success: true');
    const setCookieHeader = logoutRes.headers['set-cookie'] || [];
    const isCleared = setCookieHeader.some((c) =>
      c.includes('trustflow_token=;') || c.includes('Max-Age=0') || c.includes('Expires=')
    );
    assert(isCleared, 'Logout clears authentication cookie');

    // 6. Registration & Password Policy Validation
    console.log('\n[6] Testing Password Policy (min 8 chars) & Registration Cookie...');
    const shortPassRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { name: 'Short Pass User', email: `short_${Date.now()}@demo.com`, password: 'short', role: 'MSME' }
    );
    assert(shortPassRes.status === 400, 'Password shorter than 8 characters is rejected (400)');

    const msme2Email = `msme_u002_${Date.now()}@trustflow.demo`;
    const msme2Register = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Sri Lakshmi Knit Works Manager',
        email: msme2Email,
        password: 'Password123',
        role: 'MSME',
        unitId: 'U002'
      }
    );

    assert(msme2Register.status === 201, 'Registration with valid password (>=8 chars) succeeds (201)');
    assert(!msme2Register.body.token, 'Registration does NOT return JWT in response body');
    const msme2Cookie = parseCookie(msme2Register.headers['set-cookie']);
    assert(Boolean(msme2Cookie) && msme2Cookie.isHttpOnly, 'Registration sets HttpOnly authentication cookie');

    // 7. Wrong Password Rejection
    console.log('\n[7] Testing Wrong Password Rejection...');
    const wrongPassRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'msme@trustflow.demo', password: 'WrongPassword123' }
    );
    assert(wrongPassRes.status === 401, 'Wrong password rejected (401)');
    assert(wrongPassRes.body.message === 'Invalid email or password', 'Generic error message on wrong password');

    // 8. Protected MSME endpoint with valid cookie
    console.log('\n[8] Testing GET /api/invoices for MSME U001 with cookie...');
    const msme1Invoices = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/invoices',
      method: 'GET',
      headers: { Cookie: `trustflow_token=${msmeCookie.value}` }
    });

    assert(msme1Invoices.status === 200, 'GET /api/invoices status 200 with cookie');
    assert(
      msme1Invoices.body.invoices.every((i) => i.unitId === 'U001'),
      'MSME U001 receives only U001 invoices'
    );

    // 9. Financier Demo Login & Role Restriction
    console.log('\n[9] Testing FINANCIER role restrictions...');
    const financierLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'financier@trustflow.demo', password: 'TrustFlow@123' }
    );

    assert(financierLogin.status === 200, 'Financier login status should be 200');
    const financierCookie = parseCookie(financierLogin.headers['set-cookie']);

    const financierAccessMsmeRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'GET',
      headers: { Cookie: `trustflow_token=${financierCookie.value}` }
    });
    assert(financierAccessMsmeRes.status === 403, 'FINANCIER role prohibited from MSME orders endpoint (403)');

    // 10. Cross-Unit Ownership Restrictions
    console.log('\n[10] Testing Cross-Unit Ownership Restrictions via Cookie...');
    const crossInvoiceRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/invoices/INV001',
      method: 'GET',
      headers: { Cookie: `trustflow_token=${msme2Cookie.value}` }
    });

    assert(
      crossInvoiceRes.status === 404 || crossInvoiceRes.status === 403,
      'MSME U002 is denied access to U001 invoice INV001 (404/403)'
    );

    // 11. Rate Limiting Test
    console.log('\n[11] Testing Login Rate Limiting (repeated failed attempts)...');
    let rateLimited = false;
    const testRateLimitKey = `test-key-${Date.now()}`;
    for (let i = 0; i < 7; i++) {
      const res = await makeRequest(
        {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bypass-rate-limit': 'false',
            'x-test-rate-limit-key': testRateLimitKey
          }
        },
        { email: 'ratelimit@demo.com', password: 'InvalidPasswordRepeat' }
      );
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    assert(rateLimited, 'Rate limiting activates (429 Too Many Requests) after repeated failed attempts');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runAuthTests();
