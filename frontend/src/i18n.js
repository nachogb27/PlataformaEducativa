import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = require.context('./i18n', true, /[a-z0-9-_]+\/[a-z0-9-_]+\.json$/i)
  const messages = {}

  locales.keys().forEach(key => {
    const matched = key.match(/([a-z0-9-_]+)\/([a-z0-9-_]+)\.json$/i)
    if (matched && matched.length > 2) {
      const lang = matched[1]
      const file = matched[2]
      messages[lang] = messages[lang] || {}
      messages[lang][file] = locales(key)
    }
  })

  return messages
}

const i18n = new VueI18n({
  locale: 'es', // Idioma predeterminado
  fallbackLocale: 'en',
  messages: loadLocaleMessages()
})

export default i18n

