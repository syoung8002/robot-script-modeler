<template>
    <div>
        <v-card outlined>
            <v-card-text v-if="type=='FOR'">
                <p>Assign Variable</p>
                <v-text-field
                    v-model="variable"
                ></v-text-field>
                <p>Loop Variable</p>
                <v-text-field
                    v-model="variable"
                ></v-text-field>
            </v-card-text>
            
            <v-card-text v-if="type=='While'">
                <p>While Condition</p>
                <v-text-field
                    v-model="variable"
                ></v-text-field>
                <p>Limit</p>
                <v-text-field
                    v-model="variable"
                ></v-text-field>
            </v-card-text>
            
            <v-card-text v-if="type=='IF'">
                <p>If Condition</p>
                <v-text-field
                    v-model="variable"
                ></v-text-field>
            </v-card-text>

            <v-card-text v-if="type=='Try-Except'">
                <div>
                    Except
                    <v-btn icon>
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </div>
                <v-switch
                        inset
                        label="Else Branch"
                ></v-switch>
                <v-switch
                        inset
                        label="Finally Branch"
                ></v-switch>
            </v-card-text>

            <v-card-text v-if="type=='Return'">
                <p>Return Values</p>
            </v-card-text>

            <v-card-text v-if="type=='Break'">
            </v-card-text>

            <v-card-text v-if="type=='Continue'">
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"

    @Component
    export default class GatewayPanel extends Vue {
        @Prop() public type!: { type: string }
        
        variable: string = ''
    }
</script>