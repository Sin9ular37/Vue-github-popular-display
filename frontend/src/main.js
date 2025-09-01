import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles.css'
import lazyLoad from './directives/lazyLoad'

const app = createApp(App)
app.use(ElementPlus)
app.directive('lazy', lazyLoad)
app.mount('#app')
