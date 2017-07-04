import React, { Component, PropTypes } from 'react';
import { Row, Col, notification } from 'antd';

import api from '../../api';
import { getUser, getUnOrderedDishs } from '../../utils';

import './index.less'; 
/** 点菜 */
class OrderDetailOperate extends Component {
	constructor(props) {
		super(props);

		this.orderDishes = this.orderDishes.bind(this);
		this.changeTable = this.changeTable.bind(this);
		this.printOrderDetail = this.printOrderDetail.bind(this);
		this.handlePayment = this.handlePayment.bind(this);
		this.cancleTable = this.cancleTable.bind(this);
	}

	componentDidMount() {}

	orderDishes() {
		const href = window.location.href;

		this.context.router.push('/cashier/ordered');
	}

	changeTable() {
		const { pay_status } = this.props.orderDetail;
		const pathname = location.pathname;
		const orderDetail = this.props.orderDetail;

		if (pay_status == 1) return; //已经结账

		if (pathname.indexOf('choosetable') == -1) {
			notification.warn({
              	message: '提示信息',
              	description: '请先切换到选桌页面！'
          	});
          	return;
		}
		this.props.changingTable(orderDetail);
	}

	printOrderDetail() {
		const user = getUser();
		const { order_id } = this.props.orderDetail;
		const obj = {
			...user,
			order_id: order_id,
			type: 3
		}

		if (order_id == '' || order_id == null) {
			notification.warn({
              	message: '提示信息',
              	description: '请点菜落单后再打印！'
          	});
          	return;	
		}

		let pomise = api.post('/print_order_detail.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);
	}
    //结账按钮 
	handlePayment() {
		const user = getUser();
		const { orderDetail } = this.props;
		const { order_id, dishs ,shouldfag} = orderDetail;
		const flag = this.checkedOrdered(orderDetail);
		//没落过单，没点菜不让结账
		if (!order_id && dishs.length == 0) return;
		//没落过单已经点菜，落过单又点新菜 —————> 先落单 然后跳转到结账页面
		if (!flag) {
			const list = getUnOrderedDishs(orderDetail.dishs);
			const orderJson = { ...orderDetail, dishs: list };
			const obj = { ...user, order_json: JSON.stringify(orderJson), reversed: orderDetail.reversed };
			let pomise = api.post('/place_order.json', { data: obj });
			
			pomise.then(
				(resolved = {}) => {
					if (resolved.code === 0) {
						
						const { order_id } = resolved.data;
			          	//更新orderDetail 的 order_id
			          	this.props.updateOrderDetailOrderId(order_id);
			          	this.props.clearBatchDish();
			          	this.context.router.push('/cashier/payment');
					} else {
						notification.error({
			              	message: '落单失败！',
			              	description: resolved.msg
			          	});
			          	return;
					}
				},
				(rejected = {}) => {
					console.log('rejected......place_order', rejected);
					return;
				}
			);
		}
		//如果已经落单 && 没有新点菜 直接跳转到结账页面
		if (order_id && flag) {
			this.context.router.push('/cashier/payment');
		}
	}

	checkedOrdered(orderDetail) { //检查dishs里是否有未落单的单据
		const { order_id, dishs } = orderDetail;
		let flag = true;

		for (var i = 0; i < dishs.length; i++) {
			const ds = dishs[i];

			if (!ds.order_dish_id) {
				flag = false;
				return flag;
				break;
			}
		};
		return flag;
	}

	cancleTable() {
		//改变选中桌子状态
		//移除当前选中桌子，
		//清空当前订单
		const user = getUser();
		const { table_id } = this.props.orderDetail;
		const obj = {
			...user,
			table_id: table_id
		}
		const { clearCurrentTable, clearFood, tableArea } = this.props;
		const currentTableArea = tableArea.currentTableArea;
		let pomise = api.post('/cancel_table.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	
					clearCurrentTable();
					clearFood();
					this.context.router.push('/cashier/choosetable');	
					this.props.getTables({
						...user,
						area_id: currentTableArea.area_id,
						status: currentTableArea.status != undefined ? currentTableArea.status : ''
					});	
				}else {
					notification.error({
		              	message: '取消开桌失败！',
		              	description: resolved.msg
		          	});	
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected......', rejected);
			}
		);
	}

	render() {
		const { order_id, pay_status, dishs } = this.props.orderDetail;
		const isShowPrint = order_id == null ? 'hidden' : '';
		const isShowCanbleTable = order_id == null ? '' : 'hidden';
		let flag = true;
		const { isChangingTable, cancleChangeTable } = this.props;

		//code 没有订单号 且  没有dishs 灰色
		if (!order_id && dishs.length == 0) flag = false;

		return (
			<div className="menu-opreate">
				<Row type="flex" justify="space-between">
					<Col className={ flag ? 'op op-billing' : 'op op-billing op-disabled'} span={6} onClick={this.handlePayment}>
						<div>
							<span>结账</span>
						</div>
					</Col>
					<Col className="op op-order" span={6} onClick={this.orderDishes}>
						<div>
							<span>点菜</span>
						</div>
					</Col>
					{
						isChangingTable == true ?
							<Col className="op op-cancletb" span={6} onClick={cancleChangeTable}>
								<div>
									<span>取消换台</span>
								</div>
							</Col> 
						:
							<Col className={ pay_status != 1 ? 'op op-change' : 'op op-change op-disabled'} span={6} onClick={this.changeTable}>
								<div>
									<span>换台</span>
								</div>
							</Col>
					}
					<Col className={`op op-printf ${isShowPrint}`} span={6} onClick={this.printOrderDetail}>
						<div>
							<span>打印</span>
						</div>
					</Col>
					<Col className={`op op-cancletb ${isShowCanbleTable}`} span={6} onClick={this.cancleTable}>
						<div>
							<span>取消开台</span>
						</div>
					</Col>
				</Row>
			</div>
		)
	}
}

OrderDetailOperate.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

export default OrderDetailOperate;