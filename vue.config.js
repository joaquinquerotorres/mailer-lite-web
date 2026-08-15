const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: false,
  devServer: {
    hot: true,
    liveReload: false
  },
  configureWebpack: {
    watchOptions: {
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  }
})
