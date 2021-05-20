const on_modify_models = (values) =>{
    function _update(diffs){
        if ( '__update__' in diffs) 
            for(let k in diffs.__update__) 
                for(let v in diffs.__update__[k]) {
                    if (k in meta__cache__.__data__) meta__cache__.__data__[k][v] = diffs.__update__[k][v];
                    if (k == dataForm.__path__) dataForm.__data__[v] = diffs.__update__[k][v];
                }
                
        }

    function _insert(diffs){
        if ( '__insert__' in diffs) 
            for(let k in diffs.__insert__) 
                for(let v in diffs.__insert__[k]) {
                    if (k in meta__cache__.__data__) meta__cache__.__data__[k][v] = diffs.__insert__[k][v];
                    if (k == dataForm.__path__) dataForm.__data__[v] = diffs.__insert__[k][v];
                    }

        }

    function _delete(diffs){
        if ( '__delete__' in diffs) 
            for(let k in diffs.__delete__) 
                for(let v in diffs.__insert__[k]) {
                    if (k in meta__cache__.__data__) delete meta__cache__.__data__[k][v];
                    if (k == self.item.__path__) delete self.item.__data__[v];
                    }

        }

    function _meta_update(diffs){
        if ( '__meta_update__' in diffs) 
            for(let k in diffs.__meta_update__) 
                for(let a in diffs.__meta_update__[k])
                    for(let c in diffs.__meta_update__[k][a])
                        meta__cache__.__meta__[k][a][c] = diffs.__meta_update__[k][a][c];
        }

    function _m2m_remove(diffs){
        let row,c,idx;
        if ('__m2m_remove__' in diffs) 
        for(let i = 0; i < diffs.__m2m_remove__.length;i++) {
            row = diffs.__m2m_remove__[i];
            c = meta__cache__.__containers__[row.__container__];
            idx = -1;
            for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
                if (idx >= 0) {
                    meta__cache__.__containers__[row.__container__].splice(idx,1); 
                    delete meta__cache__.__data__[row.__path__];
                }

        }   
        }     

    function _m2m_recursive_remove(rows){
        //let row,c,idx;
        for(let i = 0,row,c,idx; i < rows.length;i++) {
            row = rows[i];
            c = meta__cache__.__containers__[row.__container__];
            idx = -1;
            for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
                if (idx >= 0) {
                    meta__cache__.__containers__[row.__container__].splice(idx,1); 
                    delete meta__cache__.__data__[row.__path__];
                }

        }   
        }     


    function _o2m_remove(diffs){
        //let row,c,idx;
        if ('__o2m_remove__' in diffs) 
        for(let i = 0,row,c,idx; i < diffs.__o2m_remove__.length;i++) {
            row = diffs.__o2m_remove__[i];
            c = meta__cache__.__containers__[row.__container__];
            idx = -1;
            for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
                if (idx >= 0) {
                    meta__cache__.__containers__[row.__container__].splice(idx,1); 
                    delete meta__cache__.__data__[row.__path__];
                    delete meta__cache__.__data__[row.__path__];
                }
            if ('__m2m_containers__' in row) for(let k in row.__m2m_containers__) _m2m_recursive_remove(self,row.__m2m_containers__[k]);
            if ('__o2m_containers__' in row) for(let k in row.__o2m_containers__) _o2m_recursive_remove(self,row.__o2m_containers__[k]);

        }
    
        }     

    function _o2m_recursive_remove(rows){
        //let row,c,idx;
        for(let i = 0,row,c,idx; i < rows.length;i++) {
            row = rows[i];
            c = meta__cache__.__containers__[row.__container__];
            idx = -1;
            for(let j = 0; j < c.length;j++) if (c[j].__path__ == row.__path__) idx = j;
                if (idx >= 0) {
                    meta__cache__.__containers__[row.__container__].splice(idx,1); 
                    delete meta__cache__.__data__[row.__path__];
                    delete meta__cache__.__meta__[row.__path__];
                }
                if ('__m2m_containers__' in row) for(let k in row.__m2m_containers__) _m2m_recursive_remove(self,row.__m2m_containers__[k]);
                if ('__o2m_containers__' in row) for(let k in row.__o2m_containers__) _o2m_recursive_remove(self,row.__o2m_containers__[k]);
        }
    
        }     


    function _m2m_append(diffs){
        if ('__m2m_append__' in diffs)
            for(let i = 0,row; i < diffs.__m2m_append__.length;i++) {
                row = diffs.__m2m_append__[i];
                if (!(row.__container__ in meta__cache__.__containers__)) meta__cache__.__containers__[row.__container__]  = [];
                meta__cache__.__containers__[row.__container__].push(row);
        }
    
        }     

    function _o2m_append(diffs){
        if ('__o2m_append__' in diffs)
            for(let i = 0,row; i < diffs.__o2m_append__.length;i++) {
                row = diffs.__o2m_append__[i];
                meta__cache__.__containers__[row.__container__].push(row);
                dataRow(row);
        }
    
        }     


    function _apply_diffs(diffs){
        _m2m_remove(diffs);
        _o2m_remove(diffs)
        _m2m_append(diffs);
        _o2m_append(diffs)
        _update(diffs);
        _insert(diffs);
        _delete(diffs);
        _meta_update(diffs);
        }


    console.log('on_modify_models:',values);

      if ( '__data__' in values){
        let data = values.__data__;
        _apply_diffs(data);
      }
          if ('__m2o_find__' in values) {
              let __m2o_find__ = values.__m2o_find__
            if (__m2o_find__.v.length == 1) {
                meta__cache__.__data__[__m2o_find__.path][__m2o_find__.key]['id'] = __m2o_find__.v[0].id
                meta__cache__.__data__[__m2o_find__.path][__m2o_find__.key]['name']= __m2o_find__.v[0].name
                }
            else{
                //on_find_many2one_update(this,meta__cache__.__data__[__m2o_find__.path],__m2o_find__.key,__m2o_find__.v);
                return;                 
                }
            }

          if ('__related_find__' in values) {
              let __related_find__ = values.__related_find__;
            if (__related_find__.v.length == 1) {
                meta__cache__.__data__[__related_find__.path][__related_find__.key]['id'] = __related_find__.v[0].id
                meta__cache__.__data__[__related_find__.path][__related_find__.key]['name']= __related_find__.v[0].name
                }
            else{
                //on_find_related_update(this,meta__cache__.__data__[__related_find__.path],__related_find__.key,__related_find__.v);
                return;                 
                }
            }
      }

export default on_modify_models;
