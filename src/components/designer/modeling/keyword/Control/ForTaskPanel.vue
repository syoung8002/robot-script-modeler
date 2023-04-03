<template>
    <div>
        <v-card outlined>
            <v-card-subtitle>
                Assign Variables
            </v-card-subtitle>
            <v-card-text>
                <v-text-field
                        v-model="value.itemVarName"
                ></v-text-field>
            </v-card-text>
        </v-card>
        <v-card outlined>
            <v-card-subtitle>
                Loop Values
            </v-card-subtitle>
            <v-card-text>
                <v-text-field
                        v-model="value.iterationVarName"
                ></v-text-field>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
    import { Component, Mixins, Prop, Watch } from "vue-property-decorator"
    import ControlPanel from "@/components/designer/modeling/panels/ControlPanel.vue";

    @Component({
        components: {
            ControlPanel,
        }
    })

    export default class ForTaskPanel extends Mixins(ControlPanel) {
        @Prop() value: any

        mounted() {
        }

        @Watch("value", {immediate: true, deep: true})
        updateValue(val: any) {
        }

    }
</script>