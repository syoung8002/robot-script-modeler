<template>
    <div>
        <v-rect
                :config="config"
                @dragstart="handleDragStart"
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

        createdNewKeyword(name: string, id: string, x: number, y: number, type: string) {
            var elementView: any = {
                name: name,
                id: id,
                fill: '#fafafa',
                stroke: '#000000',
                draggable: true,
                x: x,
                y: y,
                width: 100,
                height: 80,
                cornerRadius: 5,
                type: type,
                keywordType: name,
            }
            return elementView
        }

    }
</script>