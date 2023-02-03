import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import ModelCanvas from './components/designer/modeling/ModelCanvas'
import ModelRelation from './components/designer/modeling/ModelRelation'
import RectElement from './components/designer/modeling/elements/RectElement'
import PolygonElement from './components/designer/modeling/elements/PolygonElement'
import CircleElement from './components/designer/modeling/elements/CircleElement'

Vue.component('model-relation', ModelRelation)
Vue.component('rect-element', RectElement)
Vue.component('polygon-element', PolygonElement)
Vue.component('circle-element', CircleElement)

const options = {
    // mode: 'history',
    routes: [
        {
            path: '/',
            name: 'ModelCanvas',
            component: ModelCanvas
        },
    ]
}

export default new Router(options)
