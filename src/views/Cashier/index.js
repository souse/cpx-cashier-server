import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Table, Row, Col, Button } from 'antd';

import './index.less';

class Cashier extends Component {
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

export default Cashier;