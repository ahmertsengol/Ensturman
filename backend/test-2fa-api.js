// Test 2FA API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test kullanıcı bilgileri (gerçek bir kullanıcı olmalı)
const TEST_USER = {
  email: 'ahmertsengol@gmail.com', // Kendi email'in
  password: 'test123456' // Test şifren (varsa)
};

let authToken = '';

async function testAPI() {
  console.log('🧪 Testing 2FA API endpoints...\n');

  try {
    // 1. Önce kullanıcı girişi yapalım (token almak için)
    console.log('1️⃣ Testing user login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/users/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      authToken = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log('🔑 Token received:', authToken.substring(0, 20) + '...');
    } catch (error) {
      console.log('⚠️  Login failed (expected if user doesn\'t exist)');
      console.log('Creating a test user first...');
      
      // Test kullanıcısı oluştur
      try {
        await axios.post(`${API_BASE}/users/register`, {
          username: 'testuser',
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        console.log('✅ Test user created');
        
        // Tekrar giriş yap
        const loginResponse = await axios.post(`${API_BASE}/users/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        authToken = loginResponse.data.token;
        console.log('✅ Login successful with new user');
      } catch (regError) {
        console.error('❌ Could not create/login user:', regError.response?.data?.error || regError.message);
        return;
      }
    }

    // 2. 2FA verification status kontrol et
    console.log('\n2️⃣ Testing verification status...');
    try {
      const statusResponse = await axios.get(`${API_BASE}/verification/password-change/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Verification status:', statusResponse.data);
    } catch (error) {
      console.error('❌ Status check failed:', error.response?.data?.error || error.message);
    }

    // 3. 2FA kod isteme
    console.log('\n3️⃣ Testing verification code request...');
    try {
      const requestResponse = await axios.post(`${API_BASE}/verification/password-change/request`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Verification code requested successfully!');
      console.log('📧 Response:', requestResponse.data);
      console.log('🎯 Check your email for the verification code!');
      
      return true; // Başarılı
    } catch (error) {
      console.error('❌ Code request failed:', error.response?.data?.error || error.message);
      if (error.response?.data) {
        console.error('📝 Full error response:', error.response.data);
      }
      return false;
    }

  } catch (error) {
    console.error('❌ General test error:', error.message);
    return false;
  }
}

// Test verification code
async function testVerifyCode(code) {
  console.log(`\n4️⃣ Testing verification code: ${code}`);
  try {
    const verifyResponse = await axios.post(`${API_BASE}/verification/password-change/verify`, {
      verificationCode: code
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Code verification successful!');
    console.log('📝 Response:', verifyResponse.data);
    return true;
  } catch (error) {
    console.error('❌ Code verification failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Test password change with 2FA
async function testPasswordChange(currentPassword, newPassword, verificationCode) {
  console.log('\n5️⃣ Testing password change with 2FA...');
  try {
    const changeResponse = await axios.put(`${API_BASE}/users/change-password`, {
      currentPassword,
      newPassword,
      verificationCode
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Password change successful!');
    console.log('📝 Response:', changeResponse.data);
    return true;
  } catch (error) {
    console.error('❌ Password change failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Ana test fonksiyonu
async function runTests() {
  const result = await testAPI();
  
  if (result) {
    console.log('\n🎉 2FA API Test SUCCESSFUL!');
    console.log('📧 A verification code has been sent to:', TEST_USER.email);
    console.log('\n📋 Next steps:');
    console.log('1. Check your email for the 6-digit code');
    console.log('2. Run: node test-verify-code.js YOUR_CODE');
    console.log('3. Example: node test-verify-code.js 123456');
  } else {
    console.log('\n❌ 2FA API Test FAILED!');
    console.log('Please check the errors above and fix them.');
  }
}

runTests();

// Export for manual testing
module.exports = { testVerifyCode, testPasswordChange }; 