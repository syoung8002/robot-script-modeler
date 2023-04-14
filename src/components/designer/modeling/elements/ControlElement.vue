<template>
    <div>
        <v-group
                :config="{
                    draggable: true
                }"
        >
            <v-regular-polygon
                    :config="config"
                    @dragstart="handleDragStart"
                    @dblclick="handleModelPanel"
                    @contextMenu="handleContextMenu"
            ></v-regular-polygon>
            <!-- <v-regular-polygon
                    :config="{
                        x: config.x + 300,
                        y: config.y,
                        id: config.id,
                        fill: '#fafafa',
                        stroke: '#000000',
                        draggable: true,
                        radius: 30,
                        sides: 4,
                    }"
                    @dblclick="handleModelPanel"
                    @contextMenu="handleContextMenu"
            ></v-regular-polygon> -->
        </v-group>
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

    export default class ControlElement extends Mixins(ModelElement) {

        createdNewControl(name: string, id: string, x: number, y: number, type: string) {
            var elementView: any = {
                name: name,
                id: id,
                fill: '#fafafa',
                stroke: '#000000',
                draggable: true,
                x: x,
                y: y,
                radius: 30,
                sides: 4,
                type: type,
                controlType: name,
            }
            return elementView
        }
    }
</script>