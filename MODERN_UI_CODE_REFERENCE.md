# 🎨 Modern UI Components - Code Snippets & Best Practices

## Quick Reference Guide

### Pattern 1: Modern Card with Hover Effect
```jsx
<div style={{
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  border: "2px solid transparent",
  transition: "all 0.3s ease",
  cursor: "pointer"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-10px)";
  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.12)";
  e.currentTarget.style.borderColor = "#667eea";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
  e.currentTarget.style.borderColor = "transparent";
}}>
  {/* Content */}
</div>
```

### Pattern 2: Gradient Background Section
```jsx
<section style={{
  padding: "100px 20px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  position: "relative",
  overflow: "hidden"
}}>
  {/* Content */}
</section>
```

### Pattern 3: Glassmorphic Card
```jsx
<div style={{
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(10px)",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.2)",
  transition: "all 0.3s ease"
}}>
  {/* Content */}
</div>
```

### Pattern 4: Gradient Text
```jsx
<h2 style={{
  fontSize: "42px",
  fontWeight: "800",
  background: "linear-gradient(120deg, #667eea, #764ba2)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
}}>
  Your Text Here
</h2>
```

### Pattern 5: Animated Icon Container
```jsx
<div style={{
  width: "50px",
  height: "50px",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
}}>
  <Icon size={24} color="white" />
</div>
```

---

## Animation Keyframes Reference

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Slide In Left
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Scale In
```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

### Pulse
```css
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
  50% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
}
```

---

## Color Palette Guide

### Primary Gradients
```javascript
const gradients = {
  purple: "linear-gradient(135deg, #667eea, #764ba2)",
  pink: "linear-gradient(135deg, #f093fb, #f5576c)",
  blue: "linear-gradient(135deg, #4facfe, #00f2fe)",
  green: "linear-gradient(135deg, #43e97b, #38f9d7)",
  gold: "linear-gradient(120deg, #FFD700, #FFA500)",
  mixed: "linear-gradient(135deg, #30cfd0, #330867)"
};
```

### Hover States
```javascript
const hoverEffects = {
  lift: "translateY(-10px)",
  scale: "scale(1.05)",
  slide: "translateX(8px)",
  rotate: "rotate(5deg)",
  combined: "translateY(-10px) scale(1.02)"
};
```

### Shadow Values
```javascript
const shadows = {
  light: "0 10px 40px rgba(0,0,0,0.08)",
  medium: "0 15px 50px rgba(0,0,0,0.12)",
  heavy: "0 20px 60px rgba(0,0,0,0.15)",
  glow: "0 0 30px rgba(102,126,234,0.2)",
  glowHeavy: "0 0 40px rgba(102,126,234,0.4)"
};
```

---

## Typography System

### Heading Styles
```javascript
const typography = {
  h1: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.2",
    letterSpacing: "-1px"
  },
  h2: {
    fontSize: "42px",
    fontWeight: "800",
    lineHeight: "1.3",
    letterSpacing: "-1px"
  },
  h3: {
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "1.4",
    letterSpacing: "0px"
  },
  h4: {
    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "1.5",
    letterSpacing: "0px"
  },
  body: {
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.7",
    letterSpacing: "0px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "2px"
  }
};
```

---

## Responsive Grid Patterns

### Auto-Fit Grid
```jsx
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px"
}}>
  {/* Items automatically arrange */}
</div>
```

### Two-Column Split
```jsx
<div style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "60px",
  alignItems: "center"
}}>
  {/* Left column */}
  {/* Right column */}
</div>
```

### Media Query Alternative (Responsive)
```jsx
<div style={{
  display: window.innerWidth >= 768 ? "grid" : "flex",
  gridTemplateColumns: "1fr 1fr",
  flexDirection: "column",
  gap: "60px"
}}>
  {/* Content */}
</div>
```

---

## Animation Timing Patterns

### Sequential Animation (Staggered)
```jsx
{items.map((item, idx) => (
  <div key={idx} style={{
    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards`
  }}>
    {item}
  </div>
))}
```

### On-Load Animation
```jsx
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  setIsVisible(true);
}, []);

// Use in style: animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
```

### Hover Animation
```jsx
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-10px)";
  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.2)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
}}
```

---

## Reusable Component Templates

### Modern Card Component
```jsx
function ModernCard({ title, description, icon: Icon, gradient }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "32px 24px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
      border: "2px solid transparent",
      transition: "all 0.3s ease",
      cursor: "pointer"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-10px)";
      e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.15)";
      e.currentTarget.style.borderColor = gradient.split(",")[0];
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
      e.currentTarget.style.borderColor = "transparent";
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        background: gradient,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px"
      }}>
        <Icon size={24} color="white" />
      </div>
      <h3 style={{
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a202c",
        margin: "0 0 12px 0"
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: "14px",
        color: "#4a5568",
        margin: "0",
        lineHeight: "1.6"
      }}>
        {description}
      </p>
    </div>
  );
}
```

### Modern Button Component
```jsx
function ModernButton({ text, isPrimary = true, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "16px 32px",
        background: isPrimary 
          ? "linear-gradient(135deg, #667eea, #764ba2)"
          : "rgba(255,255,255,0.2)",
        color: isPrimary ? "white" : "white",
        border: `2px solid ${isPrimary ? "transparent" : "rgba(255,255,255,0.4)"}`,
        borderRadius: "10px",
        fontWeight: "700",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backdropFilter: "blur(10px)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}>
      {Icon && <Icon size={18} />}
      {text}
    </button>
  );
}
```

### Modern Input Component
```jsx
function ModernInput({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#1a202c",
        marginBottom: "8px"
      }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          fontSize: "14px",
          transition: "all 0.3s ease",
          boxSizing: "border-box",
          fontFamily: "inherit"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#667eea";
          e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e2e8f0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
```

---

## Best Practices

### ✅ DO's
- ✅ Use consistent gradient directions (135deg)
- ✅ Animate with transform and opacity (performance)
- ✅ Add transition delays for staggered effects
- ✅ Test animations on mobile devices
- ✅ Use semantic color meanings
- ✅ Keep hover states subtle and smooth
- ✅ Provide visual feedback for all interactions
- ✅ Use box-sizing: border-box on all elements

### ❌ DON'Ts
- ❌ Don't animate width/height (use transform instead)
- ❌ Don't use too many simultaneous animations
- ❌ Don't forget backdrop-filter support on older browsers
- ❌ Don't make hover effects too jarring
- ❌ Don't forget accessibility (focus states)
- ❌ Don't overuse gradients (becomes noise)
- ❌ Don't forget mobile responsiveness
- ❌ Don't use low contrast text on gradients

---

## Performance Tips

1. **Use GPU Acceleration**
   - Use `transform` and `opacity` for animations
   - Avoid animating `width`, `height`, `left`, `top`

2. **Optimize Animations**
   - Keep animation duration between 0.3s-0.8s
   - Use `ease-out` for entrance, `ease-in` for exit
   - Stagger animations with 0.1s delays

3. **Lazy Load Heavy Effects**
   - Use intersection observer for animations on scroll
   - Only animate visible elements
   - Consider removing animations on low-end devices

4. **CSS Optimization**
   - Use CSS variables for repeated values
   - Minimize shadow complexity
   - Use modern color formats (gradients, rgba)

---

## Accessibility Checklist

- ✅ High contrast ratios (4.5:1 minimum)
- ✅ Focus states on all interactive elements
- ✅ Keyboard navigation support
- ✅ Semantic HTML (when not using styled divs)
- ✅ ARIA labels where needed
- ✅ Color not as only indicator
- ✅ Sufficient touch target sizes (44px+)
- ✅ Reduced motion support for animations

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Gradients | ✅ | ✅ | ✅ | ✅ |
| Backdrop Filter | ✅ | ❌* | ✅ | ✅ |
| CSS Animations | ✅ | ✅ | ✅ | ✅ |
| Transform | ✅ | ✅ | ✅ | ✅ |
| Linear Gradient | ✅ | ✅ | ✅ | ✅ |

*Firefox: requires feature flag or uses alternative

---

## Quick Start Template

```jsx
import { useEffect, useState } from "react";
import { Icon } from "lucide-react";

export default function ModernSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
      padding: "100px 20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
      }}>
        <h2 style={{
          fontSize: "42px",
          fontWeight: "800",
          color: "white",
          margin: "0 0 20px 0",
          letterSpacing: "-1px"
        }}>
          Your Heading
        </h2>
        {/* Content */}
      </div>
    </section>
  );
}
```

---

**Last Updated:** October 7, 2026
**Version:** 1.0
**Status:** ✅ Production Ready
