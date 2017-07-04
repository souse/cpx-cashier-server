import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification ,Input} from 'antd';
import moment from 'moment';

import SticNav from '../SticNav';
import SticRefresh from '../SticRefresh';
import { getUser } from '../../utils';
import api from '../../api';

import './index.less';

// 11111111统计菜品销售数据的展示
const columns = [
	{
		width: '7%',
		title: '序号',
		dataIndex: 'row_number',
		className: 'row_number'
	},
	{
		width: '19%',
		title: '分类',
		dataIndex: 'category_name',
		className: 'category_name'
	},
	{
		width: '30%',
		title: '菜名',
		dataIndex: 'dish_name',
		className: 'dish_name'
	},
	{
		width: '10%',
		title: '销量',
		dataIndex: 'dish_number',
		className: 'dish_number'
	},
	{
		width: '10%',
		title: '单价',
		dataIndex: 'unit_price',
		className: 'unit_price'
	},
	{
		width: '12%',
		title: '折扣金额',
		dataIndex: 'discount_amount',
		className: 'discount_amount'
	},
	{
		width: '12%',
		title: '应收金额',
		dataIndex: 'receive_amount',
		className: 'receive_amount'
	}
];

const FormItem = Form.Item;
const Option = Select.Option;
const Search=Input.Search;


class DailydishData extends Component {
	constructor(props) {
		super(props);
		this.state={
			dishlist:[],
			dishdetails:[],
			sortnum:true,
			sortmoney:false,
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
        let pomisetable = api.get('/get_dish_category.json',{ params:user});
		pomisetable.then((data)=>{
    		this.setState({dishdetails:data.data});
        }, (error)=>{
        	console.log(error);
        });
         // 获取服务员接口数据
	    const newobjtwo={
	    	...user,
	    	type:1
	    }
        let pomise = api.get('/get_waiters.json',{ params:newobjtwo});
		pomise.then((data)=>{
    		this.setState({fwpreople:data.data});
    		console.log(data);
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
        let pomisetable = api.get('/statistics/dishes.json',{ params:recordobj});
		pomisetable.then((data)=>{
    		this.setState({dishlist:data.data});
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
    	console.log("导出excel表");
    	const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
		console.log(origin);
	    const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI =DoMain+'/api';
    	const data = this.props.form.getFieldsValue();
    	if (data.date) {
    		let date = data.date.format('YYYY-MM-DD');
    		window.location.href=baseURI+"/statistics/dishes_toexcel.json?date="+date+'&category_id='+data.cashier;
    	}else{
    		let date='';
    		window.location.href=baseURI+"/statistics/dishes_toexcel.json?date="+date+'&category_id='+data.cashier;
    	}
		
        
    
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
	  this.setState({sortnum:!this.state.sortnum});
	  this.setState({sortmoney:false});
        
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
		this.setState({sortmoney:!this.state.sortmoney});
		this.setState({sortnum:false});
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
		const hhwsortnum=this.state.sortnum;
		const hhwsortmoney=this.state.sortmoney;
		const msglist=this.state.dishlist;
		return (
			<div className="daystic daydishddt">
			    <SticNav activeId={0} />
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
					<div className="totalmesg">
						<ul>
							<li>菜品消费总额: {msglist.strTotal&&msglist.strTotal.totalamount}</li>
							<li>退菜数量: { msglist.strTotal&&msglist.strTotal.totalcacel}</li>
							<li>菜品折扣总额: {msglist.strTotal&&msglist.strTotal.totaldiscount}</li>
							<li>菜品销费总数: {msglist.strTotal&&msglist.strTotal.totaldishNum}</li>
							<li>赠菜数量: {msglist.strTotal&&msglist.strTotal.totalpresent}</li>
							<li>菜品销售总额: {msglist.strTotal&&msglist.strTotal.totalreceive}</li>
						</ul>
					</div>
					<div className="bill-table dailydish">
						<Table 
							bordered
							columns={columns} 
							pagination={false} 
							dataSource={this.state.dishlist.dishes}
							scroll={{y:488}}
						/>
					</div>
					<SticRefresh showback={false} 
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
DailydishData = Form.create()(DailydishData);

export default DailydishData;



