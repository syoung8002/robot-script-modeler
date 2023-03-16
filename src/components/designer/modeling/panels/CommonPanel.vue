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
                    <v-list-item-title>{{ elementType }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>

        <v-divider></v-divider>

        <slot name="edit-name">
            <v-card outlined>
                <v-card-text>
                    <v-text-field
                            v-model="config.name"
                            label="Name"
                            autofocus
                    ></v-text-field>
                </v-card-text>
            </v-card>
        </slot>
        <slot name="edit-property"></slot>
    </v-navigation-drawer>
</template>


<script lang="ts">
    import { Vue, Component, Mixins } from "vue-property-decorator"
    import ModelPanel from "../ModelPanel.vue"

    @Component
    export default class CommonPanel extends Mixins(ModelPanel) {
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
            if(this.value.type.includes('Tateway')) {
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
            if(this.value.type.includes('Tateway')) {
                return 'mdi-rhombus'
            }
        }
    }
</script>