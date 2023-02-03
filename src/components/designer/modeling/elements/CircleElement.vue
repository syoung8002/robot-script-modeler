<template>
    <div>
        <v-circle
                :config="config"
                @dragstart="handleDragStart"
                @transformend="handleTransformEnd"
                @dblclick="openPanel"
                @contextMenu="openMenu"
        ></v-circle>
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
        name: 'circle-element',
        data() {
            return {
            }
        },
        created() {},
        mounted() {},
        methods: {}
    }
</script>