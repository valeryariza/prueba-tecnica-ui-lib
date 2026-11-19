/**
 * Tailwind CSS v3 preset de ui-lib.
 *
 * La librería no fija colores: todos sus componentes usan tokens semánticos
 * (`ui-primary`, `ui-surface`, ...) que leen variables CSS. La app que consume
 * la librería define esas variables y así aplica su propio tema.
 *
 * Cada variable guarda un color en formato "R G B" (sin comas) para que
 * Tailwind pueda aplicar opacidad, por ejemplo `bg-ui-primary/20`.
 * Si la app no define una variable, se usa el valor por defecto indicado.
 *
 * Uso en el tailwind.config.js de la app:
 *   presets: [require('ui-lib/tailwind-preset')]
 *   content: ['./src/**\/*.{html,ts}', './node_modules/ui-lib/**\/*.mjs']
 */

/** @param {string} name @param {string} fallback */
const token = (name, fallback) => `rgb(var(--ui-color-${name}, ${fallback}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ui: {
          primary: token('primary', '37 99 235'),
          'primary-hover': token('primary-hover', '29 78 216'),
          'on-primary': token('on-primary', '255 255 255'),
          secondary: token('secondary', '71 85 105'),
          'secondary-hover': token('secondary-hover', '51 65 85'),
          danger: token('danger', '220 38 38'),
          'danger-hover': token('danger-hover', '185 28 28'),
          'on-danger': token('on-danger', '255 255 255'),
          surface: token('surface', '255 255 255'),
          'surface-muted': token('surface-muted', '248 250 252'),
          'surface-raised': token('surface-raised', '255 255 255'),
          border: token('border', '226 232 240'),
          text: token('text', '15 23 42'),
          'text-muted': token('text-muted', '100 116 139'),
          focus: token('focus', '59 130 246'),
          skeleton: token('skeleton', '226 232 240'),
        },
      },
    },
  },
};
