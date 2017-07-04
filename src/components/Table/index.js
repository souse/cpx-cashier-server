import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Row, Col, notification } from 'antd';

import api from '../../api';
import { getIntervalTime, getUser } from '../../utils';

import { setCurrentTable } from '../../actions/tables';
import * as orderDetail from '../../actions/orderDetail';

import './index.less';

//const user = getUser();

class Table extends Component {
	static defaultProps = {
		pcInnerWidth: window.innerWidth
	}
	constructor(props) {
		super(props);
		this.getOrderDetail = this.getOrderDetail.bind(this);
	}

	getOrderDetail(table) {
		const user = getUser();
		//status 1：占用，0：空闲
		const status = table.status;
		const { isChangingTable, currentTableId } = this.props;

		if (!!isChangingTable) {//换台逻辑
			this.changingTable(table, currentTableId);
			return;		
		}

		if (status == 0) {//空闲桌跳转 到开桌页面
			this.context.router.push('/cashier/opentable/' + table.table_id + '/' + table.table_name);
			return;
		}

		this.props.searchFood({
			...user,
			order_id: table.order_id,
			table_id: table.table_id
		});	
		this.props.setCurrentTable(table.table_id);	
	}

	changingTable(table, oldId) {
		const user = getUser();
		const newId = table.table_id;
		const obj = { ...user, new_table_id: newId, old_table_id: oldId };
		let pomise = api.post('/change_table.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	this.props.changingTable();
		          	this.props.setCurrentTable(newId);
		          	this.props.changeTableId(table);
		          	//批量处理
		          	
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('reject.......change_table: ', rejected);
			}
		);
	}

	render() {
		let ct5;
		const { tables, table, i } = this.props;
		const active = table.status == 1 ? 'active' : '';
		const current = table.table_id == tables.currentTableId ? 'current': '';
		const orderId = table.order_id;
		const openTime = orderId === null ? table.table_place_time : table.order_place_time;
		const pcInnerWidth = this.props.pcInnerWidth;

		if (pcInnerWidth <= 1350) {
			ct5 = (i + 1) % 4 == 0 ? 'ct5' : '';
		} else {
			ct5 = (i + 1) % 5 == 0 ? 'ct5' : '';
		}

		return (
			<li 
				className={`cash ctable ${active} ${ct5} ${current}`}
				data-table={table}
				onClick={() => this.getOrderDetail(table)}
			>
				<div>
				    { table.prepay == 0 ? '':<span id="prepaysty">预</span>}
					<span className="title">{table.table_name}</span>
					<span className="posi">{table.seating}座</span>
					{ table.status == 0 ? '' : <span className="yang">￥{table.amount}</span> }
					{ table.status == 0 ? '' : <span className="ltime">{getIntervalTime(openTime)}</span>}
					
				</div>

			</li>
		);	
	}
}

Table.propTypes = {
	table: PropTypes.object,
};
Table.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

//export default Table;
const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail,
		tables: state.tables		
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators({...orderDetail, setCurrentTable}, dispatch);	
}

export default connect(mapStateToProps, mapDispatchToProps)(Table);

