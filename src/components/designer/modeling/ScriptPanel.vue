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
<<<<<<< HEAD
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
=======
                    {{ scriptText }}
>>>>>>> 7599d4f98450be715b6c312f09ea53134a30d290
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