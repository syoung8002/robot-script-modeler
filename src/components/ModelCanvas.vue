<template>
    <div>
        <v-app-bar
                elevation="0"
                app
                fixed
                style="left:0px; background-color:transparent; z-index:1;"
                hide-on-scroll
        >
            <v-toolbar-title></v-toolbar-title>

            <v-spacer></v-spacer>
            <v-text-field
                    v-model="taskName"
                    label="Tasks Name"
                    style="max-width: 300px; margin-top: 15px;"
            ></v-text-field>
            <v-btn text color="orange">
                <v-icon>mdi-variable-box</v-icon>
                Variables
            </v-btn>

            <v-btn text color="primary" @click="openScriptPanel">
                <v-icon>mdi-script-text</v-icon>
                Robot
            </v-btn>
        </v-app-bar>

        <v-stage
                ref="stage"
                :config="configKonva"
                @mousedown="handleStageMouseDown"
                @touchstart="handleStageMouseDown"
        >
            <v-layer ref="layer">
                <div v-for="element in elements" :key="element.id">
                    <component 
                            v-if="element.type == 'KeywordElement' && element.keywordType != 'keyword'"
                            :is="element.type"
                            :config="element"
                            @mousedown="handleStageMouseDown"
                            @movingRelation="movingConnection"
                            @updateConfig="updateConfig"
                            @handleModelPanel="handleModelPanel"
                            @handleContextMenu="handleContextMenu"
                    ></component>
                    <component 
                            v-else
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

        <element-list
                :elementTypes="elementTypes"
                @selectedKeyword="detectedCollision"
                @addKeyword="addElement"
        ></element-list>

        <!-- Robot Script Panel-->
        <ScriptPanel
                v-if="isOpenScript"
                :robot="robot"
        ></ScriptPanel>

        <!-- Element Context Menu-->
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

        <!-- Element Property Panel-->
        <model-panel
                v-if="isOpenPanel"
                :value="selectedShape"
        ></model-panel>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator"
    import Konva from 'konva';
    import EventElement from '@/components/designer/modeling/elements/EventElement.vue'
    import GatewayElement from '@/components/designer/modeling/elements/GatewayElement.vue'
    import KeywordElement from '@/components/designer/modeling/elements/KeywordElement.vue'
    import ModelRelation from "@/components/designer/modeling/ModelRelation.vue";
    import ScriptPanel from "@/components/designer/modeling/ScriptPanel.vue";
    import ModelPanel from "@/components/designer/modeling/panels/Panel.vue";
    import ElementList from "@/components/designer/modeling/ElementList.vue";
    import { Stage } from 'konva/lib/Stage';
    import { Layer } from "konva/lib/Layer";
    import { Node } from 'konva/lib/Node';
    import { Robot, SeqTask, Task, IfTask, ForTask, Keyword, CallKeyword } from "@/types/Task";

    interface KonvaLayer extends Vue {
        getNode (): Layer
    }

    interface KonvaStage extends Vue {
        getStage (): Stage
    }

    interface KonvaTransformer extends Vue {
        getNode (): Transformer,
    }

    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    @Component({
        components: {
            Konva,
            EventElement,
            GatewayElement,
            KeywordElement,
            ModelRelation,
            ScriptPanel,
            ModelPanel,
            ElementList,
        }
    })

    export default class ModelCanvas extends Vue {
        taskName: string = '';
        robot: Task = new Robot(1, this.taskName, [])
        
        configKonva: any = {
            width: WIDTH,
            height: HEIGHT,
            draggable: false,
        };
        $refs!: {
            stage: KonvaStage
            transformer: KonvaTransformer
            layer: KonvaLayer
        }
        elementTypes: any[] = [
            {
                name: 'Event',
                radius: 20,
                component: 'EventElement',
                icon: 'mdi-circle-outline',
            },
            {
                name: 'Gateway',
                sides: 4,
                radius: 30,
                component: 'GatewayElement',
                icon: 'mdi-rhombus-outline',
            },
            {
                name: 'Keyword',
                width: 100,
                height: 80,
                component: 'KeywordElement',
                icon: 'mdi-square-outline',
            },                    
        ];
        
        // modeling
        elements: any[] = [];
        relations: any = [];

        dividedLines: any = [];
        divisiveElement: any = null;
        // shape
        selectedShapeId: string = '';
        selectedShape: any = null;
        lappedElement: any = null;
        // panel
        isOpenPanel: boolean = false;
        // context menu
        isOpenMenu: boolean = false;
        menuStyle: any = {};
        // robot script
        isOpenScript: boolean = false;

        mounted () {
            const layer = this.$refs.layer.getNode();
            /** Drag Event */
            layer.on('dragmove', (event: any) => {
                this.detectedCollision(event, null)
            })
            layer.on('dragend', (event: any) => {
                let target = event.target
                if (target instanceof Konva.Transformer) {
                    const node = target['_nodes'];
                    target = node[0];
                }
                
                this.detectedCollision(event, null)
                const element = this.elements.find((el: any) => el.id === target.id())
                if(this.lappedElement != null) {
                    if (this.lappedElement.type.includes('Keyword')) {
                        //
                    } else if (this.lappedElement.type.includes('Gateway')) {
                        if (this.lappedElement.id != element.id) {
                            this.addGatewayConnection(element)
                        }
                    }
                }
                if (this.dividedLines.length > 0) {
                    this.divisiveElement = element
                    this.divideConnection()
                }
            })

            const eventInfo = this.elementTypes.find((item) => item.component.includes('Event'))
            this.addElement(null, eventInfo, '');
        }

        @Watch("taskName", {immediate: true, deep: true})
        updateTaskName(val: string) {
            this.robot.setName(val)
        }

        kebabCase(str: string) {
            const result = str
                .replace(/([a-z])([A-Z])/g, "$1-$2")
                .replace(/[\s_]+/g, '-')
                .toLowerCase();
            return result
        }

        uuid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4();
        }
        handleModelPanel(val: any) {
            this.isOpenPanel = false
            if (val) {
                this.selectedShape = this.elements.find((r: any) => r.id === val.id);
                this.selectedShapeId = val.id
                this.isOpenPanel = true
            } {
                this.selectedShapeId = ''
            }
        }
        handleContextMenu(val: any) {
            this.isOpenMenu = false

            if (val) {
                const pos = val.event.target.getStage().getPointerPosition();
                this.menuStyle.left = pos.x + 'px'
                this.menuStyle.top = pos.y + 'px'
                this.selectedShape = this.elements.find((r: any) => r.id === val.config.id)
                this.selectedShapeId = val.config.id
                this.isOpenMenu = true
            } else {
                this.menuStyle = {}
                this.selectedShapeId = ''
            }
        }
        updateConfig(val: any) {
            this.elements.forEach((element: any) => {
                if(element.id == val.id) {
                    element.x = val.x
                    element.y = val.y
                    element.rotation = val.rotation
                    element.scaleX = val.scaleX
                    element.scaleY = val.scaleY
                }
            })
        }
        addElement(event: any, componentInfo: any, name: string) {
            let element: any = {
                name: name,
                id: this.uuid(),
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                fill: '#fafafa',
                stroke: '#000000',
                draggable: true,
                x: event ? event.pageX: 200,
                y: event ? event.pageY: 300,
                type: componentInfo.component,
                incomingRef: '',
                outgoingRef: '',
                keywordType: this.kebabCase(name)
            }

            if(componentInfo.component.includes('Event')) {
                element.name = 'Start Event'
                element.radius = componentInfo.radius
            } else if(componentInfo.component.includes('Gateway')) {
                element.sides = componentInfo.sides
                element.radius = componentInfo.radius
                element.keywords = []
            } else {
                element.width = componentInfo.width
                element.height = componentInfo.height
                element.cornerRadius = 10

                this.robot.child.push(new Task(element.id, name, []))
            }
            
            this.elements.push(element)

            if(componentInfo.component.includes('Gateway') || 
                componentInfo.component.includes('Keyword')
            ) {
                this.detectedCollision(event, componentInfo)
                
                if (this.dividedLines.length > 0) {
                    this.divisiveElement = element
                    this.divideConnection()

                    let element2 = null
                    if(componentInfo.component.includes('Gateway')) {
                        element2 = JSON.parse(JSON.stringify(element))
                        element2.x += 500
                        element2.id = this.uuid()
                        element2.gatewayRef = element.id
                        element2.endGateway = true
                        element.gatewayRef = element2.id
                        
                        this.elements.push(element2)
                        this.addConnection(element.id, element2.id)

                        const obj = {
                            x: element2.x,
                            y: element2.y,
                        }
                        this.detectedCollision(obj, componentInfo)

                        this.divisiveElement = element2
                        this.divideConnection()
                    }
                }
            } else {
                let element2 = null
                element2 = JSON.parse(JSON.stringify(element))
                element2.x += 1000
                element2.name = 'End Event'
                element2.strokeWidth = 5
                element2.id = this.uuid()
                element2.eventRef = element.id
                element2.incomingRef = element.id
                element.eventRef = element2.id
                element.outgoingRef = element2.id

                this.elements.push(element2)
                this.addConnection(element.id, element2.id)
            }
        }
        deleteElement(id: string) {
            const delEl = this.elements.find((el: any) => el.id === id)
            
            let delList: any = []
            if (delEl.type.includes('Keyword')) {
                this.elements.forEach((el: any) => {
                    if (el.id == id) {
                        delList.push(el.id)
                    }
                })
            } else if (delEl.type.includes('Gateway')) {
                this.elements.forEach((el: any) => {
                    if (el.id == id || el.gatewayRef == id) {
                        delList.push(el.id)
                    }
                    if (el.type.includes('Keyword') && (el.incomingRef == id || el.outgoingRef == id)) {
                        delList.push(el.id)
                    }
                })
            } else if (delEl.type.includes('Event')) {
                this.elements.forEach((el: any) => {
                    if (el.id == id || el.incomingRef == id || el.outgoingRef == id) {
                        delList.push(el.id)
                        if(el.type.includes('Gateway')) {
                            const keywordList = this.elements.filter((obj: any) => 
                                obj.type.includes('Keyword') && 
                                (obj.incomingRef == el.id || obj.outgoingRef == el.id)
                            )
                            keywordList.forEach((keyword: any) => {
                                delList.push(keyword.id)
                                if (!delList.includes(keyword.incomingRef)) {
                                    delList.push(keyword.incomingRef)
                                }
                                if (!delList.includes(keyword.outgoingRef)) {
                                    delList.push(keyword.outgoingRef)
                                }
                            })
                        }
                    }
                    if (el.eventRef == id) {
                        delList.push(el.id)
                        const elList = this.elements.filter((obj: any) => 
                            obj.incomingRef == el.id || obj.outgoingRef == el.id)
                        elList.forEach((obj: any) => {
                            if (!delList.includes(obj.id)) {
                                delList.push(obj.id)
                            }
                        })
                    }
                })
            }

            let newElements = []
            newElements = this.elements.filter((el: any) => !delList.includes(el.id))
            this.elements = newElements

            delList.forEach((delId: string) => {
                this.deleteConnection(delId)
            })

            // robot
            this.robot.child.forEach((obj: any) => {
                if(obj.id == id) {
                    this.robot.child = this.robot.delChild(delList, this.robot.child)
                } else if(obj.id == delEl.incomingRef) {
                    obj.child = this.robot.delChild(delList, obj.child)
                }
            })
            
            this.handleContextMenu(null)
        }
            
        /** Stage Function */
        handleStageMouseDown(event: any) {
            if (event.target !== event.target.getStage()) {
                                let elId = '';
                if (event.target instanceof Konva.Text) {
                    elId = event.target.attrs.elementId;
                } else {
                    elId = event.target.id();
                }
                this.selectedShapeId = elId;
            }

            if (this.isOpenScript) {
                this.isOpenScript = false
            }

            this.handleModelPanel(null)
            this.handleContextMenu(null)
        }
        detectedCollision(event: any, type: any) {
            let shape: any = {}

            if (type && type.component) {
                if (type.component.includes('Keyword')) {
                    shape = {
                        x: event.x,
                        y: event.y,
                        minX: event.x - type.width/2,
                        maxX: event.x + type.width/2,
                        minY: event.y - type.height/2,
                        maxY: event.y + type.height/2,
                        xRadius: type.width/2,
                        yRadius: type.height/2,
                    }
                } else if (type.component.includes('Event') || type.component.includes('Gateway')) {
                    shape = {
                        x: event.x,
                        y: event.y,
                        minX: event.x - type.radius,
                        maxX: event.x + type.radius,
                        minY: event.y - type.radius,
                        maxY: event.y + type.radius,
                        xRadius: type.radius,
                        yRadius: type.radius,
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

            this.elements.forEach((el: any) => {
                if(!el.type.includes('Event') && shape.type.includes('Keyword')) {
                    el.stroke = '#000000'
                    if (shape.id && shape.id != el.id) {
                        let shape2 = {}
                        if (el.type.includes('Keyword')) {
                            shape2 = {
                                id: el.id,
                                x: el.x + el.width / 2,
                                y: el.y + el.height / 2,
                                xRadius: el.width / 2,
                                yRadius: el.height / 2
                            }
                        } else if (el.type.includes('Gateway')) {
                            shape2 = {
                                id: el.id,
                                x: el.x,
                                y: el.y,
                                xRadius: el.radius,
                                yRadius: el.radius
                            }
                        }
                        
                        if (this.overlappedShape(shape, shape2)) {
                            el.stroke = 'red'
                            this.lappedElement = el
                        }
                    }
                }
            })

            const overlapLines = this.relations.filter((line: any) => 
                this.overlappedLine(line, shape) )

            if (overlapLines.length > 0) {
                overlapLines.forEach((line: any) => {
                    line.stroke = '#424242'
                    line.strokeWidth = 5
                })
                this.dividedLines = overlapLines
            } else {
                this.relations.forEach((line: any) => {
                    line.stroke = '#000000'
                    line.strokeWidth = 2
                })
                this.dividedLines = []
            }
        }
            
        /** Connection Function  */
        addConnection(fromId: string, toId: string) {
            if (!fromId || !toId) {
                return
            }

            const me = this
            const source = this.elements.find((el: any) => el.id === fromId)
            const target = this.elements.find((el: any) => el.id === toId)
            
            if (!source || !target) {
                return
            }


            const from = {
                x: Math.floor(source.x),
                y: Math.floor(source.y),
            }
            if (source.type.includes('Keyword')) {
                from.x = Math.floor(source.x + source.width)
                from.y = Math.floor(source.y + source.height / 2)
            } else if (source.type.includes('Event') || source.type.includes('Gateway')) {
                from.x = Math.floor(source.x + source.radius)
                from.y = Math.floor(source.y)
            }
            source.outgoingRef = toId

            const to = {
                x: Math.floor(target.x),
                y: Math.floor(target.y),
            }
            if (target.type.includes('Keyword')) {
                to.x = Math.floor(target.x)
                to.y = Math.floor(target.y + target.height / 2)
            } else if (target.type.includes('Event') || target.type.includes('Gateway')) {
                to.x = Math.floor(target.x - target.radius)
                to.y = Math.floor(target.y)
            }
            target.incomingRef = fromId

            const newConn = {
                name: 'relation',
                from: fromId,
                to: toId,
                points: [ from, to ],
                stroke: '#000000',
                strokeWidth: 2
            }

            const newLines = this.relations.concat(newConn)
            this.relations = newLines

        }
        deleteConnection(id: string) {
            if (!id) {
                return
            }
            
            const me = this
            const newLines = this.relations.filter((r: any) =>
                r.from != id && r.to != id
            )
            this.relations = newLines

            this.reconnectLine()
        }
        divideConnection() {
            if (this.dividedLines.length < 1) {
                return
            }

            let newLines = this.relations.filter((r: any) =>
                r.from != this.divisiveElement.id && r.to != this.divisiveElement.id
            )
            newLines = newLines.filter((r: any) => {
                const res = this.dividedLines.some((dl: any) => {
                    return !(r.from === dl.from && r.to === dl.to) 
                })
                return res
            })
            this.relations = newLines

            this.dividedLines.forEach((line: any) => {
                const source = this.elements.find((el: any) => el.id === line.from)
                const target = this.elements.find((el: any) => el.id === line.to)
                if(source.type.includes('Gateway') && target.type.includes('Gateway')) {
                    source.keywords.push(this.divisiveElement.id)
                    target.keywords.push(this.divisiveElement.id)
                }
            
                this.addConnection(line.from, this.divisiveElement.id)
                this.addConnection(this.divisiveElement.id, line.to)
            })

            this.dividedLines = []
            this.divisiveElement = null

            this.reconnectLine()
        }

        updateTasks(parent: any, child: any) {
            this.robot.child = this.robot.child.filter((task: any) => task.id != child.id)
            var parentTask = this.robot.child.find((task: any) => task.id == parent.id)
            parentTask?.child.push(new Task(child.id, child.name, child.child))
        }

        movingConnection(val: any) {
            const me = this

            if (this.relations.length < 1) {
                return;
            }

            this.relations.forEach((r: any) => {
                if (r.from === val.id) {
                    const toEl = this.elements.find((el: any) => el.id === r.to)

                    if(r.points[1].x > r.points[0].x) {
                        r.points[0].x = val.width ? val.x + val.width : val.x + val.radius
                        
                        if(toEl.type.includes('Keyword')) {
                            r.points[1].x = toEl.x
                        
                        } else if (toEl.type.includes('Event') || 
                                toEl.type.includes('Gateway')
                        ) {
                            r.points[1].x = toEl.x - toEl.radius
                        }
                        
                    } else {
                        r.points[0].x = val.width ? val.x : val.x - val.radius
                        
                        if(toEl.type.includes('Keyword')) {
                            r.points[1].x = toEl.x + toEl.width
                        
                        } else if (toEl.type.includes('Event') || 
                                toEl.type.includes('Gateway')
                        ) {
                            r.points[1].x = toEl.x + toEl.radius
                        }
                    }

                    if(val.type.includes('Keyword')) {
                        r.points[0].y = val.y + val.height / 2
                    } else {
                        r.points[0].y = val.y
                    }

                } else if (r.to === val.id) {
                    const fromEl = this.elements.find((el: any) => el.id === r.from)

                    if(r.points[0].x > r.points[1].x) {
                        r.points[1].x = val.width ? val.x + val.width : val.x + val.radius
                        
                        if(fromEl.type.includes('Keyword')) {
                            r.points[0].x = fromEl.x

                        } else if (fromEl.type.includes('Event') || 
                                fromEl.type.includes('Gateway')
                        ) {
                            r.points[0].x = fromEl.x - fromEl.radius
                        }

                    } else {
                        r.points[1].x = val.width ? val.x : val.x - val.radius
                        
                        if(fromEl.type.includes('Keyword')) {
                            r.points[0].x = fromEl.x + fromEl.width

                        } else if (fromEl.type.includes('Event') || 
                                fromEl.type.includes('Gateway')
                        ) {
                            r.points[0].x = fromEl.x + fromEl.radius
                        }
                    }

                    if(val.type.includes('Keyword')) {
                        r.points[1].y = val.y + val.height / 2
                    } else {
                        r.points[1].y = val.y
                    }
                }
            })

        }
        reconnectLine() {
            const me = this
            const startEv = this.elements.find((el: any) => el.name == 'Start Event')
            const endEv = this.elements.find((el: any) => el.name == 'End Event')

            if( !startEv || !endEv ) {
                return
            }
            
            const startLine = this.relations.find((r: any) => r.from == startEv.id)
            const endLine = this.relations.find((r: any) => r.to == endEv.id)
            
            if (!startLine) {
                const list = this.elements.filter((el: any) => el.id !== startEv.id)
                const asc = list.sort((a: any, b: any) => {
                    return a.x - b.x
                })
                this.addConnection(startEv.id, asc[0].id)
            }
            
            if (!endLine) {
                const list = this.elements.filter((el: any) => el.id !== endEv.id)
                const desc = list.sort((a: any, b: any) => {
                    return b.x - a.x
                })
                this.addConnection(desc[0].id, endEv.id)
            }
        }
        addGatewayConnection(element: any) {
            const me = this
            this.deleteConnection(element.id)

            element.incomingRef = this.lappedElement.id
            element.outgoingRef = this.lappedElement.gatewayRef
            
            let keywords = this.elements.filter((el: any) => 
                el.id != element.id && el.incomingRef == element.incomingRef)
            
            if (keywords.length > 0) {
                keywords = keywords.sort((a: any, b: any) => {
                    return a.y - b.y
                })
                element.x = keywords[0].x
                element.y = keywords[keywords.length - 1].y + 150
            } else {
                const incomingEl = this.elements.find((el: any) => 
                    el.id == element.incomingRef)
                const outgoingEl = this.elements.find((el: any) => 
                    el.id == element.outgoingRef)
                const random = outgoingEl.x - incomingEl.x
                element.x = incomingEl.x + Math.floor(Math.random() * random)
                element.y = incomingEl.y - 150
            }

            this.addConnection(element.incomingRef, element.id)
            this.addConnection(element.id, element.outgoingRef)

            this.lappedElement.keywords.push(element.id)

            this.lappedElement.stroke = '#000000'
            this.lappedElement = null
            this.dividedLines = []
            this.relations.forEach((line: any) => {
                line.stroke = '#000000'
                line.strokeWidth = 2
            })
        }

        overlappedLine(line: any, shape: any) {
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
        }
        overlappedShape(shape1: any, shape2: any) {
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
        }
        openScriptPanel() {
            this.isOpenScript = true
        }
    }

</script>

<style scoped>

    body {
        margin: 0;
        padding: 0;
    }

    .headers {
        position: absolute !important;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 64px;
        padding: 10px;
        text-align: end;
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

    }

    .tool-item {
        cursor: pointer;
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .tool-item > .v-icon {
        font-size: 40px !important;
    }

    .hands > .v-icon {
        color: #ffc124;
    }

    .context-menu {
        position: absolute !important;
        text-align: center;
    }

</style>