<template>
    <div>
        <v-stage
                ref="stage"
                :config="configKonva"
                @mousedown="handleStageMouseDown"
                @touchstart="handleStageMouseDown"
        >
            <v-layer ref="layer">
                <div v-for="element in elements" :key="element.id">
                    <component 
                            :is="element.type"
                            :config="element"
                            @mousedown="handleStageMouseDown"
                            @movingRelation="movingConnection"
                            @updateConfig="updateConfig"
                            @handleModelPanel="handleModelPanel"
                            @handleContextMenu="handleContextMenu"
                    ></component>
                </div>

                <div v-for="(relation, idx) in relations" :key="'line_'+idx">
                    <model-relation
                            :config="relation"
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
                    @drag="detectedCollision($event, item)"
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
                        component: 'event-element',
                        icon: 'mdi-circle-outline',
                    },
                    {
                        name: 'Gateway',
                        sides: 4,
                        radius: 40,
                        component: 'gateway-element',
                        icon: 'mdi-rhombus-outline',
                    },
                    {
                        name: 'Task',
                        width: 140,
                        height: 90,
                        component: 'task-element',
                        icon: 'mdi-square-outline',
                    },                    
                ],
                elements: [
                    {
                        type: 'event-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: 300,
                        y: 300,
                        radius: 30,
                        scaleX: 1,
                        scaleY: 1,
                        fill: '#fafafa',
                        stroke: '#000000',
                        strokeWidth: 2,
                        name: 'Start Event',
                        draggable: true,
                    },
                    {
                        type: 'event-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: 1600,
                        y: 300,
                        radius: 30,
                        scaleX: 1,
                        scaleY: 1,
                        fill: '#fafafa',
                        stroke: '#000000',
                        strokeWidth: 7,
                        name: 'End Event',
                        draggable: true,
                    },
                ],
                // relation
                relations: [
                    // {
                    //     name: 'relation',
                    //     // from: '1',
                    //     // to: '2',
                    //     points: [
                    //         {
                    //             x: 330,
                    //             y: 300
                    //         },
                    //         {
                    //             x: 1570,
                    //             y: 300
                    //         }
                    //     ],
                    //     stroke: '#000000',
                    //     strokeWidth: 2,
                    // },
                ],
                dividedLines: [],
                divisiveElement: null,
                // shape
                selectedShapeId: '',
                selectedShape: null,
                lappedElement: null,
                // panel
                isOpenPanel: false,
                // context menu
                isOpenMenu: false,
                menuStyle: {},

            };
        },
        created() {
            const me = this

            const startEv = me.elements.find((el) => el.name.includes('Start Event'))
            const endEv = me.elements.find((el) => el.name.includes('End Event'))
            const relation = {
                name: 'relation',
                from: startEv.id,
                to: endEv.id,
                points: [
                    {
                        x: startEv.x + startEv.radius,
                        y: startEv.y
                    },
                    {
                        x: endEv.x - endEv.radius,
                        y: endEv.y
                    }
                ],
                stroke: '#000000',
                strokeWidth: 2,
            }
            me.relations.push(relation)
        },
        mounted() {
            const me = this;
            const layer = me.$refs.layer.getNode();

            /** Drag Event */
            layer.on('dragstart', function (event) {
                //
                
            })
            layer.on('dragmove', function (event) {
                me.detectedCollision(event)
            })
            layer.on('dragend', function (event) {
                let target = event.target
                if (target instanceof Konva.Transformer) {
                    const node = target['_nodes'];
                    target = node[0];
                }
                
                me.detectedCollision(event)
                const element = me.elements.find((el) => el.id === target.id())
                if(me.lappedElement != null) {
                    if (me.lappedElement.type.includes('task')) {
                        //
                    } else if (me.lappedElement.type.includes('gateway')) {
                        if (me.lappedElement.id != element.id) {
                            me.addGatewayConnection(element)
                            return
                        }
                    }
                }
                if (me.dividedLines.length > 0) {
                    me.divisiveElement = element
                    me.divideConnection()
                }

                me.relations.forEach((line) => {
                    line.stroke = '#000000'
                    line.strokeWidth = 2
                })
            })
        },
        watch: {
        },
        methods: {
            uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4();
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
                    id: me.uuid(),
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    fill: '#fafafa',
                    stroke: '#000000',
                    draggable: true,
                    x: event.pageX,
                    y: event.pageY,
                    type: componentInfo.component,
                }

                let element2 = null
                if(componentInfo.component.includes('event')) {
                    element.name = 'Start Event'
                    element.radius = componentInfo.radius
                } else if(componentInfo.component.includes('gateway')) {
                    element.sides = componentInfo.sides
                    element.radius = componentInfo.radius
                    element.divisionRef = ''
                } else {
                    element.width = componentInfo.width
                    element.height = componentInfo.height
                    element.cornerRadius = 10
                    element.incomingRef = ''
                    element.outgoingRef = ''
                }
                
                me.elements.push(element)

                if(componentInfo.component.includes('gateway') || 
                        componentInfo.component.includes('task')
                ) {
                    me.detectedCollision(event, componentInfo)
                    
                    if (me.dividedLines.length > 0) {
                        me.divisiveElement = element
                        me.divideConnection()

                        if(componentInfo.component.includes('gateway')) {
                            element2 = JSON.parse(JSON.stringify(element))
                            element2.x += 600
                            element2.id = me.uuid()
                            element2.divisionRef = element.id
                            element2.mergeRef = ''
                            
                            element.mergeRef = element2.id
                            
                            me.elements.push(element2)
                            me.addConnection(element.id, element2.id)

                            const obj = {
                                x: element2.x,
                                y: element2.y,
                            }
                            me.detectedCollision(obj, componentInfo)

                            me.divisiveElement = element2
                            me.divideConnection()

                        }
                    }
                } else {

                    element2 = JSON.parse(JSON.stringify(element))
                    element2.x += 800
                    element2.name = 'End Event'
                    element2.strokeWidth = 7
                    element2.id = me.uuid()
                    
                    me.elements.push(element2)
                    me.addConnection(element.id, element2.id)

                }
                
            },
            deleteElement(id) {
                const me = this

                const delList = []
                me.elements.forEach((el) => {
                    if(el.id == id || el.mergeRef == id ||
                        el.divisionRef == id || el.incomingRef == id ||
                        el.outgoingRef == id
                    ) {
                        delList.push(el.id)
                    }
                })

                const newElements = me.elements.filter((el) => 
                    el.id != id && el.mergeRef != id && 
                    el.divisionRef != id && el.incomingRef != id && 
                    el.outgoingRef != id
                )
                me.elements = newElements

                delList.forEach((delId) => {
                    me.deleteConnection(delId)
                })

                const transformerNode = this.$refs.transformer.getNode()
                transformerNode.nodes([])

                me.handleContextMenu()
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

                }
                me.updateTransformer()

                me.handleModelPanel()
                me.handleContextMenu()
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
            detectedCollision(event, type) {
                const me = this
                let shape = {}

                if (type && type.component) {
                    if (type.component.includes('task')) {
                        shape = {
                            x: event.x,
                            y: event.y,
                            minX: event.x - 70,
                            maxX: event.x + 70,
                            minY: event.y - 45,
                            maxY: event.y + 45,
                            xRadius: 70,
                            yRadius: 45,
                        }
                    } else if (type.component.includes('event')) {
                        shape = {
                            x: event.x,
                            y: event.y,
                            minX: event.x - 30,
                            maxX: event.x + 30,
                            minY: event.y - 30,
                            maxY: event.y + 30,
                            xRadius: 30,
                            yRadius: 30,
                        }
                    } else {
                        shape = {
                            x: event.x,
                            y: event.y,
                            minX: event.x - 40,
                            maxX: event.x + 40,
                            minY: event.y - 40,
                            maxY: event.y + 40,
                            xRadius: 40,
                            yRadius: 40,
                        }
                    }
                    shape.type = type.component
                } else {
                    let target = event.target
                    if (target instanceof Konva.Transformer) {
                        const node = target['_nodes'];
                        target = node[0];
                    }

                    if (target instanceof Konva.Rect) {
                        shape = {
                            id: target.id(),
                            type: target.attrs.type,
                            x: target.getAbsolutePosition().x + target.width() / 2,
                            y: target.getAbsolutePosition().y + target.height() / 2,
                            minX: target.getAbsolutePosition().x,
                            maxX: target.getAbsolutePosition().x + target.width(),
                            minY: target.getAbsolutePosition().y,
                            maxY: target.getAbsolutePosition().y + target.height(),
                            xRadius: target.width() / 2,
                            yRadius: target.height() / 2,
                        }
                    } else if (target instanceof Konva.Circle || target instanceof Konva.RegularPolygon) {
                        shape = {
                            id: target.id(),
                            type: target.attrs.type,
                            x: target.getAbsolutePosition().x,
                            y: target.getAbsolutePosition().y,
                            minX: target.getAbsolutePosition().x - target.radius(),
                            maxX: target.getAbsolutePosition().x + target.radius(),
                            minY: target.getAbsolutePosition().y - target.radius(),
                            maxY: target.getAbsolutePosition().y + target.radius(),
                            xRadius: target.radius(),
                            yRadius: target.radius(),
                        }
                    }
                }

                me.elements.forEach((el) => {
                    if(!el.type.includes('event') && shape.type.includes('task')) {
                        el.stroke = '#000000'
                        if (shape.id && shape.id != el.id) {
                            let shape2 = {}
                            if (el.type.includes('task')) {
                                shape2 = {
                                    id: el.id,
                                    x: el.x + el.width / 2,
                                    y: el.y + el.height / 2,
                                    xRadius: el.width / 2,
                                    yRadius: el.height / 2
                                }
                            } else if (el.type.includes('gateway')) {
                                shape2 = {
                                    id: el.id,
                                    x: el.x,
                                    y: el.y,
                                    xRadius: el.radius,
                                    yRadius: el.radius
                                }
                            }
                            
                            if (me.overlappedShape(shape, shape2)) {
                                el.stroke = 'red'
                                me.lappedElement = el
                            }
                        }
                    }
                })

                const overlapLines = me.relations.filter((line) => me.overlappedLine(line, shape) )
                if (overlapLines.length > 0) {
                    overlapLines.forEach((line) => {
                        line.stroke = '#424242'
                        line.strokeWidth = 5
                    })
                    me.dividedLines = overlapLines
                } else {
                    me.relations.forEach((line) => {
                        line.stroke = '#000000'
                        line.strokeWidth = 2
                    })
                    me.dividedLines = []
                }
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
                    x: Math.floor(source.x),
                    y: Math.floor(source.y),
                }
                if (source.type.includes('task')) {
                    source.outgoingRef = toId
                    from.x = Math.floor(source.x + source.width)
                    from.y = Math.floor(source.y + source.height / 2)
                } else if (source.type.includes('event') || source.type.includes('gateway')) {
                    from.x = Math.floor(source.x + source.radius)
                    from.y = Math.floor(source.y)
                }

                const to = {
                    x: Math.floor(target.x),
                    y: Math.floor(target.y),
                }
                if (target.type.includes('task')) {
                    target.incomingRef = fromId
                    to.x = Math.floor(target.x)
                    to.y = Math.floor(target.y + target.height / 2)
                } else if (target.type.includes('event') || target.type.includes('gateway')) {
                    to.x = Math.floor(target.x - target.radius)
                    to.y = Math.floor(target.y)
                }

                const newConn = {
                    name: 'relation',
                    from: fromId,
                    to: toId,
                    points: [ from, to ],
                    stroke: '#000000',
                    strokeWidth: 2
                }

                const newLines = me.relations.concat(newConn)
                me.relations = newLines

            },
            deleteConnection(id) {
                if (!id) {
                    return
                }
                
                const me = this
                const newLines = me.relations.filter((r) =>
                    r.from != id && r.to != id
                )
                me.relations = newLines

                me.reconnectLine()
            },
            divideConnection() {
                const me = this
                
                if (me.dividedLines.length < 1) {
                    return
                }

                let newLines = me.relations.filter((r) =>
                    r.from != me.divisiveElement.id && r.to != me.divisiveElement.id
                )
                newLines = newLines.filter((r) => {
                    const res = me.dividedLines.some((dl) => {
                        return !(r.from === dl.from && r.to === dl.to) 
                    })
                    return res
                })
                me.relations = newLines

                me.dividedLines.forEach((line) => {
                    me.addConnection(line.from, me.divisiveElement.id)
                    me.addConnection(me.divisiveElement.id, line.to)
                })

                me.dividedLines = []
                me.divisiveElement = null

                me.reconnectLine()
            },
            movingConnection(val) {
                const me = this

                if (me.relations.length < 1) {
                    return;
                }

                me.relations.forEach((r) => {
                    if (r.from === val.id) {
                        const toEl = me.elements.find((el) => el.id === r.to)

                        if(r.points[1].x > r.points[0].x) {
                            r.points[0].x = val.width ? val.x + val.width : val.x + val.radius
                            
                            if(toEl.type.includes('task')) {
                                r.points[1].x = toEl.x
                            
                            } else if (toEl.type.includes('event') || 
                                    toEl.type.includes('gateway')
                            ) {
                                r.points[1].x = toEl.x - toEl.radius
                            }
                            
                        } else {
                            r.points[0].x = val.width ? val.x : val.x - val.radius
                            
                            if(toEl.type.includes('task')) {
                                r.points[1].x = toEl.x + toEl.width
                            
                            } else if (toEl.type.includes('event') || 
                                    toEl.type.includes('gateway')
                            ) {
                                r.points[1].x = toEl.x + toEl.radius
                            }
                        }

                        if(val.type.includes('task')) {
                            r.points[0].y = val.y + val.height / 2
                        } else {
                            r.points[0].y = val.y
                        }

                    } else if (r.to === val.id) {
                        const fromEl = me.elements.find((el) => el.id === r.from)

                        if(r.points[0].x > r.points[1].x) {
                            r.points[1].x = val.width ? val.x + val.width : val.x + val.radius
                            
                            if(fromEl.type.includes('task')) {
                                r.points[0].x = fromEl.x

                            } else if (fromEl.type.includes('event') || 
                                    fromEl.type.includes('gateway')
                            ) {
                                r.points[0].x = fromEl.x - fromEl.radius
                            }

                        } else {
                            r.points[1].x = val.width ? val.x : val.x - val.radius
                            
                            if(fromEl.type.includes('task')) {
                                r.points[0].x = fromEl.x + fromEl.width

                            } else if (fromEl.type.includes('event') || 
                                    fromEl.type.includes('gateway')
                            ) {
                                r.points[0].x = fromEl.x + fromEl.radius
                            }
                        }

                        if(val.type.includes('task')) {
                            r.points[1].y = val.y + val.height / 2
                        } else {
                            r.points[1].y = val.y
                        }
                    }
                })

            },
            reconnectLine() {
                const me = this
                const startEv = me.elements.find((el) => el.name == 'Start Event')
                const endEv = me.elements.find((el) => el.name == 'End Event')

                const startLine = me.relations.find((r) => r.from == startEv.id)
                const endLine = me.relations.find((r) => r.to == endEv.id)
                
                if (!startLine) {
                    const list = me.elements.filter((el) => el.id !== startEv.id)
                    const asc = list.sort((a, b) => {
                        return a.x - b.x
                    })
                    me.addConnection(startEv.id, asc[0].id)
                }
                
                if (!endLine) {
                    const list = me.elements.filter((el) => el.id !== endEv.id)
                    const desc = list.sort((a, b) => {
                        if(a.id != endEv.id) {
                            return b.x - a.x
                        }
                    })
                    me.addConnection(desc[0].id, endEv.id)
                }
            },
            addGatewayConnection(element) {
                const me = this
                me.deleteConnection(element.id)
                
                element.incomingRef = me.lappedElement.id
                element.outgoingRef = me.lappedElement.mergeRef
                
                me.addConnection(element.incomingRef, element.id)
                me.addConnection(element.id, element.outgoingRef)

                let tasks = me.elements.filter((el) => el.id != element.id && el.incomingRef == element.incomingRef)
                if (tasks.length > 0) {
                    tasks = tasks.sort((a, b) => {
                        return a.y - b.y
                    })
                    element.x = tasks[0].x
                    element.y = tasks[tasks.length - 1].y + 150
                } else {
                    const incomingEl = me.elements.find((el) => el.id == element.incomingRef)
                    const outgoingEl = me.elements.find((el) => el.id == element.outgoingRef)
                    const random = outgoingEl.x - incomingEl.x
                    element.x = incomingEl.x + Math.floor(Math.random() * random)
                    element.y = incomingEl.y - 150
                }

                me.lappedElement.stroke = '#000000'
                me.lappedElement = null
            },

            overlappedLine(line, shape) {
                const points = line.points
                const xDistance = points[1].x - points[0].x
                const midpoint = points[0].x + xDistance / 2
                
                if (shape.id) {
                    if (line.from == shape.id || line.to == shape.id) {
                        return false
                    }
                }

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
            },
            overlappedShape(shape1, shape2) {
                if (shape1.x == shape2.x && shape1.y == shape2.y) {
                    return true
                    
                } else {
                    if (shape2.y - shape2.yRadius <= shape1.y && shape1.y <= shape2.y + shape2.yRadius) {
                        if (shape2.x <= shape1.x + shape1.xRadius &&
                                shape1.x -shape1.xRadius < shape2.x + shape2.xRadius
                        ) {
                            return true
                        }
                        if (shape1.x - shape1.xRadius <= shape2.x &&
                                shape2.x - shape2.xRadius < shape1.x + shape1.xRadius
                        ) {
                            return true
                        }
                    }
                }
                return false
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