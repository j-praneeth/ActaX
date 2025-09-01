#!/usr/bin/env node

// Test script to verify OAuth configuration
import 'dotenv/config';

console.log('🔍 Testing Google OAuth Configuration...\n');

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`;

console.log('📋 Configuration:');
console.log(`  Client ID: ${clientId ? `${clientId.substring(0, 20)}...` : 'MISSING'}`);
console.log(`  Client Secret: ${clientSecret ? 'SET' : 'MISSING'}`);
console.log(`  Redirect URI: ${redirectUri}`);

if (!clientId || !clientSecret) {
  console.log('\n❌ Google OAuth is not properly configured!');
  console.log('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  process.exit(1);
}

// Test OAuth URL generation
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `scope=${encodeURIComponent('openid email profile https://www.googleapis.com/auth/calendar')}&` +
  `response_type=code&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log('\n🔗 Generated OAuth URL:');
console.log(authUrl);

console.log('\n✅ OAuth configuration looks good!');
console.log('\n📝 Next steps:');
console.log('1. Start your server: npm run dev');
console.log('2. Go to http://localhost:5000/login');
console.log('3. Click "Continue with Google"');
console.log('4. Complete the OAuth flow');
console.log('5. You should be redirected to the dashboard');
