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
                modelCanvasComponent: null,
            }
        },
        computed: {
            textConfig() {
                const me = this
                let obj = {
                    elementId: me.config.id,
                    text: me.config.name,
                    fontSize: 20,
                    fill: 'black',
                    align: 'center',
                    draggable: true,
                }
                if (me.config.type.includes('rect')) {
                    obj.x = me.config.x
                    obj.y = me.config.y + me.config.height + 10
                    obj.width = me.config.width
                } else if (me.config.type.includes('circle')) {
                    obj.x = me.config.x - me.config.radius
                    obj.y = me.config.y + me.config.radius + 10
                    obj.width = me.config.radius * 2
                } else if (me.config.type.includes('polygon')) {
                    obj.x = me.config.x - me.config.radius
                    obj.y = me.config.y + me.config.radius + 10
                    obj.width = me.config.radius * 2
                }
                return obj
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
                        this.$emit('updateConfig', newVal)
                    }
                }
            },
        },
        methods: {
            handleModelPanel() {
                this.$emit('handleModelPanel', this.config)
            },
            handleContextMenu(e) {
                e.evt.preventDefault()
                const obj = {
                    event: e,
                    config: this.config
                }
                this.$emit('handleContextMenu', obj)
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

                me.movingRelation(me.value)
            },
            movingRelation(val) {
                this.$emit('movingRelation', val)
            },
            movingElement(e) {
                const me = this

                if (e.target instanceof Konva.Text) {
                    me.value.x = Math.floor(e.target.x())
                    
                    if(this.config.type.includes('rect')) {
                        me.value.y = Math.floor(e.target.y() - me.config.height/2 + 10)
                    } else {
                        me.value.y = Math.floor(e.target.y())
                    }
                } else {
                    me.value.x = Math.floor(e.target.x())
                    me.value.y = Math.floor(e.target.y())
                    me.value.rotation = e.target.rotation()
                    me.value.scaleX = e.target.scaleX()
                    me.value.scaleY = e.target.scaleY()
                }

                me.movingRelation(me.value)
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