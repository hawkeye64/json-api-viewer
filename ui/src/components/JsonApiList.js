import {
  computed,
  defineComponent,
  h
} from 'vue'

import {
  QItem,
  QList
} from 'quasar'

// Utils
import JsonApiItem from './JsonApiItem'

export default defineComponent({
  name: 'JsonApiList',

  props: {
    name: {
      type: String,
      required: true
    },
    json: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const __headings = computed(() => {
      return Object.keys(props.json)
    })

    function __renderItems () {
      return [...__headings.value.map(heading => h(QItem, {
        key: props.name + '-' + heading,
        class: 'component-api__list-item'
      }, {
        default: () => [
          h(JsonApiItem, {
            name: heading,
            type: props.name,
            json: props.json[ heading ]
          })
        ]
      }))]
    }

    function __render () {
      const content = Object.keys(props.json).length !== 0
        ? __renderItems()
        : h('div', { staticClass: 'q-pa-md text-grey-7' }, 'No matching entries found. Please refine the filter.')

      return h(QList, {
        class: 'component-api__list',
        separator: true
      }, {
        default: () => content
      })
    }

    function render () {
      return __render()
    }

    return () => render()
  }
})
