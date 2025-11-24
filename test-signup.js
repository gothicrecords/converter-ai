// Test registrazione utente
async function testSignup() {
    try {
        console.log('Testing signup API...');
        
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });

        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Signup successful!');
        } else {
            console.log('❌ Signup failed:', data.error);
        }
    } catch (error) {
        console.error('❌ Request error:', error);
    }
}

testSignup();
