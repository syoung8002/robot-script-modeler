<template>
    <draggable 
            :list="tasks"
            group="task"
    >
        <v-sheet v-for="(task, idx) in tasks" 
                :key="idx"
                class="mx-auto"
                height="100"
                width="100"
                rounded
                color="primary"
        >
            {{ task.name }}
            <task-element
                    v-if="task.child"
                    style="margin-left: 100px;"
                    :tasks="task.child"
            ></task-element>
        </v-sheet>   
    </draggable>
</template>

<script lang="ts">
    import Draggable from "vuedraggable";
    import { Task } from "@/types/Task";
    import { Component, Prop,  Vue } from "vue-property-decorator";

    @Component({
        components: {
            Draggable
        }
    })
    export default class ControlElement extends Vue {
        @Prop({required: true}) readonly tasks!: Task[];

        removeAt(idx: number) {
            this.tasks.splice(idx, 1);
        }
    }
</script>

<style scoped>
</style>
  