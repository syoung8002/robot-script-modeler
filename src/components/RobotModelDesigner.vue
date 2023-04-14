<template>
    <div>
        <v-app-bar
                elevation="0"
                app
                fixed
                style="left:0px; background-color:transparent; z-index:1;"
        >
            <v-toolbar-title></v-toolbar-title>

            <v-spacer></v-spacer>
            <v-text-field
                    v-model="taskName"
                    label="Task Name"
                    style="max-width: 300px; margin-top: 25px;"
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

        <v-navigation-drawer
                absolute
                permanent
        >
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title class="text-h6">Keywords</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list dense nav>
                <draggable
                        :list="elements"
                        :group="{ name: 'task', pull: 'clone', put: false }"
                        :clone="cloneTask"
                >
                    <v-list-item
                            v-for="item in elements"
                            :key="item.name"
                    >
                        <v-list-item-content>
                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </draggable>
            </v-list>
        </v-navigation-drawer>

        <v-main>
            <v-container>
                <v-sheet
                        class="mx-auto mb-5"
                        height="30"
                        width="500"
                        :rounded="'xl'"
                        color="blue"
                >Start</v-sheet>
                <draggable 
                        tag="ul" 
                        :list="robot.child"
                        @change="log"
                        group="task"
                        style="list-style: none; padding: 0px;"
                >
                    <li v-for="task in robot.child" 
                            :key="task.id"
                            class="task mx-auto mb-5"
                            @dblclick="openPanel(task)"
                            @contextmenu="openContextMenu"
                    >
                        <p>{{ task.name }}</p>
                        <task-element 
                                :child="task.child"
                                :parent="task.name"
                        ></task-element>
                    </li>
                </draggable>
                <v-sheet
                        class="mx-auto mt-5"
                        height="30"
                        width="500"
                        :rounded="'xl'"
                        color="blue"
                >End</v-sheet>
            </v-container>
        </v-main>

        <!-- <element-list
                @cloneElement="cloneTask"
        ></element-list> -->

        <!-- Variables Dialogs -->
        <v-dialog v-model="variableDialog" max-width="800">
            <variables-dialog
                    :variables="robot.variables"
                    @updateVariables="updateVariables"
            ></variables-dialog>
        </v-dialog>

        <!-- Robot Script Panel-->
        <ScriptPanel
                v-if="isOpenScript"
                :robot="robot"
                v-click-outside="closeScriptPanel"
        ></ScriptPanel>

        <!-- Context Menu-->
        <v-card v-if="isOpenMenu"
                max-width="300"
                :style="menuStyle"
                v-click-outside="closeContextMenu"
        >
            <v-list>
                <v-list-item>
                    <v-btn text>
                        Delete
                    </v-btn>
                </v-list-item>
            </v-list>
        </v-card>

        <!-- Property Panel-->
        <model-panel
                v-if="isOpenPanel"
                :value="panelValue"
                v-click-outside="closePanel"
        ></model-panel>
    </div>
</template>
  
<script lang="ts">
    import Draggable from "vuedraggable";
    import TaskElement from "@/components/infra/TaskElement.vue";
    import ElementList from "@/components/designer/modeling/ElementList.vue";
    import ModelPanel from "@/components/designer/modeling/panels/CommonPanel.vue";
    import ScriptPanel from "@/components/designer/modeling/ScriptPanel.vue";
    import VariablesDialog from "@/components/designer/modeling/VariablesDialog.vue";
    import {Robot, SeqTask, Task, IfTask, ForTask, WhileTask, Keyword} from "@/types/Task";
    
    import { Watch, Component, Vue } from "vue-property-decorator";
import draggable from "vuedraggable";
import { log } from "console";
  
    @Component({
        components: {
            Draggable,
            TaskElement,
            ElementList,
            ModelPanel,
            ScriptPanel,
            VariablesDialog,
        }
    })
    
    export default class RobotModelDesigner extends Vue {
        // Data
        taskName: string = "New Task"
        idGlobal: number = 50
        elements: any[] = [
            {name: "For", type: ForTask},
            {name: "If", type: IfTask},
            {name: "While", type: WhileTask},
            {name: "Task", type: Task},
            {name: "Keyword", type: Keyword},
        ]
        robot: Task = new Robot(1, this.taskName, "Task", [
            new ForTask(2, "For", "ForTask",
                [
                    new Keyword(4, "Click Button", "Keyword")
                ]
            ),
            new IfTask(5, 'If', "IfTask",[]),
            new Keyword(3, 'Click Element', "Keyword")
        ])
        isOpenPanel: boolean = false
        panelValue: any = null
        isOpenMenu: boolean = false
        menuStyle: any = {}
        isOpenScript: boolean = false
        variableDialog: boolean = false

        // Watch
        @Watch("robot.child", {immediate: true, deep: true})
        updateRobot(val: any) {
            if (val) {
                var keywords = this.robot.child.filter((obj: any) => obj.type == "Keyword")
            }
        }

        // Methods
        cloneTask(value: any) {
            console.log(value)
            return new (value.type)(this.idGlobal++, value.name, value.name)
            const item = this.elements.find((obj: any) => obj.name == value.type)
            if (item) {
                var newChild = new (item.type)(this.idGlobal++, value.name, value.type)
                console.log(newChild)
                return newChild
            }
        }

        log() {
            console.log(this.robot.toRobot(0))
        }

        openScriptPanel() {
            this.isOpenScript = true
        }
        closeScriptPanel() {
            this.isOpenScript = false
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
        
        openContextMenu(evt: any) {
            evt.preventDefault()
            this.menuStyle.left = evt.pageX + 'px'
            this.menuStyle.top = evt.pageY + 'px'
            this.isOpenMenu = true
        }
        closeContextMenu() {
            //
        }

        openPanel(value: any) {
            this.isOpenPanel = true
            this.panelValue = value
        }
        closePanel() {
            this.isOpenPanel = false
            this.panelValue = null
        }
    }
</script>

<style scoped>
    .container {
        text-align: center;
    }

    .task {
        list-style: none;
        max-width: 500px;
        outline: 1px solid;
    }

</style>
  