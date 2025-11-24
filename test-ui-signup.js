// Test signup from browser-like environment
async function testSignupFromUI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('📝 Testing signup as if from browser form...\n');
  
  const testEmail = `user${Date.now()}@test.com`;
  const testData = {
    name: 'Test Browser User',
    email: testEmail,
    password: 'test123456'
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Origin': baseUrl,
        'Referer': `${baseUrl}/signup`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('\n✅ Response JSON:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.sessionToken) {
        console.log('\n✅ Session token received:', data.sessionToken.substring(0, 20) + '...');
      }
    } else {
      const text = await response.text();
      console.log('\n⚠️  Non-JSON response:');
      console.log(text.substring(0, 500));
    }
    
    // Test immediate login with same credentials
    console.log('\n\n🔐 Testing login with same credentials...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl
      },
      body: JSON.stringify({
        email: testEmail,
        password: testData.password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    
  } catch (error) {
    console.error('\n❌ Fetch error:', error.message);
    console.error('Error details:', error);
  }
}

testSignupFromUI().catch(console.error);
