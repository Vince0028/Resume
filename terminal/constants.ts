export const THEME_COLOR = "text-indigo-500";
export const THEME_BORDER = "border-indigo-500/40";
export const THEME_BG = "bg-indigo-950/20";
export const THEME_GLOW = "shadow-[0_0_15px_rgba(99,102,241,0.15)]";

export const RESUME_DATA = `
NAME: Vince Nelmar Pega Alobin
ROLE: Information Technology Student
LOCATION: Pasay City, Philippines
EXP_LEVEL: 2nd Year BSIT, Asia Pacific College

CORE SKILLS:
- Web Development: HTML, CSS, JavaScript, Python, SQL
- Computer Programming: Python, C/C++, JavaScript
- Computer Animation: Visual Effects, Three.js
- Video Editing: Multimedia Content

PROJECTS:
1. Driver-expression-detector - Detects driver expressions and triggers buzzer for safety.
2. DengueTect - Dengue risk calculator and news site (deployed, prototype).
3. Student-Portal - Student monitoring/engagement platform (deployed, prototype).
4. AnaLytics - Rice retailer/customer web app (deployed, prototype).
5. benPDF - Multi-tool converter (deployed, prototype).
6. SmartShut - Arduino smart light system (prototype).
7. vahdecs - Voice assistant for elderly (prototype).
8. VeriFace - Automated attendance via facial recognition (prototype).

CONTACT:
- Email: alobinvince@gmail.com
- GitHub: github.com/Vince0028
- Facebook: facebook.com
- LinkedIn: linkedin.com

BIO:
Aspiring IT professional passionate about web development, creative coding, and building practical tech solutions. 
Enjoys blending design, code, and automation for real-world impact.
`;

export const INITIAL_BOOT_SEQUENCE = [
  "BIOS DATE 01/01/2088 14:22:51 VER 1.0.9",
  "CPU: QUANTUM CORE I9 @ 50.0 GHZ",
  "DETECTING PRIMARY MASTER ... LOCKED",
  "DETECTING PRIMARY SLAVE ... LOCKED",
  "BOOTING FROM NETWORK ... SUCCESS",
  "LOADING KERNEL ... OK",
  "MOUNTING FILESYSTEMS ... OK",
  "INITIALIZING NEURAL LINK ... CONNECTED",
  "WELCOME TO CIPHER OS v9.0",
  "TYPE 'help' FOR AVAILABLE COMMANDS OR ASK A QUESTION."
];

export const RESUME_FALLBACK_URLS = [
  '../index.html?resume=1',
  '../index.html'
];

export interface FileSystemNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  path?: string;
  restricted?: boolean;
  children?: FileSystemNode[];
}

export const FILE_SYSTEM: FileSystemNode[] = [
  {
    name: '.github',
    type: 'dir',
    restricted: true,
    children: [
      { name: 'workflows', type: 'dir', children: [{ name: 'deploy.yml', type: 'file' }] }
    ]
  },
  {
    name: 'src',
    type: 'dir',
    restricted: true,
    children: [
      { name: 'components', type: 'dir', children: [{ name: 'Terminal.tsx', type: 'file' }] },
      { name: 'utils', type: 'dir', children: [{ name: 'helpers.ts', type: 'file' }] }
    ]
  },
  { name: '.env', type: 'file', restricted: true },
  { name: '.gitignore', type: 'file', restricted: true },
  { name: 'LICENSE', type: 'file', restricted: true },
  { name: 'README.md', type: 'file', restricted: true },
  { name: 'privacy_policy.txt', type: 'file', restricted: true },
  { name: 'package.json', type: 'file', restricted: true },
  { name: 'tsconfig.json', type: 'file', restricted: true },
  { name: 'vite.config.ts', type: 'file', restricted: true },
  { name: 'index.html', type: 'file', path: '../index.html', restricted: false },
  { name: 'styles.css', type: 'file', path: '../styles.css', restricted: false },
  { name: 'script.js', type: 'file', path: '../script.js', restricted: false },
  { name: 'lanyard-3d.js', type: 'file', path: '../lanyard-3d.js', restricted: false },
  { name: 'github-contributions.js', type: 'file', path: '../github-contributions.js', restricted: false },
  { name: 'skillset-order.js', type: 'file', path: '../skillset-order.js', restricted: false },
];