<template>
  <q-page padding>
    <json-api-viewer
      title="QCalendar API"
      :json="json"
    />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import Api from '../assets/api/QCalendar.json'

export default defineComponent({
  setup () {
    return {
      json: Api
    }
  }
})
</script>

<style lang="sass" scoped>
.directive-target
  width: 50px
  height: 50px
</style>
