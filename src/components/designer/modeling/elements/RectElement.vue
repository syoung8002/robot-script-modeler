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
        components: {
        },
        data() {
            return {
            }
        },
        created() {
            const me = this

            me.textConfig = {
                id: me.config.id,
                text: me.config.name,
                x: me.config.x,
                y: me.config.y + me.config.height/2 - 10,
                width: me.config.width,
                fontSize: 20,
                fill: 'black',
                align: 'center',
                draggable: true,
            }
        },
        mounted() {},
        methods: {
        }
    }
</script>

<style>
</style>