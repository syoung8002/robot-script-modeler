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
                            :is="element.component"
                            :config="element"
                            @updateConfig="updateConfig"
                            @updateRelation="updateRelation"
                            @openPanel="openPanel"
                            @openMenu="openMenu"
                    ></component>
                </div>

                <!-- <div v-for="relation in relations" :key="relation.id">
                    <v-line
                            :config="relation"
                    ></v-line>
                </div> -->

                <div v-for="(line, idx) in lines" :key="'line_'+idx">
                    <model-relation
                            :points="line"
                    ></model-relation>
                </div>
                
                <v-transformer ref="transformer" />
            </v-layer>
        </v-stage>

        <!-- Context Menu-->
        <v-card v-if="isOpenMenu" :style="menuStyle" max-width="300">
            <v-list>
                <v-btn text @click="addRelation(selectedShape)">
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
    // const GUIDELINE_OFFSET = 5;

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
                    // draggable: true,
                },
                elements: [
                    {
                        component: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        fill: 'ivory',
                        stroke: 'black',
                        name: 'rect1',
                        draggable: true,
                    },
                    {
                        component: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        fill: 'ivory',
                        stroke: 'black',
                        name: 'rect2',
                        draggable: true,
                    },
                    {
                        component: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        fill: 'ivory',
                        stroke: 'black',
                        name: 'rect3',
                        draggable: true,
                    },
                    {
                        component: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        fill: 'ivory',
                        stroke: 'black',
                        name: 'rect4',
                        draggable: true,
                    },
                    {
                        component: 'rect-element',
                        id: this.uuid(),
                        rotation: 0,
                        x: WIDTH * Math.random(),
                        y: HEIGHT * Math.random(),
                        width: 100,
                        height: 100,
                        scaleX: 1,
                        scaleY: 1,
                        fill: 'ivory',
                        stroke: 'black',
                        name: 'rect5',
                        draggable: true,
                    },
                ],
                // relation
                relations: [],
                drawningLine: false,
                lines: [
                    [
                        { x: 30, y: 30 },
                        { x: 200, y: 200 }
                    ]
                ],
                relationConfig: null,
                //
                selectedShapeName: '',
                selectedShape: null,
                // panel
                isOpenPanel: false,
                // context menu
                isOpenMenu: false,
                menuStyle: {},
            };
        },
        created() {
            try {
            } catch (error) {
                console.log(error)
            }
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
            openPanel(val) {
                const me = this
                me.selectedShape = me.elements.find((r) => r.id === val.id);
                me.isOpenPanel = true
            },
            openMenu(val) {
                const me = this
                me.menuStyle = {}
                me.menuStyle.position = 'absolute'
                
                if(val.component.includes('rect-element')) {
                    me.menuStyle.left = Math.floor(val.x) + val.width/2 + 'px'
                    me.menuStyle.top = Math.floor(val.y) + val.height/2 + 'px'
                } else if(val.component.includes('polygon-element')) {
                    me.menuStyle.left = Math.floor(val.x) +'px'
                    me.menuStyle.top = Math.floor(val.y) + 'px'
                }

                me.selectedShape = me.elements.find((r) => r.id === val.id)
                me.isOpenMenu = true
            },
            updateConfig(val) {
                this.elements.forEach(element => {
                    if(element.id == val.id) {
                        element.x = val.x
                        element.y = val.y
                        element.rotation = val.rotation
                        element.scaleX = val.scaleX
                        element.scaleY = val.scaleY
                    }
                })
            },
            handleStageMouseDown(e) {
                const me = this

                // relation
                if(me.drawningLine) {
                    me.addRelation(e)
                    return
                }

                // clicked on stage - clear selection
                if (e.target === e.target.getStage()) {
                    me.isOpenPanel = false
                    me.isOpenMenu = false
                    me.selectedShape = null
                    me.selectedShapeName = '';
                    me.updateTransformer();
                    return;
                }

                // clicked on transformer - do nothing
                const clickedOnTransformer = e.target.getParent().className === 'Transformer';
                if (clickedOnTransformer) {
                    return;
                }

                // find clicked rect by its name
                const name = e.target.name();
                const el = me.elements.find((r) => r.name === name);
                if (el) {
                    me.selectedShapeName = name;
                } else {
                    me.selectedShapeName = '';
                }
                me.updateTransformer();
            },
            handleStageMouseMove(e) {
                const me = this
                if (!me.drawningLine) {
                    return;
                }
                const pos = e.target.getStage().getPointerPosition();
                const lastRelation = me.relations[me.relations.length - 1];
                lastRelation.points = [lastRelation.points[0], lastRelation.points[1], pos.x, pos.y];

                // lines
                const lastLine = me.lines[me.lines.length - 1].slice();
                lastLine[1] = pos;

                const newLines = me.lines.slice();
                newLines[newLines.length - 1] = lastLine;
                me.lines = newLines;
            },
            updateTransformer() {
                // here we need to manually attach or detach Transformer node
                const transformerNode = this.$refs.transformer.getNode();
                const stage = transformerNode.getStage();
                const { selectedShapeName } = this;

                const selectedNode = stage.findOne('.' + selectedShapeName);
                // do nothing if selected node is already attached
                if (selectedNode === transformerNode.node()) {
                    return;
                }

                if (selectedNode) {
                    // attach to another node
                    transformerNode.nodes([selectedNode]);
                } else {
                    // remove transformer
                    transformerNode.nodes([]);
                }
            },
            addRelation(val) {
                const me = this

                if(me.drawningLine) {
                    me.drawningLine = false;

                    if(!(val.target instanceof Konva.Stage)) {
                        const lastRelation = me.relations[me.relations.length - 1]
                        lastRelation.to = val.target.attrs.id
                        
                        const location = {
                            x: Math.floor(val.target.x() + val.target.width() / 2),
                            y: Math.floor(val.target.y() + val.target.height() / 2)
                        }

                        lastRelation.points = [
                            lastRelation.points[0],
                            lastRelation.points[1],
                            location.x,
                            location.y
                        ]

                        // lines
                        const lastLine = me.lines[me.lines.length - 1].slice();
                        lastLine[1] = location;

                        const newLines = me.lines.slice();
                        newLines[newLines.length - 1] = lastLine;
                        me.lines = newLines;

                        console.log(me.lines, me.relations)
                    }
                } else {
                    me.drawningLine = true
                    me.isOpenMenu = false
                    
                    const location = {
                        x: Math.floor(val.x + val.width / 2),
                        y: Math.floor(val.y + val.height / 2),
                    }

                    me.relations.push({
                        component: 'model-relation',
                        id: me.uuid(),
                        points: [ location.x, location.y ],
                        stroke: 'black',
                        from: val.id,
                    })

                    // lines
                    const newLines = me.lines.concat([ [ location, location ] ]);
                    me.lines = newLines;
                }
            },
            updateRelation(val) {
                const me = this
                if (me.relations.length < 1) {
                    return;
                }

                const relationList = me.relations.filter(
                    (r) => r.to === val.id || r.from === val.id
                )

                relationList.forEach((relation) => {
                    if (relation.from === val.id) {
                        if (val.component.includes('rect-element')) {
                            relation.points[0] = val.x + val.width / 2
                            relation.points[1] = val.y + val.height / 2
                        }
                    }
                    if (relation.to === val.id) {
                        if (val.component.includes('rect-element')) {
                            relation.points[2] = val.x + val.width / 2
                            relation.points[3] = val.y + val.height / 2
                        }
                    }
                })
            },
            
        }
    };
</script>

<style>
body {
    margin: 0;
    padding: 0;
}
</style>