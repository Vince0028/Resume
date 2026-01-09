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
  "WELCOME TO BENBEN OS v9.0",
  "TYPE 'help' FOR AVAILABLE COMMANDS."
];

export const RESUME_FALLBACK_URLS = [
  '../html/index.html?resume=1',
  '../html/index.html'
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
    name: 'html',
    type: 'dir',
    restricted: false,
    children: [
      { name: 'index.html', type: 'file', path: '../html/index.html', restricted: false },
      { name: 'simple_portfolio.html', type: 'file', path: '../html/simple_portfolio.html', restricted: false },
      { name: 'resources.html', type: 'file', path: '../html/resources.html', restricted: false },
    ]
  },
  {
    name: 'css',
    type: 'dir',
    restricted: false,
    children: [
      { name: 'animations.css', type: 'file', path: '../css/animations.css', restricted: false },
      { name: 'components.css', type: 'file', path: '../css/components.css', restricted: false },
      { name: 'global.css', type: 'file', path: '../css/global.css', restricted: false },
      { name: 'layout.css', type: 'file', path: '../css/layout.css', restricted: false },
      { name: 'resources.css', type: 'file', path: '../css/resources.css', restricted: false },
      { name: 'sections.css', type: 'file', path: '../css/sections.css', restricted: false },
      { name: 'simple-portfolio.css', type: 'file', path: '../css/simple-portfolio.css', restricted: false },
      { name: 'styles.css', type: 'file', path: '../css/styles.css', restricted: false },
      { name: 'variables.css', type: 'file', path: '../css/variables.css', restricted: false },
    ]
  },
  {
    name: 'js',
    type: 'dir',
    restricted: false,
    children: [
      { name: 'github-contributions.js', type: 'file', path: '../js/github-contributions.js', restricted: false },
      { name: 'guestbook.js', type: 'file', path: '../js/guestbook.js', restricted: false },
      { name: 'lanyard-3d.js', type: 'file', path: '../js/lanyard-3d.js', restricted: false },
      { name: 'prompts-loader.js', type: 'file', path: '../js/prompts-loader.js', restricted: false },
      { name: 'prompts.js', type: 'file', path: '../js/prompts.js', restricted: false },
      { name: 'redirect.js', type: 'file', path: '../js/redirect.js', restricted: false },
      { name: 'script.js', type: 'file', path: '../js/script.js', restricted: false },
      { name: 'simple-portfolio.js', type: 'file', path: '../js/simple-portfolio.js', restricted: false },
      { name: 'skillset-order.js', type: 'file', path: '../js/skillset-order.js', restricted: false },
    ]
  },
  {
    name: 'Images',
    type: 'dir',
    restricted: false,
    children: [
      { name: 'web_logo.png', type: 'file', path: '../Images/web_logo.png', restricted: false },
    ]
  },
];