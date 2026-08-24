---
name: The Pearl Club
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3c4a45'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#6b7a75'
  outline-variant: '#bacac3'
  surface-tint: '#006b58'
  primary: '#006b58'
  on-primary: '#ffffff'
  primary-container: '#64ffda'
  on-primary-container: '#007560'
  inverse-primary: '#38debb'
  secondary: '#006b5c'
  on-secondary: '#ffffff'
  secondary-container: '#9bf3df'
  on-secondary-container: '#017162'
  tertiary: '#636037'
  on-tertiary: '#ffffff'
  tertiary-container: '#eee8b4'
  on-tertiary-container: '#6c683e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#5ffbd6'
  primary-fixed-dim: '#38debb'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#005142'
  secondary-fixed: '#9bf3df'
  secondary-fixed-dim: '#7fd6c3'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005045'
  tertiary-fixed: '#eae4b1'
  tertiary-fixed-dim: '#cdc897'
  on-tertiary-fixed: '#1e1c00'
  on-tertiary-fixed-variant: '#4b4822'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  safe-area: 2.5rem
  float-gap: 2rem
  organic-padding: 1.5rem
  bubble-margin: 4rem
---

## Brand & Style
The design system is centered on an immersive, "underwater" sanctuary for wellbeing. The brand personality is serene, ethereal, and protective—evoking the stillness of deep water and the organic beauty of a hidden lagoon. 

The visual style is a specialized **Glassmorphism**, emphasizing translucency over opacity to simulate the layered depth of water. Elements should feel like they are floating in a suspended state. Rather than rigid structures, the interface uses organic, liquid-inspired transitions and soft, blurred containers to maintain a sense of calm and weightlessness.

## Colors
The palette is inspired by a sun-drenched reef. The primary background uses a vertical gradient from Pale Cyan (#E1F5FE) to Soft Ocean Blue (#E0F2F7) to create a sense of depth. 

- **Primary (Aqua):** Used for active states and highlights, representing bioluminescence.
- **Secondary (Turquoise):** Used for interactive elements and subtle gradients.
- **Tertiary (Cream):** A warm, pearl-inspired hue for highlights and special callouts.
- **Surface Neutrals:** Warm Pearl White and Sandy Beige provide a grounding, organic contrast to the cool-toned water colors.

## Typography
The typography uses a combination of rounded geometric sans-serifs to maintain a friendly and approachable tone. 

- **Headlines:** Quicksand provides the soft, "bubbly" aesthetic necessary for the brand's motifs.
- **Body & Labels:** Plus Jakarta Sans offers superior legibility for long-form reflection content while maintaining the modern, soft-cornered aesthetic.
- **Usage:** Headings should use generous line-height to feel airy. Never use all-caps for body text; reserve it only for very small, tracked-out labels.

## Layout & Spacing
This design system intentionally avoids traditional grids. It utilizes a **Contextual Fluid Layout** where elements are positioned as if floating in an aquatic environment.

- **Non-Traditional Alignment:** Elements should often be slightly offset or staggered rather than perfectly center-aligned to mimic the natural movement of the sea.
- **Generous Whitespace:** Padding is significantly higher than standard apps to prevent "claustrophobia." 
- **Responsive Behavior:** On mobile, content stacks vertically with 2.5rem side margins. On desktop, content floats in a central "well" (max-width 900px) with wide, blurred peripheral areas.

## Elevation & Depth
Depth is created through **Backdrop Blurring** and **Tonal Layering** rather than heavy shadows.

- **Glass Surfaces:** Use a background blur of 12px–20px with a low-opacity white border (0.2 alpha) to define edges.
- **The "Pearl" Effect:** Interactive elements use a soft, inner glow (box-shadow: inset 0 2px 4px rgba(255,255,255,0.8)) and a very diffused, low-opacity drop shadow (blur 20px, opacity 0.05) to appear like rounded spheres.
- **Z-Index layers:** Floating bubbles and decorative motifs (shells, starfish) sit on the highest and lowest layers respectively to create a 3D parallax effect during scroll.

## Shapes
The shape language is strictly organic and rounded. 
- **Primary Containers:** Use the `rounded-xl` (1.5rem) or higher for a soft, pebble-like feel.
- **Interactive Elements:** Use the **Pill** or **Circle** shape exclusively. 
- **Borders:** Use hairline borders (1px) in a translucent pearl white to define shapes without creating visual "weight."

## Components
- **Pearl Buttons:** Primary actions are circular or pill-shaped with a subtle iridescent gradient (Primary to Secondary color). On hover, they should "pulse" slightly.
- **Floating Chips:** Used for mood tags, these are semi-transparent with a 1px border and no background fill until selected.
- **Glass Cards:** When necessary, cards should have no solid background. They use a `backdrop-filter: blur(10px)` and a background color of `rgba(255, 255, 255, 0.4)`.
- **Progress Bubbles:** Instead of linear progress bars, use a series of rising bubbles or a filling circular "pearl" to indicate completion.
- **Input Fields:** Minimalist lines or soft, translucent wells with high roundedness. Focus state is indicated by a soft aqua glow rather than a thick border.
- **The Pearl Button (FAB):** A permanent, floating circular button at the bottom center, styled with a sophisticated pearl-texture gradient, acting as the primary navigation hub.