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
                    <!-- <span v-for="(line, index) in scriptTextLines" :key="index">
                        {{ line }}
                        <br />
                    </span> -->
                    <pre class="scirpt-text">{{ scriptText }}</pre>
                </v-card-text>
            </v-card>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator"

    @Component
    export default class ScriptPanel extends Vue {
        @Prop() public robot!: any;

        public scriptText: string = ''

        get scriptTextLines() {
            return this.scriptText.split("\n");
        }

        mounted () {
            this.scriptText = this.robot.toRobot(0)
            console.log(this.scriptText)
        }
    }
</script>

<style scoped>
    .scirpt-text {
        font-family: Roboto,sans-serif;
    }
</style>