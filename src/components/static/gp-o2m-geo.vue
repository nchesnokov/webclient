<template>
    <l-map :zoom="zoom" :center="center">
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-marker :lat-lng="marker"></l-marker>
    </l-map>
</template>

<script>
import Vue from 'vue';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

delete Icon.Default.prototype._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default {
  name: 'gsrp5-o2mgeo-view',
  props: ['metas','meta','model','views','rel','mode','items','o2mfield','parent','root','guid','container'],
   data() {
      return {
        template: null,
        fields: [],
        zoom:13,
        center: L.latLng(47.413220, -1.219482),
        url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        marker: L.latLng(47.413220, -1.219482),
        data: [],
        columns:[],
    }
    },
    computed: {
      propList() {
        return Object.keys(this.props).map(item => ({
          name: item,
        }));
      },
    },
	mixins:[mixin],
	created: function(){
		this.view = this.views.geo;
		this.$websocket.registerComponent({n:`${this.$options.name}:${this._uid}`,c:this});
		this.fields = Object.keys(this.view.columns);
		},
	mounted: function(){
		if (this.items.length > 0) {
			let rows = [],row={};
			for(let i = 0; i < this.items.length; i++) { 
			for(k in this.items[i].__data__) if (k in this.view) row[k] = this.items[i].__data__[k]; 
			rows.push(row);
			row = {};
			}
			this.data.splice(0,this.data.length,...rows);
				}
		},
	beforeDestroy: function(){
		this.$websocket.unregisterComponent(`${this.$options.name}:${this._uid}`);
		},
 }

</script>
