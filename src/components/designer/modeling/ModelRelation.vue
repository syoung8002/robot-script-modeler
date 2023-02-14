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

                        context.beginPath();
                        context.moveTo(config.points[0].x, config.points[0].y);
                        context.lineTo(config.points[0].x + width / 2 - RADIUS * xDir, config.points[0].y);
                        context.quadraticCurveTo(
                            config.points[0].x + width / 2,
                            config.points[0].y,
                            config.points[0].x + width / 2,
                            config.points[0].y + yDir * radius
                        );
                        context.lineTo(config.points[0].x + width / 2, config.points[1].y - yDir * radius);
                        context.quadraticCurveTo(
                            config.points[0].x + width / 2,
                            config.points[1].y,
                            config.points[0].x + width / 2 + radius * xDir,
                            config.points[1].y
                        );
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
                        const yDir = Math.sign(height);
                        const xDir = Math.sign(width);

                        context.beginPath();
                        context.moveTo(config.points[1].x, config.points[1].y);
                        context.lineTo(config.points[1].x - (14 * xDir), config.points[1].y - 6);
                        context.quadraticCurveTo(
                            config.points[1].x - (14 * xDir), 
                            config.points[1].y + 3, 
                            config.points[1].x - (14 * xDir), 
                            config.points[1].y + 6
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

<script>
    // import ModelElement from './ModelElement'

    export default {
        // mixins: [ModelElement],
        name: 'model-relation',
        props: {
            config: Object,
        },
        data() {
            return {
            }
        },
        created() {
        },
        methods: {
        }
    }
</script>