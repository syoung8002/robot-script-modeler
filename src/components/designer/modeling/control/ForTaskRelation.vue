<template>
    <div>
        <v-shape 
                :config="{
                    name: config.name,
                    points: config.points,
                    sceneFunc: (context, shape) => {
                        const RADIUS = 20;
                        const width = config.points[1].x - config.points[0].x;
                        const height = config.points[1].y - config.points[0].y;
                        const yDir = Math.sign(height);
                        const xDir = Math.sign(width);
                        const radius = Math.min(
                            RADIUS,
                            Math.abs(height / 2),
                            Math.abs(width / 2)
                        );
                        const yDis = yDir > 0 ? config.points[1].y - 100 : config.points[0].y - 100

                        context.beginPath();
                        context.moveTo(config.points[0].x, config.points[0].y);
                        context.lineTo(config.points[0].x, yDis);
                        context.lineTo(config.points[1].x, yDis);
                        context.lineTo(config.points[1].x, config.points[1].y);
                        context.fillStrokeShape(shape);
                    },
                    stroke: config.stroke,
                    strokeWidth: config.strokeWidth,
                }"
        ></v-shape>
        <v-shape
                :config="{
                    name: 'relation-arrow',
                    points: config.points,
                    sceneFunc: (context, shape) => {
                        const width = config.points[1].x - config.points[0].x;
                        const height = config.points[1].y - config.points[0].y;

                        context.beginPath();
                        context.moveTo(config.points[1].x, config.points[1].y);
                        context.lineTo(config.points[1].x - 4, config.points[1].y - 10);
                        context.quadraticCurveTo(
                            config.points[1].x - 4, 
                            config.points[1].y - 10, 
                            config.points[1].x + 4, 
                            config.points[1].y - 10
                        );
                        context.closePath();

                        context.fillStrokeShape(shape);
                    },
                    fill: config.stroke,
                    stroke: config.stroke,
                }"
        ></v-shape>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from "vue-property-decorator"

    @Component
    export default class ForTaskRelation extends Vue {
        @Prop() config!: { type: object }
    }
</script>