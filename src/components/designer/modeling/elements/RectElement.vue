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
                :config="textConfig"
                @dragstart="handleDragStart"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-text>
    </div>
</template>

<script>
    import ModelElement from '../ModelElement'

    export default {
        mixins: [ModelElement],
        name: 'rect-element',
        data() {
            return {
            }
        },
        created() {},
        mounted() {},
        methods: {
        }
    }
</script>

<style>
</style>