<template>
  <q-page padding>
    <json-api-viewer title="QCalendar API" :json="calendarApi" />
    <json-api-viewer title="QMediaPlayer API" :json="mediaPlayerApi" />
  </q-page>
</template>

<script>
import calendarApi from '../api/QCalendar.json'
import mediaPlayerApi from '../api/QMediaPlayer.json'
export default {
  data () {
    return {
      calendarApi,
      mediaPlayerApi
    }
  }
}
</script>
