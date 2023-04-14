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
                    label="Task Name"
                    style="max-width: 300px; margin-top: 15px;"
            ></v-text-field>
            <v-btn text color="orange" @click="openVariableDialog">
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
                    <component
                            :is="relation.type"
                            :config="relation"
                    ></component>
                </div>
            </v-layer>
        </v-stage>

        <!-- <element-list
                :elementTypes="elementTypes"
                @detectedCollision="detectedCollision"
                @addElement="addElement"
                ref="elementList"
        ></element-list> -->

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
                v-model="selectedTask"
        ></model-panel>

        <!-- Variables Dialogs -->
        <!-- <v-dialog v-model="variableDialog" max-width="800">
            <variables-dialog
                    :variables="robot.variables"
                    @updateVariables="updateVariables"
            ></variables-dialog>
        </v-dialog> -->
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator"
    import Konva from 'konva';
    import EventElement from '@/components/designer/modeling/elements/EventElement.vue'
    import ControlElement from '@/components/designer/modeling/elements/ControlElement.vue'
    import KeywordElement from '@/components/designer/modeling/elements/KeywordElement.vue'
    import ModelRelation from "@/components/designer/modeling/ModelRelation.vue";
    import ScriptPanel from "@/components/designer/modeling/ScriptPanel.vue";
    import ModelPanel from "@/components/designer/modeling/panels/CommonPanel.vue";
    import ElementList from "@/components/designer/modeling/ElementList.vue";
    import VariablesDialog from "@/components/designer/modeling/VariablesDialog.vue";

    import { Stage } from 'konva/lib/Stage';
    import { Layer } from "konva/lib/Layer";
    import { Robot, SeqTask, Task, IfTask, ForTask, WhileTask, Keyword, CallKeyword } from "@/types/Task";

    interface KonvaLayer extends Vue {
        getNode (): Layer
    }

    interface KonvaStage extends Vue {
        getStage (): Stage
    }

    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    @Component({
        components: {
            Konva,
            EventElement,
            ControlElement,
            KeywordElement,
            ModelRelation,
            ScriptPanel,
            ModelPanel,
            ElementList,
            VariablesDialog,
        }
    })

    export default class ModelCanvas extends Vue {
        taskName: string = 'New Task';
        robot: Task = new Robot(this.uuid(), this.taskName, [])
        
        configKonva: any = {
            width: WIDTH,
            height: HEIGHT,
            draggable: false,
        };
        $refs!: {
            stage: KonvaStage
            layer: KonvaLayer
            elementList: ElementList
        }
        elementTypes: any[] = [
            {
                name: 'Event',
                component: 'EventElement',
                icon: 'mdi-circle-outline',
            },
            {
                name: 'Control',
                component: 'ControlElement',
                icon: 'mdi-rhombus-outline',
                task: null,
            },
            {
                name: 'Keyword',
                component: 'KeywordElement',
                icon: 'mdi-square-outline',
                task: Keyword,
            },
        ];
        
        // modeling
        elements: any[] = [];
        relations: any = [];

        dividedLines: any = [];
        divisiveElement: any = null;
        // shape
        selectedTask: any = null;;
        selectedShapeId: string = '';
        lappedElement: any = null;
        // panel
        isOpenPanel: boolean = false;
        // context menu
        isOpenMenu: boolean = false;
        menuStyle: any = {};
        // robot script
        isOpenScript: boolean = false;
        //
        variableDialog: boolean = false;

        mounted () {
            const layer = this.$refs.layer.getNode();
            /** Drag Event */
            layer.on('dragmove', (event: any) => {
                this.detectedCollision(event, null)
            })
            layer.on('dragend', (event: any) => {
                this.detectedCollision(event, null)

                if (this.dividedLines.length > 0) {
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

        @Watch("robot.child", {immediate: true, deep: true})
        updateRobot(newVal: any[], oldVal: any[]) {
            if (newVal) {
                // console.log(newVal)
            }
        }
        

        @Watch("lappedElement", {immediate: true, deep: true})
        checkLapped(newVal: any, oldVal: any) {
            if (newVal && this.divisiveElement) {
                const parentTask = this.robot.findChildTask(newVal.id, this.robot.child)
                const childTask = this.robot.findChildTask(this.divisiveElement.id, this.robot.child)
                const hasChild = parentTask.child.some((task: any) => task.id == childTask.id)
                if (hasChild) {
                    return
                } else {
                    this.robot.child = this.robot.delChild(childTask.id, this.robot.child)
                    parentTask.child.push(childTask)
                }
            } else {
                // if(oldVal && this.divisiveElement) {
                //     const parentTask = this.robot.findChildTask(oldVal.id, this.robot.child)
                //     const childTask = this.robot.findChildTask(this.divisiveElement.id, this.robot.child)
                //     const hasChild = parentTask.child.some((task: any) => task.id == childTask.id)
                //     if (hasChild) {
                //         parentTask.child = parentTask.child.filter((child: any) => child.id != childTask.id)
                //         this.robot.child.push(childTask)
                //     }
                // }
            }
        }

        @Watch("selectedShapeId", {immediate: true, deep: true})
        selTask(val: string) {
            if(val) {
                this.selectedTask = this.robot.findChildTask(val, this.robot.child)
            } else {
                this.selectedTask = null
            }
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
                this.selectedShapeId = val.id
                this.isOpenPanel = true
            }
        }
        handleContextMenu(val: any) {
            this.isOpenMenu = false

            if (val) {
                const pos = val.event.target.getStage().getPointerPosition();
                this.menuStyle.left = pos.x + 'px'
                this.menuStyle.top = pos.y + 'px'
                this.selectedShapeId = val.config.id
                this.isOpenMenu = true
            } else {
                this.menuStyle = {}
            }
        }
        updateConfig(val: any) {
            this.elements.forEach((element: any) => {
                if(element.id == val.id) {
                    element.x = val.x
                    element.y = val.y
                }
            })
        }
        addElement(event: any, componentInfo: any, type: string) {
            var vueComponent, elementView, copyElementView, task
            
            if(componentInfo.component.includes('Event')) {
                vueComponent = new EventElement()
                
                elementView = vueComponent.createdNewEvent(
                    'Start', 
                    this.uuid(), 
                    event ? event.pageX : 200, 
                    event ? event.pageY : 300, 
                    componentInfo.component
                )
                copyElementView = vueComponent.createdNewEvent(
                    'End', 
                    this.uuid(), 
                    event ? event.pageX : 1200, 
                    event ? event.pageY : 300, 
                    componentInfo.component
                )

            } else if(componentInfo.component.includes('Control')) {
                vueComponent = new ControlElement()
                elementView = vueComponent.createdNewControl(
                    type, 
                    this.uuid(), 
                    event.pageX, 
                    event.pageY, 
                    componentInfo.component
                )
                copyElementView = vueComponent.createdNewControl(
                    type,
                    this.uuid(), 
                    event.pageX + 300, 
                    event.pageY, 
                    componentInfo.component
                )
                copyElementView.endControl = true
                copyElementView.controlId = elementView.id

                task = new (componentInfo.task)(elementView.id, type)
                task.setElementView(elementView)

                this.robot.child.push(task)

            } else if(componentInfo.component.includes('Keyword')) {
                vueComponent = new KeywordElement()
                elementView = vueComponent.createdNewKeyword(
                    type, 
                    this.uuid(), 
                    event.pageX, 
                    event.pageY, 
                    componentInfo.component
                )

                task = new (componentInfo.task)(elementView.id, type)
                task.setElementView(elementView)
            
                this.robot.child.push(task)
            
            }

            this.elements.push(elementView)
            if (this.lappedElement || this.dividedLines) {
                this.divisiveElement = elementView
                this.divideConnection()
            }

            if (copyElementView) {
                this.elements.push(copyElementView)
                this.addConnection(elementView.id, copyElementView.id)

                if (this.lappedElement || this.dividedLines) {
                    this.divisiveElement = copyElementView
                    const obj = {
                        x: copyElementView.x,
                        y: copyElementView.y,
                    }
                    this.detectedCollision(obj, componentInfo)
                    this.divideConnection()
                }
            }
        }
        deleteElement(id: string) {
            var delTask = this.robot.findChildTask(id, this.robot.child)
            var delList = [ id ]
            if ( delTask ) {
                delTask.child.forEach((child: any) => {
                    delList.push(child.id)
                })
                console.log(id, this.robot.child)
                // this.robot.child = this.robot.delChild(id, this.robot.child)
            }
            
            let newElements = []
            newElements = this.elements.filter((el: any) => !delList.includes(el.id) && !delList.includes(el.controlId))
            this.elements = newElements

            delList.forEach((delId: string) => {
                this.deleteConnection(delId)
            })
            
            this.handleContextMenu(null)
            this.reconnectLine()
        }
            
        /** Stage Function */
        handleStageMouseDown(event: any) {
            this.$refs.elementList.closeKeywordDialog()
            this.handleModelPanel(null)
            this.handleContextMenu(null)

            if (event.target !== event.target.getStage()) {
                let elId = '';
                elId = event.target.id();
                this.selectedShapeId = elId;
            } else {
                this.selectedShapeId = ""
            }

            if (this.isOpenScript) {
                this.isOpenScript = false
            }
        }
        detectedCollision(event: any, componentInfo: any) {
            let shape: any = {}

            if (event.target instanceof Konva.Shape) {
                // Moving Element
                const target = event.target
                const type = target.attrs.type
                shape = {
                    id: target.id(),
                    type: type
                }
                const element = this.elements.find((el: any) => el.id == shape.id)
                this.divisiveElement = element

                if (type.includes('Control')) {
                    shape.x = target.getAbsolutePosition().x
                    shape.y = target.getAbsolutePosition().y
                    shape.minX = target.getAbsolutePosition().x + target.radius(),
                    shape.maxX = target.getAbsolutePosition().x + target.radius(),
                    shape.minY = target.getAbsolutePosition().y + target.radius(),
                    shape.maxY = target.getAbsolutePosition().y + target.radius(),
                    shape.xRadius = target.radius()
                    shape.yRadius = target.radius()
                } else if (type.includes('Keyword')) {
                    shape.x = target.getAbsolutePosition().x + target.width() / 2
                    shape.y = target.getAbsolutePosition().y + target.height() / 2
                    shape.minX = target.getAbsolutePosition().x
                    shape.maxX = target.getAbsolutePosition().x + target.width()
                    shape.minY = target.getAbsolutePosition().y
                    shape.maxY = target.getAbsolutePosition().y + target.height()
                    shape.xRadius = target.width() / 2
                    shape.yRadius = target.height() / 2
                }
            } else {
                // New Element
                const type = componentInfo.component
                shape = {
                    x: event.x,
                    y: event.y,
                    id: '',
                    type: type
                }
                if (type.includes('Control')) {
                    shape.minX = event.x - 30
                    shape.maxX = event.x + 30
                    shape.minY = event.y - 30
                    shape.maxY = event.y + 30
                    shape.xRadius = 30
                    shape.yRadius = 30
                } else if (type.includes('Keyword')) {
                    shape.minX = event.x - 40
                    shape.maxX = event.x + 40
                    shape.minY = event.y - 50
                    shape.maxY = event.y + 50
                    shape.xRadius = 40
                    shape.yRadius = 50
                }
            }

            let shape2: any = null
            this.elements.forEach((el: any) => {
                if(!el.type.includes('Event') && shape.type.includes('Keyword')) {
                    el.stroke = '#000000'
                    if (shape.id != el.id) {
                        // if (el.type.includes('Keyword')) {
                        //     shape2 = {
                        //         id: el.id,
                        //         x: el.x + el.width / 2,
                        //         y: el.y + el.height / 2,
                        //         xRadius: el.width / 2,
                        //         yRadius: el.height / 2
                        //     }
                        // } else 
                        if (el.type.includes('Control')) {
                            shape2 = {
                                id: el.id,
                                x: el.x,
                                y: el.y,
                                xRadius: el.radius,
                                yRadius: el.radius
                            }
                        }
                    }
                }
            })

            if (shape2) {
                if (this.overlappedShape(shape, shape2)) {
                    const lappedEl = this.elements.find((el: any) => el.id == shape2.id)
                    lappedEl.stroke = 'red'
                    this.lappedElement = lappedEl
                } else {
                    this.lappedElement = null
                }
            }
            shape2 = null

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
                // this.dividedLines = []
            }
        }
            
        /** Connection Function  */
        addConnection(fromId: string, toId: string) {
            if (!fromId || !toId) {
                return
            }

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
            } else if (source.type.includes('Event') || source.type.includes('Control')) {
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
            } else if (target.type.includes('Event') || target.type.includes('Control')) {
                to.x = Math.floor(target.x - target.radius)
                to.y = Math.floor(target.y)
            }
            target.incomingRef = fromId

            if (source.type.includes('Control') && target.type.includes('Control')) {
                if (source.controlType == 'For' && target.controlType == 'For') {
                    this.addForTaskConnection(source, target)
                }
            }

            const relationInfo = {
                name: 'relation',
                from: fromId,
                to: toId,
                points: [ from, to ],
                stroke: '#000000',
                strokeWidth: 2,
                type: 'model-relation'
            }

            const newLines = this.relations.concat(relationInfo)
            this.relations = newLines
        }
        addForTaskConnection(source: any, target: any) {
            const from = {
                x: Math.floor(target.x),
                y: Math.floor(target.y - target.radius),
            }
            const to = {
                x: Math.floor(source.x),
                y: Math.floor(source.y - source.radius),
            }

            const relationInfo = {
                name: 'relation',
                from: target.id,
                to: source.id,
                points: [ from, to ],
                stroke: '#000000',
                strokeWidth: 2,
                type: 'for-task-relation'
            }

            const newLines = this.relations.concat(relationInfo)
            this.relations = newLines
        }
        deleteConnection(id: string) {
            if (!id) {
                return
            }
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
                this.addConnection(line.from, this.divisiveElement.id)
                this.addConnection(this.divisiveElement.id, line.to)
            })

            this.dividedLines = []
            this.divisiveElement = null

            this.reconnectLine()
        }
        movingConnection(val: any) {

            if (this.relations.length < 1) {
                return;
            }

            this.relations.forEach((r: any) => {
                if (!r.type.includes('model')) {
                    const fromEl = this.elements.find((el: any) => el.id === r.from)
                    const toEl = this.elements.find((el: any) => el.id === r.to)
                    if (fromEl.type.includes('Control') && toEl.type.includes('Control')) {
                        if (fromEl.controlType == 'For') {
                            r.points[0].x = fromEl.x
                            r.points[0].y = fromEl.y - fromEl.radius
                            r.points[1].x = toEl.x
                            r.points[1].y = toEl.y - toEl.radius
                        }
                    }
                    return
                }
                if (r.from === val.id) {
                    const toEl = this.elements.find((el: any) => el.id === r.to)

                    if(r.points[1].x > r.points[0].x) {
                        r.points[0].x = val.width ? val.x + val.width : val.x + val.radius
                        
                        if(toEl.type.includes('Keyword')) {
                            r.points[1].x = toEl.x
                        
                        } else if (toEl.type.includes('Event') || 
                                toEl.type.includes('Control')
                        ) {
                            r.points[1].x = toEl.x - toEl.radius
                        }
                        
                    } else {
                        r.points[0].x = val.width ? val.x : val.x - val.radius
                        
                        if(toEl.type.includes('Keyword')) {
                            r.points[1].x = toEl.x + toEl.width
                        
                        } else if (toEl.type.includes('Event') || 
                                toEl.type.includes('Control')
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
                                fromEl.type.includes('Control')
                        ) {
                            r.points[0].x = fromEl.x - fromEl.radius
                        }

                    } else {
                        r.points[1].x = val.width ? val.x : val.x - val.radius
                        
                        if(fromEl.type.includes('Keyword')) {
                            r.points[0].x = fromEl.x + fromEl.width

                        } else if (fromEl.type.includes('Event') || 
                                fromEl.type.includes('Control')
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
            const startEv = this.elements.find((el: any) => el.name == 'Start')
            const endEv = this.elements.find((el: any) => el.name == 'End')

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
        addControlConnection(element: any) {
            this.deleteConnection(element.id)

            if (this.lappedElement.controlType == 'If') {
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

            } else if (this.lappedElement.controlType == 'For') {
                element.incomingRef = this.lappedElement.id
                element.outgoingRef = this.lappedElement.gatewayRef
                
            } else if (this.lappedElement.controlType == 'While') {
                element.incomingRef = this.lappedElement.id
                element.outgoingRef = this.lappedElement.gatewayRef
                
                // this.addConnection(element.incomingRef, element.id)
            }

            // robot
            const isAdd = this.robot.child.some((obj: any) => {
                let res
                if(obj.id == this.lappedElement.id) {
                    res = obj.child.some((ch: any) => ch.id == element.id)
                }
                return res
            })
            if(!isAdd) {
                if (this.lappedElement.controlType == 'If') {
                    this.addControlCondition(this.lappedElement, element)
                } else if (this.lappedElement.controlType == 'For' || this.lappedElement.controlType == 'While') {
                    this.updateTasks(this.lappedElement, element)
                }
            }

            this.lappedElement.stroke = '#000000'
            this.lappedElement = null
            this.dividedLines = []
            this.relations.forEach((line: any) => {
                line.stroke = '#000000'
                line.strokeWidth = 2
            })
        }

        addControlCondition(parent: any, child: any) {
            let condition = {
                type: '',
                variable: '',
                keywords: [ '' ]
            }

            if(parent.controlType == 'While') {
                parent.condition = condition
                return
            }

            if (parent.conditions.length < 1) {
                condition.type = 'If'
            } else if (parent.conditions.length == 1) {
                condition.type = 'Else'
            } else {
                condition.type = 'Else If'
            }

            if (child) {
                condition.keywords = [ child.name ]
            } else {
                condition.keywords = []
            }

            parent.conditions.push(condition)
        }

        updateTasks(parent: any, child: any) {
            if(child.endControl) {
                return
            }
            this.robot.child = this.robot.child.filter((task: any) => task.id != child.id)
            var parentTask = this.robot.child.find((task: any) => task.id == parent.id)
            if(parentTask) {
                parentTask?.child.push(new Keyword(child.id, child.name, child.child))
            } else {
                this.robot.child.push(new Keyword(child.id, child.name, child.child))
            }
        }

        overlappedLine(line: any, shape: any) {
            if(!line.type.includes('model')) { return }

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
        openVariableDialog() {
            this.variableDialog = true
        }
        closeVariableDialog() {
            this.variableDialog = false
        }
        updateVariables(variables: any) {
            this.robot.setProperty({ 'variables': variables });
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