import { version } from '../package.json'
import JsonApiViewer from './components/JsonApiViewer.js'

export {
  version,
  JsonApiViewer
}

export default {
  version,
  JsonApiViewer,

  install (Vue) {
    Vue.component(JsonApiViewer.name, JsonApiViewer)
  }
}
