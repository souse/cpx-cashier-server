import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Modal, Row, Col, Button, Checkbox, notification ,Form ,Input} from 'antd';

import OrderDetail from '../OrderDetail';
import Refresh from '../Refresh';
import TableArea from '../TableArea';
import OperateDishs from '../OperateDishs';

import api from '../../api';
import { getUser } from '../../utils';

import { getTables } from '../../actions/tables';
import * as batchdishs from '../../actions/batchdishs';
import * as getTableArea from '../../actions/tableArea';
import * as orderDetail from '../../actions/orderDetail';

import './index.less';

let user;
const CheckboxGroup = Checkbox.Group;

class ModifyDishs extends Component {

	constructor(props) {
		super(props);

		this.state = {
			gRemarks: [],
			curDish: null,
			visible: false,
			confirmLoading: false,
			dishName: '',
			ModalText: '',
			orderdish:[],
			iflese:true,
			btnmsg:'更多',  //弹窗按钮文字信息
			priceable:false,    //修改菜品数量的弹框
			spalicAmount:0,     //可输入小数点的数量
			dish_log:[]  //菜品操作日志 
		}

		user = getUser();

		this.handleGoBack = this.handleGoBack.bind(this);
		this.handleRefresh = this.handleRefresh.bind(this);

		//Modal
		this.handleOk = this.handleOk.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.onChange = this.onChange.bind(this);

		this.kinck=this.kinck.bind(this);

		this.changeCount=this.changeCount.bind(this);
		this.priceOk=this.priceOk.bind(this);
		this.priceCancel=this.priceCancel.bind(this);
	}

	componentDidMount() {
		const { batchdishs } = this.props.batchDishs;
		// 获取所有备注列表
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
		
		// 获取菜品操作日志
		if (batchdishs[0].order_id) {
			 let obj={
				...user,
				order_id:batchdishs[0].order_id,
				order_dish_id:batchdishs[0].order_dish_id
			}
		let pomisedish = api.get('/get_dish_operatelog.json', { params: obj });
		pomisedish.then(
			(resolved = {}) => {
				if (resolved.code == 0) {
					this.setState({dish_log:resolved.data.dish_operatelog});
				}else {
					notification.error({
		              	message: '获取菜品操作信息失败',
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

	}

	// 改变临时菜数量
	changeCount(){
		this.setState({priceable:true});
	}

	priceOk(){
		// 修改菜品数量
		const { batchdishs } = this.props.batchDishs;
		let newAmount=document.getElementById("amountId").value;
		if (newAmount=='') {

		}else{

			batchdishs[0].dish_number=Number(newAmount);
		}
		
		this.setState({priceable:false});
	}
	priceCancel(){
		this.setState({priceable:false});
	}
	handleGoBack() {
		this.context.router.goBack();
		this.props.clearBatchDish();
		// this.context.router.goBack();
	}

	handleRefresh() {
		alert('刷新点菜页面');
	}

	handleDishUp(event, dish) {
		event.stopPropagation();
		const {orderDetail}=this.props;
		const { orderId, tableId } = this.props.batchDishs;
		if (dish.senteId!=='66'&&dish.category_name !=='套餐') {
			  this.props.addBatchDish(dish, orderId, tableId);
		}		
	}

	handleDishDown(event, dish) {
		event.stopPropagation();
	    if (dish.senteId !=='66'&&dish.category_name !=='套餐') {
	    	this.props.deleteBatchDish(dish);
	    }
		
	}

	setRemarks(event, dish) {
		event.stopPropagation();
		//order_dish_id
		const { orderId } = this.props.batchDishs;

		if (orderId && dish.order_dish_id) {//已经落单的不能改备注
			return false;
		}
		//这里写备注信息渲染
		const modelText = this.setModelText(dish);
		this.setState({ 
			curDish: dish,
			visible: true,
			dishName: dish.dish_name,
			ModalText: modelText
		});	
	}

	setModelText(dish) {
		const dishRemarks = dish.remarks;
		const gRemarks = this.state.gRemarks;//  备注列表数据
		const { typeId } = this.getRemarkTxtAndTypeId(dish);

		const remarks =  gRemarks.map((rm, key) => {

			const cbx = rm.data.map((r, j) => {
				let ckclass = '', checked = false;
				const type_id = rm.type + '_' + r.dish_remarks_id;

				// 显示默认的菜品备注，不能删除
				for (var i = 0; i < typeId.length; i++) {
					const tid = typeId[i];
					if(tid === type_id) {
						ckclass = 'group-item-checked';
						checked = true;
						break;
					}

				};

				return (
					<label 
						className={`checkbox-group-item ${ckclass}`} 
						key={j} 
						id={`${rm.type}_${r.dish_remarks_id}`}
						data-name={r.name}
					>
						<span className="checkbox">
							<span className="checkbox-inner"></span>
							<input 
								type="checkbox" 
								className="checkbox-input" 
								data-name={r.name} 
								value={r.dish_remarks_id} 
								onClick={(e) => this.onChange(e)}
								defaultChecked={checked}
							/>	
						</span>	
						<span className="checkbox-name">{r.name}</span>
					</label>	
				)			
			});

			return (
				<div className="rms-content" key={key} id={rm.type} data-title={rm.title}>
					<span className="rm-title">{rm.title}:</span>
					<div className="checkbox-group">
						{ cbx }
					</div>
				</div>
			)					
		});

		return (
			<div className="rms-contents">
				{ remarks }	
			</div>	
		)
	}

	onChange(event) {
		let parentsNode = event.target.parentNode.parentNode;
		const checked = event.target.checked;

		if (checked) {
			parentsNode.setAttribute('class', 'checkbox-group-item group-item-checked');
		} else {
			parentsNode.setAttribute('class', 'checkbox-group-item');
		}
	}

	handleOk() {
		let remarks = [];   //存放备注的数组，包括口味，菜品，点菜状态
		const { curDish } = this.state;
		const rmsContents = document.getElementsByClassName('rms-content');
		const rms = document.getElementsByClassName('group-item-checked');

		if (rms.length > 0) {
			for (let i = 0; i < rmsContents.length; i++) {
				let data = [];
				const rc = rmsContents[i];
				const id = rc.id, title = rc.getAttribute('data-title');

				for (var j = 0; j < rms.length; j++) {
					const rm = rms[j];
					const name = rm.getAttribute('data-name');
					const _id = rm.id, ids = _id.split('_');
					const type = ids[0], dish_remarks_id = ids[1];

					if(id == type) {
						data.push({
							name: name,
							dish_remarks_id: dish_remarks_id
						});
					}
				};
				remarks.push({
					title: title,
					type: id,
					data: data	
				});
			};	
		}
		
		//更新 batchdishs 中 list 中每个  remarks 的值
		//更新 orderDetail 中 list 中每个  remarks 的值
		this.props.modifyBatchDish(curDish, remarks);
		//隐藏此块内容，在点击保存的时候同步更新到orderDetail中去
		//this.props.modifyFoodRemarks(curDish, remarks);	
		if (remarks[2]==null) {
			 this.setState({btnmsg:'即起'});
		}else{
			if (remarks[2].data[0]==null) {
				this.setState({btnmsg:'即起'});
			}else{
				this.setState({btnmsg:remarks[2].data[0].name});
			}
			
		}
		this.setState({ visible: false }); 
	}

	handleCancel() {
		this.setState({ visible: false });
	}


	//通过菜品获取备注信息
	getRemarkTxtAndTypeId(dish) {
		let str = '', arr = [];
		const remarks = dish.remarks;

		if (remarks.length == 0&&dish.temp_remark==null) return { remarkTxt: '', typeId: [] };

		for (var i = 0; i < remarks.length; i++) {
			const type = remarks[i].type;
			const data = remarks[i].data;

			for (var j = 0; j < data.length; j++) {
				const d = data[j];

					str += d.name + '、';
				    arr.push(type + '_' + d.dish_remarks_id);
				
				
			};
		};
		if (dish.temp_remark) {
				str+=dish.temp_remark+'、';
		}
		str = str.substring(0, str.length -1);
        
		return { remarkTxt: str, typeId: arr };
	}

	kinck(e,dish){
		// 点击以后，将当条菜品的价格设为零
		const { batchDishs, updateUnOrderDishs } = this.props;
		const bd = Object.assign({}, batchDishs);
		// bd.batchdishs[0].unit_price=0;
		const dishunprice=dish.unit_price;
		dish.unit_price=0;
		// updateUnOrderDishs(bd.batchdishs);
		// this.props.updateIsBatchDish(true);
	}
	setHTML(dishlog){
		if (dishlog.operate_type==1) {
			return '退x';
		}else if(dishlog.operate_type==2){
			return '赠x';
		}else if(dishlog.operate_type==3){
			return '取消赠x';
		}else{
			return ' ';
		}
		
	}
	setHTMLStyle(dishlog){
		if (dishlog.operate_type==1) {
			return 'dishcanle';
		}else if(dishlog.operate_type==2){
			return 'dishpresent';
		}else if(dishlog.operate_type==3){
			return 'dishnopresent';
		}else{
			return 'dishno';
		}

	}


	render() {
		const { batchdishs } = this.props.batchDishs;
		const {orderDetail}=this.props;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		const { getFieldDecorator } = this.props.form;
		const FormItem = Form.Item;
		const prices='';
		const dishlog=this.state.dish_log;
		const dishs = batchdishs.map((dish, key) => {
			const { remarkTxt } = this.getRemarkTxtAndTypeId(dish);
			var betmsg=''; // 保存点菜状态信息
			var remarkTxtnew='';
			// 将备注中点菜状态过滤掉
			if(remarkTxt.indexOf('即起')!=-1){
					remarkTxtnew=remarkTxt.slice(0,remarkTxt.indexOf('即起')-1);
			}else if(remarkTxt.indexOf('叫起')!=-1){
				    remarkTxtnew=remarkTxt.slice(0,remarkTxt.indexOf('叫起'));
				    betmsg='叫起';
			}else if(remarkTxt.indexOf('加急')!=-1){
				    remarkTxtnew=remarkTxt.slice(0,remarkTxt.indexOf('加急'));
				    betmsg='加急';
			}else if(remarkTxt.indexOf('打包')!=-1){
				    remarkTxtnew=remarkTxt.slice(0,remarkTxt.indexOf('打包')-1);
				    betmsg='打包';
			}else{
					remarkTxtnew=remarkTxt;	
					betmsg='即起';
			}
			// 如果是临时菜品，而且已经落单了
			if (dish.category_name=='临时菜品'&&dish.order_dish_id) {
				return (
				<li key={key} >
				<Row type="flex" justify="space-between">
					<Col span={8}><span className="dish-name">{dish.dish_name}</span></Col>
					<Col span={5}>
						<div className="operate-dish">
							<i className="dish-down" onClick={(e) => this.handleDishDown(e, dish)}></i>
							<span>{dish.order_dish_id ? dish.shownumber : dish.dish_number}{dish.norms_name}</span>
							<i className="dish-up" onClick={(e) => this.handleDishUp(e, dish)}></i>
						</div>
					</Col>
					<Col span={5}>
						<Form horizontal id="formconmt" key={Math.random()}>
						    <FormItem className="form-input">
						    	  <span>价格 :  </span>  
					           	  <Input id="prices" className="onprice"/>
					        </FormItem>
						 </Form>
					 </Col>
					 <Col span={4} className="statustyle">更多</Col>
				</Row>
				<Row type="flex" justify="start">					
					<Col className="remarkstyle">备注: {remarkTxtnew}</Col>		
					<Col><i className="right-j" onClick={(e) => this.setRemarks(e, dish)}></i></Col>
				</Row>
				</li>		
			)
			}else if(dish.allow_decimal==1){
				return (
				<li key={key} >
					<Row type="flex" justify="space-between">
						<Col span={6}><span className="dish-name">{dish.dish_name}</span></Col>
						<Col span={6}><div className="operate-dish">
							<i className="dish-down" onClick={(e) => this.handleDishDown(e, dish)}></i>
							<span onClick={this.changeCount}>{dish.dish_number}{dish.norms_name}</span>
							<i className="dish-up" onClick={(e) => this.handleDishUp(e, dish)}></i>
						</div></Col>	
								
						<Col className="statustyle" span={11}>{betmsg}</Col>		
						
						<Col><i className="right-j" onClick={(e) => this.setRemarks(e, dish)}></i></Col>
					</Row>
					<Row type="flex" justify="start" className="secordrow">
						<Col span={11} className="remarkstyle">备注: {remarkTxtnew}</Col>
					</Row>
				</li>
			   )		
			}else if(dish.dish_type==2&&dish.order_dish_id==undefined){   //显示套餐详情列表
				return (    
				 <li key={key} >
				   
					<Row type="flex" justify="space-between">
						<Col span={6}><span className="dish-name">{dish.dish_name}</span></Col>
						<Col span={6}><div className="operate-dish">
							<i className="dish-down" onClick={(e) => this.handleDishDown(e, dish)}></i>
							<span>{dish.order_dish_id ? dish.shownumber : dish.dish_number}{dish.norms_name}</span>
							<i className="dish-up" onClick={(e) => this.handleDishUp(e, dish)}></i>
						</div></Col>	
							 	
						<Col className="statustyle" span={11}>{betmsg}</Col>		
						
						<Col><i className="right-j" onClick={(e) => this.setRemarks(e, dish)}></i></Col>
					</Row>
					<Row type="flex" justify="start" className="secordrow">
						<Col span={11} className="remarkstyle">备注: {remarkTxtnew}</Col>
					</Row>
				  	  <ul className="detaildish">
				  	  	{
				  	 		dish.package_category_list.map((elem, index)=> {
				  	 		return (elem.package_dishes.map((dish,key)=>{
				  	 			return (
				  	 			     <li key={key}><div className="dishleft">{dish.dish_name}</div><div className="dishright">{dish.dish_number}{dish.norms_name}</div></li>
				  	 		    );
				  	 		}));
				  			
				  	 	})}
				  	 </ul>
				 
				</li>		
			  )
			}else{
				return (
				 <li key={key} >
					<Row type="flex" justify="space-between">
						<Col span={6}><span className="dish-name">{dish.dish_name}</span></Col>
						<Col span={6}><div className="operate-dish">
							<i className="dish-down" onClick={(e) => this.handleDishDown(e, dish)}></i>
							<span>{dish.order_dish_id ? dish.shownumber : dish.dish_number}{dish.norms_name}</span>
							<i className="dish-up" onClick={(e) => this.handleDishUp(e, dish)}></i>
						</div></Col>	
								
						<Col className="statustyle" span={11}>{betmsg}</Col>		
						
						<Col><i className="right-j" onClick={(e) => this.setRemarks(e, dish)}></i></Col>
					</Row>
					<Row type="flex" justify="start" className="secordrow">
						<Col span={11} className="remarkstyle">备注: {remarkTxtnew}</Col>
					</Row>
				</li>		
			  )
			}
			
		});
		return (
			<div>
				<OrderDetail />
				<Row type="flex" justify="end" className="cash-controls">
					<Row type="flex" justify="start" className="cash-control">
						<div className="batch-dishs">
							<i className="close-bd" onClick={this.handleGoBack}></i>
							<ul className="dishs">
								{ dishs }
							</ul>
							<ul className="opreatelist">
								{dishlog.map((detail,key)=>{
									 return (
									 	<li key={key}>
									 		<div className="listleft ">
									 			<h4>{detail.title}</h4>
									 			<span className={this.setHTMLStyle(detail)} >[{this.setHTML(detail)}{detail.operate_number}]</span>
									 			<div className="dishresone">{detail.operate_type==0?'':'原因:'}{detail.remarks[0]&&detail.remarks[0].data[0].name}</div>
									 		</div>
									 		<div className="listright">
									 			<div>{detail.creator}</div>
									 			<div>{detail.createtime}</div>
									 		</div>
									 	</li>
									);
								})}
							</ul>
							<OperateDishs 
								{...this.props} 
								handleGoBack={this.handleGoBack}
								dishs={dishs}
							/>
						</div>
						<Refresh 
							{...this.props}
							showGoBackBtn={true}
							handleRefresh={false} 
						/>	
					</Row>
					<TableArea 
						{...this.props} 
						isNotChooseTable={true}
					/>
				</Row>
				<Modal 
				  key={Math.random()}
				  title={`修改 ${this.state.dishName} 备注信息`}
		          visible={this.state.visible}
		          onOk={this.handleOk}
		          confirmLoading={this.state.confirmLoading}
		          onCancel={this.handleCancel}
		          maskClosable={false}
		        >
		          {this.state.ModalText}
		        </Modal>

		        <Modal 
				  title={'修改菜品数量'}
		          visible={this.state.priceable}
		          onOk={this.priceOk}
		          onCancel={this.priceCancel}
		          maskClosable={false}
		          className={'countUser'}
		        >
		         <input id="amountId" type="text" maxLength="4"/>
		        </Modal>
			</div>
		)
	}
}

ModifyDishs.contextTypes = {
	router: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired
}

ModifyDishs = Form.create()(ModifyDishs);

const mapStateToProps = (state) => {
	return {
		batchDishs: state.batchDishs,
		tableArea: state.tableArea,
		orderDetail: state.orderDetail
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({getTables, ...batchdishs, ...getTableArea, ...orderDetail}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ModifyDishs);


// else if(dish.category_name!=='临时菜品'&&dish.order_dish_id){
// 				return (
// 				<li key={key} >
// 					<Row type="flex" justify="space-between">
// 						<Col span={8}><span className="dish-name">{dish.dish_name}</span></Col>
// 						<Col span={6}><div className="operate-dish">
// 							<i className="dish-down" onClick={(e) => this.handleDishDown(e, dish)}></i>
// 							<span>{dish.order_dish_id ? dish.shownumber : dish.dish_number}{dish.norms_name}</span>
// 							<i className="dish-up" onClick={(e) => this.handleDishUp(e, dish)}></i>
// 						</div></Col>	
								
// 						<Col className="statustyle" span={9}>{betmsg}</Col>		
// 						{orderDetail.order_id==''?<Col><i className="right-j" onClick={(e) => this.setRemarks(e, dish)}></i></Col>:null}
// 					</Row>
// 					<Row type="flex" justify="start" className="secordrow">
						
// 						<Col span={11} className="remarkstyle">备注: {remarkTxtnew}</Col>
// 					</Row>
// 				</li>		
// 			  )
// 			   //可输入小数点的菜品 
// 			}