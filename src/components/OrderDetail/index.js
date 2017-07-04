import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { Table, Row, Col, Button, notification ,Modal} from 'antd';
import OrderList from '../OrderList';
import OrderDetailOperate from '../OrderDetailOperate';
import TurnPage from '../TurnPage';
import KeyBoard from '../KeyBoard';

import { formatDate } from '../../utils';
import api from '../../api';
import { getUser } from '../../utils';
import * as orderDetail from '../../actions/orderDetail';
import * as batchdishs from '../../actions/batchdishs';
import * as getTableArea from '../../actions/tableArea';
import * as tables from '../../actions/tables';

import './index.less';

class OrderDetail extends Component {

	constructor(props) {
		super(props);
		this.state = {
			yScroll: window.innerHeight - 486,
			remrkshow:false,  //特殊备注弹框显示
			btnshow:false,   //特殊按钮显示
			action:true,       //整单叫起
			orderstatus:'',    //存放整单状态   
			actiontwo:true,    //整单加急
			actionthree:true ,  //整单打包
			gRemarks:[] ,   //存放菜品备注数组
			showbatch:false,  //暂时将批量处理按钮隐藏
			advanceshow:false,  //预付款弹框显示
			advancemoney:'0'   //预付款金额
		}
		
		//判断点菜还是收银
		this.handleResize = this.handleResize.bind(this);
		this.handleBatchDishs = this.handleBatchDishs.bind(this);
		this.setall=this.setall.bind(this);
		this.cancle=this.cancle.bind(this);
		this.ok=this.ok.bind(this);
		this.listone=this.listone.bind(this);
		this.listtwo=this.listtwo.bind(this);
		this.listthree=this.listthree.bind(this);
		this.modalshow=this.modalshow.bind(this);
		this.handleCancel=this.handleCancel.bind(this);	
		this.onPressonce=this.onPressonce.bind(this);
		this.advanceConfirm=this.advanceConfirm.bind(this);	
	}

	componentDidMount() {
		const { orderDetail} = this.props;
		window.addEventListener('resize', this.handleResize);
		// 获取所有备注列表
		const user=getUser();
		let pomise = api.get('/get_dishs_remarks.json', { params: {...user} });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code == 0) {
					this.setState({
						gRemarks: resolved.data
					});
				}else {
					notification.error({
		              	message: '初始化备注信息失败',
		              	description: resolved.msg
		          	});	
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected......', rejected);
			}
		);



		// 在这里需要对预付款进行赋值，从orderDetail里去获取

        this.setState({advancemoney:orderDetail.prepay});

	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);	
	}
	componentWillReceiveProps(nextProps){
		for (var i = 0; i < nextProps.orderDetail.dishs.length; i++) {
			
			if(nextProps.orderDetail.dishs[i].order_id){  //判断是否有未落单的菜品
				   this.setState({btnshow:false});
			}else{
				this.setState({btnshow:true});
				break;
			}
		}
		// this.setState({btnshow:true});
	}

	handleResize() {
		this.setState({yScroll: window.innerHeight - 486});
	}

	handleBatchDishs() {
		const { isBatchOperate } = this.props.batchDishs;
		const { dishs } = this.props.orderDetail;

		if (dishs.length == 0) return;

		this.props.updateIsBatchDish(!isBatchOperate);
	}

	getDishNumber(dishs) {
		const { orderDetail} = this.props;
		let number = 0;

		if (dishs.length == 0) return number;

		for (let i = 0; i < dishs.length; i++) {
			const ds = dishs[i];

			if (ds.allow_decimal == 1) {   //可输入小数点的菜
				
				if (ds.cancel_number&&ds.cancel_number!=='0') {
					number += Number(ds.dish_number)-Number(ds.cancel_number);
				}else{
					number +=  1;
				}
			} else {
				if (ds.cancel_number&&ds.cancel_number!=='0') {   //当前菜品有退菜
					
					if (ds.dish_type==2&&ds.package_dish_group) {
						number+=Number(ds.package_dish_group.length)-Number(ds.cancel_number);
					}else{
						number += Number(ds.dish_number)-Number(ds.cancel_number);
					}
				}else{

					if (orderDetail.order_id !==null) {    //落单后
						if (ds.package_id == null) {
							
							// 针对套餐的orderdetail里的Object.assgin方法对象合并不对做的临时优化
							if (ds.dish_type==2&&ds.package_dish_group) {
								number+=Number(ds.package_dish_group.length);
							}else{
								number += Number(ds.dish_number);
								
						    }
					   }
					}else{    //落单前
						if (ds.senteId==undefined) {
							 number += Number(ds.dish_number);	
						}
					}
				}
				
			}
		};
		return number;
	}
    //落单以后统计菜品数量 
	getOrderDishNumber(olddish,catdish){

		let number=0;
		// for (let i = 0; i < olddish.length; i++) {
			 
		// }
		return number;
	}

    //点击特殊备注按钮
	setall(){
		this.setState({remrkshow:true});
	}
	cancle(){
		this.setState({remrkshow:false});
	}
	ok(){
		//点确定以后，将整单的状态复制给每个未落单的菜品
		const {orderDetail}=this.props;
		const {orderstatus,gRemarks}=this.state;
		let statusId='';
		for (let b = 0; b < gRemarks.length; b++) {
			for (let i = 0; i < gRemarks[b].data.length; i++) {
			 		 if (gRemarks[b].data[i].name==orderstatus) {
			 		 	   statusId=gRemarks[b].data[i].dish_remarks_id;
			 		 }

			 	} 	
		 }
		for (var i = 0; i < orderDetail.dishs.length; i++) {
			if(orderDetail.dishs[i].order_id==undefined){
				//如果落单id为空的话，说明是未落单菜品，需要将整单状态付给未落单菜品
				   
				   if (orderDetail.dishs[i].remarks.length!==0) {
				   	    for (var j = 0; j < orderDetail.dishs[i].remarks.length; j++) {
						   	   if (orderDetail.dishs[i].remarks[j].title=='点菜状态') {
							   		orderDetail.dishs[i].remarks.splice(j,1,{
								   	  title:'点菜状态',
								   	  type:'5',
								   	  data:[{
								   	  	name:orderstatus,
								   	  	dish_remarks_id:statusId
								   	  }]
								   });
							   }else{
							   	   orderDetail.dishs[i].remarks.push({
								   	  title:'点菜状态',
								   	  type:'5',
								   	  data:[{
								   	  	name:orderstatus,
								   	  	dish_remarks_id:statusId
								   	  }]
								   });
							   }
						   }
				   }else{
				   		orderDetail.dishs[i].remarks.push({
								   	  title:'点菜状态',
								   	  type:'5',
								   	  data:[{
								   	  	name:orderstatus,
								   	  	dish_remarks_id:statusId
								   	  }]
							});
				   }

				   if (orderDetail.dishs[i].dish_type==2) {    //如果这个菜有套餐的话，需要将套餐里的每一个菜都添加备注
				   		 for (let m = 0; m < orderDetail.dishs[i].package_category_list.length; m++) {
				   		 	    let dishandle=orderDetail.dishs[i].package_category_list[m];
				   		 	  for (let j = 0; j < dishandle.package_dishes.length; j++) {
				   		 	  	  let dishdetail=dishandle.package_dishes[j];
				   		 	  	   if (dishdetail.remarks.length!==0) {
								   	    for (var j = 0; j < dishdetail.remarks.length; j++) {
										   	   if (dishdetail.remarks[j].title=='点菜状态') {
											   		dishdetail.remarks.splice(j,1,{
												   	  title:'点菜状态',
												   	  type:'5',
												   	  data:[{
												   	  	name:orderstatus,
												   	  	dish_remarks_id:'193'
												   	  }]
												   });
											   }else{
											   	   dishdetail.remarks.push({
												   	  title:'点菜状态',
												   	  type:'5',
												   	  data:[{
												   	  	name:orderstatus,
												   	  	dish_remarks_id:'193'
												   	  }]
												   });
											   }
										   }
								   }else{
								   		dishdetail.remarks.push({
												   	  title:'点菜状态',
												   	  type:'5',
												   	  data:[{
												   	  	name:orderstatus,
												   	  	dish_remarks_id:'193'
												   	  }]
											});
								   }
				   		 	  }
				   		 }
				   }
				
				   
			}
		}
		this.props.specileNote(orderstatus);
		this.setState({remrkshow:false});
		// this.props.modifyBatchDish(curDish, remarks);
	    this.setState({action:true,actiontwo:true,actionthree:true});

	}
	//点击整单叫起
	listone(){
		// 点击按钮修改样式，并且上传数据
		const {action}=this.state;
		this.setState({action:!action,actiontwo:true,actionthree:true});
		this.setState({orderstatus:'叫起'});
	}
	listtwo(){
		const {actiontwo}=this.state;
		this.setState({actiontwo:!actiontwo,action:true,actionthree:true});
		this.setState({orderstatus:'加急'});
	}
	listthree(){
		const {actionthree}=this.state;
		this.setState({actionthree:!actionthree,action:true,actiontwo:true});
		this.setState({orderstatus:'打包'});
	}
	modalshow(){
		this.setState({advanceshow:true});
	}
	handleCancel(){
		this.setState({advanceshow:false});
	}
	// 预支付弹框的三个按钮
	advanceClearPay(){
		document.getElementById('advance').value = '';
		this.setState({advancemoney:'0'});
	}
	advanceCancle(){
        this.setState({advanceshow:false,advancemoney:'0'});
	}
	advanceConfirm(){
         const user=getUser();
         const { orderDetail } = this.props;
         const {advancemoney}=this.state;
         let obj={
         	...user,
         	table_id:orderDetail.table_id,
         	prepay:advancemoney
         };
		 let pomise = api.post('/set_prepay.json', { data: obj });
		    pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
		          	this.setState({advanceshow:false});
		          	this.props.searchFood({
						...user,
						order_id: orderDetail.order_id,
						table_id: orderDetail.table_id
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

	}
	onPressonce(value, backspace){
		let curDom;
		let currentValuetwo='';
		const keyId = 'advance';	
		if ( keyId == '') return;
		curDom = document.getElementById(keyId);
		currentValuetwo = curDom.value;
		if (backspace) {//删除一个值
			currentValuetwo = currentValuetwo.substr(0, currentValuetwo.length - 1);		
		} else {
			currentValuetwo += value;
		}
		curDom.value = currentValuetwo;
		this.setState({advancemoney:currentValuetwo});
	}
	render() { //根据order_id 判断是否开桌过
		const { orderDetail, batchDishs } = this.props;
		const { table_id , pay_status ,reversed} = orderDetail;
		const time = orderDetail.order_id ? orderDetail.order_place_time : orderDetail.table_place_time;
		const isBatchOperate = batchDishs.isBatchOperate;
		let dishNumber=0;
		if (orderDetail.order_id) {
			 dishNumber=orderDetail.dish_number;
		}else{
			 dishNumber=this.getDishNumber(orderDetail.dishs);
		}
		// const dishNumber = this.getDishNumber(orderDetail.dishs);
		if(table_id === null) {
			return (
				<div className="menu">
					<div className="no-talbe">
						<div></div>
						<p>你当前还没选中任何桌台！</p>
					</div>
				</div>	
			)
		}
		return (
			<div className="menu ordermeny">
				
				<h2 className="menu-table-position">{reversed == 1 ? '【反结账】' : ''}{`${orderDetail.table_name}号桌`}</h2>
				<div className="advance-tap" onClick={this.modalshow}>
					<span>预付款:  </span>
					<span> {orderDetail.prepay?orderDetail.prepay:0}</span>
					<i className="clickbtn"></i>
				</div>
				<div className="menu-table-detail">
					
					<div className="from-control">
						<Row className="mb-d" type="flex" justify="space-between">
							<Col span={12}>
								<label>服务：</label>{orderDetail.create_by}
							</Col>
							<Col span={12} className="md-wy">
								<label>渠道：</label>店内
							</Col>
						</Row>
						<Row className="mb-d" type="flex" justify="space-between">
							<Col span={12}>
								<label>人数：</label>{orderDetail.curr_person}人
							</Col>
							<Col span={12} className="md-hhw">
								<label>时间：</label>{formatDate(time)}
							</Col>
						</Row>
						<Row>
							<h5>
								NO.{(orderDetail.order_id)&&(orderDetail.order_id.replace(/reversed/,'R'))}
								{this.state.showbatch?<div className="menu-batch" onClick={this.handleBatchDishs}>批量处理</div>:null}
							</h5>
						</Row>
						<Row type="flex" justify="space-between">
							<Col span={12}>
								<label>备注：</label>{orderDetail.remarks}
							</Col>	
							<Col span={12}>
								<label>类型：</label>{orderDetail.is_merge==0?'正常单':(orderDetail.is_merge==1?'并台单':'换台单')}
							</Col>	
						</Row>
					</div>
				</div>	
				<div className="menu-table-foods">
					<OrderList 
						{...this.props} 
						isBatchOperate = {isBatchOperate}
						yScroll={this.state.yScroll}
						orderId={orderDetail.order_id}
						tableId={orderDetail.table_id}
					/>	
				</div>
				<div className="menu-total">
					<Row type="flex" justify="space-between" className="pd">
						<Col className="tol-d" span={24}>
							<p>合计菜品：</p><span>{dishNumber}</span>项	
						</Col>
						<Col className="tol-d" span={24}>
							<p>消费金额：</p><span>{orderDetail.amount}</span>元	
						</Col>
						<Col className="tol-d" span={24}>
							<p>折扣金额：</p><span>{orderDetail.discount_amount}</span>元	
						</Col>
						<Col className="tol-dr" span={24}>
							<p>应收金额：</p><span className="real-m">{orderDetail.receive_amount}</span>元	
						</Col>
					</Row>
					<div className="turn-page-mini">
						<TurnPage 
							parentDom={`ant-table-body`}
							currentDom={`ant-table-tbody`}
						/>
					</div>
					
					{this.state.btnshow?<div className="onlyremarks" onClick={this.setall}>特殊备注</div>:null}
				</div>
				<OrderDetailOperate {...this.props} />

				 <Modal 
			    	key={Math.random()}
			    	width={294}
			    	title="选择特殊备注" 
			    	visible={this.state.remrkshow}
		          	onOk={this.ok} 
		          	onCancel={this.cancle}
		          	maskClosable={false}
		          	closable={false}
		          	style={{top:'280px',left:'0',marginLeft:'95px',textAlign:'center'}}

		        >
		        	<ul className="ulstty">
		        		<li ><div className={this.state.action?'listone':'listoneactive'} onClick={this.listone}></div>整单叫起</li>
		        		<li><div className={this.state.actiontwo?"listtwo":'listtwoactive'} onClick={this.listtwo}></div>整单加急</li>
		        		<li><div className={this.state.actionthree? "listthree":'listthreeactive'} onClick={this.listthree}></div>整单打包</li>
		        	</ul>
		        </Modal>
		         <Modal
					width={390}
					title="预付款" 
					visible={this.state.advanceshow}
					onCancel={::this.handleCancel}
			        footer=""
			        maskClosable={false}
			       >
				    	<Row type="flex" justify="space-between" className="open-invoice">
				    		<Col span={8}>预付款: </Col>
				    		<Col span={16} className="invoice-m">
				    		   
					    		   <input 
									type="text" 
									id="advance"
									// className="ant-input ant-input-lg rpm" 
									// placeholder="输入金额"
									value={this.state.deletemoey}
									// onClick={(e) => this.triggleBoard(e)}
								/>	
				    		</Col>
				    	</Row>
				    	<KeyBoard 
							onPress={this.onPressonce}
							handleClearPay={::this.advanceClearPay}
							handleCancle={::this.advanceCancle}
							handleConfirm={this.advanceConfirm}
							btnsure={true}
							btncanle={true}
						/>  	  
			       </Modal>
			</div>
		)
	}
}

OrderDetail.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
}

const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail,
		batchDishs: state.batchDishs,
		tables: state.tables,
		tableArea: state.tableArea	
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators({...orderDetail, ...batchdishs, ...tables, ...getTableArea}, dispatch);	
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetail);