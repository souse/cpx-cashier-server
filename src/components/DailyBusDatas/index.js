import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Form, Select, DatePicker, Table, Row, Col, Button, notification } from 'antd';
import moment from 'moment';

import SticNav from '../SticNav';
import SticRefresh from '../SticRefresh';
import * as dailyRevenue from '../../actions/DailyRevenue';

import { getUser } from '../../utils';
import {formatDate} from '../../utils';

import './index.less';

//2222222每日营收信息展示

const FormItem = Form.Item;
const Option = Select.Option;

const columns=[
   {
      width:'3%',
      title:'菜品分类',
      dataIndex: 'name',
      key:'name'
   },
   {
      width:'3%',
      title:'收入金额',
      dataIndex: 'amount',
      key:'amount'
   },
   {
      width:'3%',
      title:'占比',
      dataIndex: 'proportion',
      key:'proportion'
   }

];
const columnstwo=[
   {
      width:'5%',
      title:'支付方式',
      dataIndex: 'name',
      key:'name'
   },
   {
      width:'5%',
      title:'支付金额',
      dataIndex: 'amount',
      key:'amount'
   },
   {
      width:'3%',
      title:'占比',
      dataIndex: 'proportion',
      key:'proportion'
   }

];
const columnsthree=[
   {
      width:'6%',
      title:'区域名称',
      dataIndex: 'name',
      key:'name'
   },
   {
      width:'6%',
      title:'开台次数',
      dataIndex: 'number',
      key:'number'
   },
   {
      width:'6%',
      title:'收入金额',
      dataIndex: 'amount',
      key:'amount'
   },
   {
      width:'3%',
      title:'占比',
      dataIndex: 'proportion',
      key:'proportion'
   }

];
const columnsfour=[
   {
      width:'6%',
      title:'渠道名称',
      dataIndex: 'name',
      key:'name'
   },
   {
      width:'6%',
      title:'订单数量',
      dataIndex: 'number',
      key:'number'
   },
   {
      width:'6%',
      title:'收入金额',
      dataIndex: 'amount',
      key:'amount'
   },
   {
      width:'3%',
      title:'占比',
      dataIndex: 'proportion',
      key:'proportion'
   }

];
const billlist=[];

class DailyBusDatas extends Component {
	constructor(props) {
		super(props);

		this.handleChangeDate=this.handleChangeDate.bind(this);
		this.exportExcel=this.exportExcel.bind(this);
		this.handleRefresh=this.handleRefresh.bind(this);
	}

	componentDidMount(){
		const user = getUser();
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		this.props.getDayDetail({
				...user,
				date:datestart
		});
	}
	handleChangeDate(date,datestring){
		const user=getUser();
		const data = this.props.form.getFieldsValue();
		// const datestart = data.date.format('YYYY-MM-DD');
		const newObj={
			...user,
			date:datestring
		}
		this.props.getDayDetail(newObj);
	}

	handleRefresh(){
	    const user=getUser();
		const data = this.props.form.getFieldsValue();
		const datestart = data.date.format('YYYY-MM-DD');
		const newObj={
			...user,
			date:datestart
		};
		this.props.getDayDetail(newObj);
	}

	//  返回按钮
	handleGoBack(){
	    
	}
	exportExcel(){
		console.log("导出excel表");
    	const data = this.props.form.getFieldsValue();
		const date = data.date.format('YYYY-MM-DD');
		const NODE_ENV = process.env.NODE_ENV;
		const origin = window.location.origin;
	    const DoMain=NODE_ENV == 'production' ? origin : 'http://192.168.8.2:8090';
		const baseURI =DoMain+'/api';
        window.location.href=baseURI+"/statistics/day_revenue_toexcel.json?date="+date;
	}
	render() {
		const { getFieldDecorator } = this.props.form;
		const  toalamout=this.props.dailyRevenue.dayToalDetail;
		if (toalamout.list) {
 			var mantdatil=toalamout.list[0].list;
 			var buystyle=toalamout.list[1].list;
 			var placelist=toalamout.list[2].list;
 			var methodlist=toalamout.list[3].list;
		}
		if (toalamout.list) {
			var zhifulist=toalamout.list[1].list.length;
			var quyulist=toalamout.list[2].list.length;
			var daolist=toalamout.list[3].list.length;
		}
		const dateItemLayout = { labelCol: { span: 7 }, wrapperCol: { span: 17 } };
		// const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };
		return (
			<div className="daystichhw">
				 <Row type="flex" justify="start" className="condition">
  					  <Form
					        layout="horizontal"
					        className="ant-advanced-search-form sticform"
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
					   </Form>
				 </Row>

                <Row type="flex" justify="start" align="middle" className="showtoal">
					<Col span={4} className="showtoalOne">营业总额:<span>{toalamout.amount?toalamout.amount:0}元</span></Col>
					<Col span={4} className="showtoalTwo">餐总人数:<span>{toalamout.people_number?toalamout.people_number:0}人</span></Col>
					<Col span={4} className="showtoalThree">平均客单价:<span>{toalamout.avg_people_sales?toalamout.avg_people_sales:0}元/人</span></Col>
                </Row>
                <div className="busdata">
				  <Row type="flex" justify="start" className="formdetail">
					<Col span={1} className="titlestyle">
						
						<div className="formlist"><span>明细</span></div>
					</Col>
					<Col span={5} className="sticcol">
						<header className="formzero">营业总额</header>
						<div className="commentstyle">{toalamout.amount?toalamout.amount:0}<span>元</span></div>
					    <div className="tableunquie">
                           <Table 

								bordered
								columns={columns} 
								pagination={false} 
								dataSource={mantdatil}
							    className="tablestyle"
						  />
					    </div>
						
					</Col>
					<Col span={5} className="sticcol">
						<header className="formzero">支付方式</header>
						<div className="commentstyle">{zhifulist?zhifulist:0}<span>项</span></div>
						<div className="tableunquie">
							<Table 
								bordered
								columns={columnstwo} 
								// scroll={{ y:true}}
								pagination={false} 
								dataSource={buystyle}
							    className="tablestyle"
							/>
						 </div>
					</Col>
					<Col span={7} className="sticcol">
						<header className="formzero">区域统计</header>
						<div className="commentstyle">{quyulist?quyulist:0}<span>项</span></div>
						<div className="tableunquie">
							<Table 
								bordered
								columns={columnsthree} 
								pagination={false} 
								dataSource={placelist}
							    className="tablestyle"
							/>
						</div>
					</Col>
					<Col span={6} className="sticcol">
						<header className="formzero">渠道统计</header>
						<div className="commentstyle">{daolist?daolist:0}<span>项</span></div>
						<div className="tableunquie">
							<Table 
								bordered
								columns={columnsfour} 
								pagination={false} 
								dataSource={methodlist}
							    className="tablestyle"
							/>
						</div>
					</Col>
                </Row>
                </div>
                <SticRefresh 
                   exetofille={true}
                   sellAountshow={false}
                   sellprice={false}
                   showback={true} 
                   handleRefresh={this.handleRefresh} 
                   handleGoBack={this.handleGoBack}
                   exportExcel={this.exportExcel}
                   />
			</div>	
		)
	}
}

DailyBusDatas = Form.create()(DailyBusDatas);


const mapStateToProps = (state) => {
	return {
		dailyRevenue: state.dailyRevenue
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...dailyRevenue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DailyBusDatas);



