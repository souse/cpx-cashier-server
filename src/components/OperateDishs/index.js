import React, { Component, PropTypes } from 'react';

import { Row, notification,Modal ,Form,Input} from 'antd';

import api from '../../api';
import { getUser ,getDevice,setUser} from '../../utils';
import './index.less';

let user;
const FormItem = Form.Item;
class OperateDishs extends Component {

	constructor(props) {
		super(props);
		 this.state={
		 	isshow:false,   //没有赠菜权限弹窗
		 	OpreateRemarks:[],  //退菜原因列表
		 	operavisible:false,   //退菜原因弹窗
		 	saleRemarks:[],    // 赠菜原因列表
		 	salevisible:false ,   //赠菜原因弹窗
		 	ModalText:'',
		 	canclebtn:true,   //退菜按钮显示
		 	preaentbtn:true,   //赠菜按钮显示
		 	nopresentbtn:true  //取消赠菜按钮显示

		 }

		user = getUser();
		this.saveDish = this.saveDish.bind(this);
		//this.opreateDishs = this.opreateDishs.bind(this);
		this.saveOnlyDish=this.saveOnlyDish.bind(this);
		// this.saleDishs.this.saleDishs.bind(this);
		this.markCancel=this.markCancel.bind(this);
		this.markOk=this.markOk.bind(this);
		this.ophandleOk=this.ophandleOk.bind(this);
		this.ophandleCancel=this.ophandleCancel.bind(this);
		this.onChange=this.onChange.bind(this);
		this.setRemarks=this.setRemarks.bind(this);
		this.salehandleOk=this.salehandleOk.bind(this);
		this.salehandleCancel=this.salehandleCancel.bind(this);
		this.setSaleRemarks=this.setSaleRemarks.bind(this);
		this.noPresentDishs=this.noPresentDishs.bind(this);
	}

	componentWillMount() {
		const { batchdishs } = this.props.batchDishs;

		if (batchdishs.length == 0) this.context.router.push('/cashier/choosetable');
	}
	componentDidMount() {
		const newobjone={
			...user,
			type:'2'
		}
		const newobjtwo={
			...user,
			type:'4'
		}
		const { batchdishs } = this.props.batchDishs;
		const {canclebtn,preaentbtn,nopresentbtn}=this.state
		// 获取退菜备注列表
		let pomise = api.get('/get_dishs_remarks.json', { params: newobjone });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code == 0) {
					this.setState({
						OpreateRemarks: resolved.data
					});
					console.log(resolved.data);
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


		let pomisesale = api.get('/get_dishs_remarks.json', { params: newobjtwo });
		pomisesale.then(
			(resolved = {}) => {
				if (resolved.code == 0) {
					this.setState({
						saleRemarks: resolved.data
					});
					console.log(resolved.data);
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
		if (batchdishs[0].dish_number - batchdishs[0].cancel_number - batchdishs[0].is_present==0) {
			this.setState({canclebtn:false,preaentbtn:false});
		}
		if (batchdishs[0].is_present=='0') {
			this.setState({nopresentbtn:false})
		}
		
	}

	componentWillReceiveProps(nextProps) {
		const { batchdishs } = nextProps.batchDishs;

		if (batchdishs.length == 0) this.context.router.push('/cashier/ordered');				
	}

	opreateDishs(url, type) {//退菜，催菜，补打
		const user = getUser();
		const { table_id, order_id } = this.props.orderDetail;
		const { batchdishs } = this.props.batchDishs;
		
		const orderDishs = this.getOrderDishIds(batchdishs);
		const obj = {
			...user,
			table_id: table_id,
			order_id: order_id,
			order_dishs_json: JSON.stringify(orderDishs)
		};
		if (type=='refund') {
			// this.setState({operavisible:true});
			this.setRemarks();
			return;
		}

		let pomise = api.post(url, { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	//退菜时才修改原orderDetail的数据
		          	if (type) {
		          		this.props.operateFood(batchdishs);
		          	}
		          	const { isBatchOperate } = this.props.batchDishs;
					// this.props.updateIsBatchDish(!isBatchOperate);
					this.props.updateIsBatchDish(false);

					// this.props.handleGoBack();
					this.context.router.goBack();
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
		          	this.setState({isshow:true});
				}
			},
			(rejected = {}) => {
				console.log('OperateDishs......退菜、催菜、补打：', rejected);
			}
		);
	}

	saveDish() {
		//点击保存，（有保存按钮）此时处理的其实是新点的菜s，
		//同步 batchdishs 到 orderDetail
		const { batchDishs, updateUnOrderDishs } = this.props;
		const bd = Object.assign({}, batchDishs);

		// 将临时菜的价格传过去
		updateUnOrderDishs(bd.batchdishs);
		//结束批量处理，页面切到点菜页面
		//this.props.updateIsBatchDish(false);
		this.props.clearBatchDish();
	}

	saveOnlyDish(){
		// 点击保存，修改临时菜品价格
		const user = getUser();
		const deviceid=getDevice();
		const { batchdishs } = this.props.batchDishs;
		const {orderDetail}=this.props;
	    var pricevalue=document.getElementsByClassName('onprice');

		var orderDish=[]; //存放临时菜的价格
		for (var i = 0; i < pricevalue.length; i++) {
			 if (pricevalue[i].value=='') {
			 	pricevalue[i].value=batchdishs[i].unit_price;
			 }
			  orderDish.push(pricevalue[i].value);
		}
		var orderId=[];  //存放临时菜的id
		for (var i = 0; i < batchdishs.length; i++) {
			 if (batchdishs[i].category_name=="临时菜品") {
			 		orderId.push(batchdishs[i].order_dish_id);
			 }
		}
		var orderNew=[];
		for (var i = 0; i < orderId.length; i++) {
			   orderNew.push({ "order_dish_id":orderId[i],"unit_price":orderDish[i]});
		}
		const obj = {
			...user,
			device_id:deviceid,
			order_id:batchdishs[0].order_id,
			order_dishes_json:JSON.stringify({"order_dishes":orderNew})

		};
		let pomise = api.post('/change_dishes_price.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code==0) {
					// const { isBatchOperate } = this.props.batchDishs;
					// this.props.updateIsBatchDish(!isBatchOperate);
					this.props.searchFood({
						...user,
						order_id: orderDetail.order_id,
						table_id: orderDetail.table_id
					});
					this.context.router.goBack();

				}
			},
			(rejected = {}) => {
				console.log('rejected...clear_surplus...', rejected);
			}
		);


	}
	getOrderDishIds(dishs) {
		let arr = [];
		let remarks = [];   //存放备注的数组，包括口味，菜品，点菜状态
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
		for (var i = 0; i < dishs.length; i++) {
			const dish = dishs[i];

			arr.push({ 
				order_dish_id: dish.order_dish_id,
				//number: dish.dish_number,
				cancel_number: dish.allow_decimal==1?dish.dish_number:dish.shownumber, //后台接口修改
				remarks: remarks
			});
		};
		return { order_dishs: arr };
	}

	//点击赠菜按钮后的操作
	saleDishs(){
		const {orderDetail}=this.props;
		this.setSaleRemarks();
	}

  
	getSaleDishIds(dishs){
		let arr = [];
		let remarks = [];   //存放备注的数组，包括口味，菜品，点菜状态
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
		for (var i = 0; i < dishs.length; i++) {
			const dish = dishs[i];

			arr.push({ 
				order_dish_id: dish.order_dish_id,
				//number: dish.dish_number,
				present_number: dish.shownumber, //后台接口修改
				remarks: remarks
			});
		};
		return { order_dishs: arr };
	}
	markCancel(){
		this.setState({isshow:false})
	}
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
    		   	   this.setState({isshow:false}); //输入的用户有权限，当前弹窗消失
    		   	   // this.setState({deleteshow:true});
    		   	  
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
	setRemarks(event) {
		// event.stopPropagation();
		//order_dish_id
		const { orderId } = this.props.batchDishs;
		const { batchdishs } = this.props.batchDishs;

		// if (orderId && dish.order_dish_id) {//已经落单的不能改备注
		// 	return false;
		// }
		//这里写备注信息渲染
		const modelText = this.setModelText(batchdishs);
		this.setState({ 
			operavisible: true,
			dishName: batchdishs.dish_name,
			ModalText: modelText
		});	
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
	setModelText(dish) {
		const dishRemarks = dish.remarks;
		const OpreateRemarks = this.state.OpreateRemarks;//  备注列表数据
		// const { typeId } = this.getRemarkTxtAndTypeId(dish);

		const remarks =  OpreateRemarks.map((rm, key) => {

			const cbx = rm.data.map((r, j) => {
				let ckclass = '', checked = false;
				// const type_id = rm.type + '_' + r.dish_remarks_id;

				// for (var i = 0; i < typeId.length; i++) {
				// 	const tid = typeId[i];

				// 	if(tid === type_id) {
				// 		ckclass = 'group-item-checked';
				// 		checked = true;
				// 		break;
				// 	}
				// };

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
	// 退菜弹框确认按钮
	ophandleOk(){
		const user = getUser();
		const { table_id, order_id } = this.props.orderDetail;
		const { batchdishs } = this.props.batchDishs;
		const orderDishs = this.getOrderDishIds(batchdishs);
		const obj = {
			...user,
			table_id: table_id,
			order_id: order_id,
			order_dishs_json: JSON.stringify(orderDishs)
		};
		let pomise = api.post('/cancel_dishes.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	//赠菜修改原orderDetail的数据
		          	this.props.saleopreFood(batchdishs);
					// this.props.handleGoBack();

					// 改变批量处理的状态
					const { isBatchOperate } = this.props.batchDishs;
					this.props.updateIsBatchDish(false);

					this.setState({operavisible:false});    
					this.context.router.goBack();
				} else if(resolved.code===20048){
					this.setState({operavisible:false});
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}else{
					// 没有退菜权限
					this.setState({isshow:true});
				}
			},
			(rejected = {}) => {
				console.log('OperateDishs......退菜、催菜、补打：', rejected);
			}
		);
	}
	ophandleCancel(){
		this.setState({operavisible:false});
	}

	//赠菜弹框确认按钮
	salehandleOk(){
		const { table_id, order_id } = this.props.orderDetail;
		const { batchdishs } = this.props.batchDishs;
        const user=getUser();
		const orderDishs = this.getSaleDishIds(batchdishs);
		const obj = {
			...user,
			table_id: table_id,
			order_id: order_id,
			order_dishs_json: JSON.stringify(orderDishs)
		};

		let pomise = api.post('/present_dishes.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	//赠菜修改原orderDetail的数据
		          	this.props.saleopreFood(batchdishs);
		          	// 改变批量处理的状态
					const { isBatchOperate } = this.props.batchDishs;
					this.props.updateIsBatchDish(false);

					this.context.router.goBack();
				} else if(resolved.code===20049){
					this.setState({salevisible:false});
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				} else {
					// 没有赠菜权限
					this.setState({isshow:true});
					// notification.error({
		   //            	message: '提示信息！',
		   //            	description: resolved.msg
		   //        	});
				}
			},
			(rejected = {}) => {
				console.log('OperateDishs......退菜、催菜、补打：', rejected);
			}
		);
	}
	salehandleCancel(){
		this.setState({salevisible:false});
	}
	setSaleRemarks(event) {
		// event.stopPropagation();
		//order_dish_id
		const { orderId } = this.props.batchDishs;
		const { batchdishs } = this.props.batchDishs;

		// if (orderId && dish.order_dish_id) {//已经落单的不能改备注
		// 	return false;
		// }
		//这里写备注信息渲染
		const modelText = this.setSaleText(batchdishs);
		this.setState({ 
			salevisible: true,
			dishName: batchdishs.dish_name,
			saleText: modelText
		});	
	}
	setSaleText(dish) {
		const dishRemarks = dish.remarks;
		const saleRemarks = this.state.saleRemarks;//  备注列表数据
		// const { typeId } = this.getRemarkTxtAndTypeId(dish);

		const remarks =  saleRemarks.map((rm, key) => {

			const cbx = rm.data.map((r, j) => {
				let ckclass = '', checked = false;
				// const type_id = rm.type + '_' + r.dish_remarks_id;

				// for (var i = 0; i < typeId.length; i++) {
				// 	const tid = typeId[i];

				// 	if(tid === type_id) {
				// 		ckclass = 'group-item-checked';
				// 		checked = true;
				// 		break;
				// 	}
				// };

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
	noPresentDishs(){
		const user=getUser();
		const { batchdishs } = this.props.batchDishs;
		const obj={
			...user,
			order_id:batchdishs[0].order_id,
			order_dish_id:batchdishs[0].order_dish_id
		}
		let pomise = api.post('/cancel_present.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息',
		              	description: resolved.msg
		          	});
		          	//赠菜修改原orderDetail的数据
		            // this.props.saleopreFood(batchdishs);
					this.context.router.goBack();
				}else {
					
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('OperateDishs......退菜、催菜、补打：', rejected);
			}
		);
	}
	render() {
		//判断条件 orderId, order_dish_id
		let flag = true;
		const { batchdishs } = this.props.batchDishs;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		const { getFieldDecorator } = this.props.form;
		const {canclebtn,preaentbtn,nopresentbtn}=this.state
		const username='';
		const password='';
		if (batchdishs.length != 0 && batchdishs[0].order_dish_id == undefined) flag = false;
        
        //没有落单的情况
		if (!flag) {
			return (
				<Row type="flex" justify="end" className="op-dishs">
					<div className="op-control save" onClick={this.saveDish}>
						<span>保存</span>	
					</div>	
				</Row>	
			)
		}

		return (
			<Row type="flex" justify="end" className="op-dishs">
			    <div className="op-control save" onClick={this.saveOnlyDish}>
						<span>保存</span>	
			    </div>
				{canclebtn?<div className="op-control refund" onClick={() => this.opreateDishs('/cancel_dishes.json', 'refund')}>
					<span>退菜</span>	
				</div>:null}
				{preaentbtn?<div className="op-control giveaway" onClick={() => this.saleDishs()}>
					<span>赠菜</span>	
				</div>:null}
				
				<div className="op-control reminders" onClick={() => this.opreateDishs('/urge_dish.json')}>
					<span>催菜</span>	
				</div>	
				<div className="op-control markup" onClick={() => this.opreateDishs('/reprint.json')}>
					<span>补打</span>	
				</div>
				{nopresentbtn?<div className="op-control markup nopresent" onClick={() => this.noPresentDishs()}>
					<span></span>	
					取消赠菜
				</div>:null}
			    
				 <Modal title="当前帐号无权限，需有权限的员工完成操作" className="opdishsty"   width={360} visible={this.state.isshow} onOk={() => this.markOk()} onCancel={::this.markCancel} maskClosable={false}>
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
		        <Modal 
				  
				  title={'退菜'}
		          visible={this.state.operavisible}
		          onOk={this.ophandleOk}
		          // confirmLoading={this.state.confirmLoading}
		          onCancel={this.ophandleCancel}
		          maskClosable={false}
		        >
		          {this.state.ModalText}
		        </Modal>
 
		         <Modal 
				  
				  title={'赠菜'}
		          visible={this.state.salevisible}
		          onOk={this.salehandleOk}
		          // confirmLoading={this.state.confirmLoading}
		          onCancel={this.salehandleCancel}
		          maskClosable={false}
		        >
		          {this.state.saleText}
		        </Modal>
		        
			</Row>
		)
	}
}

OperateDishs.propTypes = {
	handleGoBack: PropTypes.func.isRequired
}

OperateDishs.contextTypes = {
	router: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired
}

export default OperateDishs;