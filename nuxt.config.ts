// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-14',

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  fonts: {
    providers: {
      local: false,
    },
    families: [
      // Sans-serif
      { name: 'Inter', provider: 'google', global: true },
      { name: 'DM Sans', provider: 'google', global: true },
      { name: 'Outfit', provider: 'google', global: true },
      { name: 'Space Grotesk', provider: 'google', global: true },
      { name: 'Syne', provider: 'google', global: true },
      { name: 'Montserrat', provider: 'google', global: true },
      { name: 'Raleway', provider: 'google', global: true },
      { name: 'Poppins', provider: 'google', global: true },
      { name: 'Plus Jakarta Sans', provider: 'google', global: true },
      { name: 'Manrope', provider: 'google', global: true },
      { name: 'Urbanist', provider: 'google', global: true },
      { name: 'Figtree', provider: 'google', global: true },
      { name: 'Lexend', provider: 'google', global: true },
      { name: 'Albert Sans', provider: 'google', global: true },
      { name: 'Work Sans', provider: 'google', global: true },
      { name: 'Nunito Sans', provider: 'google', global: true },
      { name: 'Rubik', provider: 'google', global: true },
      { name: 'Lato', provider: 'google', global: true },
      // Display / Bold
      { name: 'Bebas Neue', provider: 'google', global: true },
      { name: 'Archivo Black', provider: 'google', global: true },
      { name: 'Oswald', provider: 'google', global: true },
      { name: 'Anton', provider: 'google', global: true },
      { name: 'Righteous', provider: 'google', global: true },
      { name: 'Unbounded', provider: 'google', global: true },
      { name: 'Abril Fatface', provider: 'google', global: true },
      { name: 'Playfair Display', provider: 'google', global: true },
      { name: 'Cormorant Garamond', provider: 'google', global: true },
      { name: 'Libre Baskerville', provider: 'google', global: true },
      // Serif
      { name: 'DM Serif Display', provider: 'google', global: true },
      { name: 'Lora', provider: 'google', global: true },
      { name: 'Merriweather', provider: 'google', global: true },
      { name: 'Source Serif 4', provider: 'google', global: true },
      { name: 'Crimson Text', provider: 'google', global: true },
      // Monospace
      { name: 'JetBrains Mono', provider: 'google', global: true },
      { name: 'Space Mono', provider: 'google', global: true },
      { name: 'IBM Plex Mono', provider: 'google', global: true },
      { name: 'Fira Code', provider: 'google', global: true },
    ],
  },

  nitro: {
    preset: 'bun',
    rollupConfig: {
      external: ['bun:sqlite'],
    },
  },
});
