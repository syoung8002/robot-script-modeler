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
                            @openPanel="openPanel"
                            @openMenu="openMenu"
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
                <v-btn text @click="addRelation($event, selectedShape)">
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
    const GUIDELINE_OFFSET = 5;

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
                selectedShapeName: '',
                selectedShape: null,
                // panel
                isOpenPanel: false,
                // context menu
                isOpenMenu: false,
                menuStyle: {},
                // swap location
                swapLocation: {},
            };
        },
        created() {},
        mounted() {
            const me = this;
            const layer = me.$refs.layer.getNode();

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
                console.log(target)                
                me.swapLocation = {
                    x: target.getClientRect().x,
                    y: target.getClientRect().y
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

                me.detectCollision(target);
            })

            layer.on('dragend', function (event) {
                // layer.find('.guid-line').forEach((l) => l.destroy());

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

                me.swapLocation = {}
                
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
            openPanel(val) {
                const me = this
                me.selectedShape = me.elements.find((r) => r.id === val.id);
                me.isOpenPanel = true
            },
            openMenu(val) {
                const me = this
                const pos = val.event.target.getStage().getPointerPosition();
                me.menuStyle.left = pos.x + 'px'
                me.menuStyle.top = pos.y + 'px'
                me.selectedShape = me.elements.find((r) => r.id === val.config.id)
                me.isOpenMenu = true
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

                // relation
                if(me.drawningLine) {
                    me.addRelation(event)
                    return
                }

                // clicked on stage - clear selection
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
                    me.updateTransformer();
                    return;
                }

                me.isOpenPanel = false
                me.isOpenMenu = false
                me.selectedShape = null
                me.selectedShapeId = ''
                me.updateTransformer();
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
                const transformerNode = this.$refs.transformer.getNode();
                const stage = transformerNode.getStage();
                const { selectedShapeId } = this;

                const selectedNode = stage.findOne('#' + selectedShapeId);
                // do nothing if selected node is already attached
                if (selectedNode === transformerNode.node()) {
                    return;
                }

                if (selectedNode instanceof Konva.Layer || !selectedNode) {
                    // remove transformer
                    transformerNode.nodes([]);
                } else {
                    // attach to another node
                    transformerNode.nodes([selectedNode]);
                }
            },
            detectCollision(target) {
                const me = this
                const layer = me.$refs.layer.getNode();
                
                if(target instanceof Konva.Text) {
                    target = layer.findOne('#' + target.attrs.elementId)
                }

                let targetRect = target.getClientRect();

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

                layer.children.forEach(function (item) {
                    let shape = item;
                    if(item instanceof Konva.Text) {
                        shape = layer.findOne('#' + item.attrs.elementId)
                    }
                    if (shape === target || 
                            shape instanceof Konva.Transformer ||
                            shape instanceof Konva.Line ||
                            shape.name() === 'relation'
                    ) {
                        return;
                    }
                    const overlapped = isOverlapped(shape.getClientRect(), targetRect)
                    if (overlapped) {
                        me.swappedLocation(target.id(), shape.id(), overlapped);
                    }
                });
            },
            swappedLocation(targetId, sourceId, direction) {
                const me = this
                const target = me.elements.find((el) => el.id === targetId)
                const source = me.elements.find((el) => el.id === sourceId)
                
                target.x = source.x
                target.y = source.y
                source.x = me.swapLocation.x
            },
            
            /** Relation Function  */
            addRelation(event, val) {
                const me = this

                if(me.drawningLine) {
                    if(!(event.target instanceof Konva.Stage)) {
                        let elId = ''
                        if(event.target instanceof Konva.Text) {
                            elId = event.target.attrs.elementId;
                        } else {
                            elId = event.target.id()
                        }
                        
                        if(elId) {
                            me.drawningLine = false;
                            const location = {
                                id: elId,
                                x: Math.floor(event.target.x()),
                                y: Math.floor(event.target.y() + event.target.height() / 2)
                            }

                            const lastLine = me.relations[me.relations.length - 1].slice();
                            lastLine[1] = location;

                            const newLines = me.relations.slice();
                            newLines[newLines.length - 1] = lastLine;
                            me.relations = newLines;
                        }
                    }
                } else {
                    me.drawningLine = true
                    me.isOpenMenu = false
                    
                    const location = {
                        id: val.id,
                        x: Math.floor(val.x + val.width),
                        y: Math.floor(val.y + val.height / 2),
                    }

                    const newLines = me.relations.concat([ [ location, location ] ]);
                    me.relations = newLines;
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
            
            /** GuideLine Function */
            getLineGuideStops(skipShape) {
                const me = this;
                const stage = me.$refs.stage.getNode();
                // we can snap to stage borders and the center of the stage
                var vertical = [0, stage.width() / 2, stage.width()];
                var horizontal = [0, stage.height() / 2, stage.height()];

                // and we snap over edges and center of each object on the canvas
                stage.find('Rect').forEach((guideItem) => {
                    if (guideItem === skipShape) {
                        return;
                    }
                    var box = guideItem.getClientRect();
                    // and we can snap to all edges of shapes
                    vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
                    horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
                });
                return {
                    vertical: vertical.flat(),
                    horizontal: horizontal.flat(),
                };
            },
            getObjectSnappingEdges(node) {
                var box = node.getClientRect();
                var absPos = node.absolutePosition();

                return {
                    vertical: [
                        {
                            guide: Math.round(box.x),
                            offset: Math.round(absPos.x - box.x),
                            snap: 'start',
                        },
                        {
                            guide: Math.round(box.x + box.width / 2),
                            offset: Math.round(absPos.x - box.x - box.width / 2),
                            snap: 'center',
                        },
                        {
                            guide: Math.round(box.x + box.width),
                            offset: Math.round(absPos.x - box.x - box.width),
                            snap: 'end',
                        },
                    ],
                    horizontal: [
                        {
                            guide: Math.round(box.y),
                            offset: Math.round(absPos.y - box.y),
                            snap: 'start',
                        },
                        {
                            guide: Math.round(box.y + box.height / 2),
                            offset: Math.round(absPos.y - box.y - box.height / 2),
                            snap: 'center',
                        },
                        {
                            guide: Math.round(box.y + box.height),
                            offset: Math.round(absPos.y - box.y - box.height),
                            snap: 'end',
                        },
                    ],
                };
            },
            getGuides(lineGuideStops, itemBounds) {
                var resultV = [];
                var resultH = [];

                lineGuideStops.vertical.forEach((lineGuide) => {
                    itemBounds.vertical.forEach((itemBound) => {
                        var diff = Math.abs(lineGuide - itemBound.guide);
                        // if the distance between guild line and object snap point is close we can consider this for snapping
                        if (diff < GUIDELINE_OFFSET) {
                            resultV.push({
                                lineGuide: lineGuide,
                                diff: diff,
                                snap: itemBound.snap,
                                offset: itemBound.offset,
                            });
                        }
                    });
                });

                lineGuideStops.horizontal.forEach((lineGuide) => {
                    itemBounds.horizontal.forEach((itemBound) => {
                        var diff = Math.abs(lineGuide - itemBound.guide);
                        if (diff < GUIDELINE_OFFSET) {
                            resultH.push({
                                lineGuide: lineGuide,
                                diff: diff,
                                snap: itemBound.snap,
                                offset: itemBound.offset,
                            });
                        }
                    });
                });

                var guides = [];

                // find closest snap
                var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
                var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
                if (minV) {
                    guides.push({
                        lineGuide: minV.lineGuide,
                        offset: minV.offset,
                        orientation: 'V',
                        snap: minV.snap,
                    });
                }
                if (minH) {
                    guides.push({
                        lineGuide: minH.lineGuide,
                        offset: minH.offset,
                        orientation: 'H',
                        snap: minH.snap,
                    });
                }
                return guides;
            },
            drawGuides(guides) {
                const me = this;
                const layer = me.$refs.layer.getNode();

                guides.forEach((lg) => {
                    if (lg.orientation === 'H') {
                        var line = new Konva.Line({
                            points: [-6000, 0, 6000, 0],
                            stroke: 'rgb(0, 161, 255)',
                            strokeWidth: 1,
                            name: 'guid-line',
                            dash: [4, 6],
                        });
                        layer.add(line);
                        line.absolutePosition({
                            x: 0,
                            y: lg.lineGuide,
                        });
                    } else if (lg.orientation === 'V') {
                        var line = new Konva.Line({
                            points: [0, -6000, 0, 6000],
                            stroke: 'rgb(0, 161, 255)',
                            strokeWidth: 1,
                            name: 'guid-line',
                            dash: [4, 6],
                        });
                        layer.add(line);
                        line.absolutePosition({
                            x: lg.lineGuide,
                            y: 0,
                        });
                    }
                });
            },
            beforeDrawGuide(target) {
                const me = this;
                const layer = me.$refs.layer.getNode();
                
                // clear all previous lines on the screen
                layer.find('.guid-line').forEach((l) => l.destroy());

                // find possible snapping lines
                var lineGuideStops = me.getLineGuideStops(target);
                // find snapping points of current object
                var itemBounds = me.getObjectSnappingEdges(target);

                // now find where can we snap current object
                var guides = me.getGuides(lineGuideStops, itemBounds);

                // do nothing of no snapping
                if (!guides.length) {
                    return;
                }

                me.drawGuides(guides);

                var absPos = target.absolutePosition();
                // now force object position
                guides.forEach((lg) => {
                    switch (lg.snap) {
                        case 'start': {
                            switch (lg.orientation) {
                                case 'V': {
                                    absPos.x = lg.lineGuide + lg.offset;
                                    break;
                                }
                                case 'H': {
                                    absPos.y = lg.lineGuide + lg.offset;
                                    break;
                                }
                            }
                            break;
                        }
                        case 'center': {
                            switch (lg.orientation) {
                                case 'V': {
                                    absPos.x = lg.lineGuide + lg.offset;
                                    break;
                                }
                                case 'H': {
                                    absPos.y = lg.lineGuide + lg.offset;
                                    break;
                                }
                            }
                            break;
                        }
                        case 'end': {
                            switch (lg.orientation) {
                                case 'V': {
                                    absPos.x = lg.lineGuide + lg.offset;
                                    break;
                                }
                                case 'H': {
                                    absPos.y = lg.lineGuide + lg.offset;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                });
                target.absolutePosition(absPos);
            }

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