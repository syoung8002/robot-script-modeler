<template>
    <div>
        <component
                :is="panelName"
                :value="value"
        ></component>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Mixins } from "vue-property-decorator"
    import Panel from "@/components/designer/modeling/panels/Panel.vue";

    @Component({
        components: {
            Panel
        }
    })

    export default class ControlPanel extends Mixins(Panel) {
        @Prop() value: any

        get panelName() {
            return this.value.controlType+'TaskPanel'
        }

        mounted() {
            // console.log(this.panelName)
        }
    }
</script>