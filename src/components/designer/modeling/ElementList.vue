<template>
    <div>
        <v-card class="tools" max-width="100">
            <div v-for="item in elementTypes" :key="item.name">
                <div class="tool-item" @click="openTypeDialog(item.name)">
                    {{ item.name }}
                </div>
            </div>
        </v-card>

        <v-card v-if="typeDialog"
                class="keyword-dialog"
        >
            <div v-if="openType.includes('Control')">
                <v-list>
                    <draggable
                        :list="controlList"
                        :group="{ name: 'task', pull: 'clone', put: false }"
                        :clone="cloneElement"
                    >
                        <v-list-item
                                v-for="ctrl in controlList" 
                                :key="ctrl.name"
                        >
                            <v-list-item-title>
                                {{ ctrl.name }}
                            </v-list-item-title>
                        </v-list-item>
                    </draggable>
                </v-list>
            </div>
            <div v-if="openType.includes('Keyword')">
                <v-treeview 
                        :items="keywords"
                        item-key="name"
                        item-children="list"
                        open-on-click
                >
                    <template v-slot:label="{ item }">
                        <div v-if="item.list">
                            {{ item.name }}
                        </div>
                        <draggable
                                v-else
                                :list="[ { name: item.name, type: openType } ]"
                                :group="{ name: 'task', pull: 'clone', put: false }"
                                :clone="cloneElement"
                        >
                            <div>{{ item.name }}</div>
                        </draggable>
                    </template>
                </v-treeview>
            </div>
        </v-card>
    </div>
</template>

<script lang="ts">
    import Draggable from "vuedraggable";
    import { Vue, Component } from "vue-property-decorator"
    import { Keyword } from "@/types/Task";

    @Component({
        components: {
            Draggable,
        }
    })
    
    export default class ElementList extends Vue {

        mounted() {
            const builtInList = {
                keywordType: 'Built-In',
                list: Vue.prototype.$builtInList
            }
            this.keywordList.push(builtInList)
            const collectionList = {
                keywordType: 'Collections',
                list: Vue.prototype.$collectionList
            }
            this.keywordList.push(collectionList)
            const fileSystemList = {
                keywordType: 'File System',
                list: Vue.prototype.$fileSystemList
            }
            this.keywordList.push(fileSystemList)
            const browserList = {
                keywordType: 'Browser',
                list: Vue.prototype.$browserList
            }
            this.keywordList.push(browserList)

            const control = Vue.prototype.$controlList
            control.forEach((ctrl: string) => {
                if(!ctrl.includes('Relation')) {
                    this.controlList.push({
                        name: ctrl.replaceAll(' Task', ''), 
                        type: ctrl.replaceAll(' Task', '')
                    })
                }
            })
        }

        // data
        elementTypes: any[] = [
            {
                name: 'Control',
                type: null,
            },
            {
                name: 'Keyword',
                type: Keyword,
            },
        ]
        openType: string = ''
        typeDialog: boolean = false
        controlList: any[] = []
        keywordList: any[] = []

        // computed
        get keywords() {
            var list: any[] = []
            this.keywordList.forEach((type: any) => {
                var keyList: any[] = []
                type.list.forEach((keyword: string) => {
                    keyList.push({
                        name: keyword
                    })
                })
                list.push({
                    type: Keyword,
                    name: type.keywordType,
                    list: keyList
                })
            })
            return list
        }

        // method
        openTypeDialog(type: string) {
            this.typeDialog = true
            this.openType = type
        }
        closeTypeDialog() {
            this.typeDialog = false
        }
        cloneElement(type: any) {
            this.$emit('cloneElement', type)
            this.closeTypeDialog()
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
        overflow-y: auto;
        min-width: 200px;
        max-width: 500px;
        max-height: 450px;
        box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 
                    0 2px 2px 0 rgb(0 0 0 / 14%), 
                    0 1px 5px 0 rgb(0 0 0 / 40%) !important;
    }

</style>