import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, Row, Col, Button, notification } from 'antd';

import { getUser } from '../../utils';
import { getTables } from '../../actions/tables';
import * as getTableArea from '../../actions/tableArea';
import * as orderDetail from '../../actions/orderDetail';
import * as batchdishs from '../../actions/batchdishs';

import OrderDetail from '../OrderDetail';
import Tb from '../Table';
import TableArea from '../TableArea';
import Refresh from '../Refresh';

import './index.less';

const propTypes = {
  	tables: PropTypes.object,
  	ajaxError: PropTypes.string
};

class ChooseTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isChangingTable: false,
			currentTableName: null,
			currentTableId: null
		}

		this.handleRefresh = this.handleRefresh.bind(this);
		this.changingTable = this.changingTable.bind(this);
		this.cancleChangeTable = this.cancleChangeTable.bind(this);
	}

	componentWillMount() {//路由改变时，先清空订单详情
		//this.props.clearFood();
	}

	componentDidMount() {
		let user = getUser(), orderId;
		const { currentTableId, tables } = this.props.tables;
		const { currentTableArea } = this.props.tableArea;

		this.props.getTables({
			...user,
			area_id: currentTableArea.area_id,
			status: currentTableArea.status != undefined ? currentTableArea.status : ''
		});	
		//当路由从其他一级导航切换回来时
		//如果有默认桌号 根据默认桌号查询订单详情
		if (currentTableId) {
			for (var i = 0; i < tables.length; i++) {
				const table = tables[i];

				if (currentTableId == table.table_id) {
					orderId = table.order_id;
					break;
				}
			};
			this.props.searchFood({
				...user,
				order_id: orderId,
				table_id: currentTableId
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		const error = nextProps.ajaxError;

		if (error != this.props.ajaxError && error) {
          	notification.error({
              	message: '获取桌子信息失败！',
              	description: error
          	});
      	}
	}

	changingTable(orderDetail) {
		let user = getUser();
		const dom = document.getElementsByClassName('status_0')[0];
		const table = dom.getAttribute('data-ta');
		//换到空闲桌 begin
		const key = dom.getAttribute('data-key');

		this.props.getTables({
			...user,
			area_id: table.area_id,
			status: 0
		});
		this.props.setTableAreaId(key, table);
		//换到空闲桌 end
		if (orderDetail) { //刚点切换按钮时
			this.setState({
				isChangingTable: true,
				currentTableName: orderDetail.table_name,
				currentTableId: orderDetail.table_id
			});
		} else {//切换成功时
			// 重新获取tables
			this.props.getTables({
				...user,
				area_id: '',
				status: ''
			});
			this.setState({
				isChangingTable: false	
			});
			this.props.clearBatchDish();//清空批量处理
		}		
	}

	cancleChangeTable() {
		this.setState({
			isChangingTable: false
		});
	}

	handleRefresh() {
		//1、刷新桌子列表
		//2、刷新区域列表
		//3、刷新订单列表
		let user = getUser();
		const { currentTableArea } = this.props.tableArea;
		const { currentTableId, currentTable } = this.props.tables;

		this.props.getTableArea();
		this.props.getTables({
			...user,
			area_id: currentTableArea.area_id,
			status: currentTableArea.status != undefined ? currentTableArea.status : ''	
		});
		this.props.searchFood({
			...user,
			order_id: currentTable.order_id,
			table_id: currentTable.table_id
		});
	}

	render() {
		const { isChangingTable, currentTableName, currentTableId } = this.state;
		const { tables } = this.props.tables;

		return (
			<div>
				<OrderDetail 
					isChangingTable={isChangingTable}
					changingTable={this.changingTable} 
					cancleChangeTable={this.cancleChangeTable}
				/>
				<Row type="flex" justify="end" className="cash-controls">
					<Row type="flex" justify="start" className="cash-control">
						<div className="cashs cashsList">
							{
								isChangingTable == true ?
									<div className="changing-table">
										正在为<span>【{currentTableName}】</span> 进行<span>【换台】</span>，请选择要切换的桌号。
									</div>
								: null
							}
							<ul className="clist" style={{overflow: 'auto'}}>
								{tables.map((table, key) => 
									<Tb
										key={key} 
										i={key} 
										table={table} 
										isChangingTable={isChangingTable}
										currentTableId={currentTableId}
										changingTable={this.changingTable} 
									/>
								)}
							</ul>
						</div>
						<Refresh 
							{...this.props} 
							handleRefresh={this.handleRefresh}
							handlebtn={true}
						/>	
					</Row>
					<TableArea {...this.props} />
				</Row>
			</div>
		)	
	}
}

ChooseTable.propTypes = propTypes;

const mapStateToProps = (state) => {
	return {
		batchDishs: state.batchDishs,
		tables: state.tables,
		tableArea: state.tableArea
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({getTables, ...getTableArea, ...orderDetail, ...batchdishs}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChooseTable);
