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
                // value.id = this.config.id
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
        handleTransformEnd(e: any) {
            const newWidth = Math.floor(this.value.width * e.target.scaleX())
            const newHeight = Math.floor(this.value.height * e.target.scaleY())
            console.log(newWidth, newHeight)
            console.log(e.target.width(), e.target.height())

            this.movingRelation(this.value)
        }
        movingRelation(val: any) {
            this.$emit('movingRelation', val)
        }
        movingElement(e: any) {
            if (e.target instanceof Konva.Text) {
                this.value.x = Math.floor(e.target.x())
                
                if(this.config.type.includes('task')) {
                    this.value.y = Math.floor(e.target.y() - this.config.height/2 + 10)
                } else {
                    this.value.y = Math.floor(e.target.y())
                }
            } else {
                this.value.x = Math.floor(e.target.x())
                this.value.y = Math.floor(e.target.y())
                this.value.rotation = e.target.rotation()
                this.value.scaleX = e.target.scaleX()
                this.value.scaleY = e.target.scaleY()
            }

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