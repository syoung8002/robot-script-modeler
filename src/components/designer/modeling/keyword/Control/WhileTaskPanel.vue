<template>
    <div>
        <v-card outlined>
            <v-card-subtitle>
                While Condition
            </v-card-subtitle>
            <v-card-text>
                <v-row>
                    <v-col :cols="isOperator ? 4 : 6">
                        <v-select
                                v-model="value.condition.variable"
                        ></v-select>
                    </v-col>
                    <v-col v-if="!isOperator" cols="1">
                        <v-btn @click="addOperator"
                                outlined
                        >
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col v-else cols="2">
                        <v-select
                                v-model="value.condition.operator"
                                :items="operatorList"
                        ></v-select>
                    </v-col>
                    <v-col v-if="isOperator" cols="4">
                        <v-select
                                v-model="value.condition.compareVariable"
                        ></v-select>
                    </v-col>
                    <v-col v-if="isOperator" cols="1">
                        <v-btn @click="deleteOperator"
                                icon
                        >
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-card outlined>
            <v-card-subtitle>
                Limit
            </v-card-subtitle>
            <v-card-text>
                <v-text-field
                        v-model="value.limit"
                ></v-text-field>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
    import { Component, Mixins, Prop, Watch } from "vue-property-decorator"
    import ControlPanel from "@/components/designer/modeling/panels/ControlPanel.vue";

    @Component({
        components: {
            ControlPanel,
        }
    })

    export default class WhileTaskPanel extends Mixins(ControlPanel) {
        @Prop() value: any

        public isOperator: boolean = false
        public operatorList: any[] = [
            '==',
            '!=',
            '>',
            '>=',
            '<',
            '<=',
            'is',
            'is not',
        ]

        @Watch("value.condition", {immediate: true, deep: true})
        updateConditions(newVal: any) {
            // console.log(newVal)
        }

        mounted() {
            if(this.value.condition.operator) {
                this.isOperator = true
            }
        }

        addOperator() {
            this.isOperator = true
            this.value.condition.operator = '=='
            this.value.condition.compareVariable = ''
        }

        deleteOperator() {
            this.isOperator = false
            delete this.value.condition.operator
            delete this.value.condition.compareVariable
        }
    }
</script>