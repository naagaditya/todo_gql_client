import React from 'react';
import './App.css';
import Draggable from './Draggable';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
// import Tasks from "./Tasks";
import ToDoList from "./ToDoList";
import InProgressList from "./InProgressList";
import DoneList from "./DoneList";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import Select from 'react-select';

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql"
});

class App extends React.Component {
  state = {
    openAddModal: false,
    description: '',
    title: '',
    selectedTask: null
  }
  statuses = [
    {value: 0, label: 'To Do'},
    {value: 1, label: 'In Progress'},
    {value: 2, label: 'Done'}
  ];
  selectedStatus = 0;

  render() {
    return (
      <ApolloProvider client={client} className="App">
        <div className="taskWrapper">
          <div className="toDo">
            <div>To Do</div>
            <ToDoList selectTask={(task) => {this.setState({selectedTask: task})}}></ToDoList>
          </div>
          <div className="inProgress">
            <div>In Progress</div>
            <InProgressList></InProgressList>
          </div>
          <div className="done">
            <div>Done</div>
            <DoneList></DoneList>
          </div>
        </div>
        <div className="addIcon" onClick={() => this.setState({ openAddModal:true})}>+</div>
        {
          this.state.openAddModal ? (
            <div className="modalOverlay">
              <div className="modal">
                <label>title</label>
                <input onChange={e => this.setState({title: e.target.value})}/>
                <label>description</label>
                <input onChange={e => this.setState({ description: e.target.value })}/>
                <Mutation mutation={gql`
                mutation AddTask($title: String, $description: String) {
                  addTask(title: $title, description: $description) {
                    title
                    description
                    id
                    status
                  }
                }
                `}>
                  {(addTask, {data}) => (
                    <button onClick={() => {
                      addTask({ variables: { title: this.state.title, description: this.state.description } });
                      this.setState({ openAddModal: false })}}>
                      Add
                    </button>)
                    
                  }
                </Mutation>
                <button onClick={() => { this.setState({ openAddModal: false })}}>close</button>
              </div>
            </div>
          ) : ''
        }

        {
          this.state.selectedTask ? (
            <div className="modalOverlay">
              <div className="modal">
                <p>{this.state.selectedTask.title}</p>
                <p>{this.state.selectedTask.description}</p>
                <Mutation mutation={gql`
                mutation UpdateStatus($id: ID, $status: Int) {
                  updateStatus(id: $id, status: $status) {
                    id
                  }
                }
                `}>
                  {(updateStatus, { data }) => (
                    <Select
                      value={this.statuses.find(status => status.value == this.state.selectedTask.status)}
                      onChange={(status) => {
                        let task = this.state.selectedTask;
                        task.status = status.value;
                        updateStatus({ variables: { id: task.id, status: task.status } });
                        this.setState({ selectedTask: null });
                      }}
                      options={this.statuses}
                    />)

                  }
                </Mutation>
                
                <button onClick={() => { this.setState({ selectedTask: null }) }}>close</button>
              </div>
            </div>
          ) : ''
        }
        
      </ApolloProvider>
    );
  }
}

export default App;
