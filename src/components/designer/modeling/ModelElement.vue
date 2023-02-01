<template>
</template>

<script>
    import Konva from 'konva';

    export default {
        name: 'model-element',
        props: {
            config: Object,
        },
        data() {
            return {
                value: {},
                textConfig: {},
                modelCanvasComponent: null,
            }
        },
        created() {
            const me = this
            me.modelCanvasComponent = me.getComponent('model-canvas')
            me.value = me.config
        },
        mounted() {},
        watch: {
            value: {
                deep: true,
                handler(newVal, oldVal) {
                    if(newVal) {
                        newVal.id = this.config.id
                        this.setTextConfig(newVal)
                        this.$emit('updateConfig', newVal)
                    }
                }
            },
        },
        methods: {
            openPanel() {
                this.$emit('openPanel', this.config)
            },
            openMenu(e) {
                e.evt.preventDefault()
                this.$emit('openMenu', this.config)
            },
            handleDragStart(e) {
                e.target.on('dragmove', () => {
                    this.movingElement(e)
                });
            },
            handleTransformEnd(e) {
                const me = this
                const newWidth = Math.floor(me.value.width * e.target.scaleX())
                const newHeight = Math.floor(me.value.height * e.target.scaleY())
                console.log(newWidth, newHeight)
                console.log(e.target.width(), e.target.height())
                // me.value.width = newWidth
                // me.value.height = newHeight

                me.updateRelation(me.value)
            },
            updateRelation(val) {
                this.$emit('updateRelation', val)
            },
            movingElement(e) {
                const me = this

                if (e.target instanceof Konva.Text) {
                    me.value.x = Math.floor(e.target.x())
                    me.value.y = Math.floor(e.target.y() - me.config.height/2 + me.textConfig.fontSize/2)
                } else {
                    me.value.x = Math.floor(e.target.x())
                    me.value.y = Math.floor(e.target.y())
                    me.value.rotation = e.target.rotation()
                    me.value.scaleX = e.target.scaleX()
                    me.value.scaleY = e.target.scaleY()
                }

                me.updateRelation(me.value)
            },
            setTextConfig(val) {
                const me = this
                if (val.name) {
                    me.textConfig.text = val.name
                }
                me.textConfig.x = val.x
                me.textConfig.y = val.y + me.config.height/2 - me.textConfig.fontSize/2
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
        },
    }
</script>