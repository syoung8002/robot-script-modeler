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
                    @dragend="detectedCollision($event, item.component); addElement($event, item)"
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
                <!-- <v-list-item>
                    <v-btn text @click="addRelation(selectedShapeId)">
                        Add Connection
                    </v-btn>
                </v-list-item> -->
                <v-list-item>
                    <v-btn text @click="deleteElement(selectedShapeId)">
                        Delete
                    </v-btn>
                </v-list-item>
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
                        name: 'Event',
                        radius: 30,
                        component: 'circle-element',
                        icon: 'mdi-circle-outline',
                    },
                    {
                        name: 'Gateway',
                        sides: 4,
                        radius: 40,
                        component: 'polygon-element',
                        icon: 'mdi-rhombus-outline',
                    },
                    {
                        name: 'Task',
                        width: 140,
                        height: 90,
                        component: 'rect-element',
                        icon: 'mdi-square-outline',
                    },                    
                ],
                elements: [
                    {
                        type: 'circle-element',
                        id: '1',
                        rotation: 0,
                        x: 300,
                        y: 300,
                        radius: 30,
                        scaleX: 1,
                        scaleY: 1,
                        fill: '#fafafa',
                        stroke: '#757575',
                        strokeWidth: 2,
                        name: 'Start Event',
                        draggable: true,
                    },
                    {
                        type: 'circle-element',
                        id: '2',
                        rotation: 0,
                        x: 1500,
                        y: 300,
                        radius: 30,
                        scaleX: 1,
                        scaleY: 1,
                        fill: '#fafafa',
                        stroke: '#757575',
                        strokeWidth: 2,
                        name: 'End Event',
                        draggable: true,
                    },
                ],
                // relation
                relations: [
                    [
                        {
                            id: '1',
                            x: 330,
                            y: 300
                        },
                        {
                            id: '2',
                            x: 1470,
                            y: 300
                        }
                    ]
                ],
                drawningLine: false,
                dividedLine: null,
                divisiveElement: null,
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
                
            })
            layer.on('dragend', function (event) {

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
                me.divideConnection()
            })
        },
        watch: {
            dividedLine: {
                deep: true,
                handler(newVal) {
                    if(newVal) {
                        console.log(newVal)
                    }
                }
            },
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
                    name: componentInfo.name,
                    id: me.createNewElementId(),
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    fill: '#fafafa',
                    stroke: '#757575',
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
                    element.cornerRadius = 10
                }
                me.elements.push(element)

                if (!me.dividedLine) {
                    me.addConnection('1', element.id)
                    me.addConnection(element.id, '2')
                } else {
                    me.divisiveElement = element
                    me.divideConnection()
                }

            },
            deleteElement(id) {
                const me = this;
                const newElements = me.elements.filter((el) => el.id !== id);
                me.elements = newElements;

                me.deleteConnection(id);

                const transformerNode = this.$refs.transformer.getNode();
                transformerNode.nodes([]);

                me.handleContextMenu();
                me.createNewElementId()
            },
            createNewElementId() {
                const me = this
                let list = []
                me.elements.forEach((el) => {
                    list.push(el.id)
                })
                list = list.sort((a, b) => a - b)
                const newId = Number(list[list.length - 1]) + 1
                return String(newId)
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
            detectedCollision(target, type) {
                const me = this
                const layer = me.$refs.layer.getNode()
                let shape

                function overlappedLine(line, shape) {
                    const points = line.points
                    const xDistance = points[1].x - points[0].x
                    const midpoint = points[0].x + xDistance / 2
                    
                    if (points[0].y == points[1].y) {
                        if (shape.minY < points[0].y && points[0].y < shape.maxY) {
                            if (points[0].x < points[1].x) {
                                if (points[0].x <= shape.x && shape.x <= points[1].x) {
                                    return true
                                }
                            } else {
                                if (points[1].x <= shape.x && shape.x <= points[0].x) {
                                    return true
                                }
                            }
                        }
                    } else {
                        if (points[0].y < points[1].y) {
                            if (points[0].y < shape.minY && shape.maxY < points[1].y) {
                                if (shape.minX < midpoint && midpoint < shape.maxX) {
                                    return true
                                }
                            } else {
                                if (shape.minY < points[0].y && points[0].y < shape.maxY) {
                                    if (points[0].x < points[1].x) {
                                        if (points[0].x < shape.x && shape.x < midpoint) {
                                            return true
                                        }
                                    } else {
                                        if (midpoint < shape.x && shape.x < points[0].x) {
                                            return true
                                        }
                                    }
                                }
                                if (shape.minY < points[1].y && points[1].y < shape.maxY) {
                                    if (points[0].x < points[1].x) {
                                        if (midpoint < shape.x && shape.x < points[1].x) {
                                            return true
                                        }
                                    } else {
                                        if (points[1].x < shape.x && shape.x < midpoint) {
                                            return true
                                        }
                                    }
                                }
                            }
                        } else {
                            if (points[1].y < shape.minY && shape.maxY < points[0].y) {
                                if (shape.minX < midpoint && midpoint < shape.maxX) {
                                    return true
                                }
                            } else {
                                if (shape.minY < points[0].y && points[0].y < shape.maxY) {
                                    if (points[0].x < points[1].x) {
                                        if (points[0].x < shape.x && shape.x < midpoint) {
                                            return true
                                        }
                                    } else {
                                        if (midpoint < shape.x && shape.x < points[0].x) {
                                            return true
                                        }
                                    }
                                }
                                if (shape.minY < points[1].y && points[1].y < shape.maxY) {
                                    if (points[0].x < points[1].x) {
                                        if (midpoint < shape.x && shape.x < points[1].x) {
                                            return true
                                        }
                                    } else {
                                        if (points[1].x < shape.x && shape.x < midpoint) {
                                            return true
                                        }
                                    }
                                }
                            }
                            
                        }
                    }
                    return false
                }
                function overlappedShape(shape1, shape2) {
                    if (shape1.x === shape2.x && shape1.y === shape2.y) {
                        return true
                        
                    } else {
                        if (shape1.xRadius * 2 < shape2.xRadius * 2 &&
                                shape1.yRadius * 2 < shape2.yRadius * 2
                        ) {
                            // if () {
                            //     if (shape1.x - shape1.xRadius >= shape2.x - shape2.xRadius) {
                            //         //
                            //     }
                            // }
                        } else if (shape2.xRadius * 2 < shape1.xRadius * 2 &&
                                shape2.yRadius * 2 < shape1.yRadius * 2
                        ) {
                            //
                        }
                    }
                    return false
                }

                if (target instanceof DragEvent) {
                    if (type.includes('rect')) {
                        shape = {
                            x: target.x,
                            y: target.y,
                            minX: target.x - 70,
                            maxX: target.x + 70,
                            minY: target.y - 45,
                            maxY: target.y + 45,
                        }
                    } else if (type.includes('circle')) {
                        shape = {
                            x: target.x,
                            y: target.y,
                            minX: target.x - 30,
                            maxX: target.x + 30,
                            minY: target.y - 30,
                            maxY: target.y + 30,
                        }
                    } else {
                        shape = {
                            x: target.x,
                            y: target.y,
                            minX: target.x - 40,
                            maxX: target.x + 40,
                            minY: target.y - 40,
                            maxY: target.y + 40,
                        }
                    }
                } else {
                    if (target instanceof Konva.Text) {
                        target = layer.findOne('#' + target.attrs.elementId)
                    }
                    if (target instanceof Konva.Rect) {
                        shape = {
                            x: target.getAbsolutePosition().x + target.width() / 2,
                            y: target.getAbsolutePosition().y + target.height() / 2,
                            minX: target.getAbsolutePosition().x,
                            maxX: target.getAbsolutePosition().x + target.width(),
                            minY: target.getAbsolutePosition().y,
                            maxY: target.getAbsolutePosition().y + target.height()
                        }
                    } else if (target instanceof Konva.Circle || target instanceof Konva.RegularPolygon) {
                        shape = {
                            x: target.getAbsolutePosition().x,
                            y: target.getAbsolutePosition().y,
                            minX: target.getAbsolutePosition().x - target.radius(),
                            maxX: target.getAbsolutePosition().x + target.radius(),
                            minY: target.getAbsolutePosition().y - target.radius(),
                            maxY: target.getAbsolutePosition().y + target.radius()
                        }
                    }
                }

                layer.children.forEach(function (item) {
                    if ( item instanceof Konva.Shape && item.name() === 'relation' ) {
                        const line = item.attrs
                        if (overlappedLine(line, shape)) {
                            me.dividedLine = line
                            console.log(me.dividedLine)
                            if (target.attrs) {
                                const el = me.elements.find((el) => el.id === target.id())
                                el.strokeWidth = 5
                                me.divisiveElement = el ? el : null
                            }
                        } else {
                            me.dividedLine = null
                            line.stroke = '#000000'
                            line.strokeWidth = 2
                            if (target.attrs) {
                                const el = me.elements.find((el) => el.id === target.id())
                                el.strokeWidth = 2
                            }
                        }
                    }
                    
                    // if (    target instanceof DragEvent ||
                    //         item.id() === target.id() || 
                    //         item instanceof Konva.Transformer ||
                    //         item instanceof Konva.Line ||
                    //         item instanceof Konva.Text ||
                    //         item.name() === 'relation'
                    // ) {
                    //     return;
                    // } else {
                    //     let itemShape
                    //     if (item instanceof Konva.Rect) {
                    //         itemShape = {
                    //             x: item.getAbsolutePosition().x + item.width()/2,
                    //             y: item.getAbsolutePosition().y + item.height()/2,
                    //             xRadius: item.width()/2,
                    //             yRadius: item.height()/2
                    //         }
                    //     } else if (item instanceof Konva.Circle || item instanceof Konva.RegularPolygon) {
                    //         itemShape = {
                    //             x: item.getAbsolutePosition().x,
                    //             y: item.getAbsolutePosition().y,
                    //             xRadius: item.radius(),
                    //             yRadius: item.radius()
                    //         }
                    //     }
                        
                    //     if (overlappedShape(itemShape, shape)) {
                    //         item.attrs.strokeWidth = 5
                    //         // target.attrs.strokeWidth = 5
                    //     } else {
                    //         item.attrs.strokeWidth = 2
                    //         // target.attrs.strokeWidth = 2
                    //     }
                    // }

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
            
            /** Connection Function  */
            addConnection(fromId, toId) {
                if (!fromId || !toId) {
                    return
                }

                const me = this
                const source = me.elements.find((el) => el.id === fromId)
                const target = me.elements.find((el) => el.id === toId)
                
                if (!source || !target) {
                    return
                }

                const from = {
                    id: fromId,
                    x: Math.floor(source.x),
                    y: Math.floor(source.y),
                }
                if (source.type.includes('rect')) {
                    from.x = Math.floor(source.x + source.width)
                    from.y = Math.floor(source.y + source.height / 2)
                } else if (source.type.includes('circle') || source.type.includes('polygon')) {
                    from.x = Math.floor(source.x + source.radius)
                    from.y = Math.floor(source.y)
                }

                const to = {
                    id: toId,
                    x: Math.floor(target.x),
                    y: Math.floor(target.y),
                }
                if (target.type.includes('rect')) {
                    to.x = Math.floor(target.x)
                    to.y = Math.floor(target.y + target.height / 2)
                } else if (target.type.includes('circle') || target.type.includes('polygon')) {
                    to.x = Math.floor(target.x - target.radius)
                    to.y = Math.floor(target.y)
                }

                const newLines = me.relations.concat([ [ from, to ] ])
                me.relations = newLines

            },
            deleteConnection(id) {
                if (!id) {
                    return
                }
                const me = this
                const newLines = me.relations.filter((r) => r[0].id != id || r[1].id != id)
                me.relations = newLines

            },
            divideConnection() {
                const me = this
                if (!me.dividedLine || !me.divisiveElement) {
                    return
                }
                
                const points = me.dividedLine.points
                const newLines = me.relations.filter((r) => 
                    r[0].id != points[0].id || r[1].id != points[1].id
                )
                me.relations = newLines

                me.addConnection(points[0].id, me.divisiveElement.id)
                me.addConnection(me.divisiveElement.id, points[1].id)
                
                me.dividedLine = null
                me.divisiveElement = null
            },

            addRelation(id) {
                const me = this
                if (!id) {
                    return
                }
                
                if(me.drawningLine) {
                    me.drawningLine = false

                    const target = me.elements.find((el) => el.id === id)
                    if (!target) { return }

                    const location = {
                        id: id,
                        x: Math.floor(target.x),
                        y: Math.floor(target.y)
                    }

                    if (target.type.includes('rect')) {
                        location.x = Math.floor(target.x)
                        location.y = Math.floor(target.y + target.height / 2)
                    } else if (target.type.includes('circle') || target.type.includes('polygon')) {
                        location.x = Math.floor(target.x - target.radius)
                        location.y = Math.floor(target.y)
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
                        x: Math.floor(source.x),
                        y: Math.floor(source.y),
                    }

                    if (source.type.includes('rect')) {
                        location.x = Math.floor(source.x + source.width)
                        location.y = Math.floor(source.y + source.height / 2)
                    } else if (source.type.includes('circle') || source.type.includes('polygon')) {
                        location.x = Math.floor(source.x + source.radius)
                        location.y = Math.floor(source.y)
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
                            const toEl = me.elements.find((el) => el.id === r[1].id)
                            if(r[1].x > r[rIdx].x) {
                                r[rIdx].x = val.width ? val.x + val.width : val.x + val.radius
                                
                                if(toEl.type.includes('rect')) {
                                    r[1].x = toEl.x
                                
                                } else if (toEl.type.includes('circle') || 
                                        toEl.type.includes('polygon')
                                ) {
                                    r[1].x = toEl.x - toEl.radius
                                }
                                
                            } else {
                                r[rIdx].x = val.width ? val.x : val.x - val.radius
                                
                                if(toEl.type.includes('rect')) {
                                    r[1].x = toEl.x + toEl.width
                                
                                } else if (toEl.type.includes('circle') || 
                                        toEl.type.includes('polygon')
                                ) {
                                    r[1].x = toEl.x + toEl.radius
                                }
                            }
                        }
                        if(rIdx === 1) {
                            const fromEl = me.elements.find((el) => el.id === r[0].id)
                            if(r[0].x > r[rIdx].x) {
                                r[rIdx].x = val.width ? val.x + val.width : val.x + val.radius
                                
                                if(fromEl.type.includes('rect')) {
                                    r[0].x = fromEl.x

                                } else if (fromEl.type.includes('circle') || 
                                        fromEl.type.includes('polygon')
                                ) {
                                    r[0].x = fromEl.x - fromEl.radius
                                }

                            } else {
                                r[rIdx].x = val.width ? val.x : val.x - val.radius
                                
                                if(fromEl.type.includes('rect')) {
                                    r[0].x = fromEl.x + fromEl.width

                                } else if (fromEl.type.includes('circle') || 
                                        fromEl.type.includes('polygon')
                                ) {
                                    r[0].x = fromEl.x + fromEl.radius
                                }
                            }
                        }

                        if(val.type.includes('rect')) {
                            r[rIdx].y = val.y + val.height / 2
                        } else {
                            r[rIdx].y = val.y
                        }
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
                font-size: 40px !important;
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