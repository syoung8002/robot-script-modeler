<template>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"
    import Konva from 'konva';

    @Component({
        components: {
            Konva,
        }
    })

    export default class ModelElement extends Vue {
        @Prop({ type: Object }) config?: any;

        // data
        public value: any = null;
        public modelCanvasComponent: any = null;

        mounted() {
            this.modelCanvasComponent = this.getComponent('model-canvas')
            this.value = this.config
        }

        // watch
        @Watch("value", {immediate: true, deep: true})
        public updatedValue(value: object, oldValue: object) {
            if(value) {
                this.$emit('updateConfig', value)
            }
        }

        // methods
        handleModelPanel() {
            this.$emit('handleModelPanel', this.config)
        }
        handleContextMenu(e: any) {
            e.evt.preventDefault()
            const obj = {
                event: e,
                config: this.config
            }
            this.$emit('handleContextMenu', obj)
        }
        handleDragStart(e: any) {
            e.target.on('dragmove', () => {
                this.movingElement(e)
            });
        }
        movingRelation(val: any) {
            this.$emit('movingRelation', val)
        }
        movingElement(e: any) {
            e.target.moveToTop()
            this.value.x = Math.floor(e.target.x())
            this.value.y = Math.floor(e.target.y())

            this.movingRelation(this.value)
        }
        getComponent(componentName: string) {
            let component = null
            let parent = this.$parent
            while (parent && !component) {
                if (parent.$options.name === componentName) {
                    component = parent
                }
                parent = parent.$parent
            }
            return component
        }
    }

</script>