const Browser = {
    install (Vue: any, opts = {}) {
        const requireComponent = require.context('./', false, /\.vue$/);
        const browserList: string[] = [];
        requireComponent.keys().forEach(fileName => {
            const componentConfig = requireComponent(fileName);
            const componentName = fileName.replace(/^\.\/(.*)\.\w+$/, '$1');
            Vue.component(componentName, componentConfig.default || componentConfig);
            if(!componentName.includes('Panel')) {
                const tmp: string = componentName.replace(/(?<!^)(?=[A-Z])/g, ' ');
                browserList.push(tmp)
                Vue.prototype.$browserList = browserList
            }
        });
}}

export default Browser