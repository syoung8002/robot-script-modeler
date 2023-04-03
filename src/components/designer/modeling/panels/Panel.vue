<template>
   <v-navigation-drawer
            absolute
            permanent
            right
            style="width: 500px;"
    >
        <template v-slot:prepend>
            <v-list-item two-line>
                <v-list-item-avatar>
                    <v-icon>{{ elementIcon }}</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>{{ config.name }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>

        <v-divider></v-divider>
        <div v-if="elementType=='Control'">
            <control-panel
                    :type="config.name"
                    :value="config"
            ></control-panel>
        </div>
        <div v-if="elementType=='Keyword'">
            <v-card flat>
                <v-card-text>
                    <v-text-field
                            v-model="config.name"
                    ></v-text-field>
                    <keyword-panel
                        :keyword-type="config.keywordType"
                        :value="config"
                    ></keyword-panel>
                </v-card-text>
            </v-card>
        </div>
    </v-navigation-drawer>
</template>
<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"
    
    @Component
    export default class Panel extends Vue {
        @Prop() public keywordType!: String
        @Prop() public value!: any

        // computed
        get config() {
            console.log(this.value)
            return this.value
        }
        
        get elementType() {
            if(this.value.type.includes('Keyword')) {
                return 'Keyword'
            }
            if(this.value.type.includes('Event')) {
                return 'Event'
            }
            if(this.value.type.includes('Control')) {
                return 'Control'
            }
        }
        get elementIcon() {
            if(this.value.type.includes('Keyword')) {
                return 'mdi-square'
            }
            if(this.value.type.includes('Event')) {
                return 'mdi-circle'
            }
            if(this.value.type.includes('Control')) {
                return 'mdi-rhombus'
            }
        }
        
    }
</script>