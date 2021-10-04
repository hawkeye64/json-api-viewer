import Component from './components/JsonApiViewer.js'

import { version } from './version'

function install (app) {
  app.component(Component.name, Component)
}

export {
  version,
  Component,
  install
}
