import React, { Component,PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification } from 'antd';
import moment from 'moment';

import DisciplineTable from '../DisciplineTable';
import SticRefresh from '../SticRefresh';
import { getUser } from '../../utils';
import api from '../../api';
import {formatDate} from '../../utils';

import './index.less';

// 数据统计中的   日结日志
const columns = [
	{
		title: '操作人员',
		dataIndex: 'people',
		className: 'people'
	},
	{
		title: '开始时间',
		dataIndex: 'start_time',
		className: 'start_time'
	},
	{
		title: '日结时间',
		dataIndex: 'daily_time',
		className: 'daily_time'
	},
	{
		title: '账单总数',
		dataIndex: 'order_number',
		className: 'order_number'
	},
	{
        title:'已结账单数',
        dataIndex:'checkout_number',
        className:'checkout_number'
	},
	{
		title: '未结账单数',
		dataIndex: 'uncheckout_number',
		className: 'uncheckout_number'
	},
	{
		title: '消费金额',
		dataIndex: 'amount',
		className: 'amount'
	},
	{
		title: '折扣金额',
		dataIndex: 'discount_amount',
		className: 'discount_amount'
	},
	{
        title:'抹零金额',
        dataIndex:'give_amount',
        className:'give_amount'
	},
	{
		title: '应收金额',
		dataIndex: 'receive_amount',
		className: 'receive_amount'
	},
	{
		title: '机器识别',
		dataIndex: 'device_id',
		className: 'device_id'
	}
];

const FormItem = Form.Item;
const Option = Select.Option;

class Dailydayout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			 daliylist:[],
			 detailmessage:{},   //获取每日营收数据
			 peopledetail:[], 
			 dayoutshow:false,
			 shopName:'',
			 dpmsglist:[]  //每日营收数据里的数组

		}
		this.onRowClick=this.onRowClick.bind(this);
		this.handleChangeStartDate=this.handleChangeStartDate.bind(this);
		this.handleChangeEndDate=this.handleChangeEndDate.bind(this);
		this.handleChangeStatus=this.handleChangeStatus.bind(this);
		this.dayoutclick=this.dayoutclick.bind(this);
		this.exportExcel=this.exportExcel.bind(this);
		this.handleRefresh=this.handleRefresh.bind(this);
	}

	componentDidMount(){
		const user=getUser();
		const data = this.props.form.getFieldsValue();
		const newobj={
			...user,
			type:2
		}
        let pomisetable = api.get('/get_waiters.json',{ params:newobj});
		pomisetable.then((data)=>{
    		this.setState({peopledetail:data.data});
        }, (error)=>{
        	console.log(error);
        });
	   this.searchmessage({
	   	   start_date:data.date.format('YYYY-MM-DD'),
           end_date:data.datetwo.format('YYYY-MM-DD')
	   });

	   let pomise = api.get('/get_shop_info.json', { params: {} });

		pomise.then(resolved => {
			if (resolved.code == 0) {
				const data = resolved.data;

				this.setState({ shopName: data.name });
			}
		}, rejected => {
			console.log('rejected...get_shop_info...');
		})
	}
	searchmessage(str){
		//获取交班表格的数据
		const user=getUser();
        const recordobj={
        	...user,
        	...str
        };
        let pomisetable = api.get('/get_daily_bill_record.json',{ params:recordobj});
		pomisetable.then((data)=>{

    		for (var i = 0; i < data.data.list.length; i++) {
    			  data.data.list[i].start_time=formatDate(data.data.list[i].start_time);
    			  data.data.list[i].daily_time=formatDate(data.data.list[i].daily_time);
    		}
    		this.setState({daliylist:data.data.list});
        }, (error)=>{
        	console.log(error);
        });
	}
	onRowClick(record, index){

		const user=getUser();
		const newparam={
			...user,
			daily_id:record.daily_id
		};
		let pomisetable = api.get('/get_daily_bill_info.json',{ params:newparam});
		pomisetable.then((data)=>{
    		this.setState({detailmessage:data.data,dpmsglist:data.data.list});
        }, (error)=>{
        	console.log(error);
        });
        this.setState({dayoutshow:true})
	}
	handleChangeStartDate(date, dateString){
		const data = this.props.form.getFieldsValue();
          this.searchmessage({
          	   start_date:dateString,
          	   end_date:data.datetwo.format('YYYY-MM-DD'),
          	   people:data.status
          });
	}
	handleChangeEndDate(date, dateString){
          const data = this.props.form.getFieldsValue();
          this.searchmessage({
          	   start_date:data.date.format('YYYY-MM-DD'),
          	   end_date:dateString,
          	   people:data.status
          });
	}
	handleChangeStatus(value){
		 const data = this.props.form.getFieldsValue();
		 this.searchmessage({
		 	   start_date:data.date.format('YYYY-MM-DD'),
          	   end_date:data.datetwo.format('YYYY-MM-DD'),
          	   people:value
          });
	}

	// 打印日结表
	dayoutclick(){
		const user=getUser();
		const newobj={
			...user,
			daily_id:this.state.detailmessage.daily_id
		};
		let promise=api.post('/print_daily_bill.json', { data: newobj });
    	promise.then((data)=>{
    		 console.log("打印成功");
    	},(error)=>{
    		 console.log(error);
    	})
	}
	exportExcel(){
		console.log("导出excel表");
    	const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.datetwo.format('YYYY-MM-DD');
		const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
	    const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI =DoMain+'/api';
        window.location.href=baseURI+"/get_daily_bill_record_toexcel.json?start_date="+datestart+'&end_date='+dateend+'&people='+data.status;
	}
	handleRefresh(){
		// location.reload();
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		if (this.state.dpmsglist[4]) {
			var listways=this.state.dpmsglist[4].list;
		}else{
			var listways=[];
		}
		return (
			<div className="daystic">
			   {this.state.dayoutshow?<div className="DPleft">
			    	  <Row type="flex" justify="space-between" className="titletop">
			    	  	  <Col>日结表</Col>
			    	  	  <Col><Button onClick={this.dayoutclick}>打印日结表</Button></Col>
			    	  </Row>
			    	  <h3>{this.state.shopName}</h3>
			    	  <div className="detalimsg">
			    	      <h3>账单汇总表</h3>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col span={12}>打印次数: {this.state.detailmessage.print_count}</Col>
				    	  	   <Col span={12}>最近打印: {this.state.detailmessage.last_print_time?formatDate(this.state.detailmessage.last_print_time):0}</Col>
				    	  </Row>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col>时间段: {formatDate(this.state.detailmessage.start_time)} -- {formatDate(this.state.detailmessage.daily_time)}</Col>
				    	  </Row>
			    	  </div>
			    	  <div className="msgtotal">
			    	  	  <div className="masgone">
			    	  	  	 <h3>账单合计:  <span>{this.state.dpmsglist[0]&&this.state.dpmsglist[0].total}单</span></h3>
			    	  	  	 <ul>
			    	  	  	    <li><span>已结账单数:</span><span>{this.state.dpmsglist[0]&&this.state.dpmsglist[0].list[1].total}单</span></li>
			    	  	  	 	<li><span>未结账单数:</span><span>{this.state.dpmsglist[0]&&this.state.dpmsglist[0].list[0].total}单</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgtwo">
			    	  	  	 <h3>应收金额合计: <span>{this.state.dpmsglist[1]&&this.state.dpmsglist[1].total}元</span></h3>
			    	  	  	 <ul>
			    	  	  	 	<li><span>消费合计:</span><span>{this.state.dpmsglist[1]&&this.state.dpmsglist[1].list[0].total}元</span></li>
			    	  	  	 	<li><span>折扣合计:</span><span>{this.state.dpmsglist[1]&&this.state.dpmsglist[1].list[1].total}元</span></li>
			    	  	  	 	<li><span>抹零合计:</span><span>{this.state.dpmsglist[1]&&this.state.dpmsglist[1].list[2].total}元</span></li>
			    	  	  	 	<li><span>应收合计:</span><span>{this.state.dpmsglist[1]&&this.state.dpmsglist[1].list[3].total}元</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgthree">
			    	  	  	 <h3>支付方式: <span>{this.state.dpmsglist[4]&&this.state.dpmsglist[4].total}项</span></h3>
			    	  	  	 <ul>
			    	  	  	 	{listways.map((ele,key)=><li key={key}><span>{ele.name}:</span><span>{ele.total}元</span></li>)}
			    	  	  	 </ul>
			    	  	  </div>
			    	  </div>
			    </div>:<div className="dayoutstyle"><div></div><p>选择要查看的日结表</p></div>}
				<Row type="flex" align="top" className="cash-controls">
					<Row type="flex" justify="start" className="condition">
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
											onChange={this.handleChangeStartDate}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>	
					    	</Col>
					    	<Col span={6} >
					    		<FormItem {...dateItemLayout} label={'日期'}>
						            {getFieldDecorator('datetwo', {initialValue: moment()})(
						           		<DatePicker 
											size="large"
											showToday={false}
											format={'YYYY-MM-DD'}
											onChange={this.handleChangeEndDate}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>	
					    	</Col>
					    	<Col span={8}>
						    	<FormItem {...formItemLayout} label={'交接班人员'}>
						    		{getFieldDecorator('status', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeStatus}>
						           			<Option value="">全部</Option>
						           			{this.state.peopledetail.map((cashier, key) => 
												<Option key={key} value={cashier.username}>{cashier.name}</Option>	
											)}
										</Select>	 		
						            )}
						    	</FormItem>
						    </Col>
						</Form>    
					</Row>
					<div className="bill-table dayoutable">
						<Table 
							bordered
							columns={columns} 
							pagination={false} 
							dataSource={this.state.daliylist}
							onRowClick={this.onRowClick}
						/>
					</div>
					<SticRefresh showback={true} exportExcel={this.exportExcel}  handleRefresh={this.handleRefresh}  exetofille={true}/>
				</Row>
			</div>	
		)
	}
}
Dailydayout = Form.create()(Dailydayout);

Dailydayout.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

export default Dailydayout;

