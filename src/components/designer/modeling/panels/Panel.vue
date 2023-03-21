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
        <div v-if="elementType=='Gateway'">
            <gateway-panel
                    :type="config.name"
                    :value="config.properties"
            ></gateway-panel>
        </div>
        <div v-if="elementType=='Task'">
            <v-card flat>
                <v-card-text>
                    <v-text-field
                            v-model="config.name"
                    ></v-text-field>
                    <task-panel
                        :task-type="config.taskType"
                        :value="config.properties"
                    ></task-panel>
                </v-card-text>
            </v-card>
        </div>
    </v-navigation-drawer>
</template>
<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"
    
    @Component
    export default class Panel extends Vue {
        @Prop() public taskType!: String
        @Prop() public value!: any

        // computed
        get config() {
            return this.value
        }
        
        get elementType() {
            if(this.value.type.includes('Task')) {
                return 'Task'
            }
            if(this.value.type.includes('Event')) {
                return 'Event'
            }
            if(this.value.type.includes('Gateway')) {
                return 'Gateway'
            }
        }
        get elementIcon() {
            if(this.value.type.includes('Task')) {
                return 'mdi-square'
            }
            if(this.value.type.includes('Event')) {
                return 'mdi-circle'
            }
            if(this.value.type.includes('Gateway')) {
                return 'mdi-rhombus'
            }
        }
        
    }
</script>