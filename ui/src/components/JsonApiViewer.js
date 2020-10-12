// Mixins
import JsonApiViewerMixin from '../mixins/JsonApiViewerMixin'

// Utils
import JsonApiList from './JsonApiList'
import {
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

import {
  QRibbon
} from '@quasar/quasar-ui-qribbon'

import { version } from '../../package.json'

export default {
  name: 'JsonApiViewer',

  mixins: [JsonApiViewerMixin],

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
    startingTab: String,
    startingInnerTab: String,
    noFooter: Boolean
  },

  data () {
    return {
      ready: false,
      currentTab: 'props',
      currentInnerTab: 'model',
      api: void 0,
      filteredApi: void 0,
      filter: '',
      tabs: [],
      tabCount: {},
      innerTabCount: {},
      innerTabContent: {},
      borderColor: 'lightblue',
      separatorColor: 'light-blue-2',
      showDeprecated: false
    }
  },

  mounted () {
    this.currentTab = this.startingTab || this.currentTab
    this.currentInnerTab = this.startingInnerTab || this.currentInnerTab
    this.__parseJson(this.json)
  },

  computed: {
    __slugifiedTitle () {
      return this.slugify(this.title)
    },

    __headings () {
      return this.tabs
    }
  },

  watch: {
    filter (val) {
      this.__parseJson(this.json)
    },

    showDeprecated () {
      this.__parseJson(this.json)
    }
  },

  methods: {
    __parseJson (json) {
      if (json === void 0) {
        // no api
        this.ready = true
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

      this.__resetFiltered()

      // deal with "props"
      if (api.props !== void 0) {
        // get sorted keys
        const propKeys = Object.keys(api.props).sort()

        // loop through keys to get inner tab content
        for (let j = 0; j < propKeys.length; ++j) {
          const key = propKeys[j]
          const props = api.props[key]
          if (props.deprecated !== void 0 && this.showDeprecated !== true) {
            delete api.props[key]
            continue
          }
          if (this.innerTabContent[props.category] === void 0) {
            this.$set(this.innerTabContent, props.category, {})
          }
          if (this.__filterKey(key)) {
            this.$set(this.innerTabContent[props.category], key, props)
          }
          else {
            const apiProps = this.__filterContent(props)
            if (Object.keys(apiProps).length > 0) {
              this.$set(this.innerTabContent[props.category], key, apiProps)
            }
            else {
              delete api.props[key]
            }
          }
        }

        this.$set(this, 'innerTabCount', {})
        const innerKeys = Object.keys(this.innerTabContent)
        for (let k = 0; k < innerKeys.length; ++k) {
          const innerPropKey = innerKeys[k]
          this.$set(this.innerTabCount, innerPropKey, Object.keys(this.innerTabContent[innerPropKey]).length)
        }
      }

      this.__filterTopLevel(api)

      // get a count of items within each top-level tab menu
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const type = keys[i]
        this.$set(this.tabs, type, Object.keys(api[type]).length)
      }

      this.filteredApi = api

      this.ready = true
    },

    __filterTopLevel (api) {
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const type = keys[i]
        if (type !== 'props') {
          // loop through inner content
          const propKeys = Object.keys(api[type])
          for (let l = 0; l < propKeys.length; ++l) {
            const key = propKeys[l]
            const props = api[type][key]
            if (props.deprecated !== void 0 && this.showDeprecated !== true) {
              delete api[type][key]
            }
            else if (this.__filterKey(key) !== true) {
              const apiProps = this.__filterContent(props)
              if (Object.keys(apiProps).length === 0) {
                delete api[type][key]
              }
            }
          }
        }
      }
    },

    __filterContent (api) {
      if (this.filter === '') {
        return api
      }

      let found = false
      const keys = Object.keys(api)
      for (let i = 0; i < keys.length; ++i) {
        const prop = api[keys[i]]
        const type = Object.prototype.toString.call(prop)
        if (type === '[object Array]') {
          if (this.__filterArray(prop)) {
            found = true
            break
          }
        }
        else if (type === '[object String]' || type === '[object Number]') {
          if (this.__filterString(prop)) {
            found = true
            break
          }
        }
      }

      if (found !== true) {
        return {}
      }

      return api
    },

    // tests the passed string against the filter
    __filterString (str) {
      return String(str).toLowerCase().indexOf(this.filter.toLowerCase()) >= 0
    },

    __filterKey (str) {
      return this.__filterString(str)
    },

    __filterArray (arr) {
      for (let i = 0; i < arr.length; ++i) {
        if (this.__filterString(arr[i]) === true) {
          return true
        }
      }
      return false
    },

    __resetFiltered () {
      this.$set(this, 'innerTabContent', {})
      this.$set(this, 'innerTabCount', {})
      this.$set(this, 'tabCount', {})
      this.$set(this, 'tabs', [])
    },

    __onFilter () {
      if (this.filter !== '') {
        this.filter = ''
      }

      this.$refs.input.focus()
    },

    __renderToolbarTitle (h) {
      return h(QToolbarTitle, {
        staticClass: 'example-title',
        on: {
          click: e => {
            this.copyHeading(this.__slugifiedTitle)
          }
        }
      }, [
        h('span', {
          staticClass: 'ellipsis'
        }, this.title)
      ])
    },

    __renderRibbon (h) {
      return h(QRibbon, {
        props: {
          position: 'left',
          color: 'rgba(0,0,0,.58)',
          backgroundColor: '#c0c0c0',
          leafColor: '#a0a0a0',
          leafPosition: 'bottom',
          decoration: 'rounded-out'
        }
      }, [
        this.__renderToolbarTitle(h)
      ])
    },

    __renderFilter (h) {
      return h(QInput, {
        ref: 'input',
        staticClass: 'q-mx-sm',
        style: {
          minWidth: '150px'
        },
        attrs: {
          placeholder: 'Filter...'
        },
        props: {
          value: this.filter,
          inputClass: 'text-right',
          dense: true,
          borderless: true
        },
        on: {
          input: v => {
            this.filter = v
          }
        },
        scopedSlots: {
          append: () => h(QIcon, {
            staticClass: 'cursor-pointer',
            props: {
              name: this.filter !== '' ? 'clear' : 'search'
            },
            on: {
              click: this.__onFilter
            }
          })
        }
      })
    },

    __renderToolbar (h) {
      return h(QToolbar, {
        staticClass: ''
      }, [
        this.__renderRibbon(h),
        h('div', {
          staticClass: 'q-ml-md col-auto text-grey text-caption'
        }, [
          this.$q.screen.gt.xs && this.type
        ]),
        h(QSpace),
        this.$q.screen.width >= 385 && this.__renderFilter(h),
        this.__renderMenu(h)
      ])
    },

    __renderMenu (h) {
      return h(QIcon, {
        staticClass: 'cursor-pointer text-grey',
        props: {
          name: 'menu',
          size: 'md'
        }
      }, [
        h(QMenu, [
          h('div', {
            staticClass: 'row no-wrap q-pa-md'
          }, [
            h('div', {
              staticClass: 'column'
            }, [
              h(QCheckbox, {
                props: {
                  value: this.showDeprecated,
                  label: 'Show deprecated'
                },
                directives: [{
                  name: 'close-popup'
                }],
                on: {
                  input: val => {
                    this.showDeprecated = val
                  }
                }
              })
            ])
          ])
        ])
      ])
    },

    __renderTabs (h) {
      return h('div', {
        staticClass: 'row justify-between items-center no-wrap' + (!this.$q.dark.isActive ? ' bg-grey-2 text-grey-7' : '')
      }, [
        h(QTabs, {
          staticClass: 'col-grow text-caption',
          props: {
            value: this.currentTab,
            dense: true,
            activeColor: this.$q.dark.isActive ? 'yellow' : 'primary',
            indicatorColor: this.$q.dark.isActive ? 'yellow' : 'primary',
            align: 'left',
            narrowIndicator: true
          },
          on: {
            input: v => {
              this.currentTab = v
            }
          }
        }, [
          ...Object.keys(this.tabs).map(propKey => h(QTab, {
            key: propKey + '-tab',
            props: {
              name: propKey
            },
            scopedSlots: {
              default: () => this.__renderTabSlot(h, propKey, this.tabs[propKey])
            }
          }))
        ])
      ])
    },

    __renderTabSlot (h, label, count, stretch) {
      return h('div', {
        staticClass: 'row no-wrap items-center self-stretch q-pa-xs',
        style: {
          minWidth: stretch === true ? '120px' : void 0
        }
      }, [
        h('span', {
          staticClass: 'q-mr-xs text-uppercase text-weight-medium'
        }, label),
        h('div', {
          staticClass: 'col'
        }),
        count > 0 && h(QBadge, [count])
      ])
    },

    __renderTabPanels (h) {
      return h(QTabPanels, {
        props: {
          value: this.currentTab,
          animated: true
        },
        on: {
          input: v => {
            this.currentTab = v
          }
        }
      }, [
        this.__renderTabPanel(h)
      ])
    },

    __renderTabPanel (h) {
      return [...Object.keys(this.tabs).map(propKey => h(QTabPanel, {
        key: propKey + '-panel',
        staticClass: 'q-pa-none',
        props: {
          name: propKey
        }
      }, [
        propKey === 'props' && this.__renderInnerTabs(h, propKey, this.filteredApi[propKey]),
        propKey !== 'props' && this.__renderApiList(h, propKey, this.filteredApi[propKey])
      ]))]
    },

    __renderApiList (h, name, api) {
      return h('div', {
        staticClass: 'component-api__container'
      }, [
        h(JsonApiList, {
          props: {
            name: name,
            json: api
          }
        })
      ])
    },

    __renderInnerTabs (h, name, api) {
      return h('div', {
        staticClass: 'fit row'
      }, [
        h('div', {
          staticClass: 'col-auto row no-wrap q-py-lg' + (!this.$q.dark.isActive ? ' bg-grey-2 text-grey-7' : '')
        }, [
          h(QTabs, {
            staticClass: 'text-caption' + (!this.$q.dark.isActive ? ' bg-grey-2 text-grey-7' : ''),
            props: {
              value: this.currentInnerTab,
              dense: true,
              vertical: true,
              activeColor: this.$q.dark.isActive ? 'yellow' : 'primary',
              indicatorColor: this.$q.dark.isActive ? 'yellow' : 'primary',
              align: 'left',
              narrowIndicator: true
            },
            on: {
              input: v => {
                this.currentInnerTab = v
              }
            }
          }, [
            ...Object.keys(this.innerTabCount).map(propKey => h(QTab, {
              key: propKey + '-inner-tab',
              staticClass: 'col-shrink',
              props: {
                name: propKey
              },
              scopedSlots: {
                default: () => this.__renderTabSlot(h, propKey, this.innerTabCount[propKey], true)
              }
            }))
          ])
        ]),
        h(QSeparator, {
          props: {
            vertical: true,
            color: this.separatorColor
          },
          style: {
            minHeight: '600px'
          }
        }),
        this.__renderInnerTabPanels(h)
      ])
    },

    __renderInnerTabPanels (h) {
      return h(QTabPanels, {
        staticClass: 'col',
        props: {
          value: this.currentInnerTab,
          animated: true,
          transitionPrev: 'slide-down',
          transitionNext: 'slide-up'

        },
        on: {
          input: v => {
            this.currentInnerTab = v
          }
        }
      }, [
        this.__renderInnerTabPanel(h)
      ])
    },

    __renderInnerTabPanel (h) {
      return [...Object.keys(this.innerTabContent).map(propKey => h(QTabPanel, {
        key: propKey + '-inner-panel',
        staticClass: 'q-pa-none',
        props: {
          name: propKey
        }
      }, [
        this.__renderApiList(h, propKey, this.innerTabContent[propKey])
      ]))]
    },

    __renderFooter (h) {
      const slot = this.$slots.footer
      if (this.noFooter === true) return
      return h('div', {
        staticClass: 'component-api__footer row justify-between items-center'
      }, [
        slot || h('div', 'Quasar JSON API Viewer v' + version + ' - Created and maintained by Jeff Galbraith (@hawkeye64)')
      ])
    },

    __renderCard (h) {
      return h(QCard, {
        staticClass: 'no-shadow',
        props: {
          flat: true,
          bordered: true
        },
        style: {
          border: `${this.borderColor} 1px solid`
        }
      }, [
        this.__renderToolbar(h),
        h(QSeparator, {
          props: {
            color: this.separatorColor
          }
        }),
        this.__renderTabs(h),
        h(QSpace),
        h(QSeparator, {
          props: {
            color: this.separatorColor
          }
        }),
        this.__renderTabPanels(h),
        this.__renderFooter(h)
      ])
    },

    __renderSection (h) {
      return h('section', {
        domProps: {
          id: this.__slugifiedTitle
        },
        staticClass: 'q-pa-md overflow-auto'
      }, [
        this.__renderCard(h)
      ])
    },

    __render (h) {
      return h('div', [
        this.__renderSection(h)
      ])
    }
  },

  render (h) {
    if (this.ready === true) {
      return this.__render(h)
    }
    return void 0
  }
}
