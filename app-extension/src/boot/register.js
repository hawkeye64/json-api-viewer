import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-json-api-viewer'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
