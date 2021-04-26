import moment from 'moment'

Date.prototype.toJsonString =function(){
	var s = moment(this).format().replace('T',' ');
	return s.slice(0,22)+s.slice(23)
	}

const on_action = (msg) => {
  console.log('On Action MSG:',msg);
};


const on_modify_models = (values) => {
	function _update(self,diffs){
		if ( '__update__' in diffs) 
			for(let k in diffs.__update__) 
				for(let v in diffs.__update__[k]) {
					if (k in self.d) self.d[k][v] = diffs.__update__[k][v];
					if (k == self.item.__path__) self.item.__data__[v] = diffs.__update__[k][v];
				}
				
		}

	function _insert(self,diffs){
		if ( '__insert__' in diffs) 
			for(let k in diffs.__insert__) 
				for(let v in diffs.__insert__[k]) {
					if (k in self.d) self.d[k][v] = diffs.__insert__[k][v];
					if (k == self.item.__path__) self.item.__data__[v] = diffs.__insert__[k][v];
					}

		}

	function _delete(self,diffs){
		if ( '__delete__' in diffs) 
			for(let k in diffs.__delete__) 
				for(let v in diffs.__insert__[k]) {
					if (k in self.d) self.$delete(self.d[k],v);
					if (k == self.item.__path__) self.$delete(self.item.__data__,v);
					}

		}

	function _meta_update(self,diffs){
		if ( '__meta_update__' in diffs) 
			for(let k in diffs.__meta_update__) 
				for(let a in diffs.__meta_update__[k])
					for(let c in diffs.__meta_update__[k][a])
						self.m[k][a][c] = diffs.__meta_update__[k][a][c];
		}

	function _m2m_remove(self,diffs){
		let row,c,idx;
		if ('__m2m_remove__' in diffs) 
		for(let i = 0; i < diffs.__m2m_remove__.length;i++) {
			row = diffs.__m2m_remove__[i];
			c = self.c[row.__container__];
			idx = -1;
			for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
				if (idx >= 0) {
					self.$delete(self.c[row.__container__],idx); 
					self.$delete(self.d,row.__path__);
				}

		}	
		}	  

	function _m2m_recursive_remove(self,rows){
		let row,c,idx;
		for(let i = 0; i < rows.length;i++) {
			row = rows[i];
			c = self.c[row.__container__];
			idx = -1;
			for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
				if (idx >= 0) {
					self.$delete(self.c[row.__container__],idx); 
					self.$delete(self.d,row.__path__);
				}

		}	
		}	  


	function _o2m_remove(self,diffs){
		let row,c,idx;
		if ('__o2m_remove__' in diffs) 
		for(let i = 0; i < diffs.__o2m_remove__.length;i++) {
			row = diffs.__o2m_remove__[i];
			c = self.c[row.__container__];
			idx = -1;
			for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
				if (idx >= 0) {
					self.$delete(self.c[row.__container__],idx); 
					self.$delete(self.d,row.__path__);
					self.$delete(self.m,row.__path__);
				}
			if ('__m2m_containers__' in row) for(let k in row.__m2m_containers__) _m2m_recursive_remove(self,row.__m2m_containers__[k]);
			if ('__o2m_containers__' in row) for(let k in row.__o2m_containers__) _o2m_recursive_remove(self,row.__o2m_containers__[k]);

		}
	
		}	  

	function _o2m_recursive_remove(self,rows){
		let row,c,idx;
		for(let i = 0; i < rows.length;i++) {
			row = rows[i];
			c = self.c[row.__container__];
			idx = -1;
			for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
				if (idx >= 0) {
					self.$delete(self.c[row.__container__],idx); 
					self.$delete(self.d,row.__path__);
					self.$delete(self.m,row.__path__);
				}
				if ('__m2m_containers__' in row) for(let k in row.__m2m_containers__) _m2m_recursive_remove(self,row.__m2m_containers__[k]);
				if ('__o2m_containers__' in row) for(let k in row.__o2m_containers__) _o2m_recursive_remove(self,row.__o2m_containers__[k]);
		}
	
		}	  


	function _m2m_append(self,diffs){
		if ('__m2m_append__' in diffs)
			for(let i = 0,row; i < diffs.__m2m_append__.length;i++) {
				row = diffs.__m2m_append__[i];
				if (!(row.__container__ in self.c)) self.$set(self.c,row.__container__,[]);
				self.c[row.__container__].push(row);
		}
	
		}	  

	function _o2m_append(self,diffs){
		if ('__o2m_append__' in diffs)
			for(let i = 0,row; i < diffs.__o2m_append__.length;i++) {
				row = diffs.__o2m_append__[i];
				self.c[row.__container__].push(row);
				self.dataRow(row);
		}
	
		}	  


	function _apply_diffs(self,diffs){
		_m2m_remove(self,diffs);
		_o2m_remove(self,diffs)
		_m2m_append(self,diffs);
		_o2m_append(self,diffs)
		_update(self,diffs);
		_insert(self,diffs);
		_delete(self,diffs);
		_meta_update(self,diffs);
		}


console.log('on_modify_models:',values);

if ( '__data__' in values){
  let data = values.__data__;
  _apply_diffs(this,data);
}
if ('__m2o_find__' in values) {
  if (__m2o_find__.v.length == 1) {
    this.d[__m2o_find__.path][__m2o_find__.key]['id'] = __m2o_find__.v[0].id
    this.d[__m2o_find__.path][__m2o_find__.key]['name']= __m2o_find__.v[0].name
	}
	else{
		on_find_many2one_update(this,this.d[__m2o_find__.path],__m2o_find__.key,__m2o_find__.v);
				return;					
				}
			}

		  if ('__related_find__' in values) {
			if (__related_find__.v.length == 1) {
				this.d[__related_find__.path][__related_find__.key]['id'] = __related_find__.v[0].id
				this.d[__related_find__.path][__related_find__.key]['name']= __related_find__.v[0].name
				}
			else{
				on_find_related_update(this,this.d[__related_find__.path],__related_find__.key,__related_find__.v);
				return;					
				}
			}
	  }


function	on_modify_models1(values){
		  console.log('on_modify_models:',values);

			  if ( '__data__' in values){
				let data = values.__data__;

			  //if ('__m2m_containers__' in data) for(let ck in data['__m2m_containers__']) this.on_modify_models(data['__m2m_containers__'][ck]);
			  //if ('__o2m_containers__' in data) for(let ck in data['__o2m_containers__']) this.on_modify_models(data['__o2m_containers__'][ck]);
			  
			  if ('__o2m_remove__' in data) 
				for(let i = 0; i < data.__o2m_remove__.length;i++) {
					let c = this.c[data.__o2m_remove__[i].__container__];
					let idx = -1;
					for(let j = 0; j < c.length;j++) if (c[j].__path__ == data.__o2m_remove__[i].__path__) idx = j;
					if (idx >= 0) {
						this.$delete(this.c[data.__o2m_remove__[i].__container__],idx); 
						this.$delete(this.d,data.__o2m_remove__[i].__path__);
						this.$delete(this.m,data.__o2m_remove__[i].__path__);
						}
				}

				/*
				if ('__o2m_meta_remove__' in data)
					for(let i = 0; i < data.__o2m_meta_remove__.length;i++) 
						this.$delete(this.m,data.__o2m_meta_remove__[i].__path__);
						*/


				if ('__o2m_append__' in data)
					for(let i = 0; i < data.__o2m_append__.length;i++) {
						for(let k in data.__o2m_append__[i].__containers__) if (!(k + '.' + data.__o2m_append__[i].__path__ in this.c)) this.$set(this.c,k + '.' + data.__o2m_append__[i].__path__,data.__o2m_append__[i].__containers__[k]);
						//if (!(data.__o2m_append__[i].__container__ in this.c)) this.$set(this.c,data.__o2m_append__[i].__container__,[]);
						this.c[data.__o2m_append__[i].__container__].push(data.__o2m_append__[i]);
						this.dataRow(data.__o2m_append__[i]);
				}

				/*
				if ('__o2m_meta_append__' in data)
					for(let i = 0; i < data.__o2m_meta_append__.length;i++) 
						this.$set(this.m,data.__o2m_meta_append__[i].__path__,data.__o2m_meta_append__[i].__meta__);
						*/

			  if ('__m2m_remove__' in data) 
				for(let i = 0; i < data.__m2m_remove__.length;i++) {
					let c = this.c[data.__m2m_remove__[i].__container__];
					let idx = -1;
					for(let j = 0; j < c.length;j++) if (c[j].__path__ == data.__m2m_remove__[i].__path__) idx = j;
					if (idx >= 0) {
						this.$delete(this.c[data.__m2m_remove__[i].__container__],idx); 
						this.$delete(this.d,data.__m2m_remove__[i].__path__);
						}
				}

				if ('__m2m_append__' in data)
					for(let i = 0; i < data.__m2m_append__.length;i++) {
						for(let k in data.__m2m_append__[i].__containers__) if (!(k + '.' + data.__m2m_append__[i].__path__ in this.c)) this.$set(this.c,k + '.' + data.__m2m_append__[i].__path__,data.__m2m_append__[i].__containers__[k]);
						//if (!(data.__m2m_append__[i].__container__ in this.c)) this.$set(this.c,data.__m2m_append__[i].__container__,[]);
						this.c[data.__m2m_append__[i].__container__].push(data.__m2m_append__[i]);
						this.dataRow(data.__m2m_append__[i]);
				}


				if ( '__update__' in data) 
					for(let k in data.__update__) 
						for(let v in data.__update__[k]) {
							if (k in this.d) this.d[k][v] = data.__update__[k][v];
							if (k == this.item.__path__) this.item.__data__[v] = data.__update__[k][v];
							}
				if ( '__insert__' in data) 
					for(let k in data.__insert__) 
						for(let v in data.__insert__[k]) {
							if (k in this.d) this.d[k][v] = data.__insert__[k][v];
							if (k == this.item.__path__) this.item.__data__[v] = data.__insert__[k][v];
							}

				if ( '__delete__' in data) 
					for(let k in data.__delete__) 
						for(let v in data.__insert__[k]) {
							if (k in this.d) this.$delete(this.d[k],v);
							if (k == this.item.__path__) this.$delete(this.item.__data__,v);
							}

				if ( '__meta_update__' in data) 
					for(let k in data.__meta_update__) 
						for(let a in data.__meta_update__[k])
							for(let c in data.__meta_update__[k][a])
								this.m[k][a][c] = data.__meta_update__[k][a][c];

	  }
		  if ('__m2o_find__' in values) {
			if (__m2o_find__.v.length == 1) {
				this.d[__m2o_find__.path][__m2o_find__.key]['id'] = __m2o_find__.v[0].id
				this.d[__m2o_find__.path][__m2o_find__.key]['name']= __m2o_find__.v[0].name
				}
			else{
				on_find_many2one_update(this,this.d[__m2o_find__.path],__m2o_find__.key,__m2o_find__.v);
				return;					
				}
			}

		  if ('__related_find__' in values) {
			if (__related_find__.v.length == 1) {
				this.d[__related_find__.path][__related_find__.key]['id'] = __related_find__.v[0].id
				this.d[__related_find__.path][__related_find__.key]['name']= __related_find__.v[0].name
				}
			else{
				on_find_related_update(this,this.d[__related_find__.path],__related_find__.key,__related_find__.v);
				return;					
				}
			}
	  }

function	readonly(path,name){
  return this.mode === 'lookup' ||  path in m.m && 'ro' in m.m[path] && name in m.m[path].ro && m.m[path].ro[name];
			}

function	required(path,name){
				let m;
				if (this.root == null) m = this;
				else m = this.$websocket._components[this.root];
				return path in m.m && 'rq' in m.m[path] && name in m.m[path].rq && m.m[path].rq[name];
			}


function	visible(path,name){
				let m;
				if (this.root == null) m = this;
				else m = this.$websocket._components[this.root];
				return !(path in m.m && 'iv' in m.m[path] && name in m.m[path].iv && m.m[path].iv[name]);
			}

function selFrom(selections){
		let selectionFrom = [];
		for(let i = 0; i < selections.length; i++){
			selectionFrom.push({text:selections[i]['__tuple__'][1],value:selections[i]['__tuple__'][0]});
			}
			return selectionFrom;
}

function selFromForm(selections){
		let selectionFromForm = {};
		for(let i = 0; i < selections.length; i++){
			selectionFromForm[selections[i]['__tuple__'][0]] = selections[i]['__tuple__'][1];
			}
			return selectionFromForm;
}

function	  cache(item,name){
			  //console.log('cache:',name,item.__data__[name],item);
			  let value;
			  switch(this.meta.columns[name].type){
				  case 'integer':
					value = parseInt(item.__data__[name],10);
					break;
				case 'float':
				case 'double':
					value = parseFloat(item.__data__[name]);
					break;
				case 'real':
				case 'decimal':
				case 'numeric':
					value = {'__decimal__':item.__data__[name]};
					break;
				case 'datetime':
					if (this.meta.columns[name].timezone) value = {'__datetime_tz__':item.__data__[name].toJsonString()};
					else value = {'__datetime__':item.__data__[name].toJsonString()};
					break;
				case 'date':
					value = {'__date__':item.__data__[name]};
					break;
				case 'time':
					if (this.meta.columns[name].timezone) value = {'__time_tz__':item.__data__[name]};
					else value = {'__time__':item.__data__[name]};
					break;
				case 'timedelta':
					value = {'__timedelta__':item.__data__[name]};
					break;
				case 'many2one':
				case 'related':
					//console.log('typeof-value:',typeof item[name]);
					if ('__data__' in item){
					if (typeof item.__data__[name] == 'object') value = item.__data__[name];
					else  {value = {'id':item.__data__[name].id,'name':item.__data__[name].name}; this.$set(item.__data__,'id',value.id);this.$set(item.__data__,'name',value.name);}
					}
					else{
					if (typeof item[name] == 'object') value = item[name];
					else  {value = {'id':item[name].id,'name':item[name].name}; this.$set(item.__data__,'id',value.id);this.$set(item.__data__,'name',value.name);}
						}
					break;
				default:
					value = item.__data__[name];
				  }
			  let r = {'path':item.__path__,'key':name,'value':value,'context':{}}
			 //console.log('cache:',r);
			  this.send('on_cache',['_cache','cache',this.guid,r]);
			  }

function	  on_cache(diffs){ 
			  //console.log('ON CHANGE:',diffs);
			  if (diffs.length > 0) {
				if (this.root === undefined) this.on_modify_models(diffs[0]);
				else {
					this.$websocket._components[this.root].on_modify_models(diffs[0]);
					}
				}
}

function	  m2o_cache(item,name){
			  let r = {'path':item.__path__,'model':item.__model__,'key':name,'value':item.__data__[name],'context':{}}
			  //console.log('cache:',r);
			  this.send(['on_m2o_cache',[item,name]],['_cache','m2ofind',this.guid,r]);
			  }

function	  on_m2o_cache(item,name,f){
			  //console.log('ON CHANGE:',item,name,f);
			  if (f.__m2o_find__.__data__.v.length == 1) {
				  item.__data__[name] = f.__m2o_find__.__data__.v[0];
				  this.cache(item,name);
				  }
				else {
					this.on_find_many2one_update(this,item,name,f.__m2o_find__.__data__.v);
					}
}

function	  related_cache(item,name,relatedy){
			  let r = {'path':item.__path__,'model':item.__model__,'key':name,'value':item.__data__[name],'relatedy':relatedy,'context':{}}
			  //console.log('cache-related:',r);
			  this.send(['on_related_cache',[item,name]],['_cache','relatedfind',this.guid,r]);
			  }

function	  on_related_cache(item,name,f){
			  //console.log('ON CHANGE RELATED:',item,name,f);
			  if (f.__related_find__.__data__.v.length == 1) {
				  item.__data__[name] = f.__related_find__.__data__.v[0];
				  this.cache(item,name);
				  }
				else {
					this.on_find_related_update(this,item,name,f.__related_find__.__data__.v);
					}
}

function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){
	  if (lines[i].length == 0) continue;
	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  return result; 
}

function csvUpload(msg){
	let data = csvJSON(msg);
	let result = {'fields':Object.keys(data[0]),'values':[]};
	for(let i = 1; i < data.length; i++) result.values.push(Object.values(data[i]));
	return result
	}


export {on_new_many2one,on_detail_many2one,on_edit_many2one,on_find_many2one,on_find_many2one_update,on_find_many2many,on_new_related,on_detail_related,on_edit_related,on_find_related,on_find_related_update,on_configure_view,readonly,required,m2o_new,m2o_put,related_new,related_put,send,wslog,wsdummy,on_modify_models,visible,selFrom,selFromForm,cache,on_cache,m2o_cache,on_m2o_cache,related_cache,on_related_cache,csvJSON,csvUpload};
