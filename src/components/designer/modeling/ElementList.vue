<template>
    <div>
        <v-card class="tools" max-width="100">
            <div v-for="item in elementTypes" :key="item.name">
                <div v-if="item.component.includes('Event')"
                        class="tool-item"
                        draggable="true"
                        @dragend="addKeyword($event, item)"
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
            <div v-if="elementType.includes('Gateway')">
                <v-list>
                    <v-list-item-group>
                        <v-list-item
                                v-for="(item, index) in controlList"
                                :key="index"
                        >
                            <v-list-item-title
                                    draggable="true"
                                    @dragend="addKeyword($event, item)"
                            >
                                {{ item }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </div>
            <div v-if="elementType.includes('Task')">
                <v-tabs v-model="keywordTab">
                    <v-tab v-for="item in keywordList"
                            :key="item.keywordType"
                            center-active
                    >
                        {{ item.keywordType }}
                    </v-tab>
                </v-tabs>
                <v-list max-height="450" style="overflow-y: scroll;">
                    <v-list-item-group>
                        <v-list-item
                                v-for="(item, index) in keywords"
                                :key="index"
                        >
                            <v-list-item-title
                                    draggable="true"
                                    @dragend="addKeyword($event, item)"
                            >
                                {{ item }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
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
            var aa = {
                keywordType: 'Browser',
                list: Vue.prototype.$browserList
            }
            this.keywordList.push(aa)
        }
        // data
        public elementType: string = ''
        public x: number = 0
        public y: number = 0
        public keywordDialog: boolean = false
        public keywordTab: any = null
        public controlList: any[] = [
            'FOR',
            'While',
            'IF',
            'Try-Except',
            'Return',
            'Break',
            'Continue',
        ]
        public keywordList: any[] = [
            {
                keywordType: 'Built-in',
                list: [
                    'Call Method',
                    'Catenate',
                    'Comment',
                    'Convert To Binary',
                    'Convert To Boolean',
                    'Convert To Bytes',
                    'Convert To Hex',
                    'Convert To Integer',
                    'Convert To Number',
                    'Convert To Octal',
                    'Convert To String',
                    'Create Dictionary',
                    'Create List',
                    'Evaluate',
                    'Fail',
                    'Get Count',
                    'Get Length',
                    'Get Library Instance',
                    'Get Time',
                    'Get Variable Value',
                    'Get Variables',
                    'Import Library',
                    'Import Resource',
                    'Import Variables',
                    'Log',
                    'Log Variables',
                    'No Operation',
                    'Pass Execution',
                    'Replace Variables',
                    'Set Global Variable',
                    'Set Log Level',
                    'Set Task Variable',
                    'Set Variable',
                    'Set Variable If',
                    'Sleep',
                    'Wait Until Keyword Succeeds',
                ]
            },
            {
                keywordType: 'Collections',
                list: []
            },
            {
                keywordType: 'String',
                list: []
            },
            {
                keywordType: 'DateTime',
                list: [
                    'Add Time To Date',
                    'Add Time To Time',
                    'Convert Date',
                    'Convert Time',
                    'Get Current Date',
                    'Subtract Date From Date',
                    'Subtract Time From Date',
                    'Subtract Time From Time',
                ]
            },
            {
                keywordType: 'JSON',
                list: [
                    'Add to JSON',
                    'Convert JSON to String',
                    'Convert String to JSON',
                    'Delete from JSON',
                    'Get value from JSON',
                    'Get values from JSON',
                    'Load JSON from file',
                    'Save JSON to file',
                    'Update value to JSON',
                ]
            },
            {
                keywordType: 'File System',
                list: []
            },
            // {
            //     keywordType: 'Browser',
            //     list: [
            //         'Open Available Browser'
            //     ]
            // },
            {
                keywordType: 'HTTP',
                list: [
                    'Download'
                ]
            },
            {
                keywordType: 'Excel (Files)',
                list: []
            },
            {
                keywordType: 'Tables',
                list: []
            },
            {
                keywordType: 'Windows',
                list: []
            },
            {
                keywordType: 'Work Items (Control Room)',
                list: []
            },
            {
                keywordType: 'Vault (Control Room)',
                list: [
                    'Get Secret'
                ]
            },
            {
                keywordType: 'Archive',
                list: [
                    'Add To Archive',
                    'Archive Folder With Tar',
                    'Archive Folder With Zip',
                    'Extract Archive',
                    'Extract File From Archive',
                    'Get Archive Info',
                    'List Archive',
                ]
            },
            {
                keywordType: 'Email (Exchange)',
                list: [
                    'Authorize',
                    'Generate Oauth Url',
                    'Get Oauth Token',
                    'Send Message',
                ]
            },
            {
                keywordType: 'Email (IMAP/SMTP)',
                list: [
                    'Authorize',
                    'Generate Oauth String',
                    'Generate Oauth Url',
                    'Get Oauth Token',
                    'Refresh Oauth Token',
                    'Save Attachment',
                    'Send Message',
                ]
            },
            {
                keywordType: 'PDF',
                list: []
            },
        ]

        get keywords() {
            if (this.keywordTab != null) {
                return this.keywordList[this.keywordTab].list
            } else {
                return []
            }
        }

        openKeywordDialog(event: any, type: string) {
            event.preventDefault()
            this.keywordDialog = true
            this.elementType = type
            this.x = event.clientX
            this.y = event.clientY
        }

        addKeyword(event: any, value: any) {
            if (typeof value == 'string') {
                const elementInfo = this.elementTypes.find((item) => item.name.includes(this.elementType))
                this.$emit('addKeyword', event, elementInfo, value)
            } else {
                this.$emit('addKeyword', event, value, value.name)
            }
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