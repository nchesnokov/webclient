

<template>

<img :src="src" />

</template>

<script>

import {
    defineComponent, h
}
from 'vue';

export default defineComponent({
    name: 'gp-image',
    props: {
        src: {
            type: String
        }
    },
    setup(props) {
        const render = () => {
            console.log('render', props.src);
            return h('img', {
                src: props.src
            })
        }
        return {
            render
        };
    }

});

</script>
