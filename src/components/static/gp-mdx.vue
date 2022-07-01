<template>
  <div>
    <v-layout row>
      <v-flex xs1 sm1 md1 lg1 xl1>
        <v-btn icon color="purple" @click="on_configure_view(model)"
          ><v-icon>settings</v-icon></v-btn
        >
      </v-flex>
      <v-flex xs2 sm2 md2 lg2 xl2>
        <v-select label="Criteria" :items="rfields" v-model="rfield" />
      </v-flex>
      <v-flex xs1 sm1 md1 lg1 xl1> </v-flex>
      <v-flex xs2 sm2 md2 lg2 xl2>
        <el-select label="Aggregate" :items="aggregates" v-model="aggregate">
		          <el-option
            v-for="item in aggregates"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
		</el-select>
      </v-flex>
    </el-layout>
    <pivot
      :data="data"
      :fields="fields"
      :row-fields="rowFields"
      :col-fields="colFields"
      :reducer="reducer"
      ref="pivot"
    >
      <!-- Optional slots can be used for formatting, see documentation below -->
    </pivot>
  </div>
</template>




<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "gsrp5-mdx-view",
});
</script>

<script setup>

import Pivot from '@marketconnect/vue-pivot-table';
import PivotTable from '@marketconnect/vue-pivot-table';

import {
onBeforeMount,
  ref,
  reactive,
  watch,
  getCurrentInstance
} from "vue";

const props = defineProps({
  cid: {
    type: String,
    required: true,
  },
  metas: {
    type: Object,
  },
  model: {
    type: String,
    required: true,
  }
});


     const { proxy } = getCurrentInstance(); 
	  const data = reactive([]);
      const fields = reactive([]);
      const colFields = reactive([]);
      const rowFields = reactive([]);
      const reducer = ref((sum, item) =>{
        return sum + 1;
      });
      const selectionFrom = reactive({});
      const selectionFromForm = reactive({});
      const vfields = reactive([]);
      const rfields = reactive([]);
      const rfield = ref(null);
      const aggregates = reactive([{text:'Count',value:'count'},{text:'Sum',value:'sum'},{text:'Average',value:'avg'},{text:'Min',value:'min'},{text:'Max',value:'max'}]);
      const aggregate =  ref('sum');
      const template = ref(null);
    watch( aggregate,(aggregate,prevAggregate) => {
		switch(aggregate){
			case 'count':
				reducer.value = new Function('count','item', 'return count + 1');
				break;
			case 'sum':
				reducer.value = new Function('sum','item', 'return sum + item.'+n);
				break;
			case 'avg':
				reducer.value = new Function('avg','item', 'return (avg + item.'+n+')/2');
				break;
			case 'min':
				reducer.value = new Function('min','item', 'return min < item ? min : item.'+n);
				break;
			case 'max':
				reducer.value = new Function('max','item', 'return max > item ? max : item.'+n);
				break;	
			}
		});
		
    const onMDX = (rows)=>{
			if (rows.length > 0) {
        data.splice(0,data.length,...rows)
				}
			};	
	onBeforeMount(async () => {
		// this.meta = this.metas[this.model].meta;
		// this.views = this.metas[this.model].views;
		// this.view = this.views.mdx;
		// this.name = this.meta.description;
		// this.actions = this.meta.actions;
			let a0 = [],selections = [];

			// this.view_variants = this.view.confs.map(function(a){return a.name;});
			// this.selected_view_variant = this.view_variants[0];
			// this.show_cols = this.view.confs[0].values.map(function(s){return s.col});
			// var show_cols = this.show_cols;
			// if (this.show_cols.length > 0) this.vfields = Object.keys(this.view.columns).filter(function(c){return show_cols.indexOf(c) >=0;});
			// else this.vfields = Object.keys(this.view.columns);
			vfields.splice(0,vfields.length, ...props.metas[props.model].views.mdx.columns.map((v) => v.col))
			
			for(let i = 0; i < vfields.length; i++) {
				switch(props.metas[props.model].meta.columns[vfields[i]].type){
					case 'char':
					case 'varchar':
						if (vfields[i] == props.metas[props.model].meta.names.rec_name) colFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter': new Function('item','return item.'+vfields[i])});
						else rowFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter': new Function('item','return item.'+vfields[i])});
						break;					
					case 'date':
					case 'time':
					case 'datatime':
					case 'text':
					case 'xml':
						rowFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter': new Function('item','return item.'+vfields[i])});
						break;
					case 'many2one':
					case 'related':
						rowFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter':new Function('item','return item.'+vfields[i]+'.name')});
						break;
					case 'selection':
						selectionFromForm[vfields[i]] = {};
						selections = props.metas[props.model].meta.columns[vfields[i]].selections;
						for(let j = 0; j < selections.length; j++){
							a0.push({text:selections[j][1],value:selections[j][0]});
							selectionFromForm[vfields[i]][selections[j][0]] = selections[j][1];
							}
						selectionFrom[vfields[i]] = a0;
						rowFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter': new Function('item','return item.'+vfields[i])});
						break;
					case 'integer':
					case 'float':
					case 'double':
					case 'real':
					case 'decimal':
					case 'numeric':
						rfields.push(vfields[i]);
						break;
					default:
						rowFields.push({'label':props.metas[props.model].meta.columns[vfields[i]].label,'getter': new Function('item','return item.' + vfields[i])});
				}
			} 
			rfield.value = rfields[0];
			reducer.value = new Function('sum','item', 'return sum + item.' + rfield);

		onMDX( await proxy.$ws.sendAsynvc({_msg:[props.cid,'models',props.model,'select',{fields: vfields, context: proxy.$UserPreferences.Context}]}));
		});

</script>

