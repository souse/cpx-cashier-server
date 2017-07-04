import React, { Component, PropTypes } from 'react';
import { Row, Col, Icon } from 'antd';

import './index.less';

let parentH, currentH, defaultH = 0;

class TrunPage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pd: {},
			cd: {}
		};

		this.handlePrevPage = this.handlePrevPage.bind(this);
		this.handleNextPage = this.handleNextPage.bind(this);
	}

	componentDidMount() {
		const { parentDom, currentDom } = this.props;
		this.setState({
			pd: document.getElementsByClassName(parentDom)[0],
			cd:document.getElementsByClassName(currentDom)[0]
		});
	}

	handlePrevPage() {
		const { pd, cd } = this.state;
		const { parentDom, currentDom } = this.props;
		const pdh = document.getElementsByClassName(parentDom)[0];
		const cdh = document.getElementsByClassName(currentDom)[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (defaultH <= 0) return false;
		defaultH -= parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
	}

	handleNextPage() {
		const { pd, cd } = this.state;
		const { parentDom, currentDom } = this.props;
		const pdh = document.getElementsByClassName(parentDom)[0];
		const cdh = document.getElementsByClassName(currentDom)[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (currentH <= parentH) return false;
		
		if (defaultH >= currentH-300) return false;

		defaultH += parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
	}

	render() {
		return (
			<Row type="flex" justify="space-around" align="middle" className="turn-page">
				<Col span={10} className="prevPage" onClick={this.handlePrevPage}>
					<Icon type="up" />
				</Col>
				<Col span={10} className="nextPage" onClick={this.handleNextPage}>
					<Icon type="down" />
				</Col>
			</Row>
		)
	}
}

TrunPage.PropTypes = {
	parentDom: PropTypes.string.isRequired,
	currentDom: PropTypes.string.isRequired
}

export default TrunPage;