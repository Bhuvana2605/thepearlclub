import React, { useEffect, useRef } from 'react';
import { useSanctuary } from '../context/SanctuaryContext';

// Deliberately small Home Ambient Asset Pool (Restricted Y: 0.20 - 0.45 to swim above lower reef)
const HOME_AMBIENT_SPRITES = [
  { id: 'clownfish', asset: '/assets/collectibles/clownfish.png', type: 'fish', x: 120, y: 0.28, speedX: 0.45, scale: 0.18 },
  { id: 'guppy', asset: '/assets/collectibles/guppy.png', type: 'fish', x: 0.75, y: 0.20, speedX: -0.55, scale: 0.16 },
  { id: 'jellyfish', asset: '/assets/collectibles/jellyfish.png', type: 'drift', x: 0.30, y: 0.38, speedY: -0.05, scale: 0.16 },
  { id: 'seahorse', asset: '/assets/collectibles/seahorse.png', type: 'drift', x: 0.80, y: 0.45, speedY: -0.06, scale: 0.18 }
];

export const LivingOceanCanvas = () => {
  const canvasRef = useRef(null);
  const { settings, selectedEnvironment } = useSanctuary();
  const isReducedMotion = settings?.reducedMotion || false;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const maxCreatures = isMobile ? 2 : 4;
  const allowed = selectedEnvironment?.allowedCreatures || ['clownfish', 'guppy', 'seahorse'];
  const activeSprites = HOME_AMBIENT_SPRITES.filter((item) => allowed.includes(item.id)).slice(0, maxCreatures);

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

    // Preload allowed ambient PNG assets
    const loadedImages = {};
    activeSprites.forEach((item) => {
      const img = new Image();
      img.src = item.asset;
      loadedImages[item.id] = img;
    });

    // Initialized Sprite Positions
    const creatures = activeSprites.map((item) => ({
      ...item,
      xPos: item.x < 1 ? canvas.width * item.x : item.x,
      yPos: item.y < 1 ? canvas.height * item.y : item.y
    }));

    // Sparse Subtle Bubbles (6 Bubbles Only)
    const bubbles = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.3 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Sparse Bubbles
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

      // Render Minimal Ambient Sprites
      creatures.forEach((c) => {
        const img = loadedImages[c.id];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const w = img.width * (c.scale || 0.2);
        const h = img.height * (c.scale || 0.2);

        if (!isReducedMotion) {
          if (c.type === 'fish') {
            c.xPos += c.speedX;
            if (c.speedX > 0 && c.xPos > canvas.width + 80) c.xPos = -80;
            if (c.speedX < 0 && c.xPos < -80) c.xPos = canvas.width + 80;
          } else if (c.type === 'drift') {
            if (c.speedY) {
              c.yPos += c.speedY;
              if (c.yPos < canvas.height * 0.25 || c.yPos > canvas.height * 0.52) {
                c.speedY *= -1;
              }
            }
          }
        }

        ctx.save();
        ctx.globalAlpha = 0.85;
        if (c.speedX && c.speedX < 0) {
          ctx.translate(c.xPos + w, c.yPos);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, w, h);
        } else {
          ctx.drawImage(img, c.xPos, c.yPos, w, h);
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isReducedMotion, selectedEnvironment]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
};
