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

// Fallback resume URLs (same-tab navigation). Update if your resume is served at a specific URL/port.
export const RESUME_FALLBACK_URLS = [
  // Prefer the site root with the `?resume=1` bypass so the client-side
  // redirect (which sends `/` to `/terminal/`) is bypassed and the
  // graphical resume is shown in the same tab on the deployed site.
  '/index.html?resume=1',
  '/index.html',
  '../index.html'
];