// Utils
import JsonApiItem from './JsonApiItem'
import {
  QItem,
  QList
} from 'quasar'

export default {
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

  data () {
    return {}
  },

  computed: {
    __headings () {
      return Object.keys(this.json)
    }
  },

  methods: {
    __renderItems (h) {
      return [ ...this.__headings.map(heading => h(QItem, {
        key: this.name + '-' + heading,
        staticClass: 'component-api__list-item'
      }, [
        h(JsonApiItem, {
          props: {
            name: heading,
            type: this.name,
            json: this.json[heading]
          }
        })
      ]))]
    },

    __render (h) {
      const content = Object.keys(this.json).length !== 0
        ? this.__renderItems(h)
        : h('div', { staticClass: 'q-pa-md text-grey-7' }, [
            'No matching entries found. Please refine the filter.'
          ])

      return h(QList, {
        staticClass: 'component-api__list',
        props: {
          separator: true
        }
      }, [
        content
      ])
    }
  },

  render (h) {
    return this.__render(h)
  }
}
