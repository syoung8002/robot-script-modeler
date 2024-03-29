<template>
    <v-navigation-drawer
            absolute
            permanent
            right
            style="width: 600px;"
    >
        <v-card flat>
            <v-card-title class="d-flex">
                <div class="mr-auto">
                    Run Task "{{ taskName }}"
                </div>
                <v-btn icon @click.native="closePanel()">
                    <v-icon color="grey lighten-1">mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>
            
            <v-card-text>
                <v-progress-linear
                        :active="isExecuting"
                        indeterminate
                        color="orange"
                        class="mb-3"
                ></v-progress-linear>

                <pre>{{ resultText }}</pre>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions v-if="!isExecuting">
                <v-list v-if="artifacts.length > 0" dense style="width: 100%">
                    <v-list-item link color="primary" @click="openArtifacts('')">
                        <v-list-item-icon>
                            <v-icon>mdi-folder-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Artifacts</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item v-for="file in artifacts"
                            :key="file.name"
                            @click="openArtifacts(file.path)"
                            link
                    >
                        <v-list-item-icon>
                            <v-icon>mdi-file-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ file.name }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-actions>
        </v-card>
    </v-navigation-drawer>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"
    const { shell } = require('electron').remote;

    @Component
    export default class RobotScriptPanel extends Vue {
        @Prop() public taskName!: string;
        @Prop() public resultText!: any;
        @Prop() public isExecuting!: boolean;

        public artifacts: any[] = []

        mounted () {
        }

        @Watch("isExecuting", {immediate: true, deep: true})
        endedExecute(val: boolean) {
            if(!val) {
                this.artifacts = []
                let tmpArray = this.resultText.split('\n')
                tmpArray.forEach((str: string) => {
                    if(str.trim().length > 0) {
                        if(str.includes("Output")) {
                            var path = str.split("Output:").pop()
                            this.artifacts.push({
                                name: "output.xml",
                                path: path?.trim()
                            })
                        } else if(str.includes("Log")) {
                            var path = str.split("Log:").pop()
                            this.artifacts.push({
                                name: "log.html",
                                path: path?.trim()
                            })
                        } else if(str.includes("Report")) {
                            var path = str.split("Report:").pop()
                            this.artifacts.push({
                                name: "report.html",
                                path: path?.trim()
                            })
                        }
                    }
                })
            }
        }

        closePanel() {
            this.$emit('close')
        }

        openArtifacts(path: string) {
            const FOLDER_PATH = path ? path : ''
            shell.openPath(FOLDER_PATH)
        }

    }
</script>

<style scoped>
    .scirpt-text {
        font-family: Roboto,sans-serif;
    }
</style>