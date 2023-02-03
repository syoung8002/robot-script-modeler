<template>
    <div>
        <v-rect
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="openPanel"
                @contextMenu="openMenu"
        ></v-rect>
        <v-text
                :config="textConfig"
                @dragstart="handleDragStart"
                @dblclick="openPanel"
                @contextMenu="openMenu"
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