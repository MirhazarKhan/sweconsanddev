# Scroll Animation Feature

This project includes a smooth scroll-triggered animation for the "DEPARTMENT OF SWE" title.

## How It Works

The title "DEPARTMENT OF SWE" animates from the right side of the screen into view as you scroll down the page.

### Animation Details

- **Initial State**: Title is positioned off-screen to the right (translateX: 100vw) with 0 opacity
- **Trigger Point**: Animation starts when the title reaches 80% of the viewport
- **End Point**: Animation completes when the title reaches 30% of the viewport
- **Effect**: Title smoothly slides in from right to center while fading in
- **Easing**: Uses power2.out easing for smooth deceleration

### Technical Implementation

The animation is implemented with two approaches:

1. **Primary (GSAP + ScrollTrigger)**: 
   - Uses GSAP library with ScrollTrigger plugin
   - Provides smooth scrubbing tied to scroll position
   - Requires CDN access to load libraries

2. **Fallback (Vanilla JS)**:
   - Pure JavaScript scroll event listener
   - Cubic ease-out function for smooth animation
   - Works in environments where CDN is blocked
   - Automatically activates if GSAP/ScrollTrigger not available

### Usage

Simply scroll down the page to see the animation in action. The title will slide in smoothly from the right side of the screen.

### Browser Compatibility

- Works in all modern browsers that support CSS transforms and JavaScript
- Fallback ensures functionality even without GSAP libraries
- No additional configuration needed

## Customization

To modify the animation, edit the animation parameters in `index.html`:

```javascript
// GSAP version
gsap.to("#dept-title", {
    x: 0,
    opacity: 1,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
        trigger: "#dept-title",
        start: "top 80%",    // Change trigger point
        end: "top 30%",      // Change end point
        scrub: 1,            // Change scrub speed
        markers: false       // Set to true for debugging
    }
});
```

For the vanilla JS fallback, adjust the `startScroll` and `endScroll` calculations in the scroll event listener.
