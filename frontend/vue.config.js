const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Plataforma Educativa',
    }
  },
  devServer: {
    port: 8080,
    host: 'localhost',
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; frame-src *; connect-src *; font-src *; img-src * data: blob:;"
    }
  }
})
