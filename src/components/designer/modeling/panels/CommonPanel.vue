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
                    <v-list-item-title>{{ value.name }}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>

        <v-divider></v-divider>
        <div v-if="controlList.includes(elementType)">
            <control-panel
                    :value="value"
            ></control-panel>
        </div>
        <div v-else>
            <keyword-panel
                    :value="value"
            ></keyword-panel>
        </div>
    </v-navigation-drawer>
</template>
<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"
    
    @Component
    export default class CommonPanel extends Vue {
        @Prop() public value!: any
        
        controlList: any[] = [ "ForTask", "IfTask", "WhileTask" ]

        get elementType() {
            return this.value.type
        }
        get elementIcon() {
            return 'mdi-square'
        }
        
    }
</script>