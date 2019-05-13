import React from 'react';
import './App.css';
// import Draggable from './Draggable';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import Tasks from "./Tasks";
// import ToDoList from "./ToDoList";
// import InProgressList from "./InProgressList";
// import DoneList from "./DoneList";
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
    {value: 2, label: 'Done'},
    {value: 3, label: 'Delete'}
  ];
  selectedStatus = 0;
  getTasks = (status) => gql`
      {
        tasksByStatus(status: ${status}) {
          id
          title
          description
          status
        }
      }
    `

  render() {
    return (
      <ApolloProvider client={client} className="App">
        <div className="taskWrapper">
          <div className="toDo">
            <div>To Do</div>
            <Tasks status={0} selectTask={(task) => { this.setState({ selectedTask: task }) }}/>
          </div>
          <div className="inProgress">
            <div>In Progress</div>
            <Tasks status={1} selectTask={(task) => { this.setState({ selectedTask: task }) }} />
          </div>
          <div className="done">
            <div>Done</div>
            <Tasks status={2} selectTask={(task) => { this.setState({ selectedTask: task }) }} />
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
                      addTask({ 
                        variables: { title: this.state.title, description: this.state.description },
                        refetchQueries: [{ query: this.getTasks(0) }]
                       });
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
                      value={this.statuses.find(status => status.value === this.state.selectedTask.status)}
                      onChange={(status) => {
                        let task = this.state.selectedTask;
                        const oldStatus = task.status;
                        const newStatus = status.value;
                        task.status = status.value;
                        updateStatus(
                          { variables: { id: task.id, status: task.status },
                            refetchQueries: [{ query: this.getTasks(oldStatus) }, { query: this.getTasks(newStatus) }]});
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
