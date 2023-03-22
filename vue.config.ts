const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
    devServer: {
        port: 8080,
    },
    transpileDependencies: [
      'vuetify',
    ],
    resolve: {
        extensions: [".js", ".ts"]
      },
    runtimeCompiler: true,
    chainWebpack: config => {
        config.plugin('monaco-editor').use(MonacoWebpackPlugin, 
            [
                {
                    // Languages are loaded on demand at runtime
                    languages: ['json', 'javascript', 'html', 'xml']
                }
            ]
        )
    },
}
