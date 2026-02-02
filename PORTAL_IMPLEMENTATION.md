# Doctor Strange Sanctum Portal Loading Screen

## Overview
Successfully integrated a mystical Doctor Strange-style portal opening animation into the resume website's loading screen.

## What Was Changed

### 1. Created New Portal Loader Script
**File**: `js/sanctum-portal-loader.js`
- Vanilla JavaScript implementation of the portal effect
- Creates expanding circular portal with glowing orange/amber sparks
- Particles spin around the portal edge with heat-streak effects
- Automatically triggers page load completion when portal fully opens

### 2. Updated HTML Structure
**File**: `html/index.html`
- Changed canvas ID from `particle-canvas` to `portal-canvas`
- Updated loader text to "Aligning Realities..." for mystical theme
- Added mystical CSS classes: `mystic-glow`, `mystic-text`, `portal-glow`
- Replaced old particle animation script with portal loader reference

### 3. Updated CSS Styling
**Colors Changed**:
- From: Blue/Purple gradient (#6366f1, #ec4899)
- To: Orange/Amber gradient (#ffb300, #ff3c00)

**New Effects Added**:
- `mysticPulse` animation for pulsing glow on title
- Mystical text shadow effects with orange/amber glow
- Portal-themed progress bar with glowing box-shadow

## How It Works

1. **Initial State** (0-800ms)
   - Black screen with "Aligning Realities..." text

2. **Portal Opening** (800ms - ~3-4s)
   - Portal expands from center point
   - 25 particles emitted per frame at the expanding edge
   - Particles spin tangentially and fly outward
   - Creates heat-streak effect with glowing trails
   - Uses canvas blend mode 'lighter' for bloom effect

3. **Portal Complete**
   - When radius reaches 90% of screen diagonal
   - Triggers fade-out of loading screen
   - Reveals main resume content

## Testing

### Test File Created
**File**: `html/portal-test.html`
- Standalone test page to verify portal effect
- Open this file in any browser to see the animation
- Refresh to replay the portal opening

### How to Test
1. Open `html/portal-test.html` in your browser
2. Watch the portal open from the center
3. See the orange sparks spinning around the edge
4. Portal reveals the success message

### Main Resume
1. Open `html/index.html` in your browser
2. Portal will open to reveal your resume
3. Reload page to see the effect again

## Technical Details

### Portal Physics
- **Expansion Speed**: Adaptive based on screen width (width/140)
- **Particle Count**: 25 new particles per frame
- **Particle Properties**:
  - Tangential speed: 0.06-0.14 radians/frame
  - Radial speed: -0.1 to 2.9 pixels/frame
  - Size: 1.2-3.7 pixels
  - Lifespan: 15-40 frames
  - Colors: 60% amber (#ffb300), 40% red-orange (#ff3c00)

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Canvas API
- No external dependencies required
- Fallback timeout ensures page loads even if portal fails

## Color Scheme
The portal uses Doctor Strange's signature orange/amber mystical energy colors:
- Primary: `#ffb300` (Amber)
- Secondary: `#ff3c00` (Red-Orange)
- Accent: `#ff6b00` (Orange)
- Background: `#0a0e27` (Dark Navy)

## Files Modified
1. ✅ `js/sanctum-portal-loader.js` (NEW)
2. ✅ `html/index.html` (MODIFIED)
3. ✅ `html/portal-test.html` (NEW - for testing)

## Next Steps
- Open `html/portal-test.html` to verify the effect works
- Open `html/index.html` to see it on your actual resume
- Adjust timing/colors in `sanctum-portal-loader.js` if desired
