<template>
  <q-page padding>
    <json-api-viewer title="QCalendar API" :json="api" />
  </q-page>
</template>

<script>
import Api from '../api/QCalendar.json'
export default {
  data () {
    return {
      api: Api
    }
  }
}
</script>
