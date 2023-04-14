<template>
    <div>
        <draggable 
                class="root'" 
                tag="ul" 
                :list="child" 
                group="task"
                style="padding: 0px !important;"
        >
            <li v-for="task in child" 
                    :key="task.id"
                    class="child-task"
            >
                <p>{{ task.name }}</p>
                <task-element 
                        :child="task.child"
                        :parent="task.name"
                ></task-element>
            </li>
        </draggable>
    </div>
</template>

<script lang="ts">
    import Draggable from "vuedraggable";
    import { Task } from "@/types/Task";
    import { Component, Prop, Vue } from "vue-property-decorator";

    @Component({
        components: {
            Draggable,
        }
    })
    export default class TaskElement extends Vue {
        @Prop({required: true}) readonly child!: Task[];
        @Prop() parent!: any;

        mounted() {
        }
    }
</script>

<style scoped>
    .root {
        list-style: none;
    }

    .task {
        list-style: none;
        max-width: 500px;
        outline: 1px solid;
    }

    .child-task {
        margin: auto 10px;
        list-style: none;
        background-color: lightgrey;
        outline: 1px dashed;
    }
  </style>
  