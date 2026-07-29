import { spawn } from 'child_process';
import { createServer } from 'http';

async function main() {
  console.log('Starting dev server...');
  const server = spawn('npx', ['next', 'dev', '--port', '3000'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.stdout.on('data', (data) => {
    const msg = data.toString();
    process.stdout.write(msg);
    if (msg.includes('Ready') || msg.includes('localhost:3000')) {
      console.log('\nServer is ready! Testing...');
      testPages();
    }
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  async function testPages() {
    const pages = [
      '/en',
      '/en/properties',
      '/en/admin',
      '/en/properties/riverside-views-damac',
    ];

    for (const page of pages) {
      try {
        const resp = await fetch(`http://localhost:3000${page}`, { signal: AbortSignal.timeout(5000) });
        console.log(`  ${page} -> ${resp.status} ${resp.statusText}`);
      } catch (e) {
        console.log(`  ${page} -> ERROR ${e.message}`);
      }
    }

    console.log('\nTests done. Stopping server...');
    server.kill();
    process.exit(0);
  }

  setTimeout(() => {
    console.log('Timeout - server not ready after 30s');
    server.kill();
    process.exit(1);
  }, 30000);
}

main();
