<template>
    <div>
        <v-regular-polygon
                :config="config"
                @dragstart="handleDragStart"
                @transformend="movingElement"
                @dblclick="openPanel"
                @contextMenu="openMenu"
        ></v-regular-polygon>
    </div>
</template>

<script>
    import ModelElement from '../ModelElement'

    export default {
        mixins: [ModelElement],
        name: 'polygon-element',
        components: {
        },
        data() {
            return {
            }
        },
        created() {},
        mounted() {},
        methods: {}
    }
</script>