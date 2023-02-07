<template>
    <div>
        <v-stage
                ref="stage"
                :config="configKonva"
                @mousemove="handleStageMouseMove"
                @mousedown="handleStageMouseDown"
                @touchstart="handleStageMouseDown"
        >
            <v-layer ref="layer">
                <div v-for="element in elements" :key="element.id">
                    <component 
                            :is="element.type"
                            :config="element"
                            @mousedown="handleStageMouseDown"
                            @movingRelation="movingRelation"
                            @updateConfig="updateConfig"
                            @handleModelPanel="handleModelPanel"
                            @handleContextMenu="handleContextMenu"
                    ></component>
                </div>

                <div v-for="(points, idx) in relations" :key="'line_'+idx">
                    <model-relation
                            :points="points"
                    ></model-relation>
                </div>

                <v-transformer ref="transformer" />
            </v-layer>
        </v-stage>

        <v-card class="tools" max-width="100">
            <div @click="configKonva.draggable = !configKonva.draggable"
                    :class="{ hands: configKonva.draggable }"
                    class="tool-item"
            >
                <v-icon>mdi-drag</v-icon>
            </div>
            <div v-for="item in elementTypes" 
                    :key="item.name"
                    draggable="true"
                    class="tool-item"
                    @dragend="addElement($event, item)"
            >
                <v-icon>{{ item.icon }}</v-icon>
            </div>
        </v-card>

        <!-- Context Menu-->
        <v-card v-if="isOpenMenu"
                :style="menuStyle"
                class="context-menu"
                max-width="300"
        >
            <v-list>
                <v-btn text @click="addRelation(selectedShapeId)">
                    Add Connection
                </v-btn>
            </v-list>
        </v-card>

        <!-- Panel-->
        <model-panel
                v-if="isOpenPanel"
                :value="selectedShape"
        ></model-panel>
    </div>
</template>

<script>
    import Konva from 'konva';
    import ModelPanel from './ModelPanel'

    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    export default {
        name: 'model-canvas',
        components: {
            'model-panel': ModelPanel
        },
        data() {
            return {
                configKonva: {
                    width: WIDTH,
                    height: HEIGHT,
                    draggable: false,
                },
                elementTypes: [
                    {
                        name: 'rectangle',
                        width: 100,
                        height: 100,
                        component: 'rect-element',
                        icon: 'mdi-square-outline',
                    },
                    {
                        name: 'circle',
                        radius: 60,
                        component: 'circle-element',
                        icon: 'mdi-circle-outline',
                    },
                ],
                elements: [
                    {
                        type: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        shadowBlur: 5,
                        fill: 'ivory',
                        name: 'rect1',
                        draggable: true,
                    },
                    {
                        type: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        shadowBlur: 5,
                        fill: 'ivory',
                        name: 'rect2',
                        draggable: true,
                    },
                    {
                        type: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        shadowBlur: 5,
                        fill: 'ivory',
                        name: 'rect3',
                        draggable: true,
                    },
                    {
                        type: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        shadowBlur: 5,
                        fill: 'ivory',
                        name: 'rect4',
                        draggable: true,
                    },
                    {
                        type: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        shadowBlur: 5,
                        fill: 'ivory',
                        name: 'rect5',
                        draggable: true,
                    },
                ],
                // relation
                relations: [],
                drawningLine: false,
                // shape
                selectedShapeId: '',
                selectedShape: null,
                // panel
                isOpenPanel: false,
                // context menu
                isOpenMenu: false,
                menuStyle: {},

            };
        },
        created() {},
        mounted() {
            const me = this;
            const layer = me.$refs.layer.getNode();

            /** Drag Event */
            layer.on('dragstart', function (event) {
                let target = event.target;
                if (target.name() === 'relation') {
                    return;
                }
                if (target instanceof Konva.Text) {
                    target = layer.findOne('#' + target.attrs.elementId);
                }
                if (target instanceof Konva.Transformer) {
                    const node = target['_nodes'];
                    target = node[0];
                }
                
            })
            layer.on('dragmove', function (event) {
                let target = event.target;
                if (target.name() === 'relation') {
                    return;
                }
                if (target instanceof Konva.Text) {
                    target = layer.findOne('#' + target.attrs.elementId);
                }
                if (target instanceof Konva.Transformer) {
                    const node = target['_nodes'];
                    target = node[0];
                }

                me.detectedCollision(target)
            })
            layer.on('dragend', function (event) {
                layer.find('.guid-line').forEach((l) => l.destroy());

                let target = event.target;
                if (target.name() === 'relation') {
                    return;
                }
                if (target instanceof Konva.Text) {
                    target = layer.findOne('#' + target.attrs.elementId);
                }
                if (target instanceof Konva.Transformer) {
                    const node = target['_nodes'];
                    target = node[0];
                }
            })
        },
        methods: {
            uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            handleModelPanel(val) {
                const me = this
                me.isOpenPanel = false

                if (val) {
                    me.selectedShape = me.elements.find((r) => r.id === val.id);
                    me.selectedShapeId = val.id
                    me.isOpenPanel = true
                } {
                    // me.selectedShape = null
                    me.selectedShapeId = ''
                }
            },
            handleContextMenu(val) {
                const me = this
                me.isOpenMenu = false

                if (val) {
                    const pos = val.event.target.getStage().getPointerPosition();
                    me.menuStyle.left = pos.x + 'px'
                    me.menuStyle.top = pos.y + 'px'
                    me.selectedShape = me.elements.find((r) => r.id === val.config.id)
                    me.selectedShapeId = val.config.id
                    me.isOpenMenu = true
                } else {
                    me.menuStyle = {}
                    // me.selectedShape = null
                    me.selectedShapeId = ''
                }
            },
            updateConfig(val) {
                const me = this
                me.elements.forEach(element => {
                    if(element.id == val.id) {
                        element.x = val.x
                        element.y = val.y
                        element.rotation = val.rotation
                        element.scaleX = val.scaleX
                        element.scaleY = val.scaleY
                    }
                })
            },
            addElement(event, componentInfo) {
                const me = this
                let element = {
                    name: '',
                    id: me.uuid(),
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    shadowBlur: 5,
                    fill: 'ivory',
                    draggable: true,
                    x: event.pageX,
                    y: event.pageY,
                    type: componentInfo.component,
                }

                if(componentInfo.component.includes('polygon')) {
                    element.sides = componentInfo.sides
                    element.radius = componentInfo.radius
                } else if(componentInfo.component.includes('circle')) {
                    element.radius = componentInfo.radius
                } else {
                    element.width = componentInfo.width
                    element.height = componentInfo.height
                }
                me.elements.push(element)
            },

            /** Stage Function */
            handleStageMouseDown(event) {
                const me = this

                if (event.target !== event.target.getStage()) {
                    const clickedOnTransformer = event.target.getParent().className === 'Transformer';
                    if (clickedOnTransformer) {
                        return;
                    }

                    let elId = '';
                    if (event.target instanceof Konva.Text) {
                        elId = event.target.attrs.elementId;
                    } else {
                        elId = event.target.id();
                    }
                    me.selectedShapeId = elId;

                    // relation
                    if(me.drawningLine) {
                        me.addRelation(elId)
                    }
                }
                me.updateTransformer()

                me.handleModelPanel()
                me.handleContextMenu()
            },
            handleStageMouseMove(event) {
                const me = this
                
                // draw Relation
                if (me.drawningLine) {
                    me.drawRelation(event)
                    return;
                }
            },
            updateTransformer() {
                const me = this
                const transformerNode = this.$refs.transformer.getNode();
                const stage = transformerNode.getStage();

                const selectedNode = stage.findOne('#' + me.selectedShapeId);
                if (selectedNode === transformerNode.node()) {
                    return;
                }

                if (selectedNode instanceof Konva.Layer || !selectedNode) {
                    transformerNode.nodes([]);
                } else {
                    transformerNode.nodes([selectedNode]);
                }
            },
            detectedCollision(target) {
                const me = this
                const layer = me.$refs.layer.getNode();
                
                function isOverlapped(r1, r2) {
                    if((r1.y <= r2.y && r2.y <= r1.y + r1.height) ||
                        (r1.y + r1.height/2 <= r2.y + r2.height && r2.y + r2.height <= r1.y + r1.height)
                    ) {
                        if((r1.x <= r2.x && r2.x <= r1.x + r1.width/2)) {
                            return 'right'
                        }
                        if((r1.x + r1.width/2 <= r2.x + r2.width && r2.x + r2.width <= r1.x + r1.width)
                        ) {
                            return 'left'
                        }
                    }
                    return false
                }

                if(target instanceof Konva.Text) {
                    target = layer.findOne('#' + target.attrs.elementId)
                }
                const targetRect = target.getClientRect();

                layer.children.forEach(function (item) {
                    let shape = item;
                    if (shape.id() === target.id() || 
                            shape instanceof Konva.Transformer ||
                            shape instanceof Konva.Line ||
                            shape instanceof Konva.Text ||
                            shape.name() === 'relation'
                    ) {
                        return;
                    }
                    const overlapped = isOverlapped(shape.getClientRect(), targetRect)
                    if (overlapped) {
                        me.changedElement(target.id(), shape.id(), overlapped);
                    }
                });
            },
            changedElement(targetId, sourceId, direction) {
                const me = this
                const target = me.elements.find((el) => el.id === targetId)
                const source = me.elements.find((el) => el.id === sourceId)

                // if (direction === 'left') {
                //     source.x = target.x - 200
                // } else if (direction === 'right') {
                //     source.x = target.x + 200
                // }
                // source.y = target.y
            },
            
            /** Relation Function  */
            addRelation(id) {
                const me = this
                if(!id) {
                    return
                }
                
                if(me.drawningLine) {
                    me.drawningLine = false

                    const target = me.elements.find((el) => el.id === id)
                    if (!target) { return }
                    const location = {
                        id: id,
                        x: Math.floor(target.x),
                        y: Math.floor(target.y + target.height / 2)
                    }

                    const lastLine = me.relations[me.relations.length - 1].slice();
                    lastLine[1] = location;

                    const newLines = me.relations.slice()
                    newLines[newLines.length - 1] = lastLine
                    me.relations = newLines
                    
                } else {
                    me.drawningLine = true
                    me.isOpenMenu = false
                    
                    const source = me.elements.find((el) => el.id === id)
                    if (!source) { return }
                    const location = {
                        id: id,
                        x: Math.floor(source.x + source.width),
                        y: Math.floor(source.y + source.height / 2),
                    }

                    const newLines = me.relations.concat([ [ location, location ] ])
                    me.relations = newLines

                }
            },
            drawRelation(event) {
                const me = this
                const pos = event.target.getStage().getPointerPosition();
                
                const lastLine = me.relations[me.relations.length - 1].slice();
                lastLine[1] = pos;

                const newLines = me.relations.slice();
                newLines[newLines.length - 1] = lastLine;
                me.relations = newLines;
            },
            movingRelation(val) {
                const me = this

                if (me.relations.length < 1) {
                    return;
                }

                me.relations.forEach((r) => {
                    const rIdx = r.findIndex((obj) => obj.id === val.id)
                    if(rIdx > -1) {
                        if(rIdx === 0) {
                            const toEl = me.elements.filter((el) => el.id === r[1].id)
                            if(r[1].x > r[rIdx].x) {
                                r[rIdx].x = val.x + val.width
                                r[1].x = toEl[0].x
                            } else {
                                r[rIdx].x = val.x
                                r[1].x = toEl[0].x + toEl[0].width
                            }
                        }
                        if(rIdx === 1) {
                            const fromEl = me.elements.filter((el) => el.id === r[0].id)
                            if(r[0].x > r[rIdx].x) {
                                r[rIdx].x = val.x + val.width
                                r[0].x = fromEl[0].x
                            } else {
                                r[rIdx].x = val.x
                                r[0].x = fromEl[0].x + fromEl[0].width
                            }
                        }
                        r[rIdx].y = val.y + val.height / 2
                    }
                })
            },

        }
    };
</script>

<style scoped lang="scss" rel="stylesheet/scss">

    body {
        margin: 0;
        padding: 0;
    }

    .tools {
        position: absolute !important;
        text-align: center;
        width: 100px;
        left: 20px;
        top: 200px;
        padding: 10px;
        overflow: hidden;
        box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 
                    0 2px 2px 0 rgb(0 0 0 / 14%), 
                    0 1px 5px 0 rgb(0 0 0 / 40%) !important;

        .tool-item {
            cursor: pointer;
            margin-top: 5px;
            margin-bottom: 5px;

            .v-icon {
                font-size: 50px !important;
            }
        }

        .hands > .v-icon {
            color: #ffc124;
        }
    }

    .context-menu {
        position: absolute !important;
        text-align: center;
    }

</style>