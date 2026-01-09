#!/bin/bash
echo "Running custom build script..."

# Run the build script defined in package.json
npm run build

# Remove source index.html so Vercel uses the rewrite to dist/index.html
echo "Removing source terminal/index.html..."
rm terminal/index.html
