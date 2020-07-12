# Component JsonApiViewer

[![npm](https://img.shields.io/npm/v/quasar-ui-json-api-viewer.svg?label=quasar-ui-json-api-viewer)](https://www.npmjs.com/package/quasar-ui-json-api-viewer)
[![npm](https://img.shields.io/npm/dt/quasar-ui-json-api-viewer.svg)](https://www.npmjs.com/package/quasar-ui-json-api-viewer)

Use the **JsonApiViewer** component to display json as validated and built via the [Quasar Json Api](https://github.com/hawkeye64/quasar-json-api) library for UI kit (`quasar create myApp --kit ui`). (Note: supports Quasar `dark mode`)

![json-api-viewer showing QCalendar](https://raw.githubusercontent.com/hawkeye64/json-api-viewer/master/images/json-api-viewer--qcalendar.png)

As simple as:

```html
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
```

Properties:

- `title` [String]: Title to use. Ex: `title="QCalendar API"`
- `json` [String]: The json API. Ex: `:json="api"`
- `type` [String]: Defaults to `Vue Component`.
- `starting-tab` [String]: The default starting tab is `props`, but if you have no props, you may want to start with a different tab.
- `starting-inner-tab` [String]: The default starting inner tab is `model`, but if you have no model in your prop categories, you may want to start with a different inner tab.

# Usage

## Quasar CLI project

Install the [App Extension](../app-extension).

**OR**:

Create and register a boot file:

```js
import Vue from 'vue'
import Plugin from 'quasar-ui-json-api-viewer'
import 'quasar-ui-json-api-viewer/dist/index.css'

Vue.use(Plugin)
```

**OR**:

```html
<style src="quasar-ui-json-api-viewer/dist/index.css"></style>

<script>
import { JsonApiViewer } from 'quasar-ui-json-api-viewer'

export default {
  components: {
    JsonApiViewer
  }
}
</script>
```

## Vue CLI project

```js
import Vue from 'vue'
import Plugin from 'quasar-ui-json-api-viewer'
import 'quasar-ui-json-api-viewer/dist/index.css'

Vue.use(Plugin)
```

**OR**:

```html
<style src="quasar-ui-json-api-viewer/dist/index.css"></style>

<script>
import { JsonApiViewer } from 'quasar-ui-json-api-viewer'

export default {
  components: {
    JsonApiViewer
  }
}
</script>
```

## UMD variant

Exports `window.jsonApiViewer`.

Add the following tag(s) after the Quasar ones:

```html
<head>
  <!-- AFTER the Quasar stylesheet tags: -->
  <link href="https://cdn.jsdelivr.net/npm/quasar-ui-json-api-viewer/dist/index.min.css" rel="stylesheet" type="text/css">
</head>
<body>
  <!-- at end of body, AFTER Quasar script(s): -->
  <script src="https://cdn.jsdelivr.net/npm/quasar-ui-json-api-viewer/dist/index.umd.min.js"></script>
</body>
```
If you need the RTL variant of the CSS, then go for the following (instead of the above stylesheet link):
```html
<link href="https://cdn.jsdelivr.net/npm/quasar-ui-json-api-viewer/dist/index.rtl.min.css" rel="stylesheet" type="text/css">
```

# Setup
```bash
$ yarn
```

# Developing
```bash
# start dev in SPA mode
$ yarn dev

# start dev in UMD mode
$ yarn dev:umd

# start dev in SSR mode
$ yarn dev:ssr

# start dev in Cordova iOS mode
$ yarn dev:ios

# start dev in Cordova Android mode
$ yarn dev:android

# start dev in Electron mode
$ yarn dev:electron
```

# Building package
```bash
$ cd ui
$ yarn build
```


# Donate
If you appreciate the work that went into this, please consider donating to [Quasar](https://donate.quasar.dev) or [Jeff](https://github.com/sponsors/hawkeye64).

# License
MIT (c) Jeff Galbraith <jeff@quasar.dev>
