
set -euo pipefail



echo "Building terminal (Vite)..."
if [ -d "terminal" ]; then
  cd terminal
  
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
  npm run build
  cd ..
else
  echo "No terminal folder found — skipping terminal build"
fi

echo "Preparing public folder..."
rm -rf public
mkdir -p public

echo "Copying resume root files..."

cp -f index.html public/ || true
cp -f styles.css public/ || true
cp -f script.js public/ || true
cp -f lanyard-3d.js public/ || true
cp -f github-contributions.js public/ || true
cp -f skillset-order.js public/ || true
cp -f serve.ps1 public/ || true
cp -r Images public/ || true

echo "Copying terminal build to public/terminal..."
mkdir -p public/terminal
cp -r terminal/dist/* public/terminal/ || true

echo "Adding redirect so root serves the terminal UI"
cat > public/_redirects <<'EOF'
/ /terminal/index.html 200
EOF

echo "Done. public/ is ready."
