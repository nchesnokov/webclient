<template>
<html>

<head>
  <meta charset="utf-8">
  <title>Task management</title>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">
</head>

<body>
  <div id="app">
    <div class="task-container">
      <ul class="task-list">
        <li class="task-column task-column-on-hold">
          <span class="task-column-header">
            <h2>Ideas/tasks</h2>
          </span>
          <div class="task-input">
            <input type="text" placeholder="Add an issue" @keyup.enter="addIssue('tasks')" v-model="create.tasks">
          </div>
          <ul class="task-inner-list" id="tasks">
            <li v-for="item in tasks" class="task-item">
              <h1>{{item.name}}</h1>
              <span class="task-time">{{item.billed}} / {{item.estimate}}</span>
              <div id="clockdiv"></div>
              <ul class="assigned">
                <li v-for="dev in item.assigned">
                  <img :src="dev.avatar" alt="" />
                </li>
              </ul>
              <button class="track-task" @click="!item.tracked ? trackTask(item) : stopTask(item)">
                <i class="material-icons" v-if="!item.tracked">play_arrow</i>
                <i class="material-icons" v-if="item.tracked">pause</i>
              </button>
            </li>
          </ul>
        </li>
        <li class="task-column task-column-in-progress">
          <span class="task-column-header">
          <h2>In Progress</h2>
        </span>
          <div class="task-input">
            <input type="text" placeholder="Add an issue" @keyup.enter="addIssue('inprogress')" v-model="create.inprogress">
          </div>
          <ul class="task-inner-list" id="inprogress">
            <li v-for="item in inprogress" class="task-item">
              <h1>{{item.name}}</h1>
              <span class="task-time">{{item.billed}} / {{item.estimate}}</span>
              <ul class="assigned">
                <li v-for="dev in item.assigned">
                  <img :src="dev.avatar" alt="" />
                </li>
              </ul>
              <button class="track-task" @click="!item.tracked ? trackTask(item) : stopTask(item)">
                <i class="material-icons" v-if="!item.tracked">play_arrow</i>
                <i class="material-icons" v-if="item.tracked">pause</i>
              </button>
            </li>
          </ul>
        </li>
        <li class="task-column task-column-needs-review">
          <span class="task-column-header">
          <h2>Needs Review</h2>
        </span>
          <div class="task-input">
            <input type="text" placeholder="Add an issue" @keyup.enter="addIssue('review')" v-model="create.review">
          </div>
          <ul class="task-inner-list" id="review">
            <li v-for="item in review" class="task-item">
              <h1>{{item.name}}</h1>
              <span class="task-time">{{item.billed}} / {{item.estimate}}</span>
              <ul class="assigned">
                <li v-for="dev in item.assigned">
                  <img :src="dev.avatar" alt="" />
                </li>
              </ul>
              <button class="track-task" @click="!item.tracked ? trackTask(item) : stopTask(item)">
                <i class="material-icons" v-if="!item.tracked">play_arrow</i>
                <i class="material-icons" v-if="item.tracked">pause</i>
              </button>
            </li>
          </ul>
        </li>
        <li class="task-column task-column-approved">
          <span class="task-column-header">
            <h2>Approved</h2>
          </span>
          <div class="task-input">
            <input type="text" placeholder="Add an issue" @keyup.enter="addIssue('approved')" v-model="create.approved">
          </div>
          <ul class="task-inner-list" id="approved">
            <li v-for="item in approved" class="task-item">
              <h1>{{item.name}}</h1>
              <span class="task-time">{{item.billed}} / {{item.estimate}}</span>
              <ul class="assigned">
                <li v-for="dev in item.assigned">
                  <img :src="dev.avatar" alt="" />
                </li>
              </ul>
              <button class="track-task" @click="!item.tracked ? trackTask(item) : stopTask(item)">
                <i class="material-icons" v-if="!item.tracked">play_arrow</i>
                <i class="material-icons" v-if="item.tracked">pause</i>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</body>

</html>
</template>


<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700');
* {
  box-sizing: border-box;
}

html {
  font-size: 62.5%;
}

body {
  background: #F0F3F7;
  font-weight: 300;
  margin: 0;
  padding: 5rem;
  font-size: 1.5rem;
  font-family: 'Roboto', sans-serif;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.task-container {
  max-width: 1200px;
  margin: 20px auto;
  .task-list {
    display: flex;
    align-items: flex-start;
    @media (max-width: 750px) {
      display: block;
    }
    .task-column {
      flex: 1;
      margin: 0 10px;
      position: relative;
      overflow: hidden;
      @media (max-width: 750px) {
        margin-bottom: 30px;
      }
      .task-input {
        padding: 0 0 1rem;
        input {
          border: 1px solid #CFD9EA;
          border-top: 0;
          background: white;
          border-radius: 0.2rem;
          box-shadow: 0px 2px 5px rgba(#CFD9EA, 0.1);
          width: 100%;
          padding: 1rem;
          font-size: 1.3rem;
          font-weight: 300;
          outline: none;
          font-family: 'Roboto', sans-serif;
          transition: all .3s cubic-bezier(0.23, 1, 0.32, 1);
          &:focus {
            box-shadow: 0px 4px 10px rgba(#CFD9EA, 0.5);
          }
        }
      }
      .task-column-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        h2 {
          font-size: 1.5rem;
          font-weight: 400;
          margin: 0;
          text-transform: uppercase;
        }
      }
      &-on-hold {
        .task-column-header,
        .is-moved,
        .task-options {
          background: #4B9EFD;
          color: white;
        }
      }
      &-in-progress {
        .task-column-header,
        .is-moved,
        .task-options {
          background: #FFB335;
          color: white;
        }
      }
      &-needs-review {
        .task-column-header,
        .is-moved,
        .task-options {
          background: #8473E1;
          color: white;
        }
      }
      &-approved {
        .task-column-header,
        .is-moved,
        .task-options {
          background: #44D26F;
          color: white;
        }
      }
    }
  }
}

.task-inner-list {
  min-height: 50px;
}

.task-item {
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem;
  height: 120px;
  background: white;
  border-radius: 0.2rem;
  border: 1px solid #CFD9EA;
  box-shadow: 0px 2px 5px rgba(#CFD9EA, 0.1);
  transition: all .3s cubic-bezier(0.23, 1, 0.32, 1);
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 400;
    padding-right: 2rem;
  }
  span.task-time {
    font-size: 1.3rem;
    display: inline-block;
    margin-top: 0.5rem;
    color: #566578;
  }
  .assigned {
    display: block;
    margin-top: 1rem;
    li {
      display: inline-block;
      margin-right: 0.5rem;
      img {
        max-width: 20px;
        border-radius: 100%;
      }
    }
  }
  .track-task {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    padding: 0;
    margin: 0;
    border: none;
    outline: none;
    &:hover {
      opacity: 0.6;
    }
  }
  &.is-moving {
    cursor: move;
  }
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
  opacity: 0.5;
}
</style>
