<template>
    <div>
        <v-regular-polygon
        :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="handleModelPanel"
                @contextMenu="handleContextMenu"
        ></v-regular-polygon>
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
        name: 'polygon-element',
        data() {
            return {
            }
        },
        created() {},
        mounted() {},
        methods: {}
    }
</script>