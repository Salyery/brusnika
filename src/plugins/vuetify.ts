import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { ru } from 'vuetify/locale'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'ru',
    fallback: 'ru',
    messages: { ru },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dinnovate',
    themes: {
      dinnovate: {
        colors: {
          // Primary colors - matching React version exactly
          primary: '#2196F3',
          'primary-50': '#E3F2FD',
          'primary-100': '#BBDEFB',
          'primary-200': '#90CAF9',
          'primary-300': '#64B5F6',
          'primary-400': '#42A5F5',
          'primary-500': '#2196F3',
          'primary-600': '#1E88E5',
          'primary-700': '#1976D2',
          'primary-800': '#1565C0',
          'primary-900': '#0D47A1',
          
          // Secondary colors
          secondary: '#9C27B0',
          'secondary-50': '#F3E5F5',
          'secondary-100': '#E1BEE7',
          'secondary-200': '#CE93D8',
          'secondary-300': '#BA68C8',
          'secondary-400': '#AB47BC',
          'secondary-500': '#9C27B0',
          'secondary-600': '#8E24AA',
          'secondary-700': '#7B1FA2',
          'secondary-800': '#6A1B9A',
          'secondary-900': '#4A148C',
          
          // Success colors
          success: '#4CAF50',
          'success-50': '#E8F5E9',
          'success-100': '#C8E6C9',
          'success-200': '#A5D6A7',
          'success-300': '#81C784',
          'success-400': '#66BB6A',
          'success-500': '#4CAF50',
          'success-600': '#43A047',
          'success-700': '#388E3C',
          'success-800': '#2E7D32',
          'success-900': '#1B5E20',
          
          // Warning colors
          warning: '#FFC107',
          'warning-50': '#FFF8E1',
          'warning-100': '#FFECB3',
          'warning-200': '#FFE082',
          'warning-300': '#FFD54F',
          'warning-400': '#FFCA28',
          'warning-500': '#FFC107',
          'warning-600': '#FFB300',
          'warning-700': '#E65100',
          'warning-800': '#FF8F00',
          'warning-900': '#FF6F00',
          
          // Error/Danger colors
          error: '#F44336',
          'error-50': '#FFEBEE',
          'error-100': '#FFCDD2',
          'error-200': '#EF9A9A',
          'error-300': '#E57373',
          'error-400': '#EF5350',
          'error-500': '#F44336',
          'error-600': '#E53935',
          'error-700': '#D32F2F',
          'error-800': '#C62828',
          'error-900': '#B71C1C',
          
          info: '#2196F3',
          accent: '#82B1FF',
          
          // Gray scale - matching React version exactly
          'grey-50': '#FAFAFA',
          'grey-100': '#F5F5F5',
          'grey-200': '#EEEEEE',
          'grey-300': '#E0E0E0',
          'grey-400': '#BDBDBD',
          'grey-500': '#9E9E9E',
          'grey-600': '#757575',
          'grey-700': '#616161',
          'grey-800': '#424242',
          'grey-900': '#212121',
          
          // Background and surface
          background: '#FAFAFA',
          surface: '#FFFFFF',
          
          // Text colors - matching React version (text-gray-800 = #424242)
          'on-surface': '#424242', // Main text color
          'on-background': '#424242',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-success': '#FFFFFF',
          'on-warning': '#424242',
          'on-error': '#FFFFFF',
        },
        variables: {
          // Border radius
          'border-radius-xs': '0.25rem', // 4px
          'border-radius-sm': '0.375rem', // 6px
          'border-radius-md': '0.5rem', // 8px
          'border-radius-lg': '0.75rem', // 12px - основной для модалок
          'border-radius-xl': '1rem', // 16px
          
          // Font sizes
          'font-size-xs': '0.75rem', // 12px
          'font-size-sm': '0.875rem', // 14px - основной
          'font-size-base': '1rem', // 16px
          'font-size-lg': '1.125rem', // 18px
          'font-size-xl': '1.25rem', // 20px
          'font-size-2xl': '1.5rem', // 24px
          'font-size-3xl': '1.875rem', // 30px
          
          // Spacing/Padding
          'spacing-xs': '0.25rem', // 4px
          'spacing-sm': '0.5rem', // 8px
          'spacing-md': '0.75rem', // 12px
          'spacing-lg': '1rem', // 16px
          'spacing-xl': '1.25rem', // 20px
          
          // Input field specific
          'input-height': '36px',
          'input-padding-y': '8px',
          'input-padding-x': '12px',
          'input-font-size': '14px',
          'input-border-color': '#D1D5DB', // grey-300
          'input-border-radius': '0.75rem', // 12px
          'input-focus-border-color': '#2196F3', // primary
          
          // Placeholder
          'placeholder-color': '#9E9E9E', // grey-500
          'placeholder-opacity': '1',
          
          // Checkbox
          'checkbox-size': '16px',
          'checkbox-border-radius': '4px',
          'checkbox-border-color': '#D1D5DB', // grey-300
          'checkbox-checked-bg': '#1E88E5', // primary-600
          
          // Button
          'button-padding-y': '8px',
          'button-padding-x': '16px',
          'button-font-size': '14px',
          'button-font-weight': '500',
          'button-border-radius': '0.75rem', // 12px
          'button-height': 'auto',
          
          // Dialog/Modal
          'dialog-border-radius': '0.75rem', // 12px
          'dialog-backdrop-blur': '4px',
          'dialog-backdrop-opacity': '0.5',
          
          // Medium emphasis opacity (for placeholders, hints)
          'medium-emphasis-opacity': '1',
        },
      },
      light: {
        colors: {
          // Primary colors - matching React version (#2196f3)
          primary: '#2196F3',
          'primary-darken-1': '#1976D2',
          'primary-darken-2': '#1565C0',
          'primary-lighten-1': '#42A5F5',
          'primary-lighten-2': '#64B5F6',
          'primary-lighten-3': '#90CAF9',
          'primary-lighten-4': '#BBDEFB',
          'primary-lighten-5': '#E3F2FD',
          
          // Secondary colors
          secondary: '#9C27B0',
          'secondary-darken-1': '#7B1FA2',
          'secondary-lighten-1': '#AB47BC',
          'secondary-lighten-2': '#BA68C8',
          
          // Status colors
          success: '#4CAF50',
          'success-darken-1': '#388E3C',
          'success-lighten-1': '#66BB6A',
          'success-lighten-2': '#81C784',
          'success-lighten-3': '#A5D6A7',
          'success-lighten-4': '#C8E6C9',
          'success-lighten-5': '#E8F5E9',
          
          warning: '#FFC107',
          'warning-darken-1': '#E65100',
          'warning-lighten-1': '#FFCA28',
          'warning-lighten-2': '#FFD54F',
          'warning-lighten-3': '#FFE082',
          'warning-lighten-4': '#FFECB3',
          'warning-lighten-5': '#FFF8E1',
          
          error: '#F44336',
          'error-darken-1': '#D32F2F',
          'error-lighten-1': '#EF5350',
          'error-lighten-2': '#E57373',
          'error-lighten-3': '#EF9A9A',
          'error-lighten-4': '#FFCDD2',
          'error-lighten-5': '#FFEBEE',
          
          info: '#2196F3',
          accent: '#82B1FF',
          
          // Gray scale - matching React version
          'grey-lighten-5': '#FAFAFA',
          'grey-lighten-4': '#F5F5F5',
          'grey-lighten-3': '#EEEEEE',
          'grey-lighten-2': '#E0E0E0',
          'grey-lighten-1': '#BDBDBD',
          'grey-darken-1': '#9E9E9E',
          'grey-darken-2': '#757575',
          'grey-darken-3': '#616161',
          'grey-darken-4': '#424242',
          'grey-darken-5': '#212121',
          
          // Background and surface
          background: '#FAFAFA',
          surface: '#FFFFFF',
        },
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#9C27B0',
          success: '#4CAF50',
          warning: '#FFC107',
          error: '#F44336',
          info: '#2196F3',
          accent: '#FF4081',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
  
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-size: 14px; font-weight: 500; padding: 8px 16px; min-height: auto; height: auto; line-height: 1.5;',
      rounded: false,
      class: 'dinnovate-btn',
    },
    VCard: {
      rounded: 'lg',
      elevation: 1,
    },
    VCardTitle: {
      style: 'font-size: 24px; font-weight: 600; color: #111827; padding: 10px 20px; border-bottom: 1px solid #E5E7EB;',
      class: 'dinnovate-card-title',
    },
    VCardText: {
      style: 'letter-spacing: unset;',
      class: 'dinnovate-card-text',
    },
    VDialog: {
      contentClass: 'dinnovate-dialog-content',
      maxWidth: '500',
    },
    VMenu: {
      contentClass: 'dinnovate-menu-content',
    },
    VOverlay: {
      scrim: 'rgba(0, 0, 0, 0.5)',
    },
    VSheet: {
      class: 'project-card-sheet',
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
      style: '--v-medium-emphasis-opacity: var(--v-theme-medium-emphasis-opacity, 1);',
      class: 'dinnovate-text-field',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: true,
      class: 'dinnovate-select',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VCheckbox: {
      density: 'compact',
      hideDetails: true,
      class: 'dinnovate-checkbox',
    },
    VLabel: {
      style: 'font-size: 12px; font-weight: 500; color: #374151; opacity: 1; letter-spacing: unset;',
      class: 'dinnovate-label',
    },
  },
})