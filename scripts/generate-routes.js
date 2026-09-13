import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Copy .htaccess into dist
const htaccessPath = path.resolve('public/.htaccess');
if (fs.existsSync(htaccessPath)) {
  fs.copyFileSync(htaccessPath, path.join(distDir, '.htaccess'));
  console.log('✓ Copied .htaccess to dist/');
}

// 404 fallback
fs.writeFileSync(path.join(distDir, '404.html'), indexContent);

const routes = [
  'ega',
  'ega/login',
  'ega/competitions',
  'ega/leaderboard',
  'ega/subjects',
  'ega/locations',
  'ega/team',
  'ega/users',
  'ega/proctoring',
  'ega/certificates',
  'ega/finance',
  'ega/notifications',
  'ega/support',
  'ega/packages',
  'ega/security',
  'admin',
  'admin/login',
  'dashboard',
  'student/olympiads',
  'student/leaderboard',
  'results',
  'certificates',
  'profile',
  'olympiads',
  'leaderboard',
  'about',
  'terms',
  'privacy',
  'rules',
  'auth/login',
  'auth/register',
  'auth/forgot-password'
];

routes.forEach((route) => {
  const dir = path.join(distDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), indexContent);
});

console.log(`✓ Successfully generated route directories for ${routes.length} routes.`);
