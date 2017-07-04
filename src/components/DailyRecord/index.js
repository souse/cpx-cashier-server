//班结日志
import React, { Component } from 'react';
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

// 数据统计中的 班结日志
const columns = [
	{
		title: '交接班人员',
		dataIndex: 'shift_people',
		className: 'shift_people'
	},
	{
		title: '开始时间',
		dataIndex: 'start_time',
		className: 'start_time'
	},
	{
		title: '交班时间',
		dataIndex: 'shift_time',
		className: 'shift_time'
	},
	{
		title: '备用金/元',
		dataIndex: 'imprest',
		className: 'imprest'
	},
	{
		title: '营业收入/元',
		dataIndex: 'receive_amount',
		className: 'receive_amount'
	},
	{
        title:'交接金额/元',
        dataIndex:'shift_amount',
        className:'shift_amount'
	},
	{
		title: '机器识别',
		dataIndex: 'device_id',
		className: 'device_id'
	},
	{
		title: '交班备注',
		dataIndex: 'remarks',
		className: 'remarks'
	}
];

const FormItem = Form.Item;
const Option = Select.Option;

class DailyRecord extends Component {
	constructor(props) {
		super(props);
		this.state = {
			shitInfo:{}, // 班结表左边的数据
			tableInfo:[],
			peopledetail:[],
			leftshow:false,
			msglist:[],   //账单，营业收入 支付方式数据
			shopname:''   //店铺名字

		}
		this.onRowClick=this.onRowClick.bind(this);
		this.handleChangeStartDate=this.handleChangeStartDate.bind(this);
		this.handleChangeEndDate=this.handleChangeEndDate.bind(this);
		this.handleChangeStatus=this.handleChangeStatus.bind(this);
		this.loadmessage=this.loadmessage.bind(this);
		this.printshit=this.printshit.bind(this);
		this.exportExcel=this.exportExcel.bind(this);
		this.handleRefresh=this.handleRefresh.bind(this);
	}

	componentDidMount(){
		const user=getUser();
		const newobj={
			...user,
			type:2
		};
		const data = this.props.form.getFieldsValue();
        let pomisetable = api.get('/get_waiters.json',{ params:newobj});
		pomisetable.then((data)=>{
    		this.setState({peopledetail:data.data});
        }, (error)=>{
        	console.log(error);
        });
        
        this.loadmessage({
        	 start_date:data.date.format('YYYY-MM-DD'),
          	 end_date:data.datetwo.format('YYYY-MM-DD'),
        });
	}
	loadmessage(str){
		//获取交班表格的数据
		const user=getUser();
        const recordobj={
        	...user,
        	...str
        };
        let pomisetable = api.get('/get_shift_record.json',{ params:recordobj});
		pomisetable.then((data)=>{
    		
    		for (var i = 0; i < data.data.list.length; i++) {
    			  data.data.list[i].start_time=formatDate(data.data.list[i].start_time);
    			  data.data.list[i].shift_time=formatDate(data.data.list[i].shift_time);
    		}
    		this.setState({tableInfo:data.data.list});
        }, (error)=>{
        	console.log(error);
        });
	}
	onRowClick(record, index){
       
       	const user=getUser();
       	this.setState({
       		leftshow:true
       	})
		const newparam={
			...user,
			shift_id:record.shift_id
		};
		let pomise = api.get('/get_shop_info.json',{ params:user});
		pomise.then((data)=>{
			this.setState({shopname:data.data.name});
			console.log(data.data.name);
        }, (error)=>{
        	console.log(error);
        });


		let pomisetable = api.get('/get_shift_info.json',{ params:newparam});
		pomisetable.then((data)=>{
    		this.setState({shitInfo:data.data,msglist:data.data.list});

        }, (error)=>{
        	console.log(error);
        });
	}
	handleChangeStartDate(date, dateString){
          const data = this.props.form.getFieldsValue();
          this.loadmessage({
          	   start_date:dateString,
          	   end_date:data.datetwo.format('YYYY-MM-DD'),
          	   people:data.status
          });
	}
	handleChangeEndDate(date, dateString){
		 const data = this.props.form.getFieldsValue();
          this.loadmessage({
          	   start_date:data.date.format('YYYY-MM-DD'),
          	   end_date:dateString,
          	   people:data.status
          });
	}
	handleChangeStatus(value){
		 const data = this.props.form.getFieldsValue();
		 this.loadmessage({
		 	   start_date:data.date.format('YYYY-MM-DD'),
          	   end_date:data.datetwo.format('YYYY-MM-DD'),
          	   people:value
          });
	}
	printshit(){
		// 点击打印交接班按钮，调取接口
    	const user=getUser();
    	const obj={
    		...user,
    		shift_id:this.state.shitInfo.shift_id
    	};
    	let promise=api.post('/print_shift_bill.json', { data: obj });
    	promise.then((data)=>{
    		 console.log("打印成功");
    	},(error)=>{
    		 console.log(error);
    	})
	}
	exportExcel(){
    	const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend = data.datetwo.format('YYYY-MM-DD');
		const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
	    const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI =DoMain+'/api';
        window.location.href=baseURI+"/get_shift_record_toexcel.json?start_date="+datestart+'&end_date='+dateend+'&people='+data.status;
	}
	handleRefresh(){
		// location.reload();
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		
		if (this.state.msglist[2]) {
			var listways=this.state.msglist[2].list;
		}else{
			var listways=[];
		}

		return (
			<div className="daystic">
			   {this.state.leftshow? <div className="DRleft">
			    	  <Row type="flex" justify="space-between" className="titletop">
			    	  	  <Col>交班表</Col>
			    	  	  <Col><Button onClick={this.printshit}>打印交班表</Button></Col>
			    	  </Row>
			    	  <h3>{this.state.shopname}</h3>
			    	  <div className="detalimsg">
			    	      <h3>账单汇总表</h3>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col span={12}>打印次数: {this.state.shitInfo.print_count}</Col>
				    	  	   <Col span={12}>最近打印: {this.state.shitInfo.last_print_time?this.state.shitInfo.last_print_time:0}</Col>
				    	  </Row>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col span={12}>交班员: {this.state.shitInfo.shift_people}</Col>
				    	  	   <Col span={12}>提交金额: {this.state.shitInfo.shift_amount}</Col>
				    	  </Row>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col>时间段: {formatDate(this.state.shitInfo.start_time)} -- {formatDate(this.state.shitInfo.shift_time)}</Col>
				    	  </Row>
				    	  <Row type="flex" justify="space-between" className='norstyle'>
				    	  	   <Col>交接备注: {this.state.shitInfo.remarks}</Col>
				    	  </Row>
			    	  </div>
			    	  <div className="msgtotal">
			    	  	  <div className="masgone">
			    	  	  	 <h3>账单合计:  <span>{this.state.msglist[0]&&this.state.msglist[0].total}单</span></h3>
			    	  	  	 <ul>
			    	  	  	    <li><span>店内单合计:</span><span>{this.state.msglist[0]&&this.state.msglist[0].list[0].total}单</span></li>
			    	  	  	 	<li><span>外卖单合计:</span><span>0单</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgtwo">
			    	  	  	 <h3>营业收入: <span>{this.state.msglist[1]&&this.state.msglist[1].total}元</span></h3>
			    	  	  	 <ul>
			    	  	  	 	<li><span>消费合计:</span><span>{this.state.msglist[1]&&this.state.msglist[1].list[0].total}元</span></li>
			    	  	  	 	<li><span>折扣合计:</span><span>{this.state.msglist[1]&&this.state.msglist[1].list[1].total}元</span></li>
			    	  	  	 	<li><span>赠送合计:</span><span>{this.state.msglist[1]&&this.state.msglist[1].list[2].total}元</span></li>
			    	  	  	 	<li><span>应收合计:</span><span>{this.state.msglist[1]&&this.state.msglist[1].list[3].total}元</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgthree">
			    	  	  	 <h3>支付方式: <span>{this.state.msglist[2]&&this.state.msglist[2].total}项</span></h3>
			    	  	  	 <ul>
			    	  	  	 	{(listways).map((ele,key)=><li key={key}><span>{ele.name}:</span><span>{ele.total}</span></li>)}
			    	  	  	 </ul>
			    	  	  </div>
			    	  </div>
			    </div>:<div className="tableleft"><div></div><p>选择要查看的班结表</p></div>}
			   

				<Row type="flex" align="top" className="cash-controls ">
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
					<div className="bill-table recordstyle">
						<Table 
							bordered
							columns={columns} 
							pagination={false} 
							dataSource={this.state.tableInfo}
							onRowClick={this.onRowClick}
							className="recordtable"
						/>
					</div>
					<SticRefresh showback={true}   exetofille={true}
								exportExcel={this.exportExcel}
								handleRefresh={this.handleRefresh}
								/>
				</Row>
			</div>	
		)
	}
}
DailyRecord = Form.create()(DailyRecord);

export default DailyRecord;




