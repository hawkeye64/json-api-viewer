/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
import {
  computed,
  defineComponent,
  h,
  onBeforeMount,
  ref,
  reactive,
  watch,
  getCurrentInstance
} from 'vue'

// Utils
import JsonApiList from './JsonApiList'
import {
  useQuasar,
  QBadge,
  QCard,
  QCheckbox,
  QIcon,
  QInput,
  QMenu,
  // QPopupProxy,
  QSeparator,
  QSpace,
  QTabs,
  QTab,
  QTabPanels,
  QTabPanel,
  QToolbar,
  QToolbarTitle,
  ClosePopup,
  extend
} from 'quasar'

// utils
import { copyHeading, slugify } from '../utils/utils.js'

import { version } from '../../package.json'

export default defineComponent({
  name: 'JsonApiViewer',

  directives: { ClosePopup },

  props: {
    title: {
      type: String,
      required: true
    },
    json: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      default: 'Vue Component'
    },
    noMenu: Boolean,
    startingTab: String,
    startingInnerTab: String,
    noFooter: Boolean
  },

  setup (props, { slots }) {
    const
      ready = ref(false),
      currentTab = ref('props'),
      currentInnerTab = ref('model'),
      // api = ref(null),
      filteredApi = ref(null),
      filter = ref(null),
      tabs = ref([]),
      tabCount = reactive({}),
      innerTabCount = reactive({}),
      innerTabContent = reactive({}),
      borderColor = ref('lightblue'),
      separatorColor = ref('light-blue-2'),
      showDeprecated = ref(false),
      showRemoved = ref(false),
      inputRef = ref(null),
      vm = getCurrentInstance(),
      $q = vm.proxy.$q || vm.ctx.$q || useQuasar()

    const __slugifiedTitle = computed(() => slugify(props.title))

    watch(() => filter.value, () => {
      __parseJson(props.json)
    })

    watch(() => showDeprecated.value, () => {
      __parseJson(props.json)
    })

    watch(() => showRemoved.value, () => {
      __parseJson(props.json)
    })

    onBeforeMount(() => {
      currentTab.value = props.startingTab || currentTab.value
      currentInnerTab.value = props.startingInnerTab || currentInnerTab.value
      __parseJson(props.json)
    })

    function __parseJson (json) {
      if (json === void 0) {
        // no api
        ready.value = true
        return
      }

      // deep copy object
      const api = extend(true, {}, json)

      if (api.type !== void 0) {
        delete api.type
      }

      if (api.meta) {
        delete api.meta
      }

      __resetFiltered()

      // deal with "props"
      if (api.props !== void 0) {
        // get sorted keys
        const propKeys = Object.keys(api.props).sort()

        // loop through keys to get inner tab content
        for (let j = 0; j < propKeys.length; ++j) {
          const key = propKeys[ j ]
          const p = api.props[ key ]
          if (p.deprecated !== void 0 && props.showDeprecated !== true) {
            delete api.props[ key ]
            continue
          }
          if (p.removedIn !== void 0 && props.showRemoved !== true) {
            delete api.props[ key ]
            continue
          }
          if (innerTabContent[ p.category ] === void 0) {
            innerTabContent[ p.category ] = {}
          }
          if (__filterKey(key)) {
            innerTabContent[ p.category ][ key ] = p
          }
          else {
            const apiProps = __filterContent(p)
            if (Object.keys(apiProps).length > 0) {
              innerTabContent[ p.category ][ key ] = apiProps
            }
            else {
              delete api.props[ key ]
            }
          }
        }

        __deleteKeys(innerTabCount)
        const innerKeys = Object.keys(innerTabContent)
        for (let k = 0; k < innerKeys.length; ++k) {
          const innerPropKey = innerKeys[ k ]
          innerTabCount[ innerPropKey ] = Object.keys(innerTabContent[ innerPropKey ]).length
        }
      }

      __filterTopLevel(api)

      // get a count of items within each top-level tab menu
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const type = keys[ i ]
        tabs.value[ type ] = Object.keys(api[ type ]).length
      }

      filteredApi.value = api

      ready.value = true
    }

    function __filterTopLevel (api) {
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const type = keys[ i ]
        if (type !== 'props') {
          // loop through inner content
          const propKeys = Object.keys(api[ type ])
          for (let l = 0; l < propKeys.length; ++l) {
            const key = propKeys[ l ]
            const p = api[ type ][ key ]
            if (p.deprecated !== void 0 && props.showDeprecated !== true) {
              delete api[ type ][ key ]
            }
            if (p.removedIn !== void 0 && props.showRemoved !== true) {
              delete api[ type ][ key ]
            }
            else if (__filterKey(key) !== true) {
              const apiProps = __filterContent(p)
              if (Object.keys(apiProps).length === 0) {
                delete api[ type ][ key ]
              }
            }
          }
        }
      }
    }

    function __filterContent (api) {
      if (filter.value === null) {
        return api
      }

      let found = false
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const prop = api[ keys[ i ] ]
        const type = Object.prototype.toString.call(prop)
        if (type === '[object Array]') {
          if (__filterArray(prop)) {
            found = true
            break
          }
        }
        else if (type === '[object String]' || type === '[object Number]') {
          if (__filterString(prop)) {
            found = true
            break
          }
        }
      }

      if (found !== true) {
        return {}
      }

      return api
    }

    // tests the passed string against the filter
    function __filterString (str) {
      if (filter.value) {
        return String(str).toLowerCase().indexOf(filter.value.toLowerCase()) >= 0
      }
    }

    function __filterKey (str) {
      return __filterString(str)
    }

    function __filterArray (arr) {
      for (let i = 0; i < arr.length; ++i) {
        if (__filterString(arr[ i ]) === true) {
          return true
        }
      }
      return false
    }

    function __resetFiltered () {
      __deleteKeys(innerTabContent)
      __deleteKeys(innerTabCount)
      __deleteKeys(tabCount)
      tabs.value = []
    }

    function __deleteKeys (obj) {
      Object.keys(obj).forEach(key => {
        delete obj[ key ]
      })
    }

    function __onFilter () {
      if (filter.value !== null) {
        filter.value = null
      }

      inputRef.value.focus()
    }

    function __renderTitle () {
      return h(QToolbarTitle, {
        class: props.noAnchor !== true ? 'text-subtitle1 component-api__title' : '',
        onClick: copyHeading
      }, {
        default: () => h('span', {
          class: 'ellipsis'
        }, props.title)
      })
    }

    function __renderFilter () {
      return h(QInput, {
        ref: inputRef,
        class: 'q-mx-sm',
        // style: {
        //   minWidth: '150px'
        // },
        placeholder: 'Filter...',
        modelValue: filter.value,
        inputClass: 'text-right',
        dense: true,
        borderless: true,
        'onUpdate:modelValue': v => {
          filter.value = v
        }
      },
      {
        append: () => h(QIcon, {
          class: 'cursor-pointer',
          name: filter.value !== null ? 'clear' : 'search',
          onClick: __onFilter
        })
      })
    }

    function __renderToolbar () {
      return h(QToolbar, {}, {
        default: () => [
          __renderTitle(),
          h('div', {
            class: 'q-ml-md col-auto text-grey text-caption'
          }, {
            default: () => [
              $q.screen.gt.xs && props.type
            ]
          }),
          $q.screen.width >= 385 && __renderFilter(),
          props.noMenu !== true && __renderMenu()
        ]
      })
    }

    function __renderMenu () {
      return h(QIcon, {
        class: 'cursor-pointer text-grey',
        name: 'menu',
        size: 'md'
      }, {
        default: () => [
          h(QMenu, {
            default: () => [
              h('div', {
                class: 'row no-wrap q-pa-md'
              }, {
                default: () => [
                  h('div', {
                    class: 'column'
                  }, {
                    default: () => [
                      h(QCheckbox, {
                        modelValue: showDeprecated.value,
                        label: 'Show deprecated',
                        // directives: [{
                        //   name: 'close-popup'
                        // }],
                        'onUpdate:modelValue': val => {
                          showDeprecated.value = val
                        }
                      }),
                      h(QCheckbox, {
                        modelValue: showRemoved.value,
                        label: 'Show removed',
                        // directives: [{
                        //   name: 'close-popup'
                        // }],
                        'onUpdate:modelValue': val => {
                          showRemoved.value = val
                        }
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    }

    function __renderTabs () {
      return h('div', {
        class: 'row justify-between items-center no-wrap' + (!$q.dark.isActive ? ' bg-white text-grey-7' : '')
      }, {
        default: () => [
          h(QTabs, {
            class: 'col-grow text-caption' + (!$q.dark.isActive ? ' bg-white text-grey-7' : ''),
            modelValue: currentTab.value,
            dense: true,
            activeColor: $q.dark.isActive ? 'yellow' : 'primary',
            indicatorColor: $q.dark.isActive ? 'yellow' : 'primary',
            align: 'left',
            narrowIndicator: true,
            'onUpdate:modelValue': v => {
              currentTab.value = v
            }
          }, {
            default: () => __renderTab(tabs.value)
          })
        ]
      })
    }

    function __renderTab (tab) {
      return [
        ...Object.keys(tab).map(propKey => h(QTab, {
          key: propKey + '-tab',
          name: propKey,
          style: {
            paddingRight: 0
          }
        }, {
          default: () => [
            __renderTabSlot(propKey, tab[ propKey ])
          ]
        }))
      ]
    }

    function __renderTabSlot (label, count, stretch) {
      return h('div', {
        class: 'row no-wrap items-center self-stretch q-pr-sm' + (stretch ? ' justify-between' : ''),
        style: {
          minWidth: stretch === true ? '120px' : void 0
        }
      }, {
        default: () => [
          h('span', {
            class: 'q-mr-xs text-capitalize text-weight-medium'
          }, label),
          count > 0 && h(QBadge, null, { default: () => count })
        ]
      })
    }

    function __renderTabPanels () {
      return h(QTabPanels, {
        modelValue: currentTab.value,
        animated: true,
        'onUpdate:modelValue': v => {
          currentTab.value = v
        }
      }, {
        default: () => __renderTabPanel()
      })
    }

    function __renderTabPanel () {
      return [...Object.keys(tabs.value)
        .map(propKey => h(QTabPanel, {
          key: propKey + '-panel',
          class: 'q-pa-none',
          name: propKey
        }, {
          default: () => [
            propKey === 'props' && __renderInnerTabs(propKey, filteredApi.value[ propKey ]),
            propKey !== 'props' && __renderApiList(propKey, filteredApi.value[ propKey ])
          ]
        }))
      ]
    }

    function __renderApiList (name, api) {
      return h('div', {
        class: 'component-api__container'
      }, {
        default: () => [
          h(JsonApiList, {
            name: name,
            json: api
          })
        ]
      })
    }

    function __renderInnerTabs (name, api) {
      return h('div', {
        class: 'fit row'
      }, {
        default: () => [
          h('div', {
            class: 'col-auto row no-wrap q-py-lg' + (!$q.dark.isActive ? ' bg-white text-grey-7' : '')
          }, {
            default: () => [
              h(QTabs, {
                class: 'text-caption' + (!$q.dark.isActive ? ' bg-white text-grey-7' : ''),
                modelValue: currentInnerTab.value,
                dense: true,
                vertical: true,
                activeColor: $q.dark.isActive ? 'yellow' : 'primary',
                indicatorColor: $q.dark.isActive ? 'yellow' : 'primary',
                align: 'left',
                narrowIndicator: true,
                'onUpdate:modelValue': v => {
                  currentInnerTab.value = v
                }
              }, {
                default: () => [
                  ...Object.keys(innerTabCount)
                    .map(propKey => h(QTab, {
                      key: propKey + '-inner-tab',
                      class: 'col-grow',
                      name: propKey
                    },
                    {
                      default: () => [
                        __renderTabSlot(propKey, innerTabCount[ propKey ], true)
                      ]
                    }
                    ))
                ]
              })
            ]
          }),
          h(QSeparator, {
            vertical: true,
            color: separatorColor.value,
            style: {
              minHeight: '600px'
            }
          }),
          __renderInnerTabPanels()
        ]
      })
    }

    function __renderInnerTabPanels () {
      return h(QTabPanels, {
        class: 'col',
        modelValue: currentInnerTab.value,
        animated: true,
        transitionPrev: 'slide-down',
        transitionNext: 'slide-up',
        'onUpdate:modelValue': v => {
          currentInnerTab.value = v
        }
      }, {
        default: () => [
          __renderInnerTabPanel()
        ]
      })
    }

    function __renderInnerTabPanel () {
      return [...Object.keys(innerTabContent)
        .map(propKey => h(QTabPanel, {
          key: propKey + '-inner-panel',
          class: 'q-pa-none',
          name: propKey
        }, {
          default: () => [
            __renderApiList(propKey, innerTabContent[ propKey ])
          ]
        }))
      ]
    }

    function __renderFooter () {
      const slot = slots.footer
      if (props.noFooter === true) return
      return h('div', {
        class: 'component-api__footer row justify-between items-center'
      }, {
        default: () => [
          slot || h('div', 'Quasar JSON API Viewer v' + version + ' - Created and maintained by Jeff Galbraith (@hawkeye64)')
        ]
      })
    }

    function __renderCard () {
      return h(QCard, {
        class: 'no-shadow',
        flat: true,
        bordered: true,
        style: {
          border: `${ borderColor.value } 1px solid`
        }
      }, {
        default: () => [
          __renderToolbar(),
          h(QSeparator, {
            color: separatorColor.value
          }),
          __renderTabs(),
          h(QSpace),
          h(QSeparator, {
            color: separatorColor.value
          }),
          __renderTabPanels(),
          __renderFooter()
        ]
      })
    }

    function __renderSection () {
      return h('section', {
        id: __slugifiedTitle.value,
        class: 'q-pa-md overflow-auto'
      }, __renderCard())
    }

    function __render () {
      return h('div', __renderSection())
    }

    function renderJson () {
      return __render()
      // if (ready.value === true) {
      //   return __render()
      // }
      // return void 0
    }

    return () => renderJson()
  }
})
