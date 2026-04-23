export const designTokens = {
  colors: {
    primary: "hsl(220, 100%, 60%)",
    primaryDark: "hsl(220, 100%, 45%)",
    accent: "hsl(280, 100%, 65%)",
    accentDark: "hsl(280, 100%, 50%)",
    success: "hsl(150, 80%, 45%)",
    warning: "hsl(35, 100%, 55%)",
    error: "hsl(0, 85%, 60%)",
    background: "hsl(220, 20%, 5%)",
    surface: "rgba(255, 255, 255, 0.05)",
    surfaceHover: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "hsl(220, 10%, 95%)",
    textMuted: "hsl(220, 10%, 65%)",
    glass: "rgba(255, 255, 255, 0.03)",
    glassBorder: "rgba(255, 255, 255, 0.08)",
  },
  gradients: {
    liquid: "linear-gradient(135deg, hsl(220, 100%, 60%) 0%, hsl(280, 100%, 65%) 100%)",
    glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)",
  },
  radius: {
    sm: "8px",
    md: "16px",
    lg: "24px",
    full: "9999px",
  },
  shadow: {
    sm: "0 4px 12px rgba(0, 0, 0, 0.1)",
    md: "0 12px 30px -10px rgba(0, 0, 0, 0.12)",
    lg: "0 24px 60px -20px rgba(0, 0, 0, 0.2)",
    glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  },
  font: {
    family: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
};
