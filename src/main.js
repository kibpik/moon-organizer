// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueMaterial from 'vue-material'
import store from './store'
import router from './router'
import themesConfig from './themes.config'
import 'vue-material/dist/vue-material.css'
import capitalize from 'filters/capitalize'
import SocialSharing from 'vue-social-sharing'
import VueHead from 'vue-head'

Vue.use(SocialSharing)

Vue.use(VueHead)

Vue.use(VueMaterial)

Vue.filter('capitalize', capitalize)

Vue.material.registerTheme(themesConfig)

Vue.config.errorHandler = (err, vm, info) => {
  console.log(err)
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
