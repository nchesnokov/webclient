<template>
	<div>
		<v-layout row>
		<v-flex xs1 sm1 md1 lg1 xl1>
			<v-btn icon color="purple" @click="on_configure_view(model)"><v-icon>settings</v-icon></v-btn>
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
		<pivot :data="data" :fields="fields" :row-fields="rowFields" :col-fields="colFields" :reducer="reducer" ref="pivot">
			<!-- Optional slots can be used for formatting, see documentation below -->
		</pivot>
	</div>
</template>




<script>

import {send,on_configure_view} from '../mixins/nf.js'
import Pivot from '@marketconnect/vue-pivot-table'
import PivotTable from '@marketconnect/vue-pivot-table'

export default {
  name: 'gsrp5-mdx-view',
  props: ['metas','model'],
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
  mixins: [{methods:{send:send,on_configure_view:on_configure_view,}}],
  components: { Pivot,PivotTable },
    watch: { rfield(n,o){
		switch(this.aggregate){
			case 'count':
				this.$set(this,'reducer', new Function('count','item', 'return count + 1'));
				break;
			case 'sum':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + item.'+n));
				break;
			case 'avg':
				this.$set(this,'reducer', new Function('avg','item', 'return (avg + item.'+n+')/2'));
				break;
			case 'min':
				this.$set(this,'reducer', new Function('min','item', 'return min < item ? min : item.'+n));
				break;
			case 'max':
				this.$set(this,'reducer', new Function('max','item', 'return max > item ? max : item.'+n));
				break;	
			}
		},
		aggregate(n,o){
		switch(n){
			case 'count':
				this.$set(this,'reducer', new Function('count','item', 'return count + 1'));
				break;
			case 'sum':
				this.$set(this,'reducer', new Function('sum','item', 'return sum + item.'+this.rfield));
				break;
			case 'avg':
				this.$set(this,'reducer', new Function('avg','item', 'return (avg + item.'+this.rfield+')/2'));
				break;
			case 'min':
				this.$set(this,'reducer', new Function('min','item', 'return min < item ? min : item.'+this.rfield));
				break;
			case 'max':
				this.$set(this,'reducer', new Function('max','item', 'return max > item ? max : item.'+this.rfield));
				break;	
			}			
			}
		},
    methods: {
		onMDX: function(rows){
			if (rows.length > 0) {
				this.$set(this,'data',rows);
				}
			},
    },	
	mounted(){
		this.meta = this.metas[this.model].meta;
		this.views = this.metas[this.model].views;
		this.view = this.views.mdx;
		this.name = this.meta.description;
		this.actions = this.meta.actions;
			let a0 = [],selections = [];

			this.view_variants = this.view.confs.map(function(a){return a.name;});
			this.selected_view_variant = this.view_variants[0];
			this.show_cols = this.view.confs[0].values.map(function(s){return s.col});
			var show_cols = this.show_cols;
			if (this.show_cols.length > 0) this.vfields = Object.keys(this.view.columns).filter(function(c){return show_cols.indexOf(c) >=0;});
			else this.vfields = Object.keys(this.view.columns);
			
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

		this.send('onMDX',['models',this.model,'select',{'fields':this.vfields}]);
		},
	created: function(){
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		},
	beforeDestroy: function(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		},
 }

</script>

