import {
  defineComponent,
  h
} from 'vue'

// Utils
import {
  QBadge
} from 'quasar'

import 'prismjs'

const NAME_PROP_COLOR = [
  'bg-orange-8',
  'bg-accent',
  'bg-secondary',
  'bg-warning'
]

export default defineComponent({
  name: 'JsonApiItem',

  props: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'props'
    },
    json: {
      type: Object,
      required: true
    },
    deprecatedColor: {
      type: String,
      default: 'yellow-8'
    },
    deprecatedBackground: {
      type: String,
      default: 'red-8'
    },
    removedColor: {
      type: String,
      default: 'yellow-8'
    },
    removedBackground: {
      type: String,
      default: 'red-8'
    }
  },

  setup (props, { slots }) {
    function highlight (str, lang) {
      if (lang === '') {
        lang = 'js'
      }
      else if (lang === 'vue' || lang === 'html') {
        lang = 'html'
      }

      if (Prism.languages[ lang ] !== undefined) {
        const code = Prism.highlight(str, Prism.languages[ lang ], lang)

        return '<pre class="q-markdown--code">'
          + `<code class="q-markdown--code__inner language-${ lang }">${ code }</code></pre>\n`
      }

      return ''
    }

    function getMethodName (title, json) {
      let name

      name = ' ['

      if (json.returns) {
        name += json.returns.type
      }
      else {
        name += 'void 0'
      }

      name += '] '

      if (json.params === void 0) {
        name += title + ' ()'
      }
      else {
        name += title + ' (' + Object.keys(json.params).join(', ') + ')'
      }

      return name
    }

    function getEventName () {
      let name = '@' + props.name + ' => function'

      if (props.json.params === void 0) {
        return name + ' ()'
      }

      name += ' (' + Object.keys(props.json.params).join(', ') + ')'

      return name
    }

    function __renderSubitem (name, json, level = 0) {
      if (json.type === 'Function') {
        name = getMethodName(name, json)
      }
      return h('div', {
        class: 'component-api__row component-api__row--bordered row'
      }, {
        default: () => [
          __renderName(name, NAME_PROP_COLOR[ level ]),
          __renderType(json),
          props.json.removedIn !== void 0 && __renderRemovedIn(json),
          props.json.removedIn === void 0 && props.json.deprecated !== void 0 && __renderDeprecated(json),
          props.json.removedIn === void 0 && props.json.deprecated === void 0 && __renderAddedIn(json),
          __renderRequired(json),
          __renderSync(json),
          __renderDefault(json),
          __renderApplicable(json),

          __renderDesc(json),
          __renderValues(json),
          __renderExamples(json),
          __renderParams(json, level + 1),
          __renderDefinitions(json, level + 1),
          __renderScope(json, level + 1),
          __renderReturns(json, level + 1)
        ]
      })
    }

    function __renderParams (json, level = 0) {
      if (json.params === void 0) return ''
      const keys = Object.keys(json.params)
      return h('div', {
        class: 'component-api__row--item full-width'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Parameter' + (Object.keys(json.params).length > 1 ? 's' : '')),
          h('div', {
          }, {
            default: () => [
              keys.map(key => __renderSubitem(key, json.params[ key ], level))
            ]
          })
        ]
      })
    }

    function __renderDefinitions (json, level = 0) {
      if (json.definition === void 0) return ''
      const keys = Object.keys(json.definition)
      return h('div', {
        class: 'component-api__row--item full-width'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Definition' + (Object.keys(json.definition).length > 1 ? 's' : '')),
          h('div', {
          }, {
            default: () => [
              keys.map(key => __renderSubitem(key, json.definition[ key ], level))
            ]
          })
        ]
      })
    }

    function __renderScope (json, level = 0) {
      if (json.scope === void 0) return ''
      const keys = Object.keys(json.scope)
      return h('div', {
        class: 'component-api__row--item full-width'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Scope'),
          h('div', {
          }, {
            default: () => [
              keys.map(key => __renderSubitem(key, json.scope[ key ], level))
            ]
          })
        ]
      })
    }

    function __renderReturns (json, level = 0) {
      if (json.returns === void 0) return ''
      return h('div', {
        class: 'component-api__row--item full-width'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Returns'),
          h('div', {
          }, {
            default: () => [
              json.returns === null && 'null',
              json.returns !== null && __renderSubitem(void 0, json.returns, level)
            ]
          })
        ]
      })
    }

    function __renderValues (json) {
      if (json.values === void 0 || json.values.length <= 0) return ''
      return h('div', {
        class: 'component-api__row--item col-auto'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Value' + (json.values.length > 1 ? 's' : '')),
          h('div', {
            class: 'component-api__row--values'
          }, json.values.join(', '))
        ]
      })
    }

    function __renderExample (example) {
      const inner = highlight(example, 'js')

      return h('div', {
        class: 'component-api__row--example',
        innerHtml: inner
      })
    }

    function __renderExamples (json) {
      if (json.examples === void 0 || json.examples.length <= 0) return ''
      return h('div', {
        class: 'component-api__row--item col-auto'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Example' + (json.examples.length > 1 ? 's' : '')),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              json.examples.map((example, index) => __renderExample(example))
            ]
          })
        ]
      })
    }

    function __renderDesc (json) {
      if (json.desc === void 0) return
      // const inner = highlight(json.desc, 'md')

      return h('div', {
        class: 'component-api__row--item full-width'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Description'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', {
                // innerHTML: inner
              }, json.desc)
            ]
          })
        ]
      })
    }

    function __renderSync (json) {
      if (json.sync === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Sync'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', json.sync)
            ]
          })
        ]
      })
    }

    function __renderRequired (json) {
      if (json.required === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Required'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', json.required)
            ]
          })
        ]
      })
    }

    function __renderApplicable (json) {
      if (json.applicable === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Applicable'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', json.applicable.join(', '))
            ]
          })
        ]
      })
    }

    function __renderDefault (json) {
      if (json.default === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Default'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', json.default)
            ]
          })
        ]
      })
    }

    function __renderRemovedIn (json) {
      if (json.removedIn === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, {
            default: () => [
              h('span', {
                class: 'rounded-borders text-' + props.removedColor + ' bg-' + props.removedBackground
              }, 'Removed in')
            ]
          }),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', {
                default: () => [
                  h('span', {
                    class: 'rounded-borders text-' + props.deprecatedColor + ' bg-' + props.deprecatedBackground
                  }, json.removedIn)
                ]
              })
            ]
          })
        ]
      })
    }

    function __renderDeprecated (json) {
      if (json.deprecated === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, {
            default: () => [
              h('span', {
                class: 'rounded-borders text-' + props.deprecatedColor + ' bg-' + props.deprecatedBackground
              }, 'Deprecated')
            ]
          }),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('span', {
                class: 'rounded-borders text-' + props.deprecatedColor + ' bg-' + props.deprecatedBackground
              }, json.deprecated)
            ]
          })
        ]
      })
    }

    function __renderAddedIn (json) {
      if (json.addedIn === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Added in'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', json.addedIn)
            ]
          })
        ]
      })
    }

    function __renderType (json) {
      if (json.type === void 0) return ''
      const type = Array.isArray(json.type) ? json.type.join(' | ') : json.type
      return h('div', {
        class: 'component-api__row--item col-xs-12 col-sm-4'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Type'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h('div', type)
            ]
          })
        ]
      })
    }

    function __renderName (name, color) {
      if (name === void 0) return ''
      return h('div', {
        class: 'component-api__row--item col-grow'
      }, {
        default: () => [
          h('div', {
            class: 'component-api__row--label'
          }, 'Name'),
          h('div', {
            class: 'component-api__row--value'
          }, {
            default: () => [
              h(QBadge, {
                class: `property-name ${ color }`
              }, {
                default: () => name
              })
            ]
          })
        ]
      })
    }

    function __render () {
      let name = props.name
      if (props.type === 'methods') {
        name = getMethodName(name, props.json)
      }
      else if (props.type === 'events') {
        name = getEventName(name, props.json)
      }
      const level = 0
      return h('div', {
        class: 'row full-width'
      }, {
        default: () => [
          __renderName(name, NAME_PROP_COLOR[ level ]),
          __renderType(props.json),
          props.json.removedIn === void 0 && __renderDeprecated(props.json),
          props.json.deprecated === void 0 && __renderAddedIn(props.json),
          __renderRemovedIn(props.json),
          __renderRequired(props.json),
          __renderSync(props.json),
          __renderDefault(props.json),
          __renderApplicable(props.json),

          __renderDesc(props.json),
          __renderValues(props.json),
          __renderExamples(props.json),
          __renderParams(props.json, level + 1),
          __renderDefinitions(props.json, level + 1),
          __renderScope(props.json, level + 1),
          __renderReturns(props.json, level + 1)
        ]
      })
    }

    function render () {
      return __render()
    }

    return () => render()
  }
})
