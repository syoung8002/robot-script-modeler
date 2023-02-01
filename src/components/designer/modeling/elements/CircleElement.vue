<template>
    <div>
        <v-circle
                :config="config"
                @dragstart="handleDragStart"
                @transformend="movingElement"
                @dblclick="openPanel"
                @contextMenu="openMenu"
        ></v-circle>

        <model-panel
                v-if="isOpenPanel"
                :value="config"
        ></model-panel>
    </div>
</template>

<script>
    import ModelElement from '../ModelElement'
    import ModelPanel from '../ModelPanel'

    export default {
        mixins: [ModelElement],
        name: 'circle-element',
        components: {
            'model-panel': ModelPanel
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