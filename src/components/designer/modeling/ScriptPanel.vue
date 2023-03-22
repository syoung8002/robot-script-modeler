<template>
    <v-navigation-drawer
            absolute
            permanent
            right
            style="width: 600px;"
    >
            <v-card outlined>
                <v-card-title>
                    Robot Script
                </v-card-title>
                <v-card-text>
                    <span v-for="(line, index) in scriptTextLines" :key="index">
                        {{ line }}
                        <br />
                    </span>
                    <!-- <MonacoEditor
                            width="600"
                            height="600"
                            theme="vs-dark"
                            language="plaintext"
                            v-model="scriptText"
                            :options="options"
                            @change="onChange"
                    ></MonacoEditor> -->
                </v-card-text>
            </v-card>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"
    // import MonacoEditor from 'monaco-editor-vue';
    import { Robot, SeqTask, Task, IfTask, ForTask, Keyword, CallKeyword } from "@/types/Task";

    // @Component({
    //     components: {
    //         MonacoEditor,
    //     }
    // })

    @Component
    export default class ScriptPanel extends Vue {
        @Prop() public elements!: any[];
        @Prop() public taskName!: string;

        public scriptText: string = ''
        public idGlobal: number = 1

        get scriptTextLines() {
            return this.scriptText.split("\n");
        }

        robot: Task = new Robot(1, this.taskName, [])

        mounted () {
            this.generateScript()
        }

        onChange(value: any) {
            // console.log(value)
        }
        generateScript() {
            let tasks: any[] = this.elements.filter((el: any) => 
                el.type.includes('Keyword') || (el.type.includes('Gateway') && !el.endGateway))
            
            let gateways = this.elements.find((el: any) => el.type.includes('Gateway'))
            if (gateways) {
                if (gateways.tasks && gateways.tasks.length > 0) {
                    gateways.tasks.forEach((taskId: number) => {
                        tasks = tasks.filter((task: any) => taskId != task.id)
                    })
                }
            }

            tasks = tasks.sort((a: any, b: any) => {
                if(a.x > b.x) {
                    return a.x - b.x
                } else {
                    return a.y - b.y
                }
            })

            tasks.forEach((el: any) => {
                if (el.type.includes('Keyword')) {
                    this.robot.child.push(new Task(this.idGlobal++, el.name))
                }
                if (el.type.includes('Gateway')) {
                    if (el.tasks && el.tasks.length > 0) {
                        let forInTasks: any[] = []
                        el.tasks.forEach((taskId: number) => {
                            const task = this.elements.find((el: any) => el.id == taskId)
                            if(!task) return
                            forInTasks.push(new Task(this.idGlobal++, task.name))
                        })
                        this.robot.child.push(new ForTask(this.idGlobal++, "for", forInTasks))
                    } else {
                        this.robot.child.push(new ForTask(this.idGlobal++, "for", []))
                    }
                }
            })

            this.scriptText = this.robot.toRobot(0)

        }

        @Watch("robot", {immediate: true, deep: true})
        log() {
            console.log(this.robot.toRobot(0))
        }
    }
</script>