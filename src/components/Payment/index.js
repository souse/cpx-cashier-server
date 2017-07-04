import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Select, Table, Row, Col, Button, Checkbox, notification,Modal ,Form,Input,Icon} from 'antd';

import { getUser } from '../../utils';
import { setUser ,getDevice} from '../../utils';
import api from '../../api';

import * as orderDetail from '../../actions/orderDetail';
import * as tables from '../../actions/tables';
import * as getTableArea from '../../actions/tableArea';
import * as batchdishs from '../../actions/batchdishs';

import OrderDetail from '../OrderDetail';
import PaymentType from '../PaymentType';
import KeyBoard from '../KeyBoard';
import KeyBoardPay from '../keyboardpay'
import Refresh from '../Refresh';
import BillOrderDetail from '../BillOrderDetail';

import './index.less';

const Option = Select.Option;
const FormItem = Form.Item;
notification.config({
  placement: 'topRight',
  duration: 2,
});


class Payment extends Component {
	constructor(props) {
		super(props);

		this.state = {
			id: 'realPayMoney',
			realPayMoney: 0,
			paymentType: { //支付方式
				pay_channel_id: 1,
				name: '现金'
			},
			isNeedInvoice: false,
			isAllDiscount: false, //是否对已设置不打折的商品也打折
			isDiscount: false, //是“确定(按钮)”了选择的打折信息
			showPayDom: true, //是否显示实收金额输入框
			showDiscoutActive: false, // 不参与打折，整单打折 切换
			discountList: [],
			discountObj: null ,//选择的打折类型
			pshow:false ,  
			isshowtwo:false,  //没有操作权限的弹出框
			xianshow:true,
			discountWay:0,   //抹零方式
			deteleshow:false, //手动抹零弹框 
		    chargezmout:true, //显示挂帐客户
		    componename:[],   //挂帐客户表
		    customsrId:'' ,  //存放挂帐客户的ID
		    saleorder:true,  //手动输入折扣界面
		    salebill:'' ,   //手动输入折扣的数字
		    ifsale:true,  //判断是否执行系统抹零
		    morespend:true, //是否多种支付方式

		    paylist:[],   //存放支付方式的列表
		    is_first:true, //是否第一次结账
		    discount:0,   //折扣金额
		    deletemoey:0 ,  //弹框赠送金额。抹零金额
		    oldpay:0, // 左边实收金额
		    noordermony:0, //未付金额
		    reacemoney:0,   // 左边应收金额
		    givenumber:0,  //找零金额
		    rightrecive:0,  //右边应收金额
		    isShowOK:0 ,//是否显示继续收款

		    ifmember:false,    //是否会员结账
		    paytipshow: false, //结账错误信息提示
		    payTipsMessage: '支付失败错误提示信息！'
		}

		this.checkInvoice = this.checkInvoice.bind(this);
		//打折相关
		this.changeDisRate = this.changeDisRate.bind(this);
		this.isSetAllDiscount = this.isSetAllDiscount.bind(this);
		//输入键盘
		this.onPress = this.onPress.bind(this);
		this.markCancel=this.markCancel.bind(this);
		this.markOk=this.markOk.bind(this);
		this.shouldreave=this.shouldreave.bind(this);
		this.changemoney=this.changemoney.bind(this);
		this.onPressonce=this.onPressonce.bind(this);
		this.deletehandleConfirm=this.deletehandleConfirm.bind(this);
		this.handleChangeStatus=this.handleChangeStatus.bind(this);
		this.salehanlder=this.salehanlder.bind(this);
		this.savelist=this.savelist.bind(this);
		this.deleteicon=this.deleteicon.bind(this);
		this.commentinit=this.commentinit.bind(this);
		this.handleCanclealert=this.handleCanclealert.bind(this);
		this.setMember=this.setMember.bind(this);
		this.setNormal=this.setNormal.bind(this);
	}
	
	handleChangeStatus(value,valuename){
	    this.setState({customsrId:value});
	}
	salehanlder(){
		const {saleorder}=this.state;
		this.setState({saleorder:!saleorder});
	}
	componentWillMount() {
		this.props.clearBatchDish();

	}

	componentDidMount() {
		this.caculatePayment();
	}

	caculatePayment() {
		const user = getUser();
		const { orderDetail } = this.props;
		const {paymentType,deletemoey}=this.state;
		let pomise = api.get('/get_promotions.json', { params: user });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					this.setState({ discountList: resolved.data });
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
		this.props.searchFood({
			...user,
			order_id: orderDetail.order_id,
			table_id: orderDetail.table_id
		});

		let pomisedd = api.get('/get_shop_info.json', { params: user });

		pomisedd.then(
			(resolved = {}) => {
				 // 获取抹零方式
				 this.setState({discountWay:resolved.data.minus_change_way});
				 // this.setState({reacemoney:this.shouldreave(orderDetail.receive_amount,resolved.data.minus_change_way)});
				 if (orderDetail.reversed==1) {
				 	 this.setState({deletemoey:(orderDetail.amount-this.shouldreave(orderDetail.amount,this.state.discountWay)).toFixed(2)});
				 	 this.setState({reacemoney:orderDetail.amount-this.state.deletemoey,
				    			  oldpay:orderDetail.amount-this.state.deletemoey,
		                          rightrecive:orderDetail.amount-this.state.deletemoey			
				    });
				    this.setState({paylist:[{
						'pay_channel_id':paymentType.pay_channel_id,
					    'pay_channel_name':paymentType.name,
						'pay_amount':orderDetail.amount-this.state.deletemoey
					}]});
					if (document.getElementById('realPayMoney')) {
							document.getElementById('realPayMoney').value=orderDetail.amount-this.state.deletemoey;
					}
				 }else{
				    this.setState({deletemoey:(orderDetail.amount-this.shouldreave(orderDetail.receive_amount,this.state.discountWay)).toFixed(2)});
				    this.setState({reacemoney:orderDetail.amount-this.state.deletemoey,
				    			  oldpay:orderDetail.amount-this.state.deletemoey,
		                          rightrecive:orderDetail.amount-this.state.deletemoey			
				    });
				    this.setState({paylist:[{
						'pay_channel_id':paymentType.pay_channel_id,
					    'pay_channel_name':paymentType.name,
						'pay_amount':orderDetail.amount-this.state.deletemoey
					}]});
					if (document.getElementById('realPayMoney')) {
						document.getElementById('realPayMoney').value=orderDetail.amount-this.state.deletemoey;
					}
				 }
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);

		// 获取客户列表
		let pomiseccm = api.get('/get_customers.json', { params: user });

		pomiseccm.then(
			(resolved = {}) => {
				 // 获取抹零方式
				 this.setState({componename:resolved.data});
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);		
	}
	componentWillReceiveProps(nextProps){
		 
	}

    // 右边金额初始化
	commentinit(receiveAmount){
		const {paymentType}=this.state;
		this.setState({reacemoney:receiveAmount,
			           oldpay:receiveAmount,
			           rightrecive:receiveAmount,
			           noordermony:0,
			           givenumber:0})
		this.setState({paylist:[{
			'pay_channel_id':paymentType.pay_channel_id,
		    'pay_channel_name':paymentType.name,
			'pay_amount':receiveAmount
		}]})
		var txtrealPayMoney=document.getElementById('realPayMoney');
		txtrealPayMoney.value=receiveAmount;
	}
    shouldreave(number, value) {
	    var result = 0;
	    switch(value) {
	        case 1: result = number;
	        break;
	        case 2: result = (Math.floor(number*10)/10).toFixed(2);
	        break;
	        case 3: result = (Math.ceil(number*10)/10).toFixed(2);
	        break;
	        case 4: result = (Math.round(number*10)/10).toFixed(2);
	        break;
	        case 5: result = Math.ceil(number).toFixed(2);
	        break;
	        case 6: result = Math.floor(number).toFixed(2);  //向下抹零到元
	        break;
	        case 7: result = Math.round(number).toFixed(2);
	        break;
	        case 8: result=(Math.floor(number/10)*10).toFixed(2);
	        break;
	        // default: result = number.toFixed(2);
	        // break;
	        default: result = number;
	        break;
	    }
	    return result;
	}
	checkInvoice(event) {
		const checked = event.target.checked;

		this.setState({ isNeedInvoice: checked });
	}

	setIsDiscount(event, type) {
		//type == 0 参与打折 不显示支付方式
		const { orderDetail } = this.props;
		if (type == 1) {  //不参与打折
			this.commentinit(this.shouldreave(orderDetail.amount,this.state.discountWay));
			this.setState({discount:0,deletemoey:orderDetail.amount-this.shouldreave(orderDetail.amount,this.state.discountWay)});

			this.setState({ isDiscount: false});
			this.handleClearDiscountPayAmount();
			this.setState({is_first:true});
		}else{
			
			if (!this.state.is_first) {
				 notification.open({
				    message: '温馨提示',
				    description: '结账中不能进行打折！！',
				  });
			}else{
				this.setState({showPayDom: type,showDiscoutActive: !type,reacemoney:orderDetail.receive_amount});
			}
			
		}

	}

	changeDisRate(value, option) {
		const { obj } = option.props;

		this.setState({ discountObj: obj });
	}

	isSetAllDiscount(event) {
		const checked = event.target.checked;

		this.setState({ isAllDiscount: checked });
	}

	hanldeDiscount(type) { // true 确定， false 取消
		this.setState({ 
			isDiscount: type,
			showPayDom: true,
			showDiscoutActive: type 
		});	

		if (type) {//重新计算支付金额
			// 如果点击确认以后，判断权限
			const user=getUser();
			let promise=api.post('/check_discount_permission.json', { data: user });
		    	promise.then((data)=>{
		    		  if (data.code==0) {
		    		  	  // 代表有权限，直接可以修改数据 
		    		  		this.handleRecalculate();
		    		  }else{
		    		  	 // 没有权限，弹出登录框
		    		  	 this.setState({isshowtwo:true});
		    		  }
		    	},(error)=>{
		    		 console.log(error);
		    })

			
		} else {
			this.handleClearDiscountPayAmount();
		}
	}

	// 打折方式确认
	handleRecalculate() {
		const { orderDetail } = this.props;
		const { isAllDiscount, discountObj ,paymentType,ifmember} = this.state;
		const { amount, dishs } = orderDetail;
		// const rate = discountObj.rebate_rate / 100; //折扣率
		if (this.state.saleorder==false) {
			var rate = this.state.salebill / 100;   //自定义打折方式
		}else{
			var rate = discountObj.rebate_rate / 100;
		}
		let receiveAmount = 0, discountAmount = 0;  

		for (var i = 0; i < dishs.length; i++) {
			const dish = dishs[i];

			if (isAllDiscount) {//如果勾选了全部都打折   勾选上对不打折的商品也打折
				  if(ifmember){
				  	  if (dish.dish_type==2) {
				  	  	 receiveAmount += eval(dish.vip_price) * 1000 * (dish.package_dish_group.length-dish.cancel_number-dish.is_present) * rate;
				  	  }else{
				  	  	 receiveAmount += eval(dish.vip_price) * 1000 * (dish.dish_number-dish.cancel_number-dish.is_present) * rate;
				  	  }
				  	 
				  }else{
				  	if (dish.dish_type==2) {
				  		receiveAmount += eval(dish.pay_price) * 1000 * (dish.package_dish_group.length-dish.cancel_number-dish.is_present) * rate;
				  	}else{
				  	  receiveAmount += eval(dish.pay_price) * 1000 * (dish.dish_number-dish.cancel_number-dish.is_present) * rate;
				  	}
				  }
				 
			} else { 
				if (dish.rebated != 0) {//判断这种菜品是否可以打折
					if(ifmember){
						if (dish.dish_type==2) {
							receiveAmount += eval(dish.vip_price) * 1000 *  (dish.package_dish_group.length-dish.cancel_number-dish.is_present) * rate;
						}else{
							receiveAmount += eval(dish.vip_price) * 1000 *  (dish.dish_number-dish.cancel_number-dish.is_present) * rate;
						}
						
					}else{
						if (dish.dish_type==2) {
							receiveAmount += eval(dish.pay_price) * 1000 * (dish.package_dish_group.length-dish.cancel_number-dish.is_present) * rate;
						}else{
							receiveAmount += eval(dish.pay_price) * 1000 * (dish.dish_number-dish.cancel_number-dish.is_present) * rate;
						}
						
					}
					
				} else {
					if(ifmember){
						if (dish.dish_type==2) {
							receiveAmount += eval(dish.vip_price) * 1000 *  (dish.package_dish_group.length-dish.cancel_number-dish.is_present);
						}else{
							receiveAmount += eval(dish.vip_price) * 1000 *  (dish.dish_number-dish.cancel_number-dish.is_present);
						}
						
					}else{
						if (dish.dish_type==2) {
							receiveAmount += eval(dish.pay_price) * 1000 * (dish.package_dish_group.length-dish.cancel_number-dish.is_present);
						}else{
							receiveAmount += eval(dish.pay_price) * 1000 * (dish.dish_number-dish.cancel_number-dish.is_present);
						}
						
					}
					
				}
			}
		};
		receiveAmount=receiveAmount/1000;
		this.setState({deletemoey:(receiveAmount-this.shouldreave(receiveAmount,this.state.discountWay)).toFixed(2)});
		
		discountAmount = (eval(amount) - receiveAmount).toFixed(2); //折扣金额

        receiveAmount =this.shouldreave(receiveAmount.toFixed(2),this.state.discountWay);  //应收金额
		//更新orderDetail 信息
		this.props.updateFoodPayPrice({
			receive_amount:receiveAmount,
			discount_amount: discountAmount
		});
		this.setState({ifsale:true,discount:Number(discountAmount)});
		this.commentinit(receiveAmount);
	}	

	handleClearDiscountPayAmount() {
		const { orderDetail } = this.props;

		this.props.updateFoodPayPrice({
			receive_amount: orderDetail.amount,
			discount_amount: '0.00'
		});
	}

	choosePayType(obj) {
		this.setState({ paymentType: obj });
		const { orderDetail } = this.props;
		const {paylist}=this.state;
		if (document.getElementById('realPayMoney')) {
			var firstinput=document.getElementById('realPayMoney').value;
		}
		if (this.state.is_first) {   //第一次改变支付集合的方式
			this.setState({paylist:[{
			'pay_channel_id':obj.pay_channel_id,
		    'pay_channel_name':obj.name,
			'pay_amount':firstinput
		  }]});
		}else{
			
			if (obj.pay_channel_id==8) {
				  notification.open({
				    message: '温馨提示',
				    description: '结账中不能进行挂帐！！',
				  });
				  return;
			}else{
				paylist.splice((paylist.length-1),1,{
				'pay_channel_id':obj.pay_channel_id,
			    'pay_channel_name':obj.name,
				'pay_amount':firstinput
			  });

			}
		}
		
		if (obj.pay_channel_id==1) {
			this.setState({xianshow:true});
		}else{
			this.setState({xianshow:false});
		}
		if (obj.pay_channel_id==8) {
			this.setState({chargezmout:false});
		}else{
			this.setState({chargezmout:true});
		}
	}
    // 按照正常账单结账
	setNormal(){
		const { orderDetail } = this.props;
		const user=getUser();
			this.setState({ifmember:false});
			this.props.ifmembercheckout(false);
			this.props.searchFood({
				...user,
				order_id: orderDetail.order_id,
				table_id: orderDetail.table_id,
				is_member:0
			});
			// this.commentinit(orderDetail.amount);

			const newObj={
				user,
				order_id:orderDetail.order_id,
				table_id: orderDetail.table_id,
				is_member:0
			}
			let pomise = api.get('/get_order.json', { params: newObj });
			pomise.then(
				(resolved = {}) => {
					if (resolved.code === 0) {
					    orderDetail.amount=resolved.data.amount;
					 	this.commentinit(resolved.data.amount);
					} else {
					}
				},
				(rejected = {}) => {
					console.log('reject.......print_order_detail: ', rejected);
				}
			);
	}
    // 按照会员价结账
	setMember(){
        const { orderDetail } = this.props;
		const user=getUser();
		this.setState({ifmember:true});
		this.props.ifmembercheckout(true);
		// 这个等封装好函数以后再用这个方法
		this.props.searchFood({
			...user,
			order_id: orderDetail.order_id,
			table_id: orderDetail.table_id,
			is_member:1
		});
		const newObj={
			user,
			order_id:orderDetail.order_id,
			table_id: orderDetail.table_id,
			is_member:1
		}
		let pomise = api.get('/get_order.json', { params: newObj });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
				    orderDetail.amount=resolved.data.amount;
				    OrderDetail.receive_amount=resolved.data.amount;
				 	this.commentinit(resolved.data.amount);
				} else {
				}
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);
	}


	onPress(value, backspace) {
		let currentValue, curDom;
		const keyId = this.state.id;	
		const { orderDetail } = this.props;	
		const { paymentType } = this.state;
		let  {oldpay,paylist}=this.state;
		// if ( keyId == '') return;
		if (document.getElementById('realPayMoney')) {
			// 输入实收金额
			curDom = document.getElementById(keyId);
		    currentValue = curDom.value;
		if (backspace) {//删除一个值
			currentValue = currentValue.substr(0, currentValue.length - 1);		
		} else {
			currentValue += value;
		}
		curDom.value = currentValue;
        this.setState({})
        if(this.state.is_first){//如果第一结账执行逻辑

        	 this.setState({paylist:[{
				'pay_channel_id':paymentType.pay_channel_id,
			    'pay_channel_name':paymentType.name,
				'pay_amount':currentValue
			  }]});
          if(Number(currentValue)>=Number(this.state.reacemoney)){
	          this.setState({morespend:true});//显示找零金额
	          this.setState({givenumber:(Number(currentValue)-(Number(this.state.reacemoney))).toFixed(2)});
	  		  this.setState({noordermony:-1});
          }else{
          	// 如果实收金额小于应收金额，这时候就要多种支付，随时计算出未付金额
			 this.setState({morespend:false});   //显示未付金额
			 this.setState({noordermony:(Number(this.state.reacemoney)-Number(currentValue)).toFixed(2)});

          }
          this.setState({oldpay:currentValue});
         //多付款方式逻辑
         }else{
             if(Number(currentValue)<=this.state.rightrecive){
             	 paylist.splice((paylist.length-1),1,{
					'pay_channel_id':paymentType.pay_channel_id,
				    'pay_channel_name':paymentType.name,
					'pay_amount':currentValue
				  });
	              this.setState({paylist:paylist});
	              let strPrice=0;
	              for (var i = 0; i < paylist.length; i++) {
	              	strPrice+=Number(paylist[i].pay_amount);
	              }
	             this.setState({oldpay:strPrice});
             	 this.setState({morespend:false});
             	 this.setState({noordermony:(Number(this.state.reacemoney)-strPrice).toFixed(2)});
           
             }else{
             	currentValue=this.state.rightrecive;
             	this.setState({morespend:true});
             	this.setState({givenumber:(Number(currentValue)-Number(this.state.rightrecive)).toFixed(2)});
             	document.getElementById('realPayMoney').value=this.state.rightrecive;
             	 paylist.splice((paylist.length-1),1,{
					'pay_channel_id':paymentType.pay_channel_id,
				    'pay_channel_name':paymentType.name,
					'pay_amount':this.state.rightrecive
				 });
	              this.setState({paylist:paylist});
	              let strPrice=0;
	              for (var i = 0; i < paylist.length; i++) {
	              	strPrice+=Number(paylist[i].pay_amount);
	              }
	             this.setState({oldpay:strPrice});

             }
            

           }
           this.setState({isShowOK:Number(this.state.rightrecive-currentValue)});
           this.setState({
			realPayMoney: currentValue
		});

	   }else{
	   	 //输入自定义折扣 
	   	    let mycurrentvalue,mycurdom;
			mycurdom=document.getElementById('saleval'
				);
			mycurrentvalue=mycurdom.value;
			if (backspace) {//删除一个值
				mycurrentvalue = mycurrentvalue.substr(0, mycurrentvalue.length - 1);		
			} else {
				mycurrentvalue += value;
			}
			mycurdom.value=mycurrentvalue;
			this.setState({salebill:mycurrentvalue});
	   }
		
	}

	savelist(){
		let {paylist,oldpay}=this.state;
		const { orderDetail } = this.props;
		const { paymentType ,noordermony} = this.state;
		var txtrealPayMoney=document.getElementById('realPayMoney');	
		if(this.state.is_first){
			oldpay=0;
			this.setState({oldpay:oldpay});
		}else{

		}
	    this.setState({isShowOK:0});
		//oldpay+=Number(txtrealPayMoney.value);
		let strPrice=0;
              for (var i = 0; i < paylist.length; i++) {
              	strPrice+=Number(paylist[i].pay_amount);
              }
        oldpay=strPrice;
		this.setState({noordermony:(Number(this.state.reacemoney)-oldpay).toFixed(2)});
		this.setState({rightrecive:(Number(this.state.reacemoney)-oldpay).toFixed(2)})
		 if (Number(this.state.reacemoney)-oldpay<=0) {
		 	txtrealPayMoney.value='';
		 	
		 }else{
		 	txtrealPayMoney.value=noordermony;
		 }
	    this.setState({morespend:true});
	    this.setState({is_first:false});
		paylist.push({
				'pay_channel_id':paymentType.pay_channel_id,
				'pay_channel_name':paymentType.name,
			 	'pay_amount':noordermony
			  });
		this.setState({paylist:paylist});
		this.setState({oldpay:Number(oldpay)+Number(noordermony)});

	}

	onPressonce(value, backspace){
		let curDom;
		let currentValuetwo='';
		const keyId = 'molin';	
		if ( keyId == '') return;
		curDom = document.getElementById(keyId);
		currentValuetwo = curDom.value;
		if (backspace) {//删除一个值
			currentValuetwo = currentValuetwo.substr(0, currentValuetwo.length - 1);		
		} else {
			currentValuetwo += value;
		}
		curDom.value = currentValuetwo;
		this.setState({deletemoey:currentValuetwo});
	}
	triggleBoard(e) {
		const id = e.target.id;
		this.setState({ id: id });	

		const { orderDetail } = this.props;
		const { paymentType } = this.state;
	}
	blurout(){
		
	}

	handleClearPay() {//清空支付
		document.getElementById('realPayMoney').value = '';
		this.setState({ realPayMoney: '' });	
	}

	handleCancle() {
		this.handleClearDiscountPayAmount();
		this.context.router.goBack();	
	}

	handleCanclealert(){
		this.setState({deteleshow:false});
	}

	handleConfirm() {
		const user = getUser();
		const { componename }=this.state;
		const { customsrId }=this.state;
		const { deletemoey }=this.state;
		const { paylist, oldpay }=this.state;
		const { reversed_remarks, get_order_time, table_id }=this.props.orderDetail;
		const { order_id, amount, discount_amount, receive_amount, reversed} = this.props.orderDetail;
		const { isAllDiscount, realPayMoney, isNeedInvoice, paymentType, discountObj, isDiscount,ifmember } = this.state;
		var custoname='';
		for (var i = 0; i < componename.length; i++) {
			if (componename[i].customer_id==customsrId) {
				 custoname=componename[i].customer_name;
			}
		}

		if (paylist.length==0) {
			if (paymentType.id==8) {
				paylist.push({
					'pay_channel_id':paymentType.pay_channel_id,
					'pay_channel_name':paymentType.name,
					'pay_amount':receive_amount
				});
			}
		}
		const obj = {
			...user,
			order_id: order_id,
			amount: amount,
			discount_amount: discount_amount,
			receive_amount: this.state.reacemoney,
			pay_amount: custoname.length==0?oldpay:this.state.reacemoney,
			change_amount: (eval(oldpay) - this.state.reacemoney).toFixed(2),  //找零金额
			is_draw_bill: isNeedInvoice ? 1 : 0,   //是否开发票
			draw_bill_amount: this.state.reacemoney,      //开票金额
			pay_channel: JSON.stringify(paylist),
			promotion_id: discountObj != null ? discountObj.promotion_id : '',
			discount_type: isDiscount ? 2 : 1,
			discount_all: isAllDiscount ? 1 : 0,
			reversed: reversed,
			reversed_remarks: reversed_remarks,
			customer_id:this.state.customsrId,
			customer_name:custoname,
			give_amount:deletemoey,
			rebate:this.state.salebill==0?null:this.state.salebill,
			is_member:ifmember?1:0,
			table_id: table_id,
			get_order_time: get_order_time
		};
		
		 	let pomise = api.post('/checkout.json', { data: obj });
		    pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					notification.success({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
		     		//结账成功以后
		     		//1、清空当前桌子；2、订单初始化
		     		const { currentTableArea } = this.props.tableArea;

		     		this.props.clearFood();
		     		this.props.setCurrentTable(null);
					this.context.router.push('/cashier/choosetable');
					this.props.getTables({
						...user,
						area_id: currentTableArea.area_id,
						status: currentTableArea.status != undefined ? currentTableArea.status : ''
					});
					this.props.clearBatchDish();// 清空批量处理
				} else if (resolved.code == 20067 || resolved.code == 20068) {// 并台
					//直接提示
					//重新拉取订单数据
					this.setState({ paytipshow: true, payTipsMessage: msg });
				} else if (resolved.code == 20069) {// 退菜、赠菜、加菜处理
					const tip = this.resolveTips(resolved.data);

					this.setState({ paytipshow: true, payTipsMessage: tip });
				}else {
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

	resolveTips(data) {// data返回的订单信息
		var opreateString = ''; //处理方式统计 0123
		var cancleDishs = [], // 退菜列表
			presentDishs = [], // 赠菜列表
			newDishs = [], // 加菜列表
			canclePresentDishs = []; //取消赠菜
		var allDishLogs = [];
		//const { dish_groups } = this.props.orderDetail; // 原始订单菜品列表
		const new_dish_groups = data.dish_groups; // 最新订单菜品列表
		const dishs = [], new_dishs = [];

		//dish_groups.forEach(obj => Array.prototype.push.apply(dishs, obj.group_dishes));
		new_dish_groups.forEach(obj => Array.prototype.push.apply(new_dishs, obj.group_dishes));

		for (let i = 0; i < new_dishs.length; i++) {
			let dish = new_dishs[i];
			let operateLogs = dish.operate_logs;

			operateLogs.forEach(obj => {
				opreateString += obj.operate_type;
				_doOperateLog(obj.operate_type, obj, dish);
			});

			/** 由于套餐的 内部菜 赠 退 金额不变 所以 这里不用再做处理 ===  注释掉以往万一
			if (ds.dish_type == 2) { // dish_type 2:套餐，1:正常菜
				// 1、获取套餐的份数，2、获取套餐包含的菜列表	3、套餐份数 * 套餐包含菜 list
				const packageDishGroup = dish.package_dish_group;
				const pkDishs =[];

				packageDishGroup.forEach(object => Array.prototype.push.apply(pkDishs, object.package_dishes));

				pkDishs.map(pd => {
					const pkLogs = pd.operate_logs;

					pkLogs.forEach(pl => {
						opreateString += obj.operate_type;
						_doOperateLog(pl.operate_type, pl, pd);
					});
				})
			}
			**/
		};

		let txt = '';
		let os = this._dropRepeat(opreateString);

		allDishLogs = newDishs.concat(presentDishs, cancleDishs, canclePresentDishs);

		allDishLogs.forEach(arr => {
			txt += this._tips(arr);			
		});

		if (os.length == 1) {
			if (os == 0) {
				txt = '出现加菜：账单金额出现变化，' + txt + '立即刷新账单？';
			} else if (os == 1) {
				txt = '出现退菜：账单金额出现变化，' + txt + '立即刷新账单？';
			} else if (os == 2) {
				txt = '出现赠菜：账单金额出现变化，' + txt + '立即刷新账单？';	
			} else {
				txt = '出现取消赠菜：账单金额出现变化，' + txt + '立即刷新账单？';	
			}
			
		} else {
			txt = '混合出现：账单金额出现变化，' + txt + '立即刷新账单？';
		}

		return txt;

		function _doOperateLog(type, ds, dish) {
			//操作类型，0点菜，1退菜，2赠菜，3取消赠菜
			ds.dish = dish;

			switch(type) {
				case 0: 
					newDishs.push(ds);
					break;
				case 1: 
					cancleDishs.push(ds);
					break;
				case 2: 
					presentDishs.push(ds);
					break;
				default: 
					canclePresentDishs.push(ds);	
			}
		} 
	}

	_tips(log) {
		let logstr = '';
		let typetxt = '';

		switch(log.operate_type) {
			case 0: 
				logstr += '新增' + log.dish.dish_name + 'x' + log.operate_number + '/' + log.dish.norms_name + '（操作服务员：' + log.creator + '），';
				break;
			case 1: 
				logstr += log.dish.dish_name + 'x' + log.operate_number + '/' + log.dish.norms_name + '被退菜（操作服务员：' + log.creator + '），';
				break;
			case 2: 
				logstr += log.dish.dish_name + 'x' + log.operate_number + '/' + log.dish.norms_name + '被设置为赠菜（操作服务员：' + log.creator + '），';
				break;
			default: 
				logstr += log.dish.dish_name + 'x' + log.operate_number + '/' + log.dish.norms_name + '被取消赠菜（操作服务员：' + log.creator + '），';
		}
		return logstr;
	}

	_dropRepeat(str) {
		let result = '';
		let hash = {};

		for (var i = 0, elem; i < str.length; i++) {
			elem = str[i];

			if (!hash[elem]) {
			   hash[elem] = true;
			   result += elem;
			}
		}

		return result;
	}

	getPayDom() {
		const { orderDetail } = this.props;
		const { paymentType } = this.state;
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		const {componename}=this.state;
		return (
			<div className="pay-main">
				<Row type="flex" justify="start" className="pay-d pay-title">
					<Col span={7}>支付方式：</Col>
					<span>{paymentType.name}</span>
				</Row>	
				<Row type="flex" justify="start" className="pay-d">
					<Col span={7}>应收金额：</Col>
					<Col span={16} className="paym">{this.state.rightrecive<0?0:this.state.rightrecive}</Col>
				</Row>

				{this.state.chargezmout?<Row type="flex" justify="start" className="pay-d">
					<Col span={7}>实收金额:</Col>
					<Col span={12}>
						<input 
							type="text" 
							id="realPayMoney"
							className="ant-input ant-input-lg rpm" 
							placeholder="输入金额"
							onClick={(e) => this.triggleBoard(e)}
							onBlur={()=>this.blurout()}
						/>	
					</Col>
				</Row>:<Row type="flex" justify="start" className="pay-d">
					<Col span={7}>挂帐客户: </Col>
					<Col span={16}>
					     <FormItem {...formItemLayout}>
						    		{getFieldDecorator('company', {initialValue: ''})(
						           		<Select size="large" onChange={this.handleChangeStatus}>
						           			<Option value="">全部</Option>
						           			{componename.map((cashier, key) => 
												<Option key={key} value={String(cashier.customer_id)}>{cashier.customer_name}</Option>	
											)}	
										</Select>	 		
						            )}
						  </FormItem>
					</Col>
				</Row>}
				
				<Row type="flex" justify="start" className="pay-d">
				     <Col span={7}>{this.state.morespend?'找零金额：':'未付金额：'}</Col>
				     <Col span={16} className="paym">{this.state.morespend?this.state.givenumber:this.state.noordermony}</Col>
				</Row>

				
				{this.state.isShowOK>0?<Row type="flex" justify="start" className="pay-d continepay">
				    <Button onClick={this.savelist}>继续收款</Button>
				</Row>:null}
			</div>				
		)
	}

	setDisDom() {
		const { discountList, discountObj } = this.state;
		let options;

		if (discountList.length == 0) {
			options = (<Option value="暂无折扣" disabled>暂无折扣</Option>);
		} else {
			options = discountList.map((obj, key) => {
				return (
					<Option obj={obj} key={key} value={`${obj.promotion_id}`}>{obj.name}</Option>
				)
			});	
		}

		return (
			<div className="pay-main">
				<Row type="flex" justify="start" className="pay-d pay-title">
					<Col span={7}>折扣方式：</Col>
					<span>整单打折</span>
				</Row>
				
				{this.state.saleorder?<div><Row type="flex" justify="start" className="pay-d">
					<Col span={7}>折扣率：</Col>
					<Col span={12}>
						<input 
							type="text" 
							id="disRate"
							className="ant-input ant-input-lg rpm"
							disabled
							value={discountObj != null ? `${discountObj.rebate_rate}%` : ''}
						/>	
					</Col>
				</Row>
				<Row type="flex" justify="start" className="pay-d">
					<Col span={7}>原因：</Col>
					<Col span={12}>
						<Select size="large" value={discountObj != null ? discountObj.name : ''} onSelect={this.changeDisRate}>
					   		{ options }  	
					    </Select>	
					</Col>
				</Row></div>:<Row type="flex" justify="start" className="pay-d  salestyle">
					<Col span={7}>输入折扣: </Col>
					<Col span={16}>
						<Input 
						   type="text"
						   id="saleval"
						   value={this.state.salebill}
						   />
						   折
					</Col>
				</Row>}

				<Row type="flex" justify="start" className="pay-d dis-all-check">
					<Col span={7}></Col>
					<Col span={17}>
						<Checkbox onChange={this.isSetAllDiscount}>是否对已设置不打折的商品也打折</Checkbox>	
					</Col>
				</Row>
				<Row type="flex" justify="end" className="pay-d dis-btns">
				    <Button size="large" onClick={this.salehanlder} className="saleorder">{this.state.saleorder?'输入折扣':'选择折扣'}</Button>
					<Button type="default btn-dis-cancle" size="small" onClick={() => this.hanldeDiscount(false)}>取消</Button>
					<Button type="primary btn-dis-confirm" size="small" onClick={() => this.hanldeDiscount(true)}>确认</Button>	
				</Row>	
			</div>
		)
	}

	markOk(){
		
		const user = getUser();
		const deviceid=getDevice();
		const { getFieldsValue } = this.props.form;
		const data = getFieldsValue();
		const obj={
			username:data.username,
			password:data.password,
			device_id:deviceid,
			type:2
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
    		   	   this.setState({isshowtwo:false});
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
	changemoney(){
		if (this.state.is_first) {
			 this.setState({deteleshow:true});
		}else{

		    this.setState({deteleshow:false});
		    notification.open({
		    message: '温馨提示',
		    description: '结账中不能更改抹零',
		  });
		}
	}
	handleCancel(){
		this.setState({deteleshow:false});
	}
	// 更改抹零金额以后的确认按钮
	deletehandleConfirm(){
		const {paymentType}=this.state;
		this.setState({deteleshow:false});
		const { orderDetail } = this.props;
		let receiveAmount=(orderDetail.amount-this.state.deletemoey-this.state.discount).toFixed(2);
		this.props.updateFoodPayPrice({
			receive_amount: receiveAmount
		});
		
		this.setState({ifsale:false});
		if (this.state.is_first) {
			this.commentinit(receiveAmount);
		}
		

	}
	deletehandleClearPay(){
		document.getElementById('molin').value = '';
	}

	
	deleteicon(val){
		if (val==0) {return ;}
		let {paylist,oldpay,noordermony}=this.state;
		const { orderDetail } = this.props;
		oldpay=oldpay-Number(paylist[val].pay_amount);
		paylist.splice(val,1);
		this.setState({paylist:paylist,oldpay:oldpay});
		this.setState({noordermony:(Number(this.state.reacemoney)-oldpay).toFixed(2)});
		this.setState({rightrecive:(Number(this.state.reacemoney)-oldpay).toFixed(2)});
		var txtrealPayMoney=document.getElementById('realPayMoney');
		 if (Number(orderDetail.receive_amount)-oldpay<=0) {
		 	txtrealPayMoney.value='';
		 	
		 }else{
		 	txtrealPayMoney.value=(Number(this.state.reacemoney)-oldpay).toFixed(2);
		 }
		 if (paylist.length==0) {
		 	this.setState({is_first:true});
		 	this.commentinit(this.state.reacemoney);
		 	this.setState({noordermony:-1});
		 }
		 this.setState({isShowOK:10});
		

	}

	handleRefreshOrder() {
		let _self = this;
		const user = getUser();
		const { order_id, table_id } = this.props.orderDetail;
		const sendData = {
			...user,
			order_id: order_id,
			table_id: table_id
	    }

		let pomise = api.get('/get_order_ver2.json', { params: sendData });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					this.props.updateFoodPayPrice(resolved.data);
					_self.caculatePayment();
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

		this.setState({ paytipshow: false });
	}
	
	handlePayTipCancel() {
		this.setState({ paytipshow: false });
	}

	render() {
		const { isreversed } = this.props.params;
		const { orderDetail } = this.props;
		const { realPayMoney, showPayDom, showDiscoutActive ,paylist} = this.state;
		let paydom;

		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };

		const { getFieldDecorator } = this.props.form;
		const username='';
		const password='';


		if (showPayDom) {
			paydom = this.getPayDom();
		} else {
			paydom = this.setDisDom();
		}
		let moneylist=paylist.map((obj, key)=>{
			return (
				<li className="smalllist" key={key}>
				      <span>{obj.pay_channel_name}: {obj.pay_amount}</span>
				      <i className="deletesty" onClick={()=>this.deleteicon(key)}></i>
				</li>
			 );
		});
		return (
			<div>
				{/** !isreversed ? <OrderDetail /> : <BillOrderDetail hasBilled={1} {...this.props} /> **/}
				<OrderDetail />
				<Row type="flex" align="start" className="cash-controls payment-contents">
					<Row className="payment-content">
						<Row type="flex" justify="space-between" className="payset">
							<div className="calc-detail">
								<Row type="flex" justify="space-between" className="calc-d">
									<Col span={12}>消费金额：</Col>
									<Col span={12}>{orderDetail.dish_number}项 {orderDetail.amount}</Col>
								</Row>
								<Row type="flex" justify="space-between" className="calc-d">
									<Col span={12}>抹零金额：</Col>
									<Col span={12}>{this.state.deletemoey}</Col>
								</Row>
								<Row type="flex" justify="space-between" className="calc-d">
									<Col span={12}>应收金额：</Col>
									<Col span={12}>{this.state.reacemoney}</Col>
								</Row>
								<Row type="flex" justify="space-between" className="calc-d">
									<Col span={12}>实收金额：</Col>
									<Col span={12}>{this.state.oldpay}</Col>
								</Row>
								<ul>
									{moneylist}
								</ul>
								<Row type="flex" justify="end" className="clac-invoice">
									<Col span={14}><Checkbox onChange={this.checkInvoice}>此账单需开发票</Checkbox></Col>
									<Col span={10} className="changemoey"><Button onClick={this.changemoney}>更改抹零金额</Button></Col>
								</Row>
							</div>
							<div className="pay-info">
								{ paydom }
								<div className="dis-main">
								<Row type="flex" justify="end">
										<div className={!showDiscoutActive ? 'vbtn no-dis active' : 'vbtn no-dis'} onClick={(e) => this.setIsDiscount(e, 1)}>
											<span>不打折</span>
										</div>
										<div className={showDiscoutActive ? 'vbtn all-dis active' : 'vbtn vbtn all-dis'} onClick={(e) => this.setIsDiscount(e, 0)}>
											<span>整单打折</span>
										</div>
									</Row>
									
								</div>
							</div>	
						</Row>	
						<Row type="flex" justify="space-between" className="paycalc">
							
							<PaymentType 
								orderDetail={orderDetail} 
								choosePayType={::this.choosePayType}
								setNormal={::this.setNormal}
								setMember={::this.setMember}
							/>
							<KeyBoardPay 
									onPress={this.onPress}
									handleClearPay={::this.handleClearPay}
									handleCancle={::this.handleCancle}
									handleConfirm={::this.handleConfirm}
									btncanle={true}
									btnsure={true} 
							 />
						</Row>
						<Modal title="当前帐号无权限，需有权限的员工完成操作" width={360} visible={this.state.isshowtwo} onOk={() => this.markOk()} onCancel={::this.markCancel} maskClosable={false} >
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
					            {this.state.pshow?<p className="pshow">当前用户没有沽清权限</p>:null}
		        		    </Form>
		                </Modal>
			            <Modal
							width={390}
							title="更改抹零金额" 
							visible={this.state.deteleshow}
							onCancel={::this.handleCancel}
					        footer=""
					        maskClosable={false}
					    >
					    	<Row type="flex" justify="space-between" className="open-invoice">
					    		<Col span={8}>抹零金额：</Col>
					    		<Col span={16} className="invoice-m">
					    		   
						    		   <input 
										type="text" 
										id="molin"
										// className="ant-input ant-input-lg rpm" 
										// placeholder="输入金额"
										value={this.state.deletemoey}
										onClick={(e) => this.triggleBoard(e)}
										onBlur={()=>this.blurout()}
									/>	
					    		</Col>
					    	</Row>
					    	<KeyBoard 
								onPress={this.onPressonce}
								handleClearPay={::this.deletehandleClearPay}
								handleCancle={::this.handleCanclealert}
								handleConfirm={this.deletehandleConfirm}
								btnsure={true}
								btncanle={true}
							/>  	  
				       	</Modal>
					</Row>
					<Refresh 
						{...this.props} 
						showGoBackBtn={true}
					/>	
				</Row>
				<Modal 
			    	key={Math.random()}
			    	width={400}
			    	title="提示信息" 
			    	visible={this.state.paytipshow}
		          	onOk={::this.handleRefreshOrder} 
		          	onCancel={::this.handlePayTipCancel}
		          	maskClosable={false}
		          	closable={false}
		        >
		        	<p className="pay-tips">{this.state.payTipsMessage || '错误提示信息！'}</p>
		        </Modal>
			</div>
		)
	}
}

Payment.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};
Payment = Form.create()(Payment);
const mapStateToProps = (state) => {
	return {
		batchDishs: state.batchDishs,
		orderDetail: state.orderDetail,
		tables: state.tables,
		tableArea: state.tableArea
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({ ...tables, ...getTableArea, ...orderDetail, ...batchdishs }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Payment);