<template>
  <page-container>
    <div ref="ganttRef" style="height: 100%" />
  </page-container>
</template>
<script>
import { gantt } from 'dhtmlx-gantt' // 引入dhtmlx-gantt
import dayjs from 'dayjs'
export default {
  name: 'Gantt',
  props: {
    // 任务对象
    tasks: {
      type: Object,
      default: () => {
        return {
          data: [
            { id: 1, text: '张三', render:"split",parent: 0},
            { id: 2, text: '排班时间B',  start_date: '2022-03-17 01:00', end_date: '2022-03-17 02:00', parent: 1 },
            { id: 7, text: '排班时间B', start_date: '2022-03-18 03:00', end_date: '2022-03-18 04:00', parent: 1 },
            { id: 5, text: '排班时间x', start_date: '2022-03-18 08:00', end_date: '2022-03-18 09:00', parent: 1 },
            { id: 3, text: '排班时间Z', start_date: '2022-03-20 00:00', end_date: '2022-03-20 09:00', parent: 1 },
            // {id: 3, text: '排班时间A', start_date: '2022-03-17 04:00', end_date: '2022-03-17 10:00', parent: 1 },
        {id: 4, text: '李四', start_date: '2022-03-20 01:00', end_date: '2022-03-20 02:00', duration: 3 },
        ],
        }
      },
    },

        columns: {
            type: Array,
      default: () => {
        return [
        {align: 'center', name: 'text', label: '姓名', width: 180, tree: true },
        ]
      },
    },

        scaleUnit: {
            type: String,
        default: 'day', // “minute”, “hour”, “day”, “week”, “quarter”, “month”, “year”
    },
        dateScale: {
            type: String,
        default: '%Y-%m-%d',
    },
  },
        setup(props) {
    const router = useRouter()
        const ganttRef = ref()
    onMounted(() => {
            // 清空之前的配置
            gantt.clearAll()
      // 默认配置
      gantt.config.xml_date = '%Y-%m-%d %H:%i'
        gantt.i18n.setLocale('cn') // 设置中文
        gantt.config.readonly = true // 设置为只读
        // 显示列配置
        gantt.config.columns = props.columns
        gantt.config.autofit = true
        gantt.config.autoscroll = true
        gantt.config.autoscroll_speed = 100
        gantt.config.scale_unit = props.scaleUnit
        gantt.config.date_scale = props.dateScale
        gantt.config.open_tree_initially = true
        gantt.plugins({
            tooltip: true,
      })
        gantt.templates.tooltip_text = function(start, end, task) {
        return `<b>开始时间:</b> ${
            dayjs(start).format('HH:mm:ss')
        }<br /><b>结束时间:</b> ${dayjs(end).format('HH:mm:ss')}`
      }
        // 初始化甘特图
        gantt.init(ganttRef.value)
        // 渲染数据
        gantt.parse(props.tasks)
    })

        return {
            ganttRef,
            handleBack,
    }
  },

}
    </script>
    <style>
        @import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
    </style>
