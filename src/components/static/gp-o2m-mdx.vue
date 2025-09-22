<template>
	<div>
		<v-layout row>
		<v-flex xs1 sm1 md1 lg1 xl1>
		</v-flex>			 
		<v-flex xs2 sm2 md2 lg2 xl2>
		   <v-select label="Criteria" :items="rfields" v-model="rfield"/>
		</v-flex>
		<v-flex xs1 sm1 md1 lg1 xl1>
		</v-flex>			 
		 <v-flex xs2 sm2 md2 lg2 xl2>
		   <v-select label="Aggregate" :items="aggregates" v-model="aggregate"/>
		 </v-flex>
		 </v-layout>
		<pivot :data="data" :fields="fields" :row-fields="rowFields" :col-fields="colFields" :reducer="reducer">
			<!-- Optional slots can be used for formatting, see documentation below -->
		</pivot>
	</div>
</template>

<script>
import Pivot from '@marketconnect/vue-pivot-table'
import PivotTable from '@marketconnect/vue-pivot-table'

export default {
  name: 'gsrp5-o2mmdx-view',
  props: ['metas','meta','model','views','rel','mode','items','o2mfield','parent','root','guid','container'],
  data: () => {
    return {

      data: [],
      fields: [],
      colFields: [],
      rowFields: [],
      reducer: function(sum, item) {
        return sum + 1;
      },
      selectionFrom: {},
      selectionFromForm: {},
      vfields:[],
      rfields:[],
      rfield:null,
      aggregates:[{text:'Count',value:'count'},{text:'Sum',value:'sum'},{text:'Average',value:'avg'},{text:'Min',value:'min'},{text:'Max',value:'max'}],
      aggregate: 'sum',
      template: null
    }
  },
  components: { Pivot,PivotTable },
    watch: { rfield(n,o){
		switch(this.aggregate){
			case 'count':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + 1'));
				break;
			case 'sum':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + item.'+this.rfield));
				break;
			case 'avg':
				this.$set(this,'reducer', new Function('sum','item', 'return (sum + item.'+this.rfield+')/2'));
				break;
			case 'min':
				this.$set(this,'reducer', new Function('sum','item', 'return sum < item ? sum : item.'+this.rfield));
				break;
			case 'max':
				this.$set(this,'reducer', new Function('sum','item', 'return sum > item ? sum : item.'+this.rfield));
				break;	
			}
		},
		aggregate(n,o){
		switch(this.aggregate){
			case 'count':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + 1'));
				break;
			case 'sum':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + item.'+this.rfield));
				break;
			case 'avg':
				this.$set(this,'reducer', new Function('sum','item', 'return (sum + item.'+this.rfield+')/2'));
				break;
			case 'min':
				this.$set(this,'reducer', new Function('sum','item', 'return sum < item ? sum : item.'+this.rfield));
				break;
			case 'max':
				this.$set(this,'reducer', new Function('sum','item', 'return sum > item ? sum : item.'+this.rfield));
				break;	
			}			
			}
		},
	mounted(){
		if (this.items.length > 0) {
			let data = [];
			for(let i = 0; i < this.items.length;i++) data.push(this.items[i].__data__);
			this.$set(this,'data',data);
				}
		},
	created: function(){
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		if (this.views !== undefined) this.view = this.views.mdx;
			let a0 = [],selections = [];

			this.vfields = Object.keys(this.view.columns);
			for(let i = 0; i < this.vfields.length; i++) {
				switch(this.meta.columns[this.vfields[i]].type){
					case 'char':
					case 'varchar':
						if (this.vfields[i] == this.meta.names.rec_name) this.colFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter': new Function('item','return item.'+this.vfields[i])});
						else this.rowFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter': new Function('item','return item.'+this.vfields[i])});
						break;					
					case 'date':
					case 'time':
					case 'datatime':
					case 'text':
					case 'xml':
						this.rowFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter': new Function('item','return item.'+this.vfields[i])});
						break;
					case 'many2one':
					case 'related':
						this.rowFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter':new Function('item','return item.'+this.vfields[i]+'.name')});
						break;
					case 'selection':
						this.selectionFromForm[this.vfields[i]] = {};
						selections = this.meta.columns[this.vfields[i]].selections;
						for(let j = 0; j < selections.length; j++){
							a0.push({text:selections[j][1],value:selections[j][0]});
							this.selectionFromForm[this.vfields[i]][selections[j][0]] = selections[j][1];
							}
						this.selectionFrom[this.vfields[i]] = a0;
						this.rowFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter': new Function('item','return item.'+this.vfields[i])});
						break;
					case 'integer':
					case 'float':
					case 'double':
					case 'real':
					case 'decimal':
					case 'numeric':
						this.rfields.push(this.vfields[i]);
						break;
					default:
						this.rowFields.push({'label':this.meta.columns[this.vfields[i]].label,'getter': new Function('item','return item.'+this.vfields[i])});
				}
			} 
			this.rfield = this.rfields[0];
			this.reducer = new Function('sum','item', 'return sum + item.'+this.rfield);
		},
	beforeDestroy: function(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		},
 }

</script>
