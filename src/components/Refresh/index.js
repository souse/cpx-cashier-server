import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Modal, Row, Col, Button, notification ,Spin} from 'antd';

import { getUser ,formatDate} from '../../utils';
import api from '../../api';

import TurnPage from '../TurnPage';

import * as orderDetail from '../../actions/orderDetail';

import './index.less';

//const user = getUser();

class Refresh extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: false,
			hoBtn: false,
			ifclicktwo:false
		};

		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.handleOrdered = this.handleOrdered.bind(this);
		this.handleGoBack = this.handleGoBack.bind(this);
		this.handleOpenCashBox = this.handleOpenCashBox.bind(this);
		// this.clickdown=this.clickdown.bind(this);
		// this.updateOrder=this.updateOrder.bind(this);
		this.generateUUID=this.generateUUID.bind(this);
	}

	componentDidMount() {
		window.addEventListener('keydown', this.handleKeyPress);
		
	}

	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyPress);
	}

	filterOrderList(dishs) {
		let list = [];

		for (var i = 0; i < dishs.length; i++) {
			const dish = dishs[i];

			// 过滤菜，将已落单的菜和套餐里的菜剔除
			if (dish.order_dish_id == undefined&&dish.senteId== undefined) {
				list.push(dish);
			}
		};

		return list;
	}

	handleKeyPress(event) {
		const user = getUser();
		// F3-114, F4-115, F8-119, F9-120
		const keyCode = event.keyCode;
		const key = event.key;
		if (this.props.handleRefresh&&keyCode == 114) {//刷新 r
			this.handleRefresh();
		}

		if (this.props.showOrderBtn &&keyCode == 115) {//落单 s
			this.handleOrdered();
		}

		if (keyCode == 119) {//开钱箱 w
			this.handleOpenCashBox();
		}

		if (this.props.showGoBackBtn && keyCode == 120) {//返回 x
			this.handleGoBack();
			const href = location.href;

			//如果在结账页面 特殊处理
			if (href.indexOf('payment') != -1) {
				const  { currentTable } = this.props.tables;
				
				this.props.searchFood({
					...user,
					order_id: currentTable.order_id,
					table_id: currentTable.table_id
				});	
			}

		}
	}

   //落单按钮 
	handleOrdered() {
		const user = getUser();
		//过滤orderDetail里面 order_dish_id 为空的数据
		const orderDetail = this.props.orderDetail;
		const list = this.filterOrderList(orderDetail.dishs);  
		const orderJson = { ...orderDetail, dishs: list };
		const obj = { ...user, order_json: JSON.stringify(orderJson), reversed: orderDetail.reversed ,session:this.generateUUID()};
		let pomise = api.post('/place_order.json', { data: obj });
		this.setState({ hoBtn: true ,ifclicktwo:true});
		pomise.then(
			(resolved = {}) => {
				    this.setState({ hoBtn: false });
				    this.setState({ifclicktwo:false});
				if (resolved.code === 0) {
					const { order_id } = resolved.data;
					this.props.updateOrderDetailOrderId(order_id);
					this.props.clearBatchDish();
					this.props.searchFood({
						...user,
						order_id: order_id,
						table_id: orderDetail.table_id
				    });	
					 this.setState({ifclicktwo:false});
					 notification.success({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	 });
					 this.context.router.push('/cashier/choosetable');


				} else {
					notification.error({
		              	message: '落单失败！',
		              	description: resolved.msg
		          	});
		          	this.setState({ifclicktwo:false});
				}
			},
			(rejected = {}) => {
				this.setState({ hoBtn: false });
				console.log('rejected......place_order', rejected);
			}
		);
	}

	// 返回全局唯一ID
	generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  var r = (d + Math.random()*16)%16 | 0;
		  d = Math.floor(d/16);
		  return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};
 
	handleOpenCashBox() {
		const user = getUser();

		api.post('/open_cashbox.json', { data: user });
	}

	handleGoBack() {
		//1、在点菜页面点菜 点击返回处理。
		const reg = /^modifydishs|payment$/;
		const href = window.location.href;
		const hr = href.split('\/').pop();
		const { orderDetail } = this.props;
		const list = this.filterOrderList(orderDetail.dishs);

		if (href.indexOf('/cashier/ordered') != -1 && list.length > 0) {
			this.setState({ visible: true });
			return;
		}

		//2、在ModifyDish页面, payment页面返回 清空
		if (!!reg.test(hr)) {
			this.props.clearBatchDish();
		}
		if (hr=='ordered') {
			this.context.router.push('/cashier/choosetable');
		}else{
			this.context.router.goBack();
		}
		
	}

	handleOk() {
		this.handleOrdered();
		this.setState({ visible: false });	
	}

	handleCancel() {
		this.setState({ visible: false });
		this.context.router.goBack();
	}

	render() {
		const { hoBtn } = this.state;

		return (
			<Row type="flex" justify="start" className="ob-opreate">
				<Col className="btns" span={17}>
					{this.props.showOrderBtn ? <Button type="primary btn-lv" disabled={hoBtn} onClick={this.handleOrdered}>落单F4</Button> : null}
					<Button type="primary btn-hong" onClick={this.handleOpenCashBox}>开钱箱F8</Button>
					{this.props.handleRefresh ? <Button type="primary btn-lan" onClick={this.props.handleRefresh}>刷新F3</Button> : null}	
					{this.props.showGoBackBtn ? <Button type="primary btn-lan" onClick={this.handleGoBack}>返回F9</Button> : null}
				</Col>
				<Col className="pagin" span={7}>
				     {this.props.handlebtn ?<TurnPage parentDom={this.props.parentDom || `cashsList`} currentDom={this.props.currentDom || `clist`} />:null}
				</Col>
				<Modal
				  width={300} 
				  title={`提示信息`}
		          visible={this.state.visible}
		          onOk={::this.handleOk}
		          onCancel={::this.handleCancel}
		          maskClosable={false}
		        >
		        	当前桌台含有未落单的菜品，是否进行落单？
		        </Modal>
		       
		        {this.state.ifclicktwo? <div className="example">
		        	<Spin/>
		        </div>:null}
			</Row>
		)
	}
}

Refresh.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail		
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators(orderDetail, dispatch);	
}


export default connect(mapStateToProps, mapDispatchToProps)(Refresh);