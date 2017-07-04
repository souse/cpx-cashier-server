import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification,Input } from 'antd';
import moment from 'moment';

import SticNav from '../SticNav';
import SticRefresh from '../SticRefresh';
import api from '../../api';
import { getUser } from '../../utils';
import * as comprehensive from '../../actions/comprehensive';

import './index.less';

//33333333综合营业数据

const FormItem = Form.Item;
const Option = Select.Option;
const Search=Input.Search;

const columns=[
   {
      width:'6%',
      title:'单号',
      dataIndex: 'order_id',
      key:'order_id'
   },
   {
      width:'3%',
      title:'渠道',
      dataIndex: 'channel',
      key: 'channel'
   },
   {
      width:'3%',
      title:'桌号',
      dataIndex: 'table_name',
      key: 'table_name'
   },
    {
      width:'3%',
      title:'人数',
      dataIndex: 'curr_person',
      key: 'curr_person'
   },
    {
      width:'3%',
      title:'消费金额',
      dataIndex: 'amount',
      key: 'amount'
   },
    {
      width:'3%',
      title:'折扣金额',
      dataIndex: 'discount_amount',
      key: 'discount_amount'
   },
    {
      width:'3%',
      title:'应收金额',
      dataIndex: 'receive_amount',
      key: 'receive_amount'
   },
   {
   	  width:'4%',
   	  title:'支付方式',
   	  dataIndex:'pay_channel',
   	  key:'pay_channel'
   },
   {
      title:'特殊操作',
      children:[{
      	title:'反结账',
      	dataIndex:'reversed',
      	width:'2%',
      	key:'reversed'
      },
      {
      	title:'退菜',
      	dataIndex:'cancel',
      	width:'2%',
      	key:'cancel'
      },
      {
      	title:'折扣',
      	dataIndex:'discount',
      	width:'2%',
      	key:'discount'
      },
      {
      	title:'赠菜',
      	dataIndex:'give_away',
      	width:'2%',
      	key:'give_away'
      }
      ]
   },
    {
      title:'发票',
      children:[{
      	 title:'开票金额',
      	 dataIndex:'draw_bill_amount',
      	 width:'3%',
      	 key:'draw_bill_amount' 
      },{
      	title:'税率',
      	dataIndex:'bill_rate',
      	width:'2%',
      	key:'bill_rate'
      },{
      	title:'税额',
      	dataIndex:'taxes',
      	width:'2%',
      	key:'taxes'
      }]
   },
    {
      width:'5%',
      title:'服务员',
      dataIndex: 'waiter_name',
      key: 'waiter_name'
   },
    {
      width:'3%',
      title:'收银员',
      dataIndex: 'cashier_name',
      key: 'cashier_name'
   },
    {
      width:'3%',
      title:'机器识别',
      dataIndex: 'dog',
      key: 'dog'
   }

];
const user = getUser();
class DailyComprehensive extends Component {
	constructor(props) {
		super(props);

	    this.state={
	    	shouying:[],
	    	fwpreople:[],
	    	quList:[],
	    	arealist:[]
	    };
		this.handleChangeStatus = this.handleChangeStatus.bind(this);
		this.startSearch=this.startSearch.bind(this);
		this.handleStartOpenChange=this.handleStartOpenChange.bind(this);
		this.handleEndOpenChange=this.handleEndOpenChange.bind(this);

		this.handleChangestatusmoney=this.handleChangestatusmoney.bind(this);
		this.handleChangestatuspeople=this.handleChangestatuspeople.bind(this);
		this.handleChangestatusfan=this.handleChangestatusfan.bind(this);
		this.handleChangestatuspiao=this.handleChangestatuspiao.bind(this);
		this.handleChangestatusdao=this.handleChangestatusdao.bind(this);
		this.handleChangestatusyu=this.handleChangestatusyu.bind(this);
		this.handleChangestatusqi=this.handleChangestatusqi.bind(this);
		this.SearchInput=this.SearchInput.bind(this);
		this.exportExcel=this.exportExcel.bind(this);
		this.handleRefresh=this.handleRefresh.bind(this);
	}
	componentDidMount(){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend=data.dateone.format('YYYY-MM-DD');
		const newdate={
			 start_date:datestart,
			 end_date:dateend
		}
	    this.startSearch(newdate);

	    // 获取收银员接口数据
	    const user=getUser();
	    const newobj={
	    	...user,
	    	type:2
	    }
        let pomise = api.get('/get_waiters.json',{ params:newobj});
		pomise.then((data)=>{
    		this.setState({shouying:data.data});
        }, (error)=>{
        	console.log(error);
        });

        // 获取服务员接口数据
	    const newobjtwo={
	    	...user,
	    	type:1
	    }
        let pomisetable = api.get('/get_waiters.json',{ params:newobjtwo});
		pomisetable.then((data)=>{
    		this.setState({fwpreople:data.data});
    		console.log(data);
        }, (error)=>{
        	console.log(error);
        });

        // 获取渠道数据
        let pomisetab = api.get('/get_channels.json',{ params: user});
		pomisetab.then((data)=>{
    		this.setState({quList:data.data});
        }, (error)=>{
        	console.log(error);
        });


         // 获取区域数据
        let pomisetabl = api.get('/get_areas.json',{ params: user});
		pomisetabl.then((data)=>{
    		this.setState({arealist:data.data});
        }, (error)=>{
        	console.log(error);
        });
	}
	handleChangeStatus(value) {
		
	}

	startSearch(obj){
        const user = getUser();
		this.props.getcomprehensive({
				...user,
				...obj,
				page_size:100
		});
	}
	handleStartOpenChange(date, dateString){
		const data = this.props.form.getFieldsValue();
		const dateend=data.dateone.format('YYYY-MM-DD');
		const newdate={
			 start_date:dateString,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		};
		this.startSearch(newdate);
	}
	handleEndOpenChange(date, dateString){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const newdate={
			 start_date:datestart,
			 end_date:dateString,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		};
		this.startSearch(newdate);
	}
	handleChangestatusmoney(value){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:value,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	handleChangestatuspeople(value){
		 const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:value,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	handleChangestatusfan(value){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:value,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	handleChangestatuspiao(value){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:value,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	handleChangestatusdao(value){
        const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusdao,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:value,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	handleChangestatusyu(value){
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:value,
			 device_id:''
		});
	}
	handleChangestatusqi(value){
		
	}
	SearchInput(value){
		 // 点击搜索按钮以后的操作 或者回车以后的操作
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:'',
			 keyword:value
		});
	}
	exportExcel(){
		// 导出excel

		const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		const dateend=data.dateone.format('YYYY-MM-DD');
		const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
	    const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI =DoMain+'/api';
        window.location.href=baseURI+"/statistics/composite_toexcel.json?start_date="+date+"&end_date="+dateend+
        '&waiter_id='+data.statuspeople+
        '&cashier_id='+data.statusmoney+'&reversed='+data.statusfan+'&is_draw_bill='+data.statuspiao+'&channel='+data.statusdao+
        '&area_id='+data.statusyu;
	}
	handleRefresh(){
		// location.reload();
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.dateone.format('YYYY-MM-DD');
		this.startSearch({
			 start_date:datestart,
			 end_date:dateend,
			 waiter_id:data.statuspeople,
			 cashier_id:data.statusmoney,
			 reversed:data.statusfan,
			 is_draw_bill:data.statuspiao,
			 channel:data.statusdao,
			 area_id:data.statusyu,
			 device_id:''
		});
	}
	render() {
		
		const { getFieldDecorator } = this.props.form;
		const comList=this.props.comprehensive.comprehentable;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		return (
			<div className="comprehensive">
			    <Row type="flex" justify="start" className="condition">
			    		<Form
					        horizontal
					        className="ant-advanced-search-form"
					    >
					    	<Col span={4} className="compresive">
					    		<FormItem {...dateItemLayout} label={'日期'}>
						            {getFieldDecorator('date', {initialValue: moment()})(
						           		<DatePicker 
											size="large"
											showToday={false}
											format={'YYYY-MM-DD'}
											onChange={this.handleStartOpenChange}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>	
					    	</Col>
					    	<Col span={4} >
					    		<FormItem {...dateItemLayout} label={'日期'}>
						            {getFieldDecorator('dateone', {initialValue: moment()})(
						           		<DatePicker 
											size="large"
											showToday={false}
											format={'YYYY-MM-DD'}
											onChange={this.handleEndOpenChange}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>	
					    	</Col>
					    	<Col span={4}>
						    	<FormItem {...formItemLayout} label={'收银员'}>
						    		{getFieldDecorator('statusmoney', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatusmoney}>
						           			<Option value="">全部</Option>
						           			{this.state.shouying.map((cashier, key) => 
												<Option key={key} value={cashier.username.toString()}>{cashier.name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={4}>
						    	<FormItem {...formItemLayout} label={'服务员'}>
						    		{getFieldDecorator('statuspeople', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatuspeople}>
						           			<Option value="">全部</Option>
						           			{this.state.fwpreople.map((cashier, key) => 
												<Option key={key} value={cashier.username.toString()}>{cashier.name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={5} className="teshu">
								 <Search placeholder="输入单号" onSearch={this.SearchInput}/>
						    </Col>
					   </Form>
			    </Row>
			     <Row type="flex" justify="start" className="condition">
			          <Form
					        horizontal
					        className="ant-advanced-search-form"
					    >
					     <Col span={4} className="compressstyle">
						    	<FormItem {...formItemLayout} label={'反结账'}>
						    		{getFieldDecorator('statusfan', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatusfan}>
						           			<Option value="">全部</Option>
						           			<Option value="1">是</Option>
						           			<Option value="0">否</Option>
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={4}>
						    	<FormItem {...formItemLayout} label={'发票'}>
						    		{getFieldDecorator('statuspiao', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatuspiao}>
						           			<Option value="">全部</Option>
						           			<Option value="1">是</Option>
						           			<Option value="0">否</Option>
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={4}>
						    	<FormItem {...formItemLayout} label={'渠道'}>
						    		{getFieldDecorator('statusdao', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatusdao}>
						           			<Option value="">全部</Option>
						           			{this.state.quList.map((cashier, key) => 
												<Option key={key} value={cashier.name}>{cashier.name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={4}>
						    	<FormItem {...formItemLayout} label={'区域'}>
						    		{getFieldDecorator('statusyu', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatusyu}>
						           			<Option value="">全部</Option>
						           			{this.state.arealist.map((cashier, key) => 
												<Option key={key} value={cashier.area_id.toString()}>{cashier.area_name}</Option>	
											)}	
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						    <Col span={5}>
						    	<FormItem {...formItemLayout} label={'机器识别'}>
						    		{getFieldDecorator('statusqi', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangestatusqi}>
						           			<Option value="">全部</Option>
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
					    </Form>
			     </Row>
                 <div className="toalform">
     				<Table 
							bordered
							columns={columns} 
							dataSource={comList}
							// pagination={true}
						/>
                 </div>
                <SticRefresh 
                   sellAountshow={false} 
                   sellprice={false} 
                   showback={true}
                   handlebtn={false}
                   exportExcel={this.exportExcel}
                   handleRefresh={this.handleRefresh}
                    />
			</div>	
		)
	}
}
DailyComprehensive.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

DailyComprehensive = Form.create()(DailyComprehensive);

const mapStateToProps = (state) => {
	return {
		comprehensive: state.comprehensive
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...comprehensive}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DailyComprehensive);



