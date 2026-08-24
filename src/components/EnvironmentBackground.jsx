import React from 'react';
import { useSanctuary } from '../context/SanctuaryContext';
import { ENVIRONMENTS, getEnvironment } from '../data/environments';

/**
 * Pure Environmental Atmosphere & Layering Component for The Pearl Club (V0)
 * 
 * Strict Vertical Zone & Layer Architecture:
 * TOP (0% - 35%): Open water, light rays, surface caustics, bubbles
 * MIDDLE (35% - 70%): Clear vertical swimming zone for fish, ambient particles
 * LOWER AREA (70% - 88%): Coral, kelp, underwater rocks
 * BOTTOM (88% - 100%): Sea-floor details
 * 
 * Stacking:
 * Layer 0: Base background water depth gradient
 * Layer 1: Distant environment (light rays, caustics, soft cloud tint)
 * Layer 2: Midground coral / rocks / kelp (Grounded at bottom-0/bottom-2, responsive widths/heights)
 * Layer 3: Foreground environmental elements (rising bubbles, rain streaks)
 * Layer 4: Normal ambient creatures (handled by LivingOceanCanvas)
 * Layer 5: Existing Pearl Club UI (handled by Layout & Pages)
 */
export const EnvironmentBackground = () => {
  const { selectedEnvironment } = useSanctuary();
  const currentEnv = selectedEnvironment || getEnvironment('ocean');
  const envId = currentEnv.id || 'ocean';

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden select-none">
      
      {/* LAYER 0: BASE BACKGROUND WATER DEPTH GRADIENT */}
      <div
        className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out"
        style={{ background: currentEnv.gradientFallback }}
      />

      {/* ========================================================================= */}
      {/* 1. OCEAN THEME (Primary Calm Shallow Underwater Atmosphere)                */}
      {/* ========================================================================= */}
      {envId === 'ocean' && (
        <>
          {/* Layer 1: Distant Light Rays & Water Surface Caustics (Top) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/45 via-cyan-100/20 to-transparent"></div>

          {/* Layer 2: Lower-Area Coral, Underwater Rocks & Kelp (Grounded at Bottom Edge) */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-[30vh] sm:h-[35vh] flex justify-between items-end px-2 sm:px-6 md:px-12">
            {/* Left Coral (Grounded at bottom edge) */}
            <img
              src="/assets/collectibles/coral.png"
              alt="Coral"
              className="w-[85px] sm:w-[130px] md:w-[170px] lg:w-[210px] max-h-[18vh] sm:max-h-[22vh] object-contain opacity-80 filter drop-shadow-md transform -translate-x-1 sm:translate-x-0"
            />

            {/* Right Underwater Rocks (Grounded at bottom edge) */}
            <img
              src="/assets/collectibles/underwater-stone.png"
              alt="Rocks"
              className="w-[95px] sm:w-[150px] md:w-[200px] lg:w-[250px] max-h-[16vh] sm:max-h-[20vh] object-contain opacity-80 filter drop-shadow-md transform translate-x-1 sm:translate-x-0"
            />
          </div>

          {/* Layer 3: Foreground Ambient Bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/25 border border-white/40"
                style={{
                  width: `${6 + (i % 3) * 4}px`,
                  height: `${6 + (i % 3) * 4}px`,
                  left: `${(i * 15) % 92}%`,
                  bottom: '-20px',
                  animation: `riseBubble ${10 + (i % 4) * 3}s ease-in-out infinite`,
                  animationDelay: `${i * 1.2}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. RAINY OCEAN THEME (Muted Overcast Atmosphere)                          */}
      {/* ========================================================================= */}
      {envId === 'rainy-ocean' && (
        <>
          {/* Layer 1: Soft Cloudy Overcast Tint */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/30 via-slate-500/15 to-transparent"></div>

          {/* Layer 2: Minimal Rocks Grounded at Bottom-Left */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-[25vh] flex justify-start items-end px-4 sm:px-8">
            <img
              src="/assets/collectibles/underwater-stone.png"
              alt="Rocks"
              className="w-[75px] sm:w-[110px] md:w-[150px] max-h-[15vh] object-contain opacity-50 filter grayscale-[40%]"
            />
          </div>

          {/* Layer 3: Falling Raindrops Overlay */}
          <div className="absolute inset-0 overflow-hidden opacity-60">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-white/50 to-white/80"
                style={{
                  height: `${16 + (i % 4) * 6}px`,
                  left: `${(i * 6.5) % 98}%`,
                  top: '-30px',
                  animation: `raindropFall ${1.2 + (i % 4) * 0.4}s linear infinite`,
                  animationDelay: `${(i % 5) * 0.25}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. UNDERWATER THEME (Deeper Teal Reef Atmosphere)                         */}
      {/* ========================================================================= */}
      {envId === 'underwater' && (
        <>
          {/* Layer 1: Deep Water Ambient Light Rays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300/35 via-teal-900/25 to-transparent"></div>
          <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-cyan-100/30 via-teal-400/10 to-transparent blur-lg"></div>

          {/* Layer 2: Deeper Reef Elements Grounded at Bottom Edge */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden h-[32vh] sm:h-[38vh] flex justify-between items-end px-2 sm:px-6 md:px-12">
            {/* Left Coral Reef */}
            <img
              src="/assets/collectibles/coral.png"
              alt="Reef"
              className="w-[90px] sm:w-[140px] md:w-[190px] lg:w-[230px] max-h-[20vh] sm:max-h-[24vh] object-contain opacity-85 filter drop-shadow-lg"
            />
            
            {/* Right Reversed Coral Reef */}
            <img
              src="/assets/collectibles/coral.png"
              alt="Reef"
              className="w-[95px] sm:w-[150px] md:w-[200px] lg:w-[240px] max-h-[22vh] sm:max-h-[25vh] object-contain opacity-85 transform scale-x-[-1] filter drop-shadow-lg"
            />
          </div>

          {/* Layer 3: Deep Water Ascending Bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-cyan-100/30 border border-cyan-200/50"
                style={{
                  width: `${8 + (i % 3) * 4}px`,
                  height: `${8 + (i % 3) * 4}px`,
                  left: `${(i * 12) % 94}%`,
                  bottom: '-20px',
                  animation: `riseBubble ${12 + (i % 4) * 4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.9}s`
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* DISABLED V0 THEMES (Preserved in code for future versions)                */}
      {/* ========================================================================= */}
      {envId === 'beach' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/50 via-cyan-100/20 to-transparent"></div>
      )}

      {envId === 'sunset-beach' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/40 via-purple-300/20 to-transparent"></div>
      )}

      {envId === 'grassland' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100/50 via-green-100/20 to-transparent"></div>
      )}
    </div>
  );
};

export default EnvironmentBackground;
