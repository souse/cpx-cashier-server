import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Row } from 'antd';

class Bill extends Component {
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

export default Bill;