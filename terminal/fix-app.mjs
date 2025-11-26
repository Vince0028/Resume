import fs from 'fs';

const filePath = './App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add the import
content = content.replace(
    "import VirtualKeyboard from './components/VirtualKeyboard';",
    "import VirtualKeyboard from './components/VirtualKeyboard';\nimport OctahedronNetwork from './components/OctahedronNetwork';"
);

// Replace the sun visualization with octahedron
// Find the start: <div className="w-40 h-40 md:w-48 md:h-48 relative">
// Find the end: the closing </div> before </div> that closes flex-1
const sunStart = content.indexOf('<div className="w-40 h-40 md:w-48 md:h-48 relative">');
if (sunStart !== -1) {
    // Find the matching closing div - count opening and closing divs
    let depth = 1;
    let pos = sunStart + '<div className="w-40 h-40 md:w-48 md:h-48 relative">'.length;
    while (depth > 0 && pos < content.length) {
        if (content.substr(pos, 4) === '<div') {
            depth++;
            pos += 4;
        } else if (content.substr(pos, 6) === '</div>') {
            depth--;
            if (depth === 0) {
                // Found the closing tag
                const sunEnd = pos + 6;
                const before = content.substring(0, sunStart);
                const after = content.substring(sunEnd);
                content = before + '<OctahedronNetwork networkLevel={networkLevel} />' + after;
                break;
            }
            pos += 6;
        } else {
            pos++;
        }
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated App.tsx');
