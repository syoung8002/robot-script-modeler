<template>
    <v-shape 
            :config="{
                points: points,
                sceneFunc: (context, shape) => {
                    const RADIUS = 20;
                    const width = points[1].x - points[0].x;
                    const height = points[1].y - points[0].y;
                    const dir = Math.sign(height);
                    const radius = Math.min(RADIUS, Math.abs(height / 2), Math.abs(width / 2));

                    context.beginPath();
                    context.moveTo(points[0].x, points[0].y);
                    context.lineTo(points[0].x + width / 2 - RADIUS, points[0].y);
                    context.quadraticCurveTo(
                        points[0].x + width / 2,
                        points[0].y,
                        points[0].x + width / 2,
                        points[0].y + dir * radius
                    );
                    context.lineTo(points[0].x + width / 2, points[1].y - dir * radius);
                    context.quadraticCurveTo(
                        points[0].x + width / 2,
                        points[1].y,
                        points[0].x + width / 2 + radius,
                        points[1].y
                    );
                    context.lineTo(points[1].x, points[1].y);
                    context.fillStrokeShape(shape);
                },
                stroke: 'black',
            }"
    ></v-shape>
</template>

<script>
    import ModelElement from './ModelElement'

    export default {
        mixins: [ModelElement],
        name: 'model-relation',
        props: {
            points: Array,
        },
        data() {
            return {
            }
        },
        created() {
            const me = this
        },
        mounted() {},
        methods: {
        }
    }
</script>