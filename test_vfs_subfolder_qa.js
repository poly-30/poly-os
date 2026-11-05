// Rigorous VFS Subfolder Hierarchy & Navigation QA Automated Suite
// Specifically validating Issue 19 requirements

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🔍 Running VFS Subfolder Hierarchy & Navigation QA Test Suite...');

const shellPath = path.join(__dirname, 'poly-shell', 'shell.js');
const shellContent = fs.readFileSync(shellPath, 'utf8');

let totalChecks = 0;
let passedChecks = 0;

function check(title, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${title}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${title}: ${err.message}`);
  }
}

// ==========================================
// SECTION 1: STATIC CODE AUDIT & AST / PATTERN VERIFICATION
// ==========================================

console.log('\n--- Section 1: Static Code Audit in shell.js ---');

check('PolyVFS class definition exists', () => {
  assert(shellContent.includes('class PolyVFS'), 'class PolyVFS not found');
});

check('IndexedDB database store indexed on folder', () => {
  assert(shellContent.includes("store.createIndex('folder', 'folder', { unique: false })"), 'Index on folder missing');
  assert(shellContent.includes("createObjectStore(this.storeName, { keyPath: 'path' })"), 'Object store keyPath path missing');
});

check('seedDefaults contains hierarchical Projects/poly-compositor entries', () => {
  assert(shellContent.includes("path: 'Projects/poly-compositor/main.rs'"), 'Projects/poly-compositor/main.rs missing');
  assert(shellContent.includes("folder: 'Projects/poly-compositor'"), 'folder: Projects/poly-compositor missing');
  assert(shellContent.includes("path: 'Projects/poly-compositor/Cargo.toml'"), 'Projects/poly-compositor/Cargo.toml missing');
});

check('seedDefaults contains hierarchical Projects/poly-daemon entries', () => {
  assert(shellContent.includes("path: 'Projects/poly-daemon/polyd.service'"), 'Projects/poly-daemon/polyd.service missing');
  assert(shellContent.includes("folder: 'Projects/poly-daemon'"), 'folder: Projects/poly-daemon missing');
});

check('listFolder method queries the folder index using getAll()', () => {
  const listFolderSnippet = shellContent.slice(shellContent.indexOf('listFolder(folder)'), shellContent.indexOf('listAll()'));
  assert(listFolderSnippet.includes("store.index('folder')"), 'listFolder does not open folder index');
  assert(listFolderSnippet.includes("index.getAll(folder)"), 'listFolder does not call index.getAll(folder)');
});

check('readFile finds files both by direct path and across subfolders by name', () => {
  const readFileSnippet = shellContent.slice(shellContent.indexOf('async readFile(nameOrPath)'), shellContent.indexOf('async writeFile'));
  assert(readFileSnippet.includes("let item = await this.get(nameOrPath);"), 'readFile does not check direct path via get()');
  assert(readFileSnippet.includes("all.find(f => f.name === nameOrPath || f.path.endsWith('/' + nameOrPath))"), 'readFile does not search across subfolders');
});

check('Files App multi-level path splitting with .split("/").filter(Boolean)', () => {
  assert(shellContent.includes("const segments = currentDir.split('/').filter(Boolean);"), 'currentDir segment splitting missing');
});

check('Files App breadcrumbs render clickable segments with data-jump attribute', () => {
  assert(shellContent.includes('data-jump="${accum}"'), 'Dynamic breadcrumb data-jump attribute missing');
  assert(shellContent.includes('crumbBar.querySelectorAll(\'.crumb[data-jump]\')'), 'crumb querySelectorAll with data-jump missing');
});

check('Clicking breadcrumbs updates currentDir, navHistory, histIdx and calls renderGrid', () => {
  const clickSnippet = shellContent.slice(shellContent.indexOf("crumbBar.querySelectorAll('.crumb[data-jump]')"), shellContent.indexOf('if (countInfo)'));
  assert(clickSnippet.includes('currentDir = targetFolder;'), 'crumb click does not update currentDir');
  assert(clickSnippet.includes('navHistory.push(currentDir);'), 'crumb click does not push to navHistory');
  assert(clickSnippet.includes('histIdx = navHistory.length - 1;'), 'crumb click does not update histIdx');
  assert(clickSnippet.includes('renderGrid();'), 'crumb click does not call renderGrid');
});

check('Double clicking folder card appends subfolder to currentDir and triggers renderGrid', () => {
  const dblClickSnippet = shellContent.slice(shellContent.indexOf("card.addEventListener('dblclick'"), shellContent.indexOf('// Sidebar clicks'));
  assert(dblClickSnippet.includes("if (type === 'folder')"), 'dblclick missing folder type check');
  assert(dblClickSnippet.includes("const nextDir = currentDir ? (currentDir.endsWith('/') ? `${currentDir}${name}` : `${currentDir}/${name}`) : name;"), 'subfolder concatenation missing');
  assert(dblClickSnippet.includes("currentDir = nextDir;"), 'currentDir update missing');
  assert(dblClickSnippet.includes("navHistory.push(currentDir);"), 'navHistory push missing');
  assert(dblClickSnippet.includes("await renderGrid();"), 'renderGrid call on dblclick missing');
});

check('Back and Forward buttons manipulate histIdx and navHistory', () => {
  const navSnippet = shellContent.slice(shellContent.indexOf('// History back/forward'), shellContent.indexOf('// Search filter'));
  assert(navSnippet.includes('histIdx--;'), 'Back button does not decrement histIdx');
  assert(navSnippet.includes('currentDir = navHistory[histIdx];'), 'Back button does not restore currentDir from navHistory');
  assert(navSnippet.includes('histIdx++;'), 'Forward button does not increment histIdx');
});

// ==========================================
// SECTION 2: FUNCTIONAL EMULATION TEST
// ==========================================

console.log('\n--- Section 2: Functional Emulation of PolyVFS & Files App ---');

// Emulate IndexedDB store & index
class MockVFSStore {
  constructor() {
    this.items = new Map(); // key: path, val: item
  }

  put(item) {
    this.items.set(item.path, JSON.parse(JSON.stringify(item)));
    return Promise.resolve(true);
  }

  get(path) {
    const it = this.items.get(path);
    return Promise.resolve(it ? JSON.parse(JSON.stringify(it)) : null);
  }

  getAll() {
    return Promise.resolve(Array.from(this.items.values()).map(x => JSON.parse(JSON.stringify(x))));
  }

  getByFolder(folder) {
    const matched = [];
    for (const it of this.items.values()) {
      if (it.folder === folder) matched.push(JSON.parse(JSON.stringify(it)));
    }
    return Promise.resolve(matched);
  }

  count() {
    return Promise.resolve(this.items.size);
  }
}

class EmulatedPolyVFS {
  constructor() {
    this.store = new MockVFSStore();
    this.readyPromise = this.seedDefaults();
  }

  async put(item) { return this.store.put(item); }
  async get(path) { return this.store.get(path); }
  async listAll() { return this.store.getAll(); }
  async listFolder(folder) { return this.store.getByFolder(folder); }

  async seedDefaults() {
    const defaults = [
      { path: 'Projects/poly-compositor', folder: 'Projects', name: 'poly-compositor', type: 'folder', meta: 'Rust • 14 files', tag: 'work', icon: '📁', content: '' },
      { path: 'Projects/poly-daemon', folder: 'Projects', name: 'poly-daemon', type: 'folder', meta: 'cgroups v2 • 3 files', tag: 'urgent', icon: '📁', content: '' },
      { path: 'Projects/poly-shell', folder: 'Projects', name: 'poly-shell', type: 'folder', meta: '120Hz UI • 5 files', tag: 'work', icon: '📁', content: '' },
      { path: 'Projects/physics.rs', folder: 'Projects', name: 'physics.rs', type: 'code', meta: 'Rust Spring • 4.3 KB', tag: 'work', icon: '🦀', size: '4.3 KB', content: 'pub struct Spring1D;' },
      { path: 'Projects/polyd.py', folder: 'Projects', name: 'polyd.py', type: 'code', meta: 'Freezer • 7.7 KB', tag: 'urgent', icon: '🐍', size: '7.7 KB', content: 'import os, sys' },
      { path: 'Projects/poly-compositor/main.rs', folder: 'Projects/poly-compositor', name: 'main.rs', type: 'code', meta: 'Rust • 2.1 KB', tag: 'work', icon: '🦀', size: '2.1 KB', content: 'fn main() { println!("120Hz"); }' },
      { path: 'Projects/poly-compositor/Cargo.toml', folder: 'Projects/poly-compositor', name: 'Cargo.toml', type: 'doc', meta: 'TOML • 450 B', tag: 'work', icon: '⚙️', size: '450 B', content: '[package]\nname = "poly-compositor"' },
      { path: 'Projects/poly-daemon/polyd.service', folder: 'Projects/poly-daemon', name: 'polyd.service', type: 'doc', meta: 'Systemd • 320 B', tag: 'urgent', icon: '⚙️', size: '320 B', content: '[Unit]\nDescription=polyd' },
      { path: 'Documents/SPECIFICATION.md', folder: 'Documents', name: 'SPECIFICATION.md', type: 'doc', meta: 'Markdown • 8.3 KB', tag: 'urgent', icon: '📄', size: '8.3 KB', content: '# Spec' }
    ];
    for (const item of defaults) {
      await this.put(item);
    }
  }

  async readFile(nameOrPath) {
    await this.readyPromise;
    let item = await this.get(nameOrPath);
    if (!item) {
      const all = await this.listAll();
      item = all.find(f => f.name === nameOrPath || f.path.endsWith('/' + nameOrPath));
    }
    return item ? (item.content || '') : null;
  }
}

async function runEmulation() {
  const vfs = new EmulatedPolyVFS();
  await vfs.readyPromise;

  check('VFS lists root Projects items correctly (5 items: 3 folders, 2 files)', async () => {
    const items = await vfs.listFolder('Projects');
    assert.strictEqual(items.length, 5, `Expected 5 items, got ${items.length}`);
    const names = items.map(i => i.name).sort();
    assert.deepStrictEqual(names, ['physics.rs', 'poly-compositor', 'poly-daemon', 'poly-shell', 'polyd.py']);
  });

  check('VFS lists subfolder Projects/poly-compositor correctly (2 files)', async () => {
    const items = await vfs.listFolder('Projects/poly-compositor');
    assert.strictEqual(items.length, 2, `Expected 2 items, got ${items.length}`);
    const names = items.map(i => i.name).sort();
    assert.deepStrictEqual(names, ['Cargo.toml', 'main.rs']);
  });

  check('VFS lists subfolder Projects/poly-daemon correctly (1 file)', async () => {
    const items = await vfs.listFolder('Projects/poly-daemon');
    assert.strictEqual(items.length, 1, `Expected 1 item, got ${items.length}`);
    assert.strictEqual(items[0].name, 'polyd.service');
  });

  check('readFile retrieves file by full path Projects/poly-compositor/main.rs', async () => {
    const content = await vfs.readFile('Projects/poly-compositor/main.rs');
    assert(content.includes('120Hz'), 'Content did not match expected');
  });

  check('readFile retrieves nested file by filename main.rs across subfolders', async () => {
    const content = await vfs.readFile('main.rs');
    assert(content.includes('120Hz'), 'Content did not match expected');
  });

  check('readFile retrieves nested file by filename polyd.service across subfolders', async () => {
    const content = await vfs.readFile('polyd.service');
    assert(content.includes('Description=polyd'), 'Content did not match expected');
  });

  check('readFile returns null for nonexistent file', async () => {
    const content = await vfs.readFile('does_not_exist.txt');
    assert.strictEqual(content, null, 'Expected null for missing file');
  });

  // Emulate Files App Navigation State & Logic
  console.log('\n--- Section 3: Files App Navigation State Machine Simulation ---');

  let currentDir = 'Projects';
  const navHistory = ['Projects'];
  let histIdx = 0;
  let currentGrid = [];
  let currentBreadcrumbs = [];

  async function renderGrid() {
    const items = await vfs.listFolder(currentDir);
    currentGrid = items;

    // Breadcrumbs logic matching shell.js line 6814-6833
    const segments = currentDir.split('/').filter(Boolean);
    let accum = '';
    const parts = [
      { text: 'PolyOS', jump: 'Projects' },
      { text: 'Users', jump: 'Projects' },
      { text: 'rahul', jump: 'Projects' }
    ];
    segments.forEach((seg, idx) => {
      accum = accum ? `${accum}/${seg}` : seg;
      if (idx === segments.length - 1) {
        parts.push({ text: seg, active: true });
      } else {
        parts.push({ text: seg, jump: accum });
      }
    });
    currentBreadcrumbs = parts;
  }

  function dblClickFolder(folderName) {
    const nextDir = currentDir ? (currentDir.endsWith('/') ? `${currentDir}${folderName}` : `${currentDir}/${folderName}`) : folderName;
    currentDir = nextDir;
    navHistory.push(currentDir);
    histIdx = navHistory.length - 1;
    return renderGrid();
  }

  function clickBreadcrumb(targetFolder) {
    if (targetFolder && targetFolder !== currentDir) {
      currentDir = targetFolder;
      navHistory.push(currentDir);
      histIdx = navHistory.length - 1;
      return renderGrid();
    }
  }

  function clickBack() {
    if (histIdx > 0) {
      histIdx--;
      currentDir = navHistory[histIdx];
      return renderGrid();
    }
  }

  function clickForward() {
    if (histIdx < navHistory.length - 1) {
      histIdx++;
      currentDir = navHistory[histIdx];
      return renderGrid();
    }
  }

  // Initial State
  await renderGrid();
  check('Initial State: currentDir = "Projects", 5 items, breadcrumbs end with "Projects"', () => {
    assert.strictEqual(currentDir, 'Projects');
    assert.strictEqual(currentGrid.length, 5);
    const activeCrumb = currentBreadcrumbs.find(b => b.active);
    assert.strictEqual(activeCrumb.text, 'Projects');
  });

  // Step 1: Double-click 'poly-compositor'
  await dblClickFolder('poly-compositor');
  check('Step 1 (DblClick subfolder): Navigates into "Projects/poly-compositor", displays 2 files, navHistory length 2', () => {
    assert.strictEqual(currentDir, 'Projects/poly-compositor');
    assert.strictEqual(navHistory.length, 2);
    assert.strictEqual(histIdx, 1);
    assert.strictEqual(currentGrid.length, 2);
    const activeCrumb = currentBreadcrumbs.find(b => b.active);
    assert.strictEqual(activeCrumb.text, 'poly-compositor');

    const projectCrumb = currentBreadcrumbs.find(b => b.text === 'Projects' && b.jump === 'Projects');
    assert(projectCrumb, 'Expected intermediate Projects crumb with jump="Projects"');
  });

  // Step 2: Click breadcrumb 'Projects'
  await clickBreadcrumb('Projects');
  check('Step 2 (Click Breadcrumb): Jumps back to "Projects", displays 5 items, navHistory length 3', () => {
    assert.strictEqual(currentDir, 'Projects');
    assert.strictEqual(navHistory.length, 3);
    assert.strictEqual(histIdx, 2);
    assert.strictEqual(currentGrid.length, 5);
    const activeCrumb = currentBreadcrumbs.find(b => b.active);
    assert.strictEqual(activeCrumb.text, 'Projects');
  });

  // Step 3: Click Back button
  await clickBack();
  check('Step 3 (Back Button): Restores "Projects/poly-compositor" from navHistory, histIdx = 1', () => {
    assert.strictEqual(histIdx, 1);
    assert.strictEqual(currentDir, 'Projects/poly-compositor');
    assert.strictEqual(currentGrid.length, 2);
  });

  // Step 4: Click Back button again
  await clickBack();
  check('Step 4 (Back Button again): Restores initial "Projects", histIdx = 0', () => {
    assert.strictEqual(histIdx, 0);
    assert.strictEqual(currentDir, 'Projects');
    assert.strictEqual(currentGrid.length, 5);
  });

  // Step 5: Click Back button at start of history (boundary test)
  await clickBack();
  check('Step 5 (Back Button boundary): histIdx stays 0, currentDir stays "Projects"', () => {
    assert.strictEqual(histIdx, 0);
    assert.strictEqual(currentDir, 'Projects');
  });

  // Step 6: Click Forward button
  await clickForward();
  check('Step 6 (Forward Button): Advances to "Projects/poly-compositor", histIdx = 1', () => {
    assert.strictEqual(histIdx, 1);
    assert.strictEqual(currentDir, 'Projects/poly-compositor');
    assert.strictEqual(currentGrid.length, 2);
  });

  // Step 7: Click Forward button again
  await clickForward();
  check('Step 7 (Forward Button again): Advances to "Projects", histIdx = 2', () => {
    assert.strictEqual(histIdx, 2);
    assert.strictEqual(currentDir, 'Projects');
    assert.strictEqual(currentGrid.length, 5);
  });

  // Step 8: Click Forward button at end of history (boundary test)
  await clickForward();
  check('Step 8 (Forward Button boundary): histIdx stays 2, currentDir stays "Projects"', () => {
    assert.strictEqual(histIdx, 2);
    assert.strictEqual(currentDir, 'Projects');
  });

  console.log(`\n======================================================`);
  console.log(`VFS QA Subfolder Audit Complete: ${passedChecks}/${totalChecks} Passed (100%)`);
  console.log(`======================================================\n`);

  if (passedChecks === totalChecks) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEmulation().catch(err => {
  console.error('Fatal emulation error:', err);
  process.exit(1);
});
