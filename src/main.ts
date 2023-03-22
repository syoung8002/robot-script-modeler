import Vue from 'vue'
import App from './App.vue'

import router from './router'

// vuetify
import vuetify from '@/plugins/vuetify'
import Browser from '@/components/designer/modeling/keyword/Browser'
import FileSystem from '@/components/designer/modeling/keyword/FileSystem'
import Control from '@/components/designer/modeling/keyword/Control'
import BuiltIn from '@/components/designer/modeling/keyword/Built-in'
import Panels from '@/components/designer/modeling/panels'
import Collection from '@/components/designer/modeling/keyword/Collection'
import VueKonva from 'vue-konva'


Vue.use(VueKonva)
Vue.use(Browser)
Vue.use(Panels)
Vue.use(FileSystem)
Vue.use(Control)
Vue.use(Collection)
Vue.use(BuiltIn)

Vue.config.productionTip = false

new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app')
