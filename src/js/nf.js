import { reactive } from 'vue'

const dataRowMaps = (maps, row) => {
    let row1 = reactive({});
    for (let k in row) if (['__o2m_containers__', '__m2m_containers__'].indexOf(k) < 0) row1[k] = row[k]

    if ("__path__" in row && "__data__" in row)
        maps.__ids__[row.__path__] = row1;
    if ('__container__' in row) {
        if (!(row.__container__ in maps.__containers__)) maps.__containers__[row.__container__] = reactive([]);
        maps.__containers__[row.__container__].push(row1)
    }
    if ("__m2m_containers__" in row) {
        for (let k in row.__m2m_containers__) {
            if (!(k + '.' + row.__path__ in maps.__containers__)) maps.__containers__[k + '.' + row.__path__] = reactive([]);
            for (let i = 0; i < row.__m2m_containers__[k].length; i++) dataRowMaps(maps, row.__m2m_containers__[k][i]);
        }
    }
    if ("__o2m_containers__" in row) {
        for (let k in row.__o2m_containers__) {
            if (!(k + '.' + row.__path__ in maps.__containers__)) maps.__containers__[k + '.' + row.__path__] = reactive([]);
            for (let i = 0; i < row.__o2m_containers__[k].length; i++) dataRowMaps(maps, row.__o2m_containers__[k][i]);
        }
    }
};

const on_modify_models = (maps, values) => {
    function _update(maps, diffs) {
        if ('__update__' in diffs)
            for (let k in diffs.__update__)
                for (let v in diffs.__update__[k]) {
                    maps.__ids__[k].__data__[v] = diffs.__update__[k][v];
                }

    }

    function _insert(maps, diffs) {
        if ('__insert__' in diffs)
            for (let k in diffs.__insert__)
                for (let v in diffs.__insert__[k]) {
                    maps.__ids__[k].__data__[v] = diffs.__insert__[k][v];
                }

    }

    function _delete(maps, diffs) {
        if ('__delete__' in diffs)
            for (let k in diffs.__delete__)
                for (let v in diffs.__delete__[k]) {
                    if (v == diffs.__delete__[k][v]) delete maps.__ids__[k].__data__[v];
                }

    }

    function _meta_update(maps, diffs) {
        if ('__meta_update__' in diffs)
            for (let k in diffs.__meta_update__)
                for (let a in diffs.__meta_update__[k])
                    for (let c in diffs.__meta_update__[k][a])
                        maps.__ids__[k].__meta__[a][c] = diffs.__meta_update__[k][a][c];
    }

    function _m2m_remove(maps, diffs) {
        if ('__m2m_remove__' in diffs)
            for (let i = 0; i < diffs.__o2m_remove__.length; i++) {
                let path = diffs.__m2m_remove__[i].__path__;
                let container = diffs.__m2m_remove__[i].__container__;
                let index = maps.__containers__[container].findIndex((element, index, array) => element.__path__ === path);
                if (index >= 0) {
                    // if ('__m2m_containers__' in diffs.__m2m_remove__[i])
                    //     for (let k in diffs.__m2m_remove__[i].__m2m_containers__) _m2m_recursive_remove(maps, diffs.__o2m_remove__[i].__m2m_containers__[k]);
                    // if ('__o2m_containers__' in diffs.__m2m_remove__[i])
                    //     for (let k in diffs.__m2m_remove__[i].__o2m_containers__) _o2m_recursive_remove(maps, diffs.__o2m_remove__[i].__o2m_containers__[k]);

                    maps.__containers__[container].splice(index, 1);
                    delete maps.__ids__[path];

                }
            }
    }

    // function _m2m_recursive_remove(maps, rows) {
    //     //let row,c,idx;
    //     for (let i = 0, row, c, idx; i < rows.length; i++) {
    //         row = rows[i];
    //         c = maps.__m2m_containers__[row.__container__];
    //         idx = -1;
    //         for (let j = 0; j < c.length; j++)
    //             if (c[j].__path__ == row.__path__) idx = j;
    //         if (idx >= 0) {
    //             maps.__m2m_containers__[row.__container__].splice(idx, 1);
    //             delete maps.__data__[row.__path__];
    //         }

    //     }
    // }


    function _o2m_remove(maps, diffs) {
        if ('__o2m_remove__' in diffs)
            for (let i = 0; i < diffs.__o2m_remove__.length; i++) {
                let path = diffs.__o2m_remove__[i].__path__;
                let container = diffs.__o2m_remove__[i].__container__;
                let index = maps.__containers__[container].findIndex((element, index, array) => element.__path__ === path);
                if (index >= 0) {
                    if ('__m2m_containers__' in diffs.__o2m_remove__[i])
                        for (let k in diffs.__o2m_remove__[i].__m2m_containers__) _m2m_recursive_remove(maps, diffs.__o2m_remove__[i].__m2m_containers__[k]);
                    if ('__o2m_containers__' in diffs.__o2m_remove__[i])
                        for (let k in diffs.__o2m_remove__[i].__o2m_containers__) _o2m_recursive_remove(maps, diffs.__o2m_remove__[i].__o2m_containers__[k]);

                    maps.__containers__[container].splice(index, 1);
                    delete maps.__ids__[path];

                }
            }

    }

    function _o2m_recursive_remove(maps, rows) {
        //let row,c,idx;
        for (let i = 0; i < rows.length; i++) {
            let path = rows[i].__path__;
            let container = rows[i].__container__;
            let index = maps.__containers__[container].findIndex((element, index, array) => element.__path__ === path);

            if (index >= 0) {
                if ('__m2m_containers__' in rows[i])
                    for (let k in row.__m2m_containers__) _m2m_recursive_remove(maps, rows[i].__m2m_containers__[k]);
                if ('__o2m_containers__' in rows[i])
                    for (let k in row.__o2m_containers__) _o2m_recursive_remove(maps, rows[i].__o2m_containers__[k]);
                maps.__containers__[container].splice(index, 1);
                delete maps.__ids__[path];

            }

        }
    }

    function _m2m_append(maps, diffs) {
        if ('__m2m_append__' in diffs)
            for (let i = 0, row; i < diffs.__m2m_append__.length; i++) {
                // row = diffs.__m2m_append__[i];
                dataRowMaps(maps, diffs.__m2m_append__[i])
                // if (!(row.__container__ in maps.__containers__)) maps.__containers__[row.__container__] = reactive([]);
                // maps.__containers__[row.__container__].push(row);
            }

    }

    function _o2m_append(maps, diffs) {
        if ('__o2m_append__' in diffs) {
            // for (let i = 0, row; i < diffs.__o2m_append__.length; i++) {
            //     row = diffs.__o2m_append__[i];
            //     for (let k in row.__o2m_containers__) { row.__o2m_containers__[k + '.' + row.__path__] = row.__o2m_containers__[k]; delete row.__o2m_containers__[k]; }
            // }
            for (let i = 0, row; i < diffs.__o2m_append__.length; i++) {
                row = diffs.__o2m_append__[i];
                dataRowMaps(maps, row)
                // maps.__ids__[row.__path__] = row;
                // maps.__containers__[row.__container__].push(row);
                // if ("__o2m_containers__" in row) for (let k in row.__o2m_containers__) for (let j = 0; j < row.__o2m_containers__[k].length; j++) dataRowMaps(maps, row.__o2m_containers__[k][j])

            }

        }
    }


    function _apply_diffs(maps, diffs) {
        _m2m_remove(maps, diffs);
        _o2m_remove(maps, diffs)
        _m2m_append(maps, diffs);
        _o2m_append(maps, diffs)
        _update(maps, diffs);
        _insert(maps, diffs);
        _delete(maps, diffs);
        _meta_update(maps, diffs);
    }


    console.log('on_modify_models:', maps, values);

    if ('__data__' in values) {
        let data = values.__data__;
        _apply_diffs(maps, data);
    }
    if ('__m2o_find__' in values) {
        let __m2o_find__ = values.__m2o_find__
        if (__m2o_find__.v.length == 1) {
            maps.__ids__[__m2o_find__.path].__data__[__m2o_find__.key]['id'] = __m2o_find__.v[0].id
            maps.__ids__[__m2o_find__.path].__data__[__m2o_find__.key]['name'] = __m2o_find__.v[0].name
        } else {
            //on_find_many2one_update(this,maps.__data__[__m2o_find__.path],__m2o_find__.key,__m2o_find__.v);
            return;
        }
    }

    if ('__related_find__' in values) {
        let __related_find__ = values.__related_find__;
        if (__related_find__.v.length == 1) {
            maps.__ids__[__related_find__.path].__data__[__related_find__.key]['id'] = __related_find__.v[0].id
            maps.__ids__[__related_find__.path].__data__[__related_find__.key]['name'] = __related_find__.v[0].name
        } else {
            //on_find_related_update(this,maps.__data__[__related_find__.path],__related_find__.key,__related_find__.v);
            return;
        }
    }
}

export { on_modify_models, dataRowMaps };
