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
                    {{ scriptText }}
                    <div></div>
                </v-card-text>
            </v-card>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"

    @Component
    export default class ScriptPanel extends Vue {
        @Prop() public robot!: any;

        public scriptText: string = ''

        mounted () {
            this.scriptText = this.robot.toRobot(0)
            console.log(this.scriptText)
        }
    }
</script>