// Quick connection test for signup and OAuth endpoints
async function testEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing server connectivity...\n');
  
  // Test 1: Server health
  try {
    const homeResponse = await fetch(baseUrl);
    console.log('✅ Server is running:', homeResponse.status);
  } catch (err) {
    console.error('❌ Server not reachable:', err.message);
    process.exit(1);
  }
  
  // Test 2: Signup endpoint (POST with test data)
  console.log('\n📝 Testing signup endpoint...');
  try {
    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpass123'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('Signup response status:', signupResponse.status);
    console.log('Signup response body:', JSON.stringify(signupData, null, 2));
    
    if (signupResponse.ok) {
      console.log('✅ Signup endpoint working');
    } else {
      console.log('⚠️  Signup returned error:', signupData.error || signupData.message);
    }
  } catch (err) {
    console.error('❌ Signup endpoint failed:', err.message);
  }
  
  // Test 3: Google OAuth init (GET, should redirect)
  console.log('\n🔐 Testing Google OAuth init...');
  try {
    const oauthResponse = await fetch(`${baseUrl}/api/auth/oauth/google`, {
      redirect: 'manual'
    });
    
    console.log('OAuth init status:', oauthResponse.status);
    
    if (oauthResponse.status === 302 || oauthResponse.status === 307) {
      const location = oauthResponse.headers.get('location');
      console.log('✅ OAuth redirect working');
      console.log('Redirect to:', location?.substring(0, 80) + '...');
    } else {
      console.log('⚠️  OAuth init unexpected status:', oauthResponse.status);
      const text = await oauthResponse.text();
      console.log('Response:', text.substring(0, 200));
    }
  } catch (err) {
    console.error('❌ OAuth init failed:', err.message);
  }
  
  // Test 4: Database connection (via a safe read endpoint if available)
  console.log('\n💾 Database connection check...');
  console.log('(Will show in signup attempt above if DB is accessible)');
}

testEndpoints().catch(console.error);
