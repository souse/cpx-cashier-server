import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Checkbox, Modal, Table, Row, Col, Button, notification ,Form,Input} from 'antd';

import api from '../../api';
import { getUser ,getDevice} from '../../utils';
import { formatDate } from '../../utils';
import { setUser } from '../../utils';
import KeyBoard from '../KeyBoard';
import TurnPage from '../TurnPage';

import './index.less';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

const columns = [
	{
		title: '品名',
		dataIndex: 'dish_name',
		className: 'name'
	},
	{
		title: '数量',
		dataIndex: 'amount',
		className: 'amount',
		width: 60,
		render: (text, record, index) => {
			return (
				<span>x{record.dish_number}{record.norms_name}</span>
			)
		}
	},
	{
		title: '金额(元)',
		dataIndex: 'money',
		className: 'money',
		width: 85,
		render: (text, record, index) => {
			return (
				<span>{((record.dish_number-record.is_present) * record.unit_price).toFixed(2)}</span>
			)
		}
	}
];

const columnmember = [
	{
		title: '品名',
		dataIndex: 'dish_name',
		className: 'name'
	},
	{
		title: '数量',
		dataIndex: 'amount',
		className: 'amount',
		width: 60,
		render: (text, record, index) => {
			return (
				<span>x{record.dish_number}{record.norms_name}</span>
			)
		}
	},
	{
		title: '金额(元)',
		dataIndex: 'money',
		className: 'money',
		width: 85,
		render: (text, record, index) => {

			return (
				<span>{((record.dish_number-record.is_present) * record.vip_price).toFixed(2)}</span>
			)
		}
	}
];


const options = [
  	{ label: '付款类型选择错误', value: '付款类型选择错误' },
  	{ label: '金额处理错误', value: '金额处理错误' },
  	{ label: '桌号错误', value: '桌号错误' }
];

let reversedRemarks = '';

class BillOrderDetail extends Component {

	constructor(props) {
		super(props);

		this.state = {
			show: false,
			visible: false,
			invoiceMoney: '',
			isshowtwo:false,
			pshow:false,
			deleteshow:false,   //作废弹框是否显示
			delebtnshow:false,    //作废？取消作废按钮的变化。默认是正常单
			Nodeleteshow:false,    //取消作废弹框是否显示
			isshodelete:false ,    //作废没有权限弹框
			istocompent:1   //是否进这个函数
			
		}

		this.handleReBil = this.handleReBil.bind(this);
		this.handleInvoice = this.handleInvoice.bind(this);
		this.handlePrint = this.handlePrint.bind(this);
		this.markOk=this.markOk.bind(this);
		this.markCancel=this.markCancel.bind(this);
		this.handledelete=this.handledelete.bind(this);
		this.deleteok=this.deleteok.bind(this);
		this.deletecancle=this.deletecancle.bind(this);
		this.Nodelete=this.Nodelete.bind(this);
		this.Nodeleteok=this.Nodeleteok.bind(this);
		this.Nodeletecancle=this.Nodeletecancle.bind(this);
	}

	componentDidMount(){
		window.addEventListener('keydown', this.handleKeyPress);
	}
	componentWillUnmount() {
		window.removeEventListener('keydown', this.handleKeyPress);
	}
	componentWillReceiveProps(nextProps){
		const {orderDetail}=this.props;
		if (this.state.istocompent==2) {
			this.setState({istocompent:1});
			 return;
		}
		if (this.props.hasdelete=='0') {
			this.setState({delebtnshow:false});
		}else{
			this.setState({delebtnshow:true});
		}
		
	}

	handleReBil() {
		if (this.props.hasdelete=='0') {
			this.setState({ show: true });
		}
	}

	handleInvoice() {
		const { orderDetail } = this.props;

		this.setState({ 
			visible: true,
			invoiceMoney: orderDetail.receive_amount 
		});

	}

	handlePrint() {
		const user = getUser();
		const { hasBilled } = this.props;
		const { order_id } = this.props.orderDetail;
		const obj = {
			...user,
			order_id: order_id,
			type: hasBilled == 0 ? 3 : 4 // 未结账 3，已结账 4
		}

		let pomise = api.post('/print_order_detail.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',   
		              	description: resolved.msg
		          	});
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);		
	}

	// 点击作废按钮
    handledelete(){
      this.setState({deleteshow:true});
    }
	handleCancel() {
		this.setState({ visible: false });
	}

	onPress(value, backspace) {
		let currentValue = this.state.invoiceMoney;

		if (backspace) {//删除一个值
			currentValue = currentValue.substr(0, currentValue.length - 1);		
		} else {
			currentValue += value;
		}
		//currentValue = currentValue.length == 0 ? 0 : currentValue;
		this.setState({ invoiceMoney: currentValue });
	}
	handleClearPay() {
		this.setState({ invoiceMoney: '' });
	}
	handleCancle() {
		this.setState({ visible: false });	
	}
	handleConfirm() {
		const user = getUser();
		const { invoiceMoney } = this.state;
		const { orderDetail } = this.props;
		const obj = {
			...user,
			order_id: orderDetail.order_id,
			is_draw_bill: 1,
			draw_bill_amount: invoiceMoney
		};
		let pomise = api.post('/draw_bill.json', { data: obj });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('rejected......place_order', rejected);
			}
		);

		this.setState({ visible: false });		
	}
	ok() {
		const user = getUser();
		const { order_id } = this.props.orderDetail;
		const obj = {
			...user,
			order_id: order_id
		};
		const ifreverse=1;  //代表反结账
		if (reversedRemarks.length == 0) return;

		let pomise = api.post('/reversed_checkout.json', { data: obj });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
				
				this.props.updateOrderDetailOrderId(resolved.data);
				//更新orderDetail中 反结账的两个字段
				this.props.setReversedMessage(reversedRemarks,ifreverse);
				this.setState({ show: false });	//输入账号密码框消失
				this.context.router.push('/cashier/payment/1');
				}else if(resolved.code === 20039){
					this.setState({ show: false });
		          	// 代表没有反结账权限
		          	this.setState({isshowtwo:true});
				} else {
					this.setState({ show: false });
		          	notification.success({
		              	message: '提示信息',   
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('rejected......reversed_checkout', rejected);
			}
		);
	}
	// 输入用户名密码  点击确认判断是否输入用户有权限
	markOk(){
		// 调用接口，判断是否有权限
        const user = getUser();
        const deviceid=getDevice();
		const { getFieldsValue } = this.props.form;
		const data = getFieldsValue();
		const obj={
			username:data.username,
			password:data.password,
			device_id:deviceid,
			type:3
		}
		let pomise = api.post('/login_check_permission.json', { data: obj });
		pomise.then((data)=>{
    		   if (data.code==0) {
    		   	  this.setState({
    		   	  	pshow:false
    		   	  })
    		   	   const datapay = getFieldsValue();
    		   	   setUser({
    		   	   	username:datapay.username,
    		   	   	password:datapay.password,
    		   	   	token:data.data.token,
    		   	   	name:data.data.name
    		   	   });

    		   	   //不同情况执行不同逻辑
    		   	   this.setState({isshowtwo:false}); //输入的用户有权限，当前弹窗消失
    		   	   // this.setState({deleteshow:true});
    		   	  
    		   	   if (this.state.deleteshow) {

    		   	   }else if(this.state.Nodeleteshow){

    		   	   }else{
    		   	   	  this.context.router.push('/cashier/payment/1');
    		   	   }

    		   }else{
    		   	   this.setState({
    		   	   	pshow:true
    		   	   })
    		   	  console.log("失败，没有权限");
    		   }
        }, (error)=>{
        	console.log(error);
        });
	}
	markCancel(){
		this.setState({isshowtwo:false});
	}
	cancle() {
		reversedRemarks = ''; //清空
		this.setState({ show: false });	
	}
	changeReason(checkedValues) {
		reversedRemarks = checkedValues.length > 0 ? checkedValues.join(',') : '';
	}

	// 作废弹框的确认按钮
	deleteok(){
	    const user=getUser();
	    const deviceid=getDevice();
    	const {orderDetail}=this.props;
		const newobj={
			...user,
			order_id:orderDetail.order_id,
			device_id:deviceid
		};
		let promise=api.post('/delete_order.json', { data: newobj });
    	promise.then((data)=>{
    		 if (data.code==0) {
				this.setState({deleteshow:false,delebtnshow:true,istocompent:2});
				 this.props.getBillingList({
				   ...user,
				   origin: 'pc',
				   date:this.props.nowdate
		         });

    		 }else{
    		 	console.log("没有权限");
    		 	//没有权限，弹出重新输入框
    		 	this.setState({isshowtwo:true,deleteshow:true});
    		 }
    		
    	},(error)=>{
    		 console.log(error);
    	})
	}
	
	// 作废弹‘’框‘’的取消按钮
	deletecancle(){
		this.setState({deleteshow:false});
	}
	// 取消作废按钮点击
	Nodelete(){
		this.setState({Nodeleteshow:true});
	}

	// 取消作废弹框的确认按钮
	Nodeleteok(){
		const user=getUser();
		const deviceid=getDevice();
    	const {orderDetail}=this.props;
    	const {delebtnshow}=this.state;
		const newobj={
			...user,
			order_id:orderDetail.order_id,
			device_id:deviceid
		};
		let promise=api.post('/reconver_delete_order.json', { data: newobj });
    	promise.then((data)=>{
    		 
    		 if (data.code==0) {
    		 	console.log("取消作废成功");
    		 	this.setState({Nodeleteshow:false});
    		 	this.setState({delebtnshow:false,istocompent:2});
    		 	this.props.getBillingList({
					...user,
					origin: 'pc',
					date:this.props.nowdate
			   });
    		 }else{
    		 	console.log("没有权限");
    		 	this.setState({isshowtwo:true,Nodeleteshow:true});
    		 }
    		 
    	},(error)=>{
    		 console.log(error);
    	})
	}
	Nodeletecancle(){
		this.setState({Nodeleteshow:false});
	}
	render() { //根据order_id 判断是否开桌过
		const { orderDetail } = this.props;
		const table_id = orderDetail.table_id;
		const dishsall = orderDetail.dish_groups;
		let dishs = [];
		const username='';
		const password='';
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		const { getFieldDecorator } = this.props.form;
		let flag=true;
		if (this.props.hasdelete=='1') flag=false;
		//过滤 已经退菜的订单
		for (var i = 0; i < dishsall.length; i++) {
			let ds = Object.assign({}, dishsall[i]);
			const { cancel_number, dish_number } = ds; 
			const num = dish_number - cancel_number;

			if (cancel_number && num > 0) {//过滤掉退菜的菜品
				ds.dish_number = num;
				dishs.push(ds);
			}
		};
		
		if(table_id === null) {
			return (
				<div className="menu">
					<div className="no-talbe">
						<div></div>
						<p>请先选择要处理的账单！</p>
					</div>
				</div>	
			)
		}
		return (
			<div className="menu">
				<h5>
					NO.{orderDetail.order_id}
				</h5>
				<h2 className="menu-table-position">{`${orderDetail.table_name}号桌`}</h2>
				<div className="menu-table-detail">
					<h4>结账单</h4>
					<div className="from-control">
						<Row className="mb-d" type="flex" justify="space-between">
							<Col span={10}>
								<label>服务：</label>{orderDetail.create_by}
							</Col>
							<Col span={14}>
								<label>渠道：</label>店内
							</Col>
						</Row>
						<Row className="mb-d" type="flex" justify="space-between">
							<Col span={10}>
								<label>人数：</label>{orderDetail.curr_person}人
							</Col>
							<Col span={14}>
								<label>下单时间：</label>{formatDate(orderDetail.create_time)}
							</Col>
						</Row>
						<Row type="flex" justify="space-between">
							<Col span={24}>
								<label>结账时间：</label>{formatDate(orderDetail.pay_time)}
							</Col>	
						</Row>
					</div>
				</div>	
				<div className="menu-table-foods bill-olist">
					<Table 
						scroll={{ y: window.innerHeight - 598 }}
						columns={orderDetail.type?columnmember:columns} 
						pagination={false} 
						dataSource={dishs} 
					/>
				</div>
				<div className="menu-total">
					<Row type="flex" justify="space-between" className="pd">
						<Col className="tol-d" span={24}>
							<p>合计菜品：</p><span>{orderDetail.dish_number}</span>项	
						</Col>
						<Col className="tol-d" span={24}>
							<p>消费金额：</p><span>{orderDetail.amount}</span>元	
						</Col>
						<Col className="tol-d" span={24}>
							<p>折扣金额：</p><span>{orderDetail.discount_amount}</span>元	
						</Col>
						<Col className="tol-d" span={24}>
							<p>抹零金额：</p><span>{orderDetail.give_amount}</span>元	
						</Col>
						<Col className="tol-dr" span={24}>
							<p>应收金额：</p><span className="real-m">{orderDetail.receive_amount}</span>元	
						</Col>
						<Col className="tol-dr" span={24}>
							<p>实收金额：</p><span>{orderDetail.pay_amount}</span>元	
						</Col>
						<Col className="tol-dr" span={24}>
							<p>找零金额：</p><span>{orderDetail.change_amount}</span>元	
						</Col>
					</Row>
					<div className="from-control pay-od">
						<Row type="flex" justify="space-between">
							<Col span={10}>
								<label>支付方式：</label>{orderDetail.pay_channel}
							</Col>
							<Col span={14}>
								<label>流水号：</label>{orderDetail.serial_no}
							</Col>	
						</Row>
						<Row type="flex" justify="space-between">
							<Col span={10}>
								<label>索要发票：</label>{orderDetail.is_draw_bill == 1 ? '是' : '否'}
							</Col>
							<Col span={14}>
								<label>收银员：</label>{orderDetail.cashier_name}
							</Col>	
						</Row>
					</div>
					<div className="turn-page-mini">
						<TurnPage 
							parentDom={`ant-table-body`}
							currentDom={`ant-table-tbody`}
						/>
					</div>
				</div>
				<div className="menu-opreate">
					<Row type="flex" justify="space-between">
						<Col className={ flag ?"op op-billing op-rebill":"op op-billing op-rebill op-disable"} span={6} onClick={this.handleReBil}>
							<div>
								<span>反结账</span>
							</div>
						</Col>
						<Col className="op op-order op-invoice" span={6} onClick={this.handleInvoice}>
							<div>
								<span>开发票</span>
							</div>
						</Col>
						
						{this.state.delebtnshow?<Col className="op op-nodelete" span={6} onClick={this.Nodelete}>
							<div>
								<span>取消作废</span>
							</div>
						</Col>:<Col className="op op-delete" span={6} onClick={this.handledelete}>
							<div>
								<span>作废</span>
							</div>
						</Col>}

						<Col className="op op-printf" span={6} onClick={this.handlePrint}>
							<div>
								<span>打印</span>
							</div>
						</Col>
					</Row>
				</div>
				<Modal
					width={390}
					title="开发票" 
					visible={this.state.visible}
					onCancel={::this.handleCancel}
			        footer=""
			        maskClosable={false}
			        closable={false}
			        className="open-invoice-dig"
			    >
			    	<Row type="flex" justify="space-between" className="open-invoice">
			    		<Col span={12}>发票金额：</Col>
			    		<Col span={12} className="invoice-m">{this.state.invoiceMoney}元</Col>
			    	</Row>
			    	<KeyBoard 
						onPress={::this.onPress}
						handleClearPay={::this.handleClearPay}
						handleCancle={::this.handleCancle}
						handleConfirm={::this.handleConfirm} 
						btnsure={true}
						btncanle={true}
					/>  	  
			    </Modal>
			    <Modal 
			    	key={Math.random()}
			    	width={340}
			    	title="反结账" 
			    	visible={this.state.show}
		          	onOk={::this.ok} 
		          	onCancel={::this.cancle}
		          	maskClosable={false}
		          	closable={false}
		        >
		        	<div className="recalc">
		        		<h4>反结账原因：</h4>
		        		<CheckboxGroup options={options} onChange={::this.changeReason} />
		        	</div>	
		        </Modal>

		        <Modal 
			    	width={360}
			    	title="作废订单" 
			    	visible={this.state.deleteshow}
		          	onOk={::this.deleteok} 
		          	onCancel={::this.deletecancle}
		          	maskClosable={false}
		          	closable={false}
		        >
		        <p className="contentshow">作废操作后，该单据的数据将不计入营业收入，请确认！</p>	
		        </Modal>


		        <Modal 
			    	width={340}
			    	title="取消作废订单" 
			    	visible={this.state.Nodeleteshow}
		          	onOk={::this.Nodeleteok} 
		          	onCancel={::this.Nodeletecancle}
		          	maskClosable={false}
		          	closable={false}
		        >
		        <p className="contentshow">取消作废操作后，该单据的数据将计入营业收入，请确认！</p>	
		        </Modal>

		        <Modal title="当前帐号无权限，需有权限的员工完成操作" width={360} visible={this.state.isshowtwo} onOk={() => this.markOk()} onCancel={::this.markCancel} maskClosable={false} closable={false}>
		        		<Form horizontal>
		        			 <FormItem className="form-input"
				          	{...formItemLayout}
				          	label="用户名"
				        >
				          	{getFieldDecorator('username', { initialValue: username,rules: [ {required: true, message: '用户名不能为空'} ]  })(
				            	<Input id="username" placeholder="输入用户名" />
				          	)}
				        </FormItem>
				        <FormItem className="form-input"
				          	{...formItemLayout}
				          	label="密码"
				        >
				          	{getFieldDecorator('password', { initialValue: password ,rules: [ {required: true, message: '密码不能为空'} ] })(
				            	<Input id="password" placeholder="输入密码"/>
				          	)}
				        </FormItem>
				         {this.state.pshow?<p className="pshow">当前用户没有权限</p>:null}
		        		</Form>
		        </Modal>
		       
			</div>
		)
	}
}

BillOrderDetail.contextTypes = {
  	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};

export default BillOrderDetail;