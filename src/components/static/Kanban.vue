<template>
  <div class="drag-container" ref="drag">
    <ul class="drag-list">
      <li v-for="stage in stages" class="drag-column" :class="{['drag-column-' + stage]: true}" :key="stage">
        <span class="drag-column-header">
          <slot :name="stage">
            <h2>{{ stage }}</h2>
          </slot>
        </span>
        <div class="drag-options"></div>
        <ul class="drag-inner-list" ref="list" :data-status="stage">
          <li class="drag-item" v-for="block in getBlocks(stage)" :data-block-id="block[idProp]" :key="block[idProp]">
            <slot :name="block[idProp]">
              <strong>{{ block[statusProp] }}</strong>
              <div>{{ block[idProp] }}</div>
            </slot>
          </li>
        </ul>
        <div class="drag-column-footer">
            <slot :name="`footer-${stage}`"></slot>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import {defineComponent, computed, onMounted, onUpdated,getCurrentInstance} from 'vue';
  //import dragula from 'dragula';
  import { Machine } from 'xstate';

  export default defineComponent({
    name: 'KanbanBoard',

    props: {
      stages: {
        type: Array,
        required: true,
      },
      blocks: {
        type: Array,
        required: true,
      },
      config: {
        type: Object,
        default: () => ({}),
      },
      stateMachineConfig: {
        type: Object,
        default: null,
      },
      idProp: {
        type: String,
        default: 'id',
      },
      statusProp: {
        type: String,
        default: 'status',
      },
    },

    setup(props){
      const { proxy } = getCurrentInstance();
      var machine;
      var config ={};
      var drake;
      const localBlocks = computed(() => {
        return props.blocks;
      });

      const getBlocks = (status) => {
        return localBlocks.value.filter(block => block[props.statusProp] === status);
      };

      const findPossibleTransitions = (sourceState) => {
        return props.machine.config.states[sourceState].on || {};
      };

      const findTransition = (target, source) => {
        const targetState = target.dataset.status;
        const sourceState = source.dataset.status;
        const possibleTransitions = findPossibleTransitions(sourceState);
        return Object.keys(possibleTransitions)
          .find(transition => possibleTransitions[transition] === targetState);
      };

      const accepts = (block, target, source) => {
        if (!machine) return true;
        const targetState = target.dataset.status;
        const sourceState = source.dataset.status;
        return Object.values(findPossibleTransitions(sourceState)).includes(targetState);
      };

      const allowedTargets = (el, source) => {
        const block = localBlocks.value.find(b => b[props.idProp] === el.dataset.blockId);
        return drake.containers.filter(c => props.config.accepts(block, c, source));
      };

      const forbiddenTargets = (el, source) => {
        return drake.containers.filter(c => !allowedTargets(el, source).includes(c));
      };
 
    onUpdated(() => {
      //drake.containers = proxy.$refs.list;
      //drake.mirrorContainer = proxy.$refs.drag;
    });

     onMounted(() => {
      if (props.stateMachineConfig)  machine.value = Machine(props.stateMachineConfig);

      config.accepts = props.config.accepts || accepts;
      config.mirrorContainer = proxy.$el;
      /*
      drake = dragula(proxy.$refs.list, config)
      .on('drag', (el, source) => {
        proxy.$emit('drag', el, source);
        el.classList.add('is-moving');
        allowedTargets(el, source).forEach(c => c.classList.add('allowed'));
        forbiddenTargets(el, source).forEach(c => c.classList.add('forbidden'));
      })
      .on('dragend', (el) => {
        proxy.$emit('dragend', el);
        el.classList.remove('is-moving');
        drake.containers.forEach(c => c.classList.remove('allowed', 'forbidden'));
        window.setTimeout(() => {
          el.classList.add('is-moved');
          window.setTimeout(() => {
            el.classList.remove('is-moved');
          }, 600);
        }, 100);
      })
      .on('drop', (block, list, source, sibling) => {
        proxy.$emit('drop', block, list, source, sibling);
        let index = 0;
        for (index = 0; index < list.children.length; index += 1) {
          if (list.children[index].classList.contains('is-moving')) break;
        }

        let newState = list.dataset.status;

        if (machine) {
          const transition = findTransition(list, source);
          if (!transition) return;
          newState = machine.transition(source.dataset.status, transition).value;
        }

        proxy.$emit('update-block', block.dataset.blockId, newState, index);
      })
      .on('cancel', (el, container, source) => {
        proxy.$emit('cancel', el, container, source);
      })
      .on('remove', (el, container, source) => {
        proxy.$emit('remove', el, container, source);
      })
      .on('shadow', (el, container, source) => {
        proxy.$emit('shadow', el, container, source);
      })
      .on('over', (el, container, source) => {
        proxy.$emit('over', el, container, source);
      })
      .on('out', (el, container, source) => {
        this.$emit('out', el, container, source);
      })
      .on('cloned', (clone, original, type) => {
        proxy.$emit('cloned', clone, original, type);
      });
      */
      //proxy.$emit('init', drake);
    });

 
      
      return {
        machine,
        drake,
        localBlocks,
        getBlocks,
        findPossibleTransitions,
        findTransition,
        accepts,
        allowedTargets,
        forbiddenTargets
      };
    }

  });
</script>

<style>
ul.drag-list, ul.drag-inner-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.drag-container {
  max-width: 1000px;
  margin: 20px auto;
}

.drag-list {
  display: flex;
  align-items: flex-start;
}
@media (max-width: 690px) {
  .drag-list {
    display: block;
  }
}

.drag-column {
  flex: 1;
  margin: 0 10px;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
@media (max-width: 690px) {
  .drag-column {
    margin-bottom: 30px;
  }
}
.drag-column h2 {
  font-size: 0.8rem;
  margin: 0;
  text-transform: uppercase;
  font-weight: 600;
}

.drag-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.drag-inner-list {
  min-height: 50px;
  color: white;
}

.drag-item {
  padding: 10px;
  margin: 10px;
  height: 100px;
  background: rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.drag-item.is-moving {
  transform: scale(1.5);
  background: rgba(0, 0, 0, 0.8);
}

.drag-header-more {
  cursor: pointer;
}

.drag-options {
  position: absolute;
  top: 44px;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 10px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.drag-options.active {
  transform: translateX(0);
  opacity: 1;
}
.drag-options-label {
  display: block;
  margin: 0 0 5px 0;
}
.drag-options-label input {
  opacity: 0.6;
}
.drag-options-label span {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 400;
  margin-left: 5px;
}

/* Dragula CSS  */
.gu-mirror {
  position: fixed !important;
  margin: 0 !important;
  z-index: 9999 !important;
  opacity: 0.8;
  list-style-type: none;
}

.gu-hide {
  display: none !important;
}

.gu-unselectable {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

.gu-transit {
  opacity: 0.2;
}
</style>
