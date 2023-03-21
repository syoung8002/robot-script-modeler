import Vue from 'vue'
import App from './App.vue'

import router from './router'

// vuetify
import vuetify from '@/plugins/vuetify'
import Browser from '@/components/designer/modeling/keyword/Browser'
import Panels from '@/components/designer/modeling/panels'
import VueKonva from 'vue-konva'

Vue.use(VueKonva)
Vue.use(Browser)
Vue.use(Panels)
Vue.config.productionTip = false



new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app')
