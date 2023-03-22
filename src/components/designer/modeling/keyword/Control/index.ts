const Control = {
    install (Vue: any, opts = {}) {
        const requireComponent = require.context('./', false, /\.vue$/);
        const controlList: string[] = [];
        requireComponent.keys().forEach(fileName => {
            const componentConfig = requireComponent(fileName);
            const componentName = fileName.replace(/^\.\/(.*)\.\w+$/, '$1');
            Vue.component(componentName, componentConfig.default || componentConfig);
            if(!componentName.includes('Panel')) {
                const tmp: string = componentName.replace(/(?<!^)(?=[A-Z])/g, ' ');
                controlList.push(tmp)
                Vue.prototype.$controlList = controlList
            }
        });
}}

export default Control