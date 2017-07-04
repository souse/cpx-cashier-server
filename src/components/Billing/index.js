import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import {Form, Select, DatePicker, Table, Row, Col, Button, notification,Input } from 'antd';
import moment from 'moment';

import api from '../../api';
import { getUser } from '../../utils';
import * as billing from '../../actions/billing';
import * as orderDetail from '../../actions/orderDetail';
import * as tables from '../../actions/tables';

import BillOrderDetail from '../BillOrderDetail';
import Refresh from '../Refresh';

import './index.less';

const FormItem = Form.Item;
const Option = Select.Option;
const Search=Input.Search;
const columns = [
	{
		width: '20%',
		title: '单号',
		dataIndex: 'order_id',
		className: 'orderId'
	},
	{
		width: '10%',
		title: '桌号',
		dataIndex: 'table_name',
		className: 'areaName'
	},
	{
		width: '9%',
		title: '消费金额',
		dataIndex: 'amount',
		className: 'amount'
	},
	{
		width: '9%',
		title: '优惠金额',
		dataIndex: 'discount_amount',
		className: 'discountAmount'
	},
	{
		width: '9%',
		title: '应收金额',
		dataIndex: 'receive_amount',
		className: 'receive_amount'
	},
	{
		width: '7%',
		title: '状态',
		dataIndex: 'status',
		className: 'status',
		render: (text, record, index) => {
			const ps = record.pay_status;
			const txt = ps == 0 ? '未结账' : ps == 1 ? '已结账' : '作废';

			return (
				<span>{txt}</span>
			)
		} 
	},
	{
		width: '10%',
		title: '收银员',
		dataIndex: 'cashier_name',
		className: 'cashierName'
	},
	{
		width: '10%',
		title:'操作',
		dataIndex:'is_delete',
		className:'className',
		render: (text, record, index) => {
			const ps = record.is_delete;
			const txt = ps == '0' ? '正常单' :'作废单';

			return (
				<span>{txt}</span>
			)
		} 
	},
	{
		width:'16%',
		title:'支付方式',
		dataIndex:'pay_channel',
		className:'pay_channel'
	}

];


class Billing extends Component{
	constructor(props) {
		super(props);
		this.state = {
			hasBilled: 0,
			cashiers: [],
			yScroll: window.innerHeight - 275,
			isdelete:'',  //账单是否作废
			nowdate:'',  //当前日期
			currentTableId:''  //要进入的桌号id值
		};

		this.handleRefresh = this.handleRefresh.bind(this);

		this.handleChangeDate = this.handleChangeDate.bind(this);
		this.handleChangeStatus = this.handleChangeStatus.bind(this);
		this.handleChangeCashier = this.handleChangeCashier.bind(this);

		this.handleSearch = this.handleSearch.bind(this);
		this.onRowClick = this.onRowClick.bind(this);
		this.handleChangeAction=this.handleChangeAction.bind(this);
		this.startSearch=this.startSearch.bind(this);
	}

	componentWillMount() {
		this.props.clearFood();
	}

	componentDidMount() {
		const user = getUser();
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
        console.log(data);
		this.handleSearch({
			date: date,
			pay_status: data.status,
			cashier_id: data.cashier
		});
		//请求服务员列表
		let pomise = api.post('/get_cashier.json', { data: user });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					this.setState({ cashiers: resolved.data });					
				}else {
					if (resolved.code == '20001' || resolved.code == '20002') {
						window.location.href = origin;
						return;
					}
					notification.error({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});	
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected......', rejected);
			}
		);
		this.setState({nowdate:date})
	}

	handleChangeDate(date, dateString) {
		const data = this.props.form.getFieldsValue();
		this.handleSearch({
			date: dateString,
			pay_status: data.status,
			cashier_id: data.cashier
		});
	}

	handleChangeStatus(value) {
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		console.log(data)
		this.handleSearch({
			date: date,
			pay_status: value,
			cashier_id: data.cashier
		});
	}

	handleChangeCashier(value) {
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');

		this.handleSearch({
			date: date,
			pay_status: data.status,
			cashier_id: value
		});
	}

	handleSearch(obj) {
		const user = getUser();

		this.props.getBillingList({
			...user,
			...obj,
			origin: 'pc'
		});
	}
	startSearch(value){
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		this.handleSearch({
			date: date,
			pay_status: data.status,
			cashier_id: data.cashier,
			keyword:value
		});
	}

	onRowClick(record, index) {
		const user = getUser();
		//如果没有结账 跳转到对应的桌子，详情页面  pay_status 0 未结账
		if (record.pay_status == 0) {

			//重新设置currentTableId 查询新订单信息
			this.props.setCurrentTable(record.table_id);

			this.context.router.push('/cashier/choosetable');
		}

		//根据订单号获取订单详情
		this.props.searchFood({
			...user,
			order_id: record.order_id,
			table_id: record.table_id
		});
		this.setState({
			hasBilled: record.pay_status,
			isdelete:record.is_delete,
			currentTableId:record.table_id
		});

	}

	handleRefresh() {
		//点击结账界面的刷新
		const user = getUser();
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		this.props.getBillingList({
			...user,
			origin: 'pc',
			date:date

		});

	}

	handleChangeAction(value){
		// 正常单 作废单的选择
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		this.handleSearch({
			date: date,
			pay_status: data.status,
			cashier_id: data.cashier,
			is_delete:value
		});
		
	}
	render() {
		const { billlist } = this.props.billing;
		const { getFieldDecorator } = this.props.form;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		const { cashiers } = this.state;

		return (
			<div className="billing">
				<BillOrderDetail hasBilled={this.state.hasBilled} hasdelete={this.state.isdelete} nowdate={this.state.nowdate} currentTableId={this.state.currentTableId}{...this.props} />
				<Row type="flex" align="top" className="cash-controls">
					<div className="billlist">
						<div className="conditions">
							<Form
						        horizontal
						        className="ant-advanced-search-form"
						    >
						    <Col span={6} >
						    	<FormItem {...dateItemLayout} label={'日期'}>
						            {getFieldDecorator('date', {initialValue: moment()})(
						           		<DatePicker 
											size="large"
											showToday={false}
											format={'YYYY-MM-DD'}
											onChange={this.handleChangeDate}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>
						    </Col>
						    <Col span={6}>
						    	<FormItem {...formItemLayout} label={'状态'}>
						    		{getFieldDecorator('status', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeStatus}>
						           			<Option value="">全部</Option>
						           			<Option value="0">未结账</Option>
						           			<Option value="1">已结账</Option>
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={6} className="c-cashier">
						    	<FormItem {...formItemLayout} label={'收银员'}>
						    		{getFieldDecorator('cashier', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeCashier}>
						           			<Option value="">全部</Option>
						           			{cashiers.map((cashier, key) => 
												<Option key={key} value={cashier.username}>{cashier.name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={6}>
						    	<FormItem {...formItemLayout} label={'操作'}>
						    		{getFieldDecorator('action', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeAction}>
						           			<Option value="">全部</Option>
						           			<Option value="0">正常单</Option>
						           			<Option value="1">作废单</Option>
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
							</Form>
						</div>
					    <div className="middlemsg"><span>总金额 : {billlist.amount_model&&billlist.amount_model.totalamount}</span><span>未付金额 : {billlist.amount_model&&billlist.amount_model.totalunpaidamount}</span><span>已付金额 : {billlist.amount_model&&billlist.amount_model.totalpaidamount}</span></div>
					    <div className="searchbill"> <Search placeholder="输入桌号" onSearch={this.startSearch}/></div>
						<div className="bill-table billdtyle">
							<Table
								bordered
								scroll={{ y: this.state.yScroll, x:true }}
								columns={columns} 
								pagination={false} 
								dataSource={billlist.history_orderlist}
								onRowClick={this.onRowClick}
								key={Math.random()}
							/>	
						</div>	
					</div>
					<Refresh 
						parentDom={`ant-table-body`}
						currentDom={`ant-table-tbody`}
						{...this.props} 
						handleRefresh={this.handleRefresh} 
						handlebtn={true}
					/>	
				</Row>
			</div>
		)
	}
}

Billing.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

Billing = Form.create()(Billing);

const mapStateToProps = (state) => {
	return {
		billing: state.billing,
		tables: state.tables,
		orderDetail: state.orderDetail
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...billing, ...orderDetail, ...tables}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Billing);


