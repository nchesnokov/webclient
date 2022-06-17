<template>
	<gantt-elastic :tasks="tasks" :options="options"></gantt-elastic>
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

let tasks = [
  {
    id: 1,
    label: "Make some noise",
    user:
      '<a href="https://www.google.com/search?q=John+Doe" target="_blank" style="color:#0077c0;">John Doe</a>',
    start: getDate(-24 * 5),
    duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: "project"
    //collapsed: true,
  },
  {
    id: 2,
    label: "With great power comes great responsibility",
    user:
      '<a href="https://www.google.com/search?q=Peter+Parker" target="_blank" style="color:#0077c0;">Peter Parker</a>',
    parentId: 1,
    start: getDate(-24 * 4),
    duration: 4 * 24 * 60 * 60 * 1000,
    percent: 50,
    type: "milestone",
    collapsed: true,
    style: {
      base: {
        fill: "#1EBC61",
        stroke: "#0EAC51"
      }
    }
  },
  {
    id: 3,
    label: "Courage is being scared to death, but saddling up anyway.",
    user:
      '<a href="https://www.google.com/search?q=John+Wayne" target="_blank" style="color:#0077c0;">John Wayne</a>',
    parentId: 2,
    start: getDate(-24 * 3),
    duration: 2 * 24 * 60 * 60 * 1000,
    percent: 100,
    type: "task"
  },
  {
    id: 4,
    label: "Put that toy AWAY!",
    user:
      '<a href="https://www.google.com/search?q=Clark+Kent" target="_blank" style="color:#0077c0;">Clark Kent</a>',
    start: getDate(-24 * 2),
    duration: 2 * 24 * 60 * 60 * 1000,
    percent: 50,
    type: "task",
    dependentOn: [3]
  },
  {
    id: 5,
    label:
      "One billion, gajillion, fafillion... shabadylu...mil...shabady......uh, Yen.",
    user:
      '<a href="https://www.google.com/search?q=Austin+Powers" target="_blank" style="color:#0077c0;">Austin Powers</a>',
    parentId: 4,
    start: getDate(0),
    duration: 2 * 24 * 60 * 60 * 1000,
    percent: 10,
    type: "milestone",
    style: {
      base: {
        fill: "#0287D0",
        stroke: "#0077C0"
      }
    }
  },
  {
    id: 6,
    label: "Butch Mario and the Luigi Kid",
    user:
      '<a href="https://www.google.com/search?q=Mario+Bros" target="_blank" style="color:#0077c0;">Mario Bros</a>',
    parentId: 5,
    start: getDate(24),
    duration: 1 * 24 * 60 * 60 * 1000,
    percent: 50,
    type: "task",
    collapsed: true,
    style: {
      base: {
        fill: "#8E44AD",
        stroke: "#7E349D"
      }
    }
  },
  {
    id: 7,
    label: "Devon, the old man wanted me, it was his dying request",
    user:
      '<a href="https://www.google.com/search?q=Knight+Rider" target="_blank" style="color:#0077c0;">Knight Rider</a>',
    parentId: 2,
    dependentOn: [6],
    start: getDate(24 * 2),
    duration: 4 * 60 * 60 * 1000,
    percent: 20,
    type: "task",
    collapsed: true
  },
  {
    id: 8,
    label: "Hey, Baby! Anybody ever tell you I have beautiful eyes?",
    user:
      '<a href="https://www.google.com/search?q=Johhny+Bravo" target="_blank" style="color:#0077c0;">Johhny Bravo</a>',
    parentId: 7,
    dependentOn: [7],
    start: getDate(24 * 3),
    duration: 1 * 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  },
  {
    id: 9,
    label:
      "This better be important, woman. You are interrupting my very delicate calculations.",
    user:
      '<a href="https://www.google.com/search?q=Dexter\'s+Laboratory" target="_blank" style="color:#0077c0;">Dexter\'s Laboratory</a>',
    parentId: 8,
    dependentOn: [8, 7],
    start: getDate(24 * 4),
    duration: 4 * 60 * 60 * 1000,
    percent: 20,
    type: "task",
    style: {
      base: {
        fill: "#8E44AD",
        stroke: "#7E349D"
      }
    }
  },
  {
    id: 10,
    label: "current task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 5),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  },
  {
    id: 11,
    label: "test task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 6),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  },
  {
    id: 12,
    label: "test task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 7),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task",
    parentId: 11
  },
  {
    id: 13,
    label: "test task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 8),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  },
  {
    id: 14,
    label: "test task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 9),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  },
  {
    id: 15,
    label: "test task",
    user:
      '<a href="https://www.google.com/search?q=Johnattan+Owens" target="_blank" style="color:#0077c0;">Johnattan Owens</a>',
    start: getDate(24 * 16),
    duration: 24 * 60 * 60 * 1000,
    percent: 0,
    type: "task"
  }
];

import { send } from '../mixins/nf.js'

export default {
  name: 'gsrp5-gantt-view',
  props: ['metas','model'],
  components: {
    GanttElastic,
    GanttHeader
  },
  data() {
    return {
      fields:[],
      meta:{},
      views:{},
      view:null,
      name:null,
      actions: {},      
      tasks,
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
      dynamicStyle: {},
      lastId: 16
      };
  },
   methods:{
		_buildTasks: function(rows){
		let val = {};
		for(let i = 0; i < rows.length;i++){
			val = {'id':rows[i].id,'label':rows[i][this.meta.names.rec_name],'start':dayjs(rows[i][this.meta.names.start_date]).valueOf(),'end':dayjs(rows[i][this.meta.names.end_date]).valueOf(),'progress':rows[i][this.meta.names.progress],'type':rows[i][this.meta.names.project_type]};
			if (rows[i][this.meta.names.parent_id].id != null) val.parentId = rows[i][this.meta.names.parent_id].id;
			for(let k in rows[i]) 
				if (k == 'id') continue; 
				else {
					if ( ['many2one','related'].indexOf(this.meta.columns[k].type) >=0 ) val[k] = rows[i][k].name;
					else val[k] = rows[i][k];
					} 
			this.tasks.push(val);	
			val = {};
			}
		},
		onGantt: function(rows){
			if (rows.length > 0) {
				this.tasks.splice(0,this.tasks.length);
				this._buildTasks(rows);
				console.log('rows-gantt:',this.tasks);
				}
			},
	},
    mixins: [
    {
		methods:{
			send:send
			}
	}
	],
	created: function(){
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		},
	mounted: function(){		
		this.meta = this.metas[this.model].meta;
		this.views = this.metas[this.model].views;
		this.view = this.views.gantt;
		this.name = this.meta.description;
		this.actions = this.meta.actions;
		this.fields = Object.keys(this.view.columns);
		this.options.taskList.columns.splice(0,this.options.taskList.columns.length);
		let columns = [ {id: 1, label: 'ID', value: 'id', width: 120 }],i = 1;
		for(let key in this.view.columns){
			i++;
			columns.push({id:i,label:this.meta.columns[key].label,value:key, width: 80}); 
		}
			this.$set(this.options.taskList,'columns',columns);
			this.send('onGantt',['models',this.model,'select',{'fields':this.fields,'context':{}}]);		

		},
	beforeDestroy: function(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		},


  };

</script>
