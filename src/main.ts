import Vue from 'vue'
import App from './App.vue'
import router from './router'

import vuetify from '@/plugins/vuetify'

import Keyword from '@/components/designer/modeling/elements/keyword/KeywordElement.vue'

import Control from '@/components/designer/modeling/elements/control'
import BuiltIn from '@/components/designer/modeling/elements/keyword/Built-in'
import Collection from '@/components/designer/modeling/elements/keyword/Collection'
import FileSystem from '@/components/designer/modeling/elements/keyword/FileSystem'
import String from '@/components/designer/modeling/elements/keyword/String'
import DateTime from '@/components/designer/modeling/elements/keyword/DateTime'
import JSON from '@/components/designer/modeling/elements/keyword/JSON'
import Browser from '@/components/designer/modeling/elements/keyword/Browser'
import HTTP from '@/components/designer/modeling/elements/keyword/HTTP'
import Excel from '@/components/designer/modeling/elements/keyword/Excel_Files'
import Tables from '@/components/designer/modeling/elements/keyword/Tables'
import Windows from '@/components/designer/modeling/elements/keyword/Windows'
import WorkItems from '@/components/designer/modeling/elements/keyword/WorkItems_ControlRoom'
import Vault from '@/components/designer/modeling/elements/keyword/Vault_ControlRoom'
import Archive from '@/components/designer/modeling/elements/keyword/Archive'
import EmailExchange from '@/components/designer/modeling/elements/keyword/Email_Exchange'
import EmailImapSmtp from '@/components/designer/modeling/elements/keyword/Email_ImapSmtp'
import PDF from '@/components/designer/modeling/elements/keyword/PDF'

import Panels from '@/components/designer/modeling/elements/panels'
import Fields from '@/components/designer/modeling/elements/panels/fields'

Vue.component('keyword-element', Keyword)

Vue.use(Control)
Vue.use(BuiltIn)
Vue.use(Collection)
Vue.use(FileSystem)
Vue.use(String)
Vue.use(DateTime)
Vue.use(JSON)
Vue.use(Browser)
Vue.use(HTTP)
Vue.use(Excel)
Vue.use(Tables)
Vue.use(Windows)
Vue.use(WorkItems)
Vue.use(Vault)
Vue.use(Archive)
Vue.use(EmailExchange)
Vue.use(EmailImapSmtp)
Vue.use(PDF)

Vue.use(Panels)
Vue.use(Fields)

Vue.config.productionTip = false

new Vue({
    router,
    vuetify,
    render: h => h(App),
}).$mount('#app')
