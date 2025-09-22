<template>
	<gantt-elastic :tasks="tasks" :options="options">
	</gantt-elastic>
</template>

<script>

import GanttElastic from "gantt-elastic";
import GanttHeader from "gantt-elastic-header";
import dayjs from "dayjs";
// just helper to get current dates
function getDate(hours) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const timeStamp = new Date(
    currentYear,
    currentMonth,
    currentDay,
    0,
    0,
    0
  ).getTime();
  return new Date(timeStamp + hours * 60 * 60 * 1000).getTime();
}

export default {
  name: 'gsrp5-o2mgantt-view',
  props: ['metas','model','items','rel','mode','role','o2mfield','root','guid','container','parent'],
  components: {
    ganttElastic:GanttElastic
  },
  data() {
    return {
      fields:[],
      meta:{},
      views:{},
      view:{},
      name:'',
      actions:{},
      tasks: [],

	  options: {
		  taskMapping: {
		    progress: "percent"
		  },
		  maxRows: 100,
		  maxHeight: 500,
		  title: {
		    label: "Your project title as html (link or whatever...)",
		    html: false
		  },
		  row: {
		    height: 24
		  },
		  calendar: {
		    hour: {
		      display: true
		    }
		  },
		  chart: {
		    progress: {
		      bar: false
		    },
		    expander: {
		      display: true
		    }
		  },
		  taskList: {
		    expander: {
		      straight: false
		    },
		    columns: [
		      {
		        id: 1,
		        label: "ID",
		        value: "id",
		        width: 40
		      },
		      {
		        id: 2,
		        label: "Description",
		        value: "label",
		        width: 200,
		        expander: true,
		        html: true,
		        events: {
		          click({ data, column }) {
		            alert("description clicked!\n" + data.label);
		          }
		        }
		      },
		      {
		        id: 3,
		        label: "Assigned to",
		        value: "user",
		        width: 130,
		        html: true
		      },
		      {
		        id: 3,
		        label: "Start",
		        value: task => dayjs(task.start).format("YYYY-MM-DD"),
		        width: 78
		      },
		      {
		        id: 4,
		        label: "Type",
		        value: "type",
		        width: 68
		      },
		      {
		        id: 5,
		        label: "%",
		        value: "progress",
		        width: 35,
		        style: {
		          "task-list-header-label": {
		            "text-align": "center",
		            width: "100%"
		          },
		          "task-list-item-value-container": {
		            "text-align": "center",
		            width: "100%"
		          }
		        }
		      }
		    ]
		  },
		  locale: {
		    name: "en",
		    Now: "Now",
		    "X-Scale": "Zoom-X",
		    "Y-Scale": "Zoom-Y",
		    "Task list width": "Task list",
		    "Before/After": "Expand",
		    "Display task list": "Task list"
		  }
		},

    }
  },
   methods:{
		_buildTasks: function(rows){
		let val = {};
		for(let i = 0; i < rows.length;i++){
			val = {'id':rows[i].__data__.id,'label':rows[i].__data__[this.meta.names.rec_name],'start':dayjs(rows[i].__data__[this.meta.names.start_date]).format('YYYY-MM-DDTHH:mm:ssZ') .valueOf(),'end':dayjs(rows[i].__data__[this.meta.names.end_date]).format('YYYY-MM-DDTHH:mm:ssZ') .valueOf(),'progress':rows[i].__data__[this.meta.names.progress],'type':rows[i].__data__[this.meta.names.project_type]};
			if (rows[i].__data__[this.meta.names.parent_id].id != null) val.parentId = rows[i].__data__[this.meta.names.parent_id].id;
			for(let k in rows[i].__data__) 
				if (k == 'id') continue; 
				else {
					if ( ['many2one','related'].indexOf(this.meta.columns[k].type) >=0 ) val[k] = rows[i].__data__[k].name;
					else val[k] = rows[i][k];
					} 
			this.tasks.push(val);	
			val = {};
			}
		}
	},
	created: function(){
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		this.meta = this.metas[this.model].meta;
		this.views = this.metas[this.model].views;
		this.view = this.views.gantt;
		this.name = this.meta.description;
		this.fields = Object.keys(this.view.columns);
		},
	mounted: function(){
		let i = 1;
		this.options.taskList.columns.splice(0,this.options.taskList.columns.length);
		this.options.taskList.columns.push({id: 1, label: 'ID', value: 'id', width: 120 });
		for(let key in this.view.columns){
			i++;
			this.options.taskList.columns.push({id:i,label:this.meta.columns[key].label,value:key, width: 80}); 
			}
			this.tasks.splice(0,this.tasks.length);
			if (this.items.length > 0) {
				this._buildTasks(this.items);
				}
		},
	beforeDestroy: function(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		}
  };

</script>
