import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Form, Input, Modal, Row, Col, notification } from 'antd';

import KeyBoardMini from '../KeyBoardMini';

import api from '../../api';
import { getUser ,getDish,setDish} from '../../utils';
import { setUser ,getDevice} from '../../utils';

import { login } from '../../actions/user';

import './index.less';

const FormItem = Form.Item;
class SellOutTable extends Component {
	static defaultProps = {
		pcInnerWidth: window.innerWidth
	}
	constructor(props) {
		super(props);
		this.state = {
			id : '',
			inputValue: '',
			visible: false,
			isshowtwo:false,
			device_id:'',
			pshow:false,
			pcenter:'当前用户没有沽清权限'
		}

		this.setSellOut = this.setSellOut.bind(this);
	}
    componentDidMount(){
    	
    }
	setSellOut() {
		this.setState({ visible: true });	
	}
	handleOk(id, dish) {
		const user = getUser();
		const { getFieldsValue } = this.props.form;
		const data = getFieldsValue();
		const obj = {
			...user,
			dish_id: id,
			surplus: data.surplus,
			day_limit: data.dayLimit
		};
        if (data.surplus&&data.dayLimit) {
        	  let pomise = api.post('/set_surplus.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
		          	this.setState({ visible: false });
		          	//更新右侧列表
		          	if (dish.surplus !=-1 ) {
		          		this.props.updateSellOut(dish.dish_id, data.surplus, data.dayLimit);
		          	} else {
		          		this.props.addSellOut({
							...dish,
							surplus: data.surplus,
							day_limit: data.dayLimit
						});
		          	}

					//设置当前沽清菜的背景颜色
		          	this.props.updateDishSurplus(id, data.surplus);
				}else {
					this.setState({isshowtwo:true})
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected...set_surplus...', rejected);
			}
		);
       }
		
	}

	handleCancel() {
		this.setState({ visible: false });
	}
    markCancel(){
    	this.setState({isshowtwo:false})
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
			type:1
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
    		   }else if(data.code==20005){
    		      	this.setState({pshow:true});
    		   		 this.setState({pcenter:"用户密码错误"});
    		   }else {
    		   	   this.setState({
    		   	   	pshow:true
    		   	   })
    		   }
        }, (error)=>{
        	console.log(error);
        });
    }
	triggleBoard(e) {
		const id = e.target.id;
		this.setState({ id: id });
	}

	onPress(value, backspace) {
		const { setFieldsValue, getFieldValue } = this.props.form;
		const keyId = this.state.id;
		let currentValue;

		if ( keyId == '') return;
		currentValue = getFieldValue(keyId);
		if (backspace) {//删除一个值
			currentValue = currentValue.substr(0, currentValue.length - 1);		
		} else {
			currentValue += value;
		}
		setFieldsValue({ [keyId]: currentValue });
		this.setState({ inputValue: currentValue });
	}

	handleClear() {
		const { setFieldsValue } = this.props.form;
		const keyId = this.state.id;
		
		setFieldsValue({ [keyId]: '' });
	}

	render() {
		let ct5;
		const { dish, i, pcInnerWidth } = this.props;
		const surplus = dish.surplus != -1 ? dish.surplus : '';
		const dayLimit = dish.day_limit != -1 ? dish.day_limit : '';
		const username='';
		const password='';

		const { getFieldDecorator } = this.props.form;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		
		if (pcInnerWidth <= 1350) {
			ct5 = (i + 1) % 4 == 0 ? 'ct5' : '';
		} else {
			ct5 = (i + 1) % 5 == 0 ? 'ct5' : '';
		}
		//沽清的菜点击无效 背景红色，字体变白色
		if (dish.surplus == 0) {//-1无限量 >=0限量
			return (
				<li className={`cash dish ctable soldout ${ct5}`}>
					<div>
						<span className="title">{dish.dish_name}</span>
						<span className="posi">{dish.category_name}</span>
						<span className="yang">￥{dish.unit_price}/{dish.norms_name}</span>
					</div>
				</li>
			)
		}
		return (
			<li 
				className={`cash dish ctable ${surplus} ${ct5} `}
				data-table={dish}
				onClick={this.setSellOut}
			>
				<div>
					<span className="title">{dish.dish_name}</span>
					<span className="posi">{dish.category_name}</span>
					<span className="yang">￥{dish.unit_price}/{dish.norms_name}</span>
				</div>
				<Modal title="菜品沽清设置" width={520} className="sellout-set" visible={this.state.visible}  onOk={() => this.handleOk(dish.dish_id, dish)}   onCancel={::this.handleCancel} maskClosable={false} >
		       		<Form horizontal>
		       			<FormItem className="form-titles"
				          	{...formItemLayout}
				          	label="菜品名称"
				        >
				          	<span className="table-name">{dish.dish_name}</span>
				        </FormItem>
				        <FormItem className="form-titles"
				          	{...formItemLayout}
				          	label="菜品规格"
				        >
				          	<span className="table-name">{dish.norms_name}</span>
				        </FormItem>	
				        <FormItem className="form-input"
				          	{...formItemLayout}
				          	label="当前剩余数量"
				        >
				          	{getFieldDecorator('surplus', { initialValue: surplus })(
				            	<Input id="surplus" onClick={(e) => this.triggleBoard(e)} />
				          	)}
				        </FormItem>
				        <FormItem className="form-input"
				          	{...formItemLayout}
				          	label="每日限制数量"
				        >
				          	{getFieldDecorator('dayLimit', { initialValue: dayLimit })(
				            	<Input id="dayLimit" onClick={(e) => this.triggleBoard(e)} />
				          	)}
				        </FormItem>
		       		</Form>
		       		<KeyBoardMini 
		       			onPress={::this.onPress} 
						handleClear={::this.handleClear}
		       		/> 	  	
		        </Modal>
		        <Modal title="当前帐号无权限，需有权限的员工完成操作" width={360} visible={this.state.isshowtwo} onOk={() => this.markOk()}   onCancel={::this.markCancel} maskClosable={false} >
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
				            	<Input id="password" placeholder="输入密码" />
				          	)}
				        </FormItem>
				        {this.state.pshow?<p className="pshow">{this.state.pcenter}</p>:null}
		        		</Form>
		        </Modal>
			</li>

		);	
	}
}

SellOutTable = Form.create()(SellOutTable);


const mapStateToProps = (state) => {
	return state.user;
}

const mapDispatchToProps = (dispatch) => {
	return {
		login: bindActionCreators(login, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SellOutTable);

