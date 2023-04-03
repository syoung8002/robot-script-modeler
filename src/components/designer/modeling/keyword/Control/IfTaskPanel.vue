<template>
    <div>
        <v-card v-for="(condition, index) in value.conditions" :key="index"
                outlined
        >
            <v-card-subtitle v-if="condition.type != 'Else'">
                <div v-if="condition.type != 'Else'">
                    {{ condition.type }} Condition
                </div>
            </v-card-subtitle>
            <v-card-text v-if="condition.type != 'Else'">
                <v-row>
                    <v-col :cols="isOperator ? 4 : 6">
                        <v-select
                                v-model="condition.variable"
                        ></v-select>
                    </v-col>
                    <v-col v-if="condition.type != 'Else' && !isOperator"
                            cols="1"
                    >
                        <v-btn @click="addOperator(index)"
                                outlined
                        >
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col v-if="isOperator"
                            cols="2"
                    >
                        <v-select
                                v-model="condition.operator"
                                :items="operatorList"
                        ></v-select>
                    </v-col>
                    <v-col v-if="isOperator"
                            cols="4"
                    >
                        <v-select
                                v-model="condition.compareVariable"
                        ></v-select>
                    </v-col>
                    <v-col v-if="isOperator"
                            cols="1"
                    >
                        <v-btn @click="deleteOperator(index)"
                                icon
                        >
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
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

    export default class IfTaskPanel extends Mixins(ControlPanel) {
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

        @Watch("value.conditions", {immediate: true, deep: true})
        updateConditions(newVal: any) {
            // console.log(newVal)
        }

        mounted() {
        }

        addOperator(index: number) {
            this.isOperator = true
            this.value.conditions[index]['operator'] = '=='
            this.value.conditions[index]['compareVariable'] = ''
            
        }
        deleteOperator(index: number) {
            this.isOperator = false
            delete this.value.conditions[index].operator
            delete this.value.conditions[index].compareVariable
        }

    }
</script>