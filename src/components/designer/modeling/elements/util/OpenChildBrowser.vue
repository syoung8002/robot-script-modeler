<template>
    <div>
        <v-btn 
                @click="getXpath"
                outlined
                block
        >
            Locator Button
        </v-btn>
        <!-- <v-autocomplete
                :items="records"
                item-disabled="disabled"
                persistent-hint
                outlined
                dense
                required
        ></v-autocomplete> -->
    </div>
</template>


<script lang="ts">
    import { Vue, Component, Prop, Mixins } from "vue-property-decorator";
    import { remote, ipcRenderer } from "electron";

    @Component
    export default class OpenChildBrowser extends Vue {

        @Prop() public records!: any[]
        public listener: any

        messageProcessing(msg: any, arg: any, domPickerWindow: any) {
            const me = this
            if(arg.type == 'close') {
                // me.listener = null
                domPickerWindow.destroy()
                // ipcRenderer.removeListener('fromMain', me.messageProcessing)
                ipcRenderer.removeAllListeners('fromMain')
                this.$emit('update:records',this.records)
                this.$emit('closeLocator')
            } else {
                console.log(msg,arg);
                if (arg.id || arg.class) {
                    this.records.push(arg)
                }
            }   
        }

        getXpath() {
            let me = this
            let domPickerWindow = new remote.BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                }
            })
    
            domPickerWindow.setIgnoreMouseEvents(true)
            domPickerWindow.loadURL("https://google.com")
            domPickerWindow.webContents.openDevTools()
            // const webFrame = require('electron').webFrame
            domPickerWindow.webContents.on('did-frame-finish-load', () => {
                // domPickerWindow.webContents.on('did-interact-with-keyboard', (event,result) => {
                // // console.log('Clicked at position:', x, y, 'with button:', button)
                // // Do whatever you want to do when the window is clicked
                // })
                let iframe = domPickerWindow.webContents
                this.listener = ipcRenderer.on('fromMain', (msg, arg) => {
                    me.messageProcessing(msg,arg,domPickerWindow)
                })
                domPickerWindow.setIgnoreMouseEvents(false)
                iframe.executeJavaScript(`
                    console.log("init")
                    ElementPicker = require('html-element-picker')
                    const options = {
                            container: document.body,
                            selectors: "*",
                            background: "rgba(153, 235, 255, 0.5)",
                            borderWidth: 5,
                            transition: "all 150ms ease",
                            ignoreElements: [document.body],
                            action: {
                                trigger: "click",
                                callback: (function (target) {
                                    const obj = {
                                        type: 'msg',
                                        class: target.getAttribute('class'),
                                        ref: target.getAttribute('ref'),
                                        id: target.getAttribute('id')
                                    }
                                    require('electron').ipcRenderer.send('toMain', obj);
                                })
                            }
                        }
                    new ElementPicker(options);
                    document.querySelectorAll('[role="button"]').forEach(function (el){
                        var clonedElement = el.cloneNode(true);
                        el.parentNode.replaceChild(clonedElement, el);
                    });
                    window.addEventListener("keydown",(event) => {
                        if (event.defaultPrevented) {
                            return; // Should do nothing if the default action has been cancelled
                        } else if (event.keyCode == 27) {
                            // Handle the event with KeyboardEvent.keyCode
                            const obj = {
                                type: 'close'
                            }
                            require('electron').ipcRenderer.send('toMain', obj);
                        }
                    }, true);
                `)
                
            })
        }
    }
</script>