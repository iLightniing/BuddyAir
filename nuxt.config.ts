// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    pageTransition: {
      name: 'auth-slide',
      mode: 'out-in'
    },
    head: {
      htmlAttrs: {
        lang: 'fr'
      },
      title: 'BuddyAir | Votre épargne prend son envol',
      meta: [
        { name: 'description', content: 'BuddyAir | Votre épargne prend son envol - La plateforme moderne pour suivre et faire fructifier votre épargne.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon'
  ]
})