import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    console.log('Loading .env from:', envPath);
    if (!fs.existsSync(envPath)) {
      console.error('.env file does not exist at path');
      return {};
    }
    let envFile = fs.readFileSync(envPath, 'utf8');
    // Strip BOM if present
    if (envFile.charCodeAt(0) === 0xFEFF) {
      envFile = envFile.slice(1);
    }
    const env = {};
    const lines = envFile.split(/\r?\n/); // Handle CRLF and LF
    console.log(`Read ${envFile.length} bytes, ${lines.length} lines.`);

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      } else {
        console.log(`Line ${index + 1} did not match regex: "${line}"`);
      }
    });
    console.log('Loaded keys:', Object.keys(env));
    return env;
  } catch (error) {
    console.error('Error reading .env file:', error.message);
    return {};
  }
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

console.log('Testing connection to:', SUPABASE_URL);
// Mask key for security in logs
console.log('Using key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'undefined');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Attempt to fetch from products table
    const { data, error } = await supabase.from('products').select('*').limit(1);

    if (error) {
      console.error('Connection FAILED:', error.message);
      if (error.code) console.error('Error Code:', error.code);
      if (error.hint) console.error('Hint:', error.hint);
    } else {
      console.log('Connection SUCCESSFUL!');
      console.log('Data retrieved (first item only):', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
