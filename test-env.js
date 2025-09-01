#!/usr/bin/env node
import 'dotenv/config';
// Simple script to test environment variables
// require('dotenv').config();

console.log('🔍 Testing Environment Variables...\n');

const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalVars = [
  'DATABASE_URL',
  'RECALL_API_KEY',
  'JIRA_CLIENT_ID',
  'JIRA_CLIENT_SECRET'
];

console.log('✅ Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  - ${varName}: not set`);
  }
});

console.log('\n🔧 Google OAuth Configuration:');
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientId && clientSecret) {
  console.log('  ✓ Google OAuth is configured');
  console.log(`  ✓ Client ID format: ${clientId.endsWith('.apps.googleusercontent.com') ? 'Valid' : 'Invalid'}`);
  console.log(`  ✓ Client Secret: ${clientSecret.length > 10 ? 'Valid length' : 'Too short'}`);
} else {
  console.log('  ❌ Google OAuth is NOT configured');
  console.log('  📝 Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file');
}

console.log('\n🌐 URLs:');
console.log(`  Callback Base URL: ${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}`);
console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5000'}`);
console.log(`  Google Redirect URI: ${process.env.CALLBACK_BASE_URL || 'http://localhost:5000'}/api/auth/google/callback`);

console.log('\n✨ Environment check complete!');
