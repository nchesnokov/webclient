import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//import path from 'path'
//import vueI18n from '@intlify/vite-plugin-vue-i18n'

const vueI18nPlugin = {
  name: 'vue-i18n',
  transform(code, id) {
    if (!/vue&type=i18n/.test(id)) {
      return
    }
    if (/\.ya?ml$/.test(id)) {
      code = JSON.stringify(require('js-yaml').load(code.trim()))
    }
    return `export default Comp => {
      Comp.i18n = ${code}
    }`
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  //server: {
     //proxy: {
     //'/views': {
        //target:'http://localhost:8100/',
        //changeOrigin: true
        //}
     //}
     //},
  plugins: [vue(),vueI18nPlugin]
  //,vueI18n({ include: path.resolve(__dirname, './src/locales/**')})
})
