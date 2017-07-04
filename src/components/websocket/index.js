import React from 'react';
import Websocket from 'react-websocket';

class ProductDetail extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        count: 90
      };
    }

    handleData(data) {
      let result = JSON.parse(data);
      this.setState({count: this.state.count + result.movement});
    }

    render() {
      return (
        <div>
          Count: <strong>{this.state.count}</strong>

          <Websocket url='ws://192.168.0.212:8091/' 
              onMessage={this.handleData.bind(this)}/>
        </div>
      );
    }
  }

  export default ProductDetail;