
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification,Input } from 'antd';
import moment from 'moment';

import SticRefresh from '../SticRefresh';
import api from '../../api';
import { getUser } from '../../utils';

import './index.less';

//777777 统计模块中的操作日志

const FormItem = Form.Item;
const Option = Select.Option;
const Search=Input.Search;

const columns=[
   {
      width:'3%',
      title:'操作时间',
      dataIndex: 'date',
      key:'date'
   },
   {
      width:'3%',
      title:'操作人员',
      dataIndex: 'create_by',
      key: 'create_by'
   },
   {
      width:'3%',
      title:'日志类型',
      dataIndex: 'subject',
      key: 'subject'
   },
    {
      width:'4%',
      title:'日志描述',
      dataIndex: 'content',
      key: 'content'
   },
    {
      width:'3%',
      title:'机器识别',
      dataIndex: 'device_id',
      key: 'device_id'
   }
];
const user = getUser();
const comList=[];
class DailyHandle extends Component {
	constructor(props) {
		super(props);
		this.state={
			handledetail:[]
		}
		this.handleStartOpenChange=this.handleStartOpenChange.bind(this);
		this.handleEndOpenChange=this.handleEndOpenChange.bind(this);
		this.startSearch=this.startSearch.bind(this);
		this.loadmsg=this.loadmsg.bind(this);
		this.handleRefresh=this.handleRefresh.bind(this);
	}
	componentDidMount(){
	    const data = this.props.form.getFieldsValue();
		this.loadmsg({
			start_date:data.date.format('YYYY-MM-DD'),
 			end_date:data.dateone.format('YYYY-MM-DD')
		})
	}
	handleChangeStatus(value) {
		
	}

	startSearch(value){
        const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const dateend=data.dateone.format('YYYY-MM-DD');
 		const recordobj={
 			...user,
 			start_date:datestart,
 			end_date:dateend,
 			keyword:value

 		}
        this.loadmsg(recordobj);
		
	}
	loadmsg(obj){
		const user = getUser();
 		const recordobj={
 			...user,
 			...obj
 		}
        let pomisetable = api.get('/get_operate_logs.json',{ params:recordobj});
		pomisetable.then((data)=>{
    		this.setState({handledetail:data.data.list});
        }, (error)=>{
        	console.log(error);
        });
	}
	handleStartOpenChange(value){
        const data = this.props.form.getFieldsValue();
		const datesend=data.dateone.format('YYYY-MM-DD');
	    const recordobj={
 			...user,
 			start_date:value,
 			end_date:datesend
 		}
		this.loadmsg(recordobj);
	}
	handleEndOpenChange(value){
		const data = this.props.form.getFieldsValue();
		const datestart=data.date.format('YYYY-MM-DD');
	    const recordobj={
 			...user,
 			start_date:datestart,
 			end_date:value
 		}
		this.loadmsg(recordobj);
	}
	
	handleRefresh(){

	}

	render() {
		
		const { getFieldDecorator } = this.props.form;
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		return (
			<div className="comprehensive">
			    <Row type="flex" justify="start" className="condition">
			    		<Form
					        horizontal
					        className="ant-advanced-search-form"
					    >
					    	<Col span={4} >
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
											pagination={true}
											onChange={this.handleEndOpenChange}
											allowClear={false}
										/> 		
						            )}
					        	</FormItem>	
					    	</Col>
						    <Col span={7} className="teshu">
								 <Search placeholder="输入日志类型，日志内容，操作人员等" onSearch={this.startSearch}/>
						    </Col>
					   </Form>
			    </Row>
                 <div className="toalform handleday">
     				<Table 
							bordered
							columns={columns} 
							dataSource={this.state.handledetail}
							pagination={true}
						/>
                 </div>
                <SticRefresh 
                   sellAountshow={false} 
                   sellprice={false} 
                   showback={true} 
                   handlebtn={false} 
                   exetofille={false}
                   handleRefresh={this.handleRefresh}
                    />
			</div>	
		)
	}
}
DailyHandle.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

DailyHandle = Form.create()(DailyHandle);




export default DailyHandle;


