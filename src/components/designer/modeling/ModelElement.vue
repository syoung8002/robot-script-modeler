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
                let obj = {
                    elementId: this.config.id,
                    text: this.config.name,
                    x: this.config.x,
                    y: this.config.y,
                    width: this.config.width ? this.config.width : 100,
                    fontSize: 20,
                    fill: 'black',
                    align: 'center',
                    draggable: true,
                }
                if(this.config.type.includes('rect')) {
                    obj.y += this.config.height/2 - 10
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
            openPanel() {
                this.$emit('openPanel', this.config)
            },
            openMenu(e) {
                e.evt.preventDefault()
                const obj = {
                    event: e,
                    config: this.config
                }
                this.$emit('openMenu', obj)
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