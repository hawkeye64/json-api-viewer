import Component from './components/JsonApiViewer.js'
import pkg from '../package.json'
const { version } = pkg

function install (app) {
  app.component(Component.name, Component)
}

export {
  version,
  Component,
  install
}
