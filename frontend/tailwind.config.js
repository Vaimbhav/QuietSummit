/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#e5feff',
					100: '#b8fcff',
					200: '#8af9ff',
					300: '#5CE1E6',
					400: '#4DD4E1',
					500: '#3EC5D1',
					600: '#2FB6C2',
					700: '#20A7B3',
					800: '#1B8D97',
					900: '#16737B',
				},
				accent: {
					50: '#e8f2ff',
					100: '#d1e5ff',
					200: '#a3d0ff',
					300: '#6B9CEA',
					400: '#5A8BDB',
					500: '#4A90E2',
					600: '#3A7BC8',
					700: '#2A66AE',
					800: '#1A5194',
					900: '#0A3C7A',
				},
				neutral: {
					50: '#f8f9fc',
					100: '#e4e7ef',
					200: '#c5cad9',
					300: '#B0B7C3',
					400: '#8891A5',
					500: '#6b7588',
					600: '#4f5866',
					700: '#3a424f',
					800: '#2d3548',
					900: '#1e2139',
				},
				luxury: {
					50: '#fdfdf9',
					100: '#f9f9f1',
					200: '#f3f2e7',
					300: '#e8e6d4',
					400: '#d6d2b8',
					500: '#b8b396',
					600: '#9a9474',
					700: '#7c775d',
					800: '#5e5a47',
					900: '#3e3b30',
				},
				dark: {
					DEFAULT: '#0a0e27',
					light: '#1a1d2e',
					card: '#1e2139',
					border: '#2d3548',
				},
				parchment: {
					DEFAULT: '#FDFCF8',
					light: '#FEFDF9',
					dark: '#F8F7F3',
				},
				pine: {
					DEFAULT: '#2D4F1E',
					light: '#4a6f3e',
					dark: '#1e3414',
				},
				slate: {
					DEFAULT: '#4A6D8C',
					light: '#739eb3',
					dark: '#3d5a72',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['Playfair Display', 'Lora', 'Georgia', 'serif'],
				serif: ['Playfair Display', 'Lora', 'Georgia', 'serif'],
				body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			},
			fontSize: {
				xs: ['0.75rem', {lineHeight: '1rem', letterSpacing: '0.02em'}],
				sm: [
					'0.875rem',
					{lineHeight: '1.25rem', letterSpacing: '0.01em'},
				],
				base: ['1rem', {lineHeight: '1.5rem', letterSpacing: '0'}],
				lg: [
					'1.125rem',
					{lineHeight: '1.75rem', letterSpacing: '-0.01em'},
				],
				xl: [
					'1.25rem',
					{lineHeight: '1.75rem', letterSpacing: '-0.01em'},
				],
				'2xl': [
					'1.5rem',
					{lineHeight: '2rem', letterSpacing: '-0.02em'},
				],
				'3xl': [
					'1.875rem',
					{lineHeight: '2.25rem', letterSpacing: '-0.02em'},
				],
				'4xl': [
					'2.25rem',
					{lineHeight: '2.5rem', letterSpacing: '-0.03em'},
				],
				'5xl': ['3rem', {lineHeight: '1', letterSpacing: '-0.03em'}],
				'6xl': ['3.75rem', {lineHeight: '1', letterSpacing: '-0.04em'}],
				'7xl': ['4.5rem', {lineHeight: '1', letterSpacing: '-0.04em'}],
				'8xl': ['6rem', {lineHeight: '1', letterSpacing: '-0.05em'}],
			},
			spacing: {
				18: '4.5rem',
				22: '5.5rem',
				26: '6.5rem',
				30: '7.5rem',
				34: '8.5rem',
			},
			borderRadius: {
				'4xl': '2rem',
				'5xl': '2.5rem',
			},
			boxShadow: {
				luxury: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
				'luxury-lg':
					'0 10px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
				'luxury-xl':
					'0 20px 60px -8px rgba(0, 0, 0, 0.16), 0 8px 24px -8px rgba(0, 0, 0, 0.08)',
				'luxury-2xl':
					'0 30px 80px -12px rgba(0, 0, 0, 0.20), 0 12px 32px -12px rgba(0, 0, 0, 0.10)',
				'inner-luxury': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.06)',
				premium:
					'0 20px 60px -12px rgba(74, 139, 112, 0.25), 0 10px 20px -5px rgba(74, 139, 112, 0.1)',
				'premium-lg':
					'0 25px 80px -15px rgba(74, 139, 112, 0.35), 0 15px 30px -10px rgba(74, 139, 112, 0.15)',
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in',
				'slide-up': 'slideUp 0.6s ease-out',
				'slide-down': 'slideDown 0.6s ease-out',
				'slide-left': 'slideLeft 0.6s ease-out',
				'slide-right': 'slideRight 0.6s ease-out',
				'scale-in': 'scaleIn 0.5s ease-out',
				float: 'float 6s ease-in-out infinite',
				glow: 'glow 2s ease-in-out infinite alternate',
				shimmer: 'shimmer 2s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-slow': 'bounce 3s ease-in-out infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': {opacity: '0'},
					'100%': {opacity: '1'},
				},
				slideUp: {
					'0%': {transform: 'translateY(20px)', opacity: '0'},
					'100%': {transform: 'translateY(0)', opacity: '1'},
				},
				slideDown: {
					'0%': {transform: 'translateY(-20px)', opacity: '0'},
					'100%': {transform: 'translateY(0)', opacity: '1'},
				},
				slideLeft: {
					'0%': {transform: 'translateX(20px)', opacity: '0'},
					'100%': {transform: 'translateX(0)', opacity: '1'},
				},
				slideRight: {
					'0%': {transform: 'translateX(-20px)', opacity: '0'},
					'100%': {transform: 'translateX(0)', opacity: '1'},
				},
				scaleIn: {
					'0%': {transform: 'scale(0.9)', opacity: '0'},
					'100%': {transform: 'scale(1)', opacity: '1'},
				},
				float: {
					'0%, 100%': {transform: 'translateY(0)'},
					'50%': {transform: 'translateY(-20px)'},
				},
				glow: {
					'0%': {
						textShadow:
							'0 0 20px rgba(74, 139, 112, 0.5), 0 0 30px rgba(74, 139, 112, 0.3)',
					},
					'100%': {
						textShadow:
							'0 0 30px rgba(74, 139, 112, 0.8), 0 0 40px rgba(74, 139, 112, 0.5)',
					},
				},
				shimmer: {
					'0%': {backgroundPosition: '-1000px 0'},
					'100%': {backgroundPosition: '1000px 0'},
				},
				shake: {
					'0%, 100%': {transform: 'translateX(0)'},
					'10%, 30%, 50%, 70%, 90%': {transform: 'translateX(-4px)'},
					'20%, 40%, 60%, 80%': {transform: 'translateX(4px)'},
				},
			},
			backdropBlur: {
				xs: '2px',
			},
			transitionDuration: {
				400: '400ms',
				600: '600ms',
				800: '800ms',
			},
			scale: {
				102: '1.02',
				98: '0.98',
			},
		},
	},
	plugins: [],
};
