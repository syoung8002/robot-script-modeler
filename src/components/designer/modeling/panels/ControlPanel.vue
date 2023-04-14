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
    import Panel from "@/components/designer/modeling/panels/CommonPanel.vue";

    @Component({
        components: {
            Panel
        }
    })

    export default class ControlPanel extends Mixins(Panel) {
        @Prop() value: any

        get panelName() {
            return this.value.type+'Panel'
        }

        mounted() {
        }
    }
</script>