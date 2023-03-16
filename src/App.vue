<template>
    <v-app id="inspire">
        <router-view></router-view>
    </v-app>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import ScriptPanel from "./components/designer/modeling/ScriptPanel.vue"

    @Component({
        components: {
            ScriptPanel,
        }
    })

    export default class App extends Vue {
        taskName: string = 'Test';
        isOpenScript: boolean = false;

        elements: any[] = [];

        openScriptPanel() {
            this.isOpenScript = true
        }
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
