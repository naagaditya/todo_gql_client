import React from 'react';
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Draggable from './Draggable';

class InProgressList extends React.Component {
  render() {
    return (
      <Query
        query={gql`
      {
        tasksByStatus(status: 1) {
          id
          title
          description
          status
        }
      }
    `}
      >
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;
          return <Draggable updateChildren={() => { }}>

            {
              data.tasksByStatus.map(task =>
                <div draggable key={task.id} className="card">
                  {task.title}
                </div>)
            }
          </Draggable>
        }}
      </Query>
    );
  }
}

export default InProgressList;