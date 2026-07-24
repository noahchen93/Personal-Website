/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        'terminal': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Ubuntu Mono', 'monospace'],
        'chinese': ['PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'Source Han Sans SC', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'english': ['Inter', 'SF Pro Display', 'Helvetica Neue', 'Arial', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mixed': ['Inter', 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      fontSize: {
        'large': 'var(--font-size-large)',
        'medium': 'var(--font-size-medium)', 
        'small': 'var(--font-size-small)'
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      animation: {
        'terminal-blink': 'terminal-blink 1s infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fadeIn': 'fadeIn 0.4s ease-out',
        'slideInUp': 'slideInUp 0.6s ease-out',
        'slideInLeft': 'slideInLeft 0.5s ease-out',
        'slideInRight': 'slideInRight 0.5s ease-out'
      },
      keyframes: {
        'terminal-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        'glow': {
          '0%, 100%': { 'box-shadow': '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { 'box-shadow': '0 0 20px rgba(59, 130, 246, 0.8)' }
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slideInUp': {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slideInLeft': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        },
        'slideInRight': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' }
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue-purple': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}