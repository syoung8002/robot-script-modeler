<template>
    <div>
        <v-circle
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-circle>
        <v-text
                :config="{
                    x: config.x - config.radius,
                    y: config.y + config.radius + 10,
                    text: config.name
                }"
        ></v-text>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Mixins } from "vue-property-decorator"
    import ModelElement from '@/components/designer/modeling/elements/ModelElement.vue'

    @Component({
        components: {
            ModelElement,
        }
    })

    export default class EventElement extends Mixins(ModelElement) {}
</script>