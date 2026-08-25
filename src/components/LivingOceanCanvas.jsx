import React, { useEffect, useRef } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

// Desktop Ambient Marine Roster (Tailored for Wide Screen Layout & Open Water Spaces)
const DESKTOP_AMBIENT_FISH = [
  {
    id: 'clownfish-primary',
    speciesId: 'clownfish',
    name: 'Clownfish',
    asset: '/assets/collectibles/clownfish.png',
    naturalFacing: 'left',
    yRatio: 0.16,        // Upper open water (above clock card, below header)
    initialXRatio: 0.30, // Swimming across top open water
    scale: 0.16,         // Visible size (~55-65px width)
    speedPxPerSec: 58,   // Traversal speed
    direction: -1,       // Swimming Right to Left
    bobAmplitude: 7,     // Gentle sine bobbing
    bobFrequency: 0.0013
  },
  {
    id: 'guppy-primary',
    speciesId: 'guppy',
    name: 'Guppy',
    asset: '/assets/collectibles/guppy.png',
    naturalFacing: 'right',
    yRatio: 0.68,        // Lower open water (below cards, above bottom reef)
    initialXRatio: 0.65, // Swimming across bottom open water
    scale: 0.15,         // Visible size (~50-58px width)
    speedPxPerSec: 50,   // Traversal speed
    direction: -1,       // Swimming Right to Left (head faces left via flip)
    bobAmplitude: 8,     // Gentle sine bobbing
    bobFrequency: 0.0016
  },
  {
    id: 'turtle-primary',
    speciesId: 'turtle',
    name: 'Sea Turtle',
    asset: '/assets/collectibles/turtle.png',
    naturalFacing: 'right',
    yRatio: 0.45,        // Mid open water right (flanking right side of cards)
    initialXRatio: 0.84, // Right side of screen
    scale: 0.14,         // Visible size (~60-70px width)
    speedPxPerSec: 32,   // Calm slow turtle paddling speed
    direction: 1,        // Swimming Left to Right
    bobAmplitude: 5,     // Soft gentle gliding
    bobFrequency: 0.0012
  },
  {
    id: 'starfish-primary',
    speciesId: 'starfish',
    name: 'Starfish',
    asset: '/assets/collectibles/starfish.png',
    naturalFacing: 'right',
    yRatio: 0.14,        // Upper open water right (above cards, below header)
    initialXRatio: 0.78, // Top Right
    scale: 0.12,         // Visible size (~40-48px width)
    speedPxPerSec: 28,   // Gentle slow floating
    direction: -1,       // Floating Right to Left
    bobAmplitude: 5,     // Gentle sine bobbing
    bobFrequency: 0.0015
  }
];

// Mobile Ambient Marine Roster (Tailored for Mobile Screen Aspect Ratio & Centered Card Stack)
const MOBILE_AMBIENT_FISH = [
  {
    id: 'starfish-primary',
    speciesId: 'starfish',
    name: 'Starfish',
    asset: '/assets/collectibles/starfish.png',
    naturalFacing: 'right',
    yRatio: 0.12,        // Upper open water (above clock card, below header)
    initialXRatio: 0.22, // Top Left / Mid
    scale: 0.11,         // Mobile compact scale
    speedPxPerSec: 25,   // Gentle slow floating
    direction: -1,       // Floating Right to Left
    bobAmplitude: 4,     // Gentle sine bobbing
    bobFrequency: 0.0015
  },
  {
    id: 'clownfish-primary',
    speciesId: 'clownfish',
    name: 'Clownfish',
    asset: '/assets/collectibles/clownfish.png',
    naturalFacing: 'left',
    yRatio: 0.74,        // Lower open water below cards
    initialXRatio: 0.08, // Lower Left
    scale: 0.15,         // Mobile compact scale
    speedPxPerSec: 48,   // Traversal speed
    direction: -1,       // Swimming Right to Left
    bobAmplitude: 6,     // Gentle sine bobbing
    bobFrequency: 0.0013
  },
  {
    id: 'guppy-primary',
    speciesId: 'guppy',
    name: 'Guppy',
    asset: '/assets/collectibles/guppy.png',
    naturalFacing: 'right',
    yRatio: 0.72,        // Lower open water below cards (beside Clownfish)
    initialXRatio: 0.38, // Lower Left / Mid
    scale: 0.14,         // Mobile compact scale
    speedPxPerSec: 42,   // Traversal speed
    direction: -1,       // Swimming Right to Left (head faces left via flip)
    bobAmplitude: 6,     // Gentle sine bobbing
    bobFrequency: 0.0016
  }
];

export const LivingOceanCanvas = () => {
  const canvasRef = useRef(null);
  const { settings } = useSanctuary();
  const isReducedMotion = settings?.reducedMotion || false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const isMobile = window.innerWidth < 768;
    // Decoupled active roster: Mobile uses MOBILE_AMBIENT_FISH, Desktop uses DESKTOP_AMBIENT_FISH
    const activeRoster = isMobile ? MOBILE_AMBIENT_FISH : DESKTOP_AMBIENT_FISH;

    // Preload PNG assets
    const loadedImages = {};
    activeRoster.forEach((item) => {
      if (!loadedImages[item.speciesId]) {
        const img = new Image();
        img.src = item.asset;
        loadedImages[item.speciesId] = img;
      }
    });

    // Initialize fish state positions immediately on screen at initialXRatio
    const creatures = activeRoster.map((item) => {
      const startX = canvas.width * item.initialXRatio;
      return {
        ...item,
        xPos: startX,
        yBase: canvas.height * item.yRatio,
        bobPhase: Math.random() * Math.PI * 2
      };
    });

    // 6 Subtle ambient rising bubbles
    const bubbles = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1.5,
      speed: Math.random() * 0.35 + 0.15,
      opacity: Math.random() * 0.3 + 0.15
    }));

    let lastTimestamp = performance.now();

    const render = (now) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render Ambient Rising Bubbles
      bubbles.forEach((b) => {
        if (!isReducedMotion) {
          b.y -= b.speed;
          if (b.y < -10) {
            b.y = canvas.height + 10;
            b.x = Math.random() * canvas.width;
          }
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
        ctx.fill();
      });

      // 2. Render Ambient Common Fish
      creatures.forEach((c) => {
        const img = loadedImages[c.speciesId];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const w = img.width * c.scale;
        const h = img.height * c.scale;
        const padding = w + 80;

        if (!isReducedMotion) {
          // Continuous forward swimming movement
          c.xPos += c.direction * c.speedPxPerSec * deltaSec;

          // Off-screen exit detection & seamless re-entry reset
          if (c.direction < 0 && c.xPos < -padding) {
            // Exited left -> reset offscreen to the right
            c.xPos = canvas.width + padding;
            c.yBase = canvas.height * c.yRatio;
          } else if (c.direction > 0 && c.xPos > canvas.width + padding) {
            // Exited right -> reset offscreen to the left
            c.xPos = -padding;
            c.yBase = canvas.height * c.yRatio;
          }
        }

        // Calculate gentle vertical bobbing
        const yOffset = Math.sin(now * c.bobFrequency + c.bobPhase) * c.bobAmplitude;
        const currentY = c.yBase + yOffset;

        // Sprite facing logic: Head MUST face the direction of motion
        const shouldFlip =
          (c.naturalFacing === 'left' && c.direction > 0) ||
          (c.naturalFacing === 'right' && c.direction < 0);

        ctx.save();
        ctx.globalAlpha = 0.92;

        if (shouldFlip) {
          ctx.translate(c.xPos + w, currentY);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, w, h);
        } else {
          ctx.drawImage(img, c.xPos, currentY, w, h);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none w-full h-full"
    />
  );
};
