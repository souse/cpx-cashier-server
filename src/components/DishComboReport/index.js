import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification ,Input} from 'antd';
import moment from 'moment';

import SticNav from '../SticNav';
import SticRefresh from '../SticRefresh';
import { getUser, getExportString } from '../../utils';
import api from '../../api';

import './index.less';

const columns = [
	{
		width: '15%',
		title: '菜品名称',
		dataIndex: 'dish_name',
		className: 'dish_name'
	},
	{
		width: '6%',
		title: '菜品类别',
		dataIndex: 'category_name',
		className: 'category_name'
	},
	{
		width: '7%',
		title: '菜品编码',
		dataIndex: 'dish_identifier',
		className: 'dish_identifier'
	},
	{
		width: '6%',
		title: '规格',
		dataIndex: 'norms_name',
		className: 'norms_name'
	},
	{
		width: '8%',
		title: '销售数量',
		dataIndex: 'unit_price',
		className: 'unit_price'
	},
	{
		width: '8%',
		title: '赠菜数量',
		dataIndex: 'is_present',
		className: 'is_present'
	},
	{
		width: '8%',
		title: '退菜数量',
		dataIndex: 'cancel_number',
		className: 'cancel_number'
	},
	{
		width: '8%',
		title: '套餐价',
		dataIndex: 'package_price',
		className: 'package_price'
	},
	{
		width: '8%',
		title: '消费金额',
		dataIndex: 'amount',
		className: 'amount'
	},
	{
		width: '8%',
		title: '折扣金额',
		dataIndex: 'discount_amount',
		className: 'discount_amount'
	},
	{
		width: '8%',
		title: '销售金额',
		dataIndex: 'receive_amount',
		className: 'receive_amount'
	},
	{
		width: '10%',
		title: '今日收入比例',
		dataIndex: 'cancel_remarks',
		className: 'cancel_remarks'
	}
];

const FormItem = Form.Item;
const Option = Select.Option;
const Search=Input.Search;


class DishComboReport extends Component {
	constructor(props) {
		super(props);
		this.state={
			dishlist:[],
			dishdetails:[],
			sortnum: true,
			sortmoney: false,
			fwpreople:[]    //存放服务员列表
		}
	    this.handleChangeDate=this.handleChangeDate.bind(this);
	    this.handleChangeStatus=this.handleChangeStatus.bind(this);
	    this.handleChangeCashier=this.handleChangeCashier.bind(this);
	    this.loadifno=this.loadifno.bind(this);
	    this.startSearch=this.startSearch.bind(this);
	    this.handleRefresh=this.handleRefresh.bind(this);
	    this.orderBySellAmount=this.orderBySellAmount.bind(this);
	    this.orderByMoney=this.orderByMoney.bind(this);
	    this.exportExcel=this.exportExcel.bind(this);
	    this.handleChangePeople=this.handleChangePeople.bind(this);
	}
	componentDidMount(){
        const user=getUser();
        let pomisetable = api.get('/get_dish_category.json',{ params: user });

		pomisetable.then((data)=>{
    		this.setState({ dishdetails: data.data });
        }, (error)=>{
        	console.log(error);
        });
         // 获取服务员接口数据
	    const newobjtwo={ ...user, type: 1 };
        let pomise = api.get('/get_waiters.json',{ params:newobjtwo});

		pomise.then((data)=>{
    		this.setState({fwpreople:data.data});
        }, (error)=>{
        	console.log(error);
        });


		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		this.loadifno({
			date: date,
			pay_status: data.status,
			category_id: data.cashier,
			sort_field:'dish_number',
			sort_way:'desc',
			waiter_id:data.cashpeople
		});

	}
	loadifno(str){
		const user=getUser();
        const recordobj={
        	...user,
        	...str
        };
        let pomisetable = api.get('/statistics/statistic_package.json',{ params:recordobj});
		pomisetable.then((data)=>{
    		this.setState({ dishlist: data.data });
        }, (error)=>{
        	console.log(error);
        });
	}
	handleChangeDate(date, dateString){
        const data = this.props.form.getFieldsValue();
        this.loadifno({
        	 date:dateString,
        	 pay_status: data.status,
			 category_id: data.cashier,
			 waiter_id:data.cashpeople
        })
	}
	handleChangeStatus(value){
		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		 this.loadifno({
        	 date:date,
        	 pay_status: value,
			 category_id: data.cashier,
			 waiter_id:data.cashpeople
        })
	}
	handleChangeCashier(value){
        const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');
         this.loadifno({
        	 date:date,
        	 pay_status: data.status,
			 category_id: value
        })
    }
    startSearch(value){
    	const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');
    	 this.loadifno({
    	 	 date:date,
        	 keyword:value,
        	 category_id: data.cashier
        })
    }
    handleRefresh(){
    	const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');
         this.loadifno({
        	 date:date,
        	 pay_status: data.status,
			 category_id: data.cashier
        })
    }
    exportExcel(){
    	const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
	    const DoMain = NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI = DoMain+'/api';
    	const data = this.props.form.getFieldsValue();
    	const date = data.date ? data.date.format('YYYY-MM-DD') : '';
    	const user = getUser();
    	const { sortnum, sortmoney } = this.state;
    	const sendObj = { ...user, ...data, ...{ date: date } };
    	const str = getExportString(sendObj);

    	window.location.href = baseURI + '/statistics/statistic_package_toexcel.json?' + str;
    }
    // 销量排序
    orderBySellAmount(){
    	const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');

		this.loadifno({
    	 	date:date,
		 	category_id: data.cashier,
		 	sort_field:'dish_number',
		 	sort_way:'desc'
		});
	  	this.setState({ sortnum: !this.state.sortnum });
	  	this.setState({ sortmoney: false });
    }
    // 金额排序
    orderByMoney(){
    	const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');
		this.loadifno({
			date:date,
			category_id: data.cashier,
			sort_field:'receive_amount',
			sort_way:'desc'
		});
		this.setState({ sortmoney: !this.state.sortmoney });
		this.setState({ sortnum: false });
    }
    handleChangePeople(value){
    	const data = this.props.form.getFieldsValue();	
        const date = data.date.format('YYYY-MM-DD');
         this.loadifno({
			date:date,
			pay_status: data.status,
			category_id: data.cashier,
			waiter_id:value
        })
    }
	render() {
		const { getFieldDecorator } = this.props.form;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };

		const list = [];
		const hhwsortnum = this.state.sortnum;
		const hhwsortmoney = this.state.sortmoney;
		const msglist = this.state.dishlist;

		return (
			<div className="daystic daydishddt refund-report">
			    <SticNav activeId={7} />
				<Row type="flex"  className="cash-controls dishdatehh">
					<Row type="flex" justify="start" className="condition">
						<Form
					        layout="horizontal"
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
					    	
						    <Col span={5} className="c-cashier">
						    	<FormItem {...formItemLayout} label={'分类'}>
						    		{getFieldDecorator('cashier', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeCashier}>
						           		<Option value="">全部</Option>
						           			{this.state.dishdetails.map((cashier, key) => 
												<Option key={key} value={cashier.category_id.toString()}>{cashier.name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						     <Col span={5} className="c-cashier casproe">
						    	<FormItem {...formItemLayout} label={'服务员'}>
						    		{getFieldDecorator('cashpeople', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangePeople}>
						           		<Option value="">全部</Option>
						           		{this.state.fwpreople.map((cashier, key) => 
												<Option key={key} value={cashier.username.toString()}>{cashier.name}</Option>	
											)}
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						     <Col span={6} className="teshu">
								 <Search placeholder="输入菜品名称或编码" onSearch={this.startSearch}/>
						    </Col>
						    
						</Form>    
					</Row>
					<div className="totalmsg">
						<ul>
							<li>退菜数量: { msglist.strTotal && msglist.strTotal.totalcancel }</li>
							<li>退菜总金额: { msglist.strTotal && msglist.strTotal.totalamount }</li>
						</ul>
					</div>
					<div className="bill-table dailydish">
						<Table 
							bordered
							columns={columns} 
							pagination={false} 
							dataSource={this.state.dishlist.packagedishes}
							scroll={{ y: 488 }}
						/>
					</div>
					<SticRefresh 
						showback={false} 
						sellAountshow={true} sellprice={true} 
						handleRefresh={this.handleRefresh} 
						exportExcel={this.exportExcel}
						orderBySellAmount={this.orderBySellAmount}
						orderByMoney={this.orderByMoney}
						sortnum={hhwsortnum}
						sortmoney={hhwsortmoney}
						exetofille={true}
		            />
				</Row>
			</div>	
		)
	}
}
DishComboReport = Form.create()(DishComboReport);

export default DishComboReport;



