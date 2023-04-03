<template>
    <div>
        <v-card class="tools" max-width="100">
            <div v-for="item in elementTypes" :key="item.name">
                <div v-if="item.component.includes('Event')"
                        class="tool-item"
                        draggable="true"
                        @dragend="addEvent($event, item)"
                >
                    <v-icon>{{ item.icon }}</v-icon>
                </div>
                <div v-else
                        class="tool-item"
                        @click="openKeywordDialog($event, item.name)"
                >
                    <v-icon>{{ item.icon }}</v-icon>
                </div>
            </div>
        </v-card>

        <v-card v-if="keywordDialog"
                class="keyword-dialog"
                max-width="500"
                overflow
        >
            <div v-if="elementType.includes('Control')">
                <v-list>
                    <v-list-item-group>
                        <v-list-item
                                v-for="(item, index) in controlList"
                                :key="index"
                        >
                            <v-list-item-title
                                    draggable="true"
                                    @dragend="addControl($event, item)"
                            >
                                {{ item }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </div>
            <div v-if="elementType.includes('Task')">
                <v-treeview 
                        :items="keywordList"
                        item-key="name"
                        item-children="list"
                        open-on-click
                >
                    <template v-slot:label="{ item }">
                        <div draggable="true"
                                @dragend="addKeyword($event, item)"
                        >
                            {{ item.name }}
                        </div>
                    </template>
                </v-treeview>
            </div>            
        </v-card>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"

    @Component
    export default class ElementList extends Vue {
        @Prop() elementTypes!: any[]

        mounted() {
            var browser = {
                name: 'Browser',
                list: [{}]
            }
            var browserList = Vue.prototype.$browserList
            browserList.forEach((keyword: string, index: number) => {
                if(index == 0) { browser.list = [] }
                browser.list.push({ id: index, name: keyword })
            })
            this.keywordList.push(browser)

            const control = Vue.prototype.$controlList
            control.forEach((ctrl: string) => {
                if(!ctrl.includes('Relation')) {
                    ctrl = ctrl.replaceAll(' Task', '')
                    this.controlList.push(ctrl)
                }
            })
        }
        // data
        public elementType: string = ''
        public x: number = 0
        public y: number = 0
        public keywordDialog: boolean = false
        public keywordTab: any = null
        public controlList: any[] = []
        public keywordList: any[] = []

        openKeywordDialog(event: any, type: string) {
            event.preventDefault()
            this.keywordDialog = true
            this.elementType = type
            this.x = event.clientX
            this.y = event.clientY
        }
        closeKeywordDialog() {
            this.keywordDialog = false
        }

        addEvent(event: any, value: any) {
            this.$emit('addElement', event, value, value.name)
            this.keywordDialog = false
        }

        addControl(event: any, value: any) {
            const componentInfo = this.elementTypes.find((item) => item.name.includes('Control'))
            this.$emit('addElement', event, componentInfo, value)
            this.keywordDialog = false
        }

        addKeyword(event: any, value: any) {
            const componentInfo = this.elementTypes.find((item) => item.name.includes('Task'))
            this.$emit('addElement', event, componentInfo, value.name)
            this.keywordDialog = false
        }
    }
</script>

<style scoped>
    .tools {
        position: absolute !important;
        text-align: center;
        width: 100px;
        left: 20px;
        top: 200px;
        padding: 10px;
        overflow: hidden;
        box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 
                    0 2px 2px 0 rgb(0 0 0 / 14%), 
                    0 1px 5px 0 rgb(0 0 0 / 40%) !important;

    }

    .tool-item {
        cursor: pointer;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .tool-item > .v-icon {
        font-size: 40px !important;
    }

    .keyword-dialog {
        position: absolute !important;
        left: 125px;
        top: 200px;
        box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 
                    0 2px 2px 0 rgb(0 0 0 / 14%), 
                    0 1px 5px 0 rgb(0 0 0 / 40%) !important;
    }

</style>