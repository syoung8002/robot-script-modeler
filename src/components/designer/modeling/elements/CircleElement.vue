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
        name: 'event-element',
        data() {
            return {
            }
        },
        created() {},
        mounted() {},
        methods: {}
    }
</script>