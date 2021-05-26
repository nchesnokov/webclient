import ElementPlus from 'element-plus'
import '../element-variables.scss'
import locale from 'element-plus/lib/locale/lang/ru'
import 'dayjs/locale/ru'

export default (app) => {
  app.use(ElementPlus, {locale})
}
