import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
    console.log('Fetching world atlas data...');
    const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    if (!response.ok) throw new Error('Failed to fetch world atlas');
    const topology = await response.json();

    console.log('Processing topology...');
    const countries = topojson.feature(topology, topology.objects.countries);
    const generatedPoints = [];

    console.log('Generating points...');
    let count = 0;

    
    for (let lat = -90; lat <= 90; lat += 2.5) {
        const radiusAtLat = Math.cos((lat * Math.PI) / 180);
        const lonStep = 2.5 / (radiusAtLat || 0.1);

        for (let lon = -180; lon < 180; lon += lonStep) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);

            
            const isLand = d3.geoContains(countries, [lon, lat]);
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);

            generatedPoints.push({
                x: Number(x.toFixed(4)),
                y: Number(y.toFixed(4)),
                z: Number(z.toFixed(4)),
                isLand: isLand
            });

            count++;
            if (count % 1000 === 0) process.stdout.write(`\rPoints: ${count}`);
        }
    }
    console.log(`\nTotal points: ${generatedPoints.length}`);

    const outputPath = path.resolve(__dirname, '../data/globe_points.json');
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(generatedPoints));
    console.log(`Saved to ${outputPath}`);
}

generate().catch(console.error);
