import React, { Component } from 'react';
import { Row } from 'antd';


import './index.less';

class More extends Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Row type="flex" justify="start" className="cashier-control">
				{this.props.children}
			</Row>
		)
	}
}

export default More;