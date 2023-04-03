<template>
    <div>
        <v-rect
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-rect>
        <v-text
                :config="{
                    x: config.x,
                    y: config.y + config.height + 10,
                    text: config.name,
                }"
        ></v-text>
        
    </div>
</template>

<script lang="ts">
    import { Component, Mixins } from "vue-property-decorator"
    import ModelElement from '@/components/designer/modeling/elements/ModelElement.vue'

    @Component({
        components: {
            ModelElement,
        }
    })
    export default class KeywordElement extends Mixins(ModelElement) {

        mounted() {
        }

    }
</script>