#!/usr/bin/env node

/**
 * Development Cache Clearing Script
 * 
 * This script helps clear various caches during development to ensure
 * fresh data and prevent caching issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Clearing development caches...\n');

// Clear Next.js cache
console.log('1. Clearing Next.js cache...');
try {
  const nextCacheDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextCacheDir)) {
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
    console.log('   ✅ Next.js cache cleared');
  } else {
    console.log('   ℹ️  No Next.js cache found');
  }
} catch (error) {
  console.log('   ⚠️  Error clearing Next.js cache:', error.message);
}

// Clear node_modules cache (optional)
console.log('\n2. Clearing node_modules cache...');
try {
  const nodeModulesDir = path.join(__dirname, 'node_modules', '.cache');
  if (fs.existsSync(nodeModulesDir)) {
    fs.rmSync(nodeModulesDir, { recursive: true, force: true });
    console.log('   ✅ Node modules cache cleared');
  } else {
    console.log('   ℹ️  No node_modules cache found');
  }
} catch (error) {
  console.log('   ⚠️  Error clearing node_modules cache:', error.message);
}

// Clear TypeScript cache
console.log('\n3. Clearing TypeScript cache...');
try {
  const tsCacheDir = path.join(__dirname, '.tsbuildinfo');
  if (fs.existsSync(tsCacheDir)) {
    fs.unlinkSync(tsCacheDir);
    console.log('   ✅ TypeScript cache cleared');
  } else {
    console.log('   ℹ️  No TypeScript cache found');
  }
} catch (error) {
  console.log('   ⚠️  Error clearing TypeScript cache:', error.message);
}

// Clear ESLint cache
console.log('\n4. Clearing ESLint cache...');
try {
  const eslintCacheDir = path.join(__dirname, '.eslintcache');
  if (fs.existsSync(eslintCacheDir)) {
    fs.unlinkSync(eslintCacheDir);
    console.log('   ✅ ESLint cache cleared');
  } else {
    console.log('   ℹ️  No ESLint cache found');
  }
} catch (error) {
  console.log('   ⚠️  Error clearing ESLint cache:', error.message);
}

console.log('\n🎉 Cache clearing complete!');
console.log('\n📝 Next steps:');
console.log('   1. Restart your development server: npm run dev');
console.log('   2. Hard refresh your browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
console.log('   3. Open Developer Tools and disable cache in Network tab');
console.log('\n💡 Pro tip: Keep Developer Tools open with "Disable cache" checked during development!');
