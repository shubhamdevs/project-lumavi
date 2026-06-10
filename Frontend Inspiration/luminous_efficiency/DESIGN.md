---
name: Luminous Efficiency
colors:
  surface: '#f8f9ff'
  surface-dim: '#d1dbec'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fa'
  surface-container-highest: '#d9e3f4'
  on-surface: '#121c28'
  on-surface-variant: '#464555'
  inverse-surface: '#27313e'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d45e0'
  primary: '#2100b7'
  on-primary: '#ffffff'
  primary-container: '#3b2fcf'
  on-primary-container: '#bab8ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#572c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#783f00'
  on-tertiary-container: '#ffad68'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0e0069'
  on-primary-fixed-variant: '#3425c9'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#121c28'
  surface-variant: '#d9e3f4'
typography:
  display-hero:
    fontFamily: Syne
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-h1:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-h1-mobile:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-h2:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  unit-1: 4px
  unit-2: 8px
  unit-4: 16px
  unit-6: 24px
  unit-8: 32px
  unit-12: 48px
  unit-16: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered for a high-performance AI content marketing platform. The brand personality is **Professional, Innovative, and Efficient**, focusing on the transition from complex briefs to ready-to-publish campaigns. 

The aesthetic follows a **Modern Corporate** style with **High-Contrast** accents. It prioritizes clarity and speed, utilizing heavy whitespace to reduce cognitive load while employing expressive display typography to signal creative innovation. The UI communicates reliability through structured layouts, while subtle glows and indigo-tinted depth provide a "technological" aura characteristic of advanced AI tooling.

Key visual principles:
- **Efficiency First**: Information density is balanced with generous whitespace to ensure the AI-generated outputs are the hero.
- **Strategic Contrast**: Deep indigos are paired with crisp whites and vibrant teal/gold accents to guide user attention.
- **Refined Precision**: Sharp execution of borders and shadows mimics the precision of the underlying AI models.

## Colors

The palette is anchored by a deep **Indigo** foundation, representing professional authority and the "deep tech" nature of AI. 

- **Primary (Indigo)**: Use Indigo 500 for primary actions and Indigo 900 for high-level navigation and core text.
- **Secondary (Teal)**: Used for "Success" states, publishing indicators, and creative growth metrics.
- **Tertiary (Gold)**: Reserved for premium features, campaign alerts, and highlighting AI-generated insights.
- **Neutral**: Pure White is the primary canvas. Neutral 50/100 are used for subtle sectioning, while Neutral 900 is used for maximum-legibility body text.

Apply Indigo-tinted grays (e.g., mixing a hint of Indigo 500 into Neutral 200) for borders to maintain a cohesive brand temperature.

## Typography

This design system uses a triple-font strategy to balance character and utility:

1.  **Syne**: The expressive engine. Use for H1, Hero sections, and major marketing headlines. Its bold, geometric nature signals modern creative power.
2.  **Inter**: The functional workhorse. Used for all UI elements, body copy, and form labels. It ensures readability at all sizes and provides a neutral, professional contrast to Syne.
3.  **JetBrains Mono**: The technical layer. Used specifically for data points, AI confidence scores, timestamps, and metadata. Its monospaced nature emphasizes the "platform/tool" aspect of the product.

**Scale Constraints**: For mobile screens, strictly downscale H1 and Display Hero sizes to maintain a maximum width of 320px for the text container without horizontal overflow.

## Layout & Spacing

The layout utilizes a **12-column Fluid Grid** for desktop and a **4-column Grid** for mobile. 

- **Spacing Rhythm**: A 4px baseline grid governs all spatial decisions. Increments of 8px (8, 16, 24, 32, 48, 64) are preferred for internal component padding and section margins.
- **Safe Zones**: Maintain a minimum 24px gutter on desktop and 16px on mobile. 
- **Content Max-Width**: Main dashboard views should cap at 1280px to prevent excessive line lengths in AI-generated content, though the sidebar may remain fixed at 280px.
- **Reflow**: On tablet, the sidebar should collapse into a hamburger menu or a slim icon bar to prioritize the content canvas.

## Elevation & Depth

Depth is used sparingly to signify "active" workspaces. The design system employs **Ambient Shadows** with a distinct indigo tint to maintain brand harmony.

- **Surface Tiers**:
    - **Level 0 (Background)**: Neutral 50. The base floor.
    - **Level 1 (Cards/Sidebar)**: White. Uses a 1px border of Neutral 200.
    - **Level 2 (Dropdowns/Popovers)**: White. Uses a soft shadow: `0 4px 12px -2px rgba(30, 27, 77, 0.08)`.
    - **Level 3 (Modals)**: White. High-depth shadow: `0 20px 25px -5px rgba(30, 27, 77, 0.1), 0 10px 10px -5px rgba(30, 27, 77, 0.04)`.

- **Interactivity**: Apply a subtle Indigo 500 outer glow (`0 0 0 4px rgba(59, 47, 207, 0.15)`) to Primary CTAs on hover to simulate the AI "energizing."

## Shapes

The shape language is modern and approachable, avoiding harsh corners to maintain a "friendly assistant" feel.

- **Small (6px)**: Checkboxes, small buttons, and tags.
- **Medium (12px)**: Standard UI buttons, input fields, and small cards.
- **Large (20px)**: Main dashboard containers, hero image frames, and large modal windows.

All interactive elements should strictly adhere to these three radii to ensure a systematic look across the platform.

## Components

### Buttons
- **Primary**: Indigo 500 background, White text. 12px radius. On hover, apply the indigo-tinted glow.
- **Secondary**: Indigo 50 background, Indigo 700 text. 12px radius.
- **Tertiary**: Ghost style. Indigo 700 text, no background. 

### Input Fields
- **Default**: White background, 1px border (Neutral 200), 12px radius.
- **Focus**: Border changes to Indigo 500 with a 2px ring of Indigo 100.
- **AI-Input**: A specialized text area with a subtle Indigo-to-Teal gradient border to signify the AI prompt area.

### Cards
- **Content Card**: White background, 20px radius, 1px Neutral 200 border. 
- **Metric Card**: Uses JetBrains Mono for the primary number. Includes a small Teal 100 "trend" chip if positive.

### Chips & Badges
- **Status Chips**: Use 100-weight backgrounds with 500-weight text (e.g., Teal 100 background with Teal 500 text for "Published"). Fully rounded (pill-shaped).

### Lists
- Standardize on a "Row" format with 16px padding and a 1px bottom border of Neutral 200. Use Inter Medium for the list titles.

### AI Feedback
- Provide a "Thumbs up/down" icon set next to any AI-generated output, using Teal 500 and Gold 500 respectively on interaction.