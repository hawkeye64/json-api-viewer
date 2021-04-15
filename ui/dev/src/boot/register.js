import { boot } from 'quasar/wrappers'
import VuePlugin from 'ui' // "ui" is aliased in quasar.conf.js

console.log(VuePlugin)

export default boot(({ app }) => {
  app.use(VuePlugin)
})
