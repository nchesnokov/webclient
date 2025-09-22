<template>
	<kanban-board :stages="stages" :blocks="blocks"></kanban-board>
</template>

<script>
import Vue from 'vue'

import vueKanban from 'vue-kanban'

Vue.use(vueKanban)

export default {
  name:'gsrp5-o2mkanban-view',
  props: ['metas','meta','model','views','rel','mode','items','o2mfield','parent','root','guid','container'],
  //props: ['model','views','metas','meta','title','name'],
  data(){
	  return {stages:[],blocks:[]};
	  },
  created(){
	  this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
	  let s = this.meta.columns[this.meta.names.state].selections;
	  this.stages.splice(0,this.stages.length);
	  for(let i = 0; i < s.length;i++) this.stages.push(s[i]['__tuple__'][0]);
	  },
	mounted(){
	  this.blocks.splice(0,this.blocks.length);
	  for(let i = 0; i < this.items.length;i++) this.blocks.push({title:this.items[i].__data__.id,status:this.items[i].__data__[this.meta.names.state],id:this.items[i].__data__[this.meta.names.rec_name]});
	},
	beforeDestroy(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		}
}
</script>

<style lang="scss">
  @import "vue-kanban/src/assets/kanban.scss"
</style> 
