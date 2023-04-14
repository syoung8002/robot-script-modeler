<template>
    <div>
        <v-card>
            <v-card-title>
                Variables
            </v-card-title>
            <v-card-text>
                <v-treeview
                        :items="globalVariables"
                        item-key="name"
                        item-children="list"
                        open-on-click
                ></v-treeview>
                <v-treeview
                        :items="getVariables"
                        item-key="name"
                        item-children="list"
                        open-on-click
                >
                    <template v-slot:append="{ item, index }">
                        <div v-if="!item.list">
                            <v-btn x-small icon @click="modifyVariable(item, index)">
                                <v-icon>
                                    {{ 'mdi-pencil-outline' }}
                                </v-icon>
                            </v-btn>
                            <v-btn x-small icon @click="deleteVariable(item)">
                                <v-icon>
                                    {{ 'mdi-delete-outline' }}
                                </v-icon>
                            </v-btn>
                        </div>
                    </template>
                </v-treeview>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" outlined
                        @click="openVariableForm"
                >
                    Add Variable
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model="variableForm" max-width="600">
            <v-card>
                <v-card-title>{{ isNewVar ? 'New' : 'Edit' }} Suite Variable</v-card-title>
                <v-card-text>
                    <v-text-field
                            label="Variable Name"
                            v-model="newVariable.name"
                    ></v-text-field>
                    <v-text-field
                            label="Default Value"
                            v-model="newVariable.defaultValue"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" outlined
                            @click="variableForm = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn color="primary" outlined
                            @click="updateVariable(newVariable, editVarIndex)"
                    >
                        {{ isNewVar ? 'Add' : 'Edit' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"
    import { Variable } from "@/types/Task";
    
    @Component
    export default class VariablesDialog extends Vue {
        @Prop() variables!: any[]

        public globalVariables: any[] = [
            {
                name: 'Global',
                list: [
                    {
                        name: 'CURDIR'
                    },
                    {
                        name: 'EXECDIR'
                    },
                    {
                        name: 'TEMPDIR'
                    },
                    {
                        name: 'TRUE'
                    },
                    {
                        name: 'FALSE'
                    },
                    {
                        name: 'NONE'
                    },
                    {
                        name: 'NULL'
                    },
                    {
                        name: 'SPACE'
                    },
                    {
                        name: 'EMPTY'
                    },
                    {
                        name: 'SUITE NAME'
                    },
                    {
                        name: 'SUITE SOURCE'
                    },
                    {
                        name: 'SUITE DOCUMENTATION'
                    },
                    {
                        name: 'SUITE METADATA'
                    },
                    {
                        name: 'SUITE STATUS'
                    },
                    {
                        name: 'SUITE MESSAGE'
                    },
                    {
                        name: 'KEYWORD STATUS'
                    },
                    {
                        name: 'KEYWORD MESSAGE'
                    },
                    {
                        name: 'LOG LEVEL'
                    },
                    {
                        name: 'LOG FILE'
                    },
                    {
                        name: 'OUTPUT DIR'
                    },
                    {
                        name: 'OUTPUT FILE'
                    },
                    {
                        name: 'ROBOT_ROOT'
                    },
                    {
                        name: 'ROBOT_ARTIFACTS'
                    },
                ]
            },
        ]
        public variableForm: boolean = false
        public newVariable: any = {
            name: '',
            type: '',
            value: '',
        }
        public isNewVar: boolean = true
        public editVarIndex: number = -1

        get getVariables() {
            var list = [
                {
                    name: 'Suite',
                    list: this.variables
                }
            ]
            return list
        }

        openVariableForm() {
            this.variableForm = true
        }

        updateVariable(variable: any, index: number) {
            if (this.isNewVar) {
                this.variables.push(new Variable(variable.name, variable.defaultValue))
            } else {
                if(index >= 0) {
                    this.variables[index] = variable
                }
            }            
            this.newVariable = {
                name: '',
                defaultValue: '',
            }
            this.variableForm = false
            this.isNewVar = true
        }

        modifyVariable(variable: any, index: number) {
            this.isNewVar = false
            this.editVarIndex = index
            this.newVariable = variable
            this.openVariableForm()
        }

        deleteVariable(variable: any) {
            var newVars = this.variables.filter((vars: any) => vars.name != variable.name)
            this.$emit('updateVariables', newVars)
        }
    }
</script>

<style>

</style>