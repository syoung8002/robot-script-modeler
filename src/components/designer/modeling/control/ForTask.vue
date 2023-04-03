<template>
    <div>
        <v-regular-polygon
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-regular-polygon>
    </div>
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import ControlElement from '@/components/designer/modeling/elements/ControlElement.vue'

    @Component({
        components: {
            ControlElement,
        }
    })
    export default class ForTask extends Mixins(ControlElement) {
        mounted() {
        }
    }
</script>