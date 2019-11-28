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
    headings () {
      return Object.keys(this.json)
    }
  },

  methods: {
    __render (h) {
      return h(QList, {
        staticClass: 'component-api__list',
        props: {
          separator: true
        }
      }, [
        ...this.headings.map(heading => h(QItem, {
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
        ]))
      ])
    }
  },

  render (h) {
    return this.__render(h)
  }
}
