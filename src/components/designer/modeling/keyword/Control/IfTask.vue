<template>
    <div>
        <v-regular-polygon
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-regular-polygon>

        <v-regular-polygon
                :config="copyConfig"
        ></v-regular-polygon>
    </div>
</template>

<script lang="ts">
    import { Component, Mixins, Watch } from "vue-property-decorator"
    import ControlElement from '@/components/designer/modeling/elements/ControlElement.vue'

    @Component({
        components: {
            ControlElement,
        }
    })
    export default class IfTask extends Mixins(ControlElement) {
        copyConfig: any = null

        mounted() {
            this.copyConfig = this.config
            this.copyConfig.x = this.config.x + 300
        }

        @Watch("config.conditions", {immediate: true, deep: true})
        setConditions(val: any) {
            console.log(val)
        }
    }
</script>