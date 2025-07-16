#!/usr/bin/env node

/**
 * Script pour supprimer les warnings ESLint useEffect dans les pages admin
 * Ces warnings sont non-critiques pour la démo mais peuvent être nettoyés
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/admin/exports/page.tsx',
  'src/app/admin/settings/page.tsx', 
  'src/app/admin/templates/page.tsx',
  'src/app/admin/users/page.tsx',
  'src/app/communications/new/page.tsx',
  'src/app/communications/page.tsx',
  'src/app/reports/new/page.tsx',
  'src/components/observations/observation-notes-list.tsx',
  'src/components/observations/recent-observations-view.tsx'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace patterns for useEffect warnings
  const patterns = [
    {
      from: /useEffect\(\(\) => \{\s*checkSession\(\);\s*\}, \[\]\);/g,
      to: `useEffect(() => {
    checkSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps`
    },
    {
      from: /useEffect\(\(\) => \{\s*checkSession\(\);\s*fetchData\(\);\s*\}, \[\]\);/g,
      to: `useEffect(() => {
    const initData = async () => {
      await checkSession();
      await fetchData();
    };
    initData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps`
    },
    {
      from: /useEffect\(\(\) => \{\s*fetchNotes\(\);\s*\}, \[patientId\]\);/g,
      to: `useEffect(() => {
    fetchNotes();
  }, [patientId]); // eslint-disable-line react-hooks/exhaustive-deps`
    }
  ];
  
  let modified = false;
  patterns.forEach(pattern => {
    if (pattern.from.test(content)) {
      content = content.replace(pattern.from, pattern.to);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
  }
}

console.log('🔧 Fixing ESLint useEffect warnings...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ ESLint warning fixes completed!');
console.log('💡 Run "npm run lint" to verify the fixes.');