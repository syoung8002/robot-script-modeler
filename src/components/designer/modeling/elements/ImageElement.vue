<template>
    <div>
        <v-image 
                :config="config"
                @dragstart="handleDragStart"
                @transformend="movingElement"
                @dblclick="openPanel"
                @contextMenu="openMenu"
        ></v-image>
    </div>
</template>

<script>
    import ModelElement from '../ModelElement'

    export default {
        mixins: [ModelElement],
        name: 'image-element',
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