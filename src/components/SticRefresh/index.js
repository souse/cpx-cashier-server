import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Row, Col, Button, Icon, notification } from 'antd';
import { getUser } from '../../utils';
import TurnPage from '../TurnPage';

import './index.less';

class SticRefresh extends Component {
	constructor(props) {
		super(props);
		this.handleGoBack = this.handleGoBack.bind(this);
	}

	componentDidMount() {
		window.addEventListener('keydown', this.handleKeyPress);
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyPress);
	}

	handleKeyPress(event) {
		const user = getUser();
		// F3-114
		const keyCode = event.keyCode;

		if (keyCode === 114) {//刷新
			this.props.handleRefresh();
		}
	}
	handleGoBack(){
		this.context.router.goBack();
	}

	render() {
		return (
			<Row type="flex" justify="start" className="ob-opreate">
				<Col className="btns" span={16}>
					
					{this.props.sellAountshow ?<Button type="primary btn-lv" onClick={this.props.orderBySellAmount}>
						销量
						{this.props.sortnum? <Icon type="arrow-left" className="rotate" />:<i></i>}
					</Button>:null}
					
					{this.props.sellprice?<Button type="primary btn-hong" onClick={this.props.orderByMoney}>
						金额
						{this.props.sortmoney? <Icon type="arrow-left" className="rotate" />:<i></i>}
					</Button>:null}
					
					
					{this.props.exetofille?<Button type="primary btn-lan" onClick={this.props.exportExcel}>导出EXCEL</Button>:null}
					{this.props.showback ?<Button type="primary btn-lan" onClick={this.handleGoBack}>返回F9</Button>:null}
				</Col>
				<Col className="pagin" span={6}>
                     {this.props.handlebtn ?<TurnPage parentDom={this.props.parentDom || `cashsList`} currentDom={this.props.currentDom || `clist`} />:null}
				</Col>
			</Row>
		)
	}
}

SticRefresh.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

export default SticRefresh;