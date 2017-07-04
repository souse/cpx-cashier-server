import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Form, Input, Select, Icon, Row, Col, Button, notification} from 'antd';
import api from '../../api';
import { objToString, getUser } from '../../utils';

import OrderDetail from '../OrderDetail';
import Refresh from '../Refresh';
import TableArea from '../TableArea';
import KeyBoard from '../KeyBoard';

import * as tables from '../../actions/tables';
import * as getTableArea from '../../actions/tableArea';
import * as orderDetail from '../../actions/orderDetail';

import './index.less';

let user;
const FormItem = Form.Item;
const Option = Select.Option;

const reg = /^[0-9]*$/;

class OpenTable extends Component {

	constructor(props) {
		super(props);
		this.state = {
			id : '',
			inputValue: '',
			personNo: '',
			phoneNumber: ''	
		};

		user = getUser();

		this.onPress = this.onPress.bind(this);
		this.checkNumber = this.checkNumber.bind(this);
		//this.triggleBoard = this.triggleBoard.bind(this);
		this.handleClearPay = this.handleClearPay.bind(this);
		this.handleCancle = this.handleCancle.bind(this);
		this.handleConfirm = this.handleConfirm.bind(this);
		//this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		//开桌后 跳转到点菜页面，点击返回 BUG
		const { tables } = this.props.tables;
		const { tableId } = this.props.params;

		for (var i = 0; i < tables.length; i++) {
			const table = tables[i];

			if (tableId == table.table_id && table.status == 1) {//已开桌
				this.context.router.push('/cashier/choosetable');
				break;
			}
		};
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
	      	if (!err) {
	        	console.log('Received values of form: ', values);
	      	}
	    });
	}

	triggleBoard(e) {
		const id = e.target.id;

		this.setState({ id: id });	
	}

	onPress(value, backspace) {
		const { setFieldsValue, getFieldValue } = this.props.form;
		const keyId = this.state.id;
		let currentValue;

		if ( keyId == '') return;
		currentValue = getFieldValue(keyId);
		if (backspace) {//删除一个值
			currentValue = currentValue.substr(0, currentValue.length - 1);		
		} else {
			currentValue += value;
		}
		setFieldsValue({ [keyId]: currentValue });
		//this.setState({ inputValue: currentValue });
	}

	handleClearPay() {
		const { setFieldsValue } = this.props.form;
		const keyId = this.state.id;
		
		setFieldsValue({ [keyId]: '' });
	}

	handleCancle() {
		this.context.router.push('/cashier/choosetable');
	}

	handleConfirm() {
		const data = this.props.form.getFieldsValue();
		const tableId = this.props.params.tableId;
		let obj = {
			...user,
			person_count: data.personNo,
			table_id: tableId,
			remarks: data.remarks || '' 
		};
		
		let pomise = api.post('/place_table.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
					//更新currentTable, 然后请求订单信息，并且更新订单信息
					this.props.setCurrentTable(tableId);
					this.props.searchFood({
						...user,
						order_id: '',
						table_id: tableId,
					});	
					//this.context.router.push('/cashier/choosetable');	
					//更新桌子信息
					// this.props.getTables({
					// 	...user,
					// 	area_id: '',
					// 	status: 0
					// });
					this.context.router.push('/cashier/ordered');
				}else {
					notification.error({
		              	message: '开桌失败！',
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

	checkNumber(rule, value, callback) {
		const form = this.props.form;
		
		if (value && !reg.test(value)) {
			 callback('格式必须为数字！');
		}	
		callback();
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = {
	      	labelCol: { span: 4 },
	      	wrapperCol: { span: 15 },
	    };

		return (
			<div>
				<OrderDetail />
				<Row type="flex" justify="end" className="cash-controls">
					<Row type="flex" justify="start" className="cash-control">
						<div className="cashs">
							<div className="opentable">
								<div className="tablemessage">
									<Form layout="horizontal" onSubmit={this.handleSubmit}>
										<FormItem className="form-title"
								          	{...formItemLayout}
								          	label="桌台"
								        >
								          	<span className="table-name">{this.props.params.tableName}号桌</span>
								        </FormItem>
										<FormItem className="form-input"
								          	{...formItemLayout}
								          	label="人数"
								        >
								          	{getFieldDecorator('personNo', { 
								          		initialValue: '', 
								          		rules: [ {required: true, message: '人数不能为空'} ] 
								          	})(
								            	<Input id="personNo" placeholder="输入人数" autoFocus onFocus={(e) => this.triggleBoard(e)} onPaste={()=>false} />
								          	)}
								        </FormItem>
								        <FormItem className="form-input"
								          	{...formItemLayout}
								          	label="姓名"
								        >
								          	{getFieldDecorator('personName', { initialValue: '' })(
								            	<Input id="personNameone" className="personnaem" placeholder="输入姓名" onFocus={(e) => this.triggleBoard(e)} onPaste={()=>false}/>
								          	)}
								        </FormItem>
								        <FormItem className="form-input"
								          	{...formItemLayout}
								          	label="电话"
								        >
								          	{getFieldDecorator('phoneNumber', { initialValue: '' })(
								            	<Input id="phoneNumber" placeholder="输入电话号码" onFocus={(e) => this.triggleBoard(e)} onPaste={()=>false}/>
								          	)}
								        </FormItem>
								        <FormItem className="form-input"
								          	{...formItemLayout}
								          	label="备注"
								        >
								          	{getFieldDecorator('remarks', { initialValue: '' })(
								            	<Input id="remarks" placeholder="备注信息" onFocus={(e) => this.triggleBoard(e)} onPaste={()=>false}/>
								          	)}
								        </FormItem>
										<FormItem className="form-input"
								          	{...formItemLayout}
								          	label="渠道"
								        >
											{getFieldDecorator('select', {
												initialValue: '0'
											})(
												<Select placeholder="订单渠道">
													<Option value="0">店内</Option>
												</Select>
											)}
								        </FormItem>
									</Form>
								</div>
								<KeyBoard 
									onPress={this.onPress}
									handleClearPay={this.handleClearPay}
									handleCancle={this.handleCancle}
									handleConfirm={this.handleConfirm} 
									btncanle={true}
									btnsure={true}
								/>	
							</div>	
						</div>
						<Refresh 
							{...this.props}
							showGoBackBtn={true} 
						/>	
					</Row>
					<TableArea {...this.props} isNotChooseTable={true} />
				</Row>
			</div>
		)
	}
}

OpenTable.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

OpenTable = Form.create()(OpenTable);

//export default OpenTable;
const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail,
		tables: state.tables,
		tableArea: state.tableArea		
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators({...orderDetail, ...getTableArea, ...tables}, dispatch);	
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenTable);

