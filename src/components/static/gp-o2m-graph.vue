<template>
  <v-flex xs2 sm2 md2 lg2 xl2>
    <v-select :items="enableCharts" v-model="chartType"/>
	  <GChart
	    :type="chartType"
	    :data="chartData"
	    :options="chartOptions"
	  />
  </v-flex>
</template>

<script>
import Vue from 'vue'

import VueGoogleCharts from 'vue-google-charts'
Vue.use(VueGoogleCharts)

export default {
  name: 'gsrp5-o2mgraph-view',
  props: ['metas','meta','model','views','rel','mode','items','o2mfield','parent','root','guid','container'],
  data: function(){
	  return {
		  chartSettings:{},
		  chartType: "ColumnChart",
		  chartData: null,
		  chartOptions: {},
		  f:[],
		  l:[],
		  enableCharts:[{'text':'Column Chart','value':'ColumnChart'},{'text':'Pie Chart','value':'PieChart'},{'text':'Bar Chart','value':'BarChart'},{'text':'Bubble Chart','value':'BubbleChart'},{'text':'Combo Chart','value':'ComboChart'},{'text':'Stepped Area Chart','value':'SteppedAreaChart'},{'text':'Table','value':'Table'},{'text':'Histogram','value':'Histogram'},{'text':'Line Chart','value':'LineChart'},{'text':'Area Chart','value':'AreaChart'}]
		  };
	  },
  mounted(){
	if (this.items.length > 0){
	  let d =[],r=[];
	  d.push(this.l);
	  for(let i = 0; i < this.items.length;i++) {
	    for(let k in this.items[i].__data__) {
		  if (k == 'id') continue;
		  if (this.f.indexOf(k) >= 0) r.push(this.items[i].__data__[k]);
		  }
	  d.push(r);
	  r = [];
  }
	  this.$set(this,'chartData',d);
	this.chartOptions = {
	  chart: {
		title: this.meta.description,
		//subtitle: 'Sales, Expenses, and Profit: 2014-2017',
	  }
	};
	
	}
  
  },
  created(){
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		this.view = this.views.graph;
		this.fields = Object.keys(this.view.columns);
		this.f.push(this.meta.names.date);
		this.l.push(this.meta.columns[this.meta.names.date].label);
		for(let i = 0; i < this.fields.length; i++) 
		if(['integer','float','double','real','numeric','decimal'].indexOf(this.meta.columns[this.fields[i]].type) != -1) {
			this.f.push(this.fields[i]);
			this.l.push(this.meta.columns[this.fields[i]].label); 
			}
		},
  beforeDestroy(){
	  this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
	  }
}

</script>

