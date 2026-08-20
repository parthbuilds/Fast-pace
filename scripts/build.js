const { execSync } = require('child_process');

console.log('[Fast Pace Build] Starting build sequence...');

if (process.env.VERCEL === '1') {
  console.log('[Fast Pace Build] Vercel environment detected. Initializing production SQLite database...');
  try {
    // Run db push to sync schema and create the sqlite database file
    console.log('[Fast Pace Build] Running: prisma db push');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

    // Generate Prisma Client
    console.log('[Fast Pace Build] Running: prisma generate');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Seed the database with Bangalore demo data
    console.log('[Fast Pace Build] Running: tsx prisma/seed.ts');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
  } catch (err) {
    console.error('[Fast Pace Build] Database preparation failed:', err);
    process.exit(1);
  }
} else {
  console.log('[Fast Pace Build] Local environment detected. Skipping automatic DB migrations (use start.sh or manual commands).');
}

console.log('[Fast Pace Build] Compiling Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('[Fast Pace Build] Compilation complete!');
} catch (err) {
  console.error('[Fast Pace Build] Next.js build failed:', err);
  process.exit(1);
}
