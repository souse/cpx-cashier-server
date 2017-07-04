import React, { Component, PropTypes } from 'react';
import { Modal, Row, Col, notification ,Form,Input} from 'antd';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import * as sellout from '../../actions/sellout';
import api from '../../api';
import { getUser } from '../../utils';
import { setUser ,getDevice} from '../../utils';

import './index.less';

const FormItem = Form.Item;
class SellOutNav extends Component {
	constructor(props) {
		super(props);
		this.state = {
			visible: false,
			visibled: false,
			dish: null,
			isshowfource:false,
			pshow:false,
			pcenter:'当前用户没有沽清权限'
		}

		this.clearSellOutList = this.clearSellOutList.bind(this);
		this.navOk=this.navOk.bind(this);
		this.navCancel=this.navCancel.bind(this);
		this.onChange=this.onChange.bind(this);
	}

	componentDidMount() {
		const user = getUser();
		const {flag} = this.props;
		this.props.getSellOutList(user);
		let lablest=document.getElementById('checkoutStatus');
		console.log(lablest);
		if (flag) {
			lablest.setAttribute('class', 'checkbox-group-item group-item-checked');
		}
	}
	
	deleteSellOut(dish) {
		this.setState({ 
			visible: true,
			dish: dish
		});
	}

	clearSellOutList() {
			

		// 点击清空以后，判断是否有权限
		const user = getUser();
		const { dish } = this.state;
		const obj = {
			...user,
			all_clear: 1
		};
		let pomise = api.post('/clear_surplus.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
		          	// this.setState({ visible: false });
		          	// 如果有权限的话，弹出确认界面
		          	this.setState({ visibled: true });
				}else {
					// 没有权限，弹出输入有权限的界面
		          	this.setState({isshowfource:true});
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected...clear_surplus...', rejected);
			}
		);
	}

	handleOk() {
		const user = getUser();
		const { dish } = this.state;
		const obj = {
			...user,
			dish_id: dish.dish_id,
			all_clear: 0
		};
		let pomise = api.post('/clear_surplus.json', { data: obj });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					// notification.success({
		   //            	message: '提示信息',
		   //            	description: resolved.msg
		   //        	});
		          	this.setState({ visible: false });
					this.props.deleteSellOut(dish.dish_id);
					this.props.updateDishSurplus(dish.dish_id, -1);
				}else {
					// notification.success({
		   //            	message: '提示信息',
		   //            	description: resolved.msg
		   //        	});	
		          	this.setState({isshowfource:true});
		          	return;
				}
			},
			(rejected = {}) => {
				console.log('rejected...clear_surplus...', rejected);
			}
		);

	}	

	handleCancel() {
		this.setState({ 
			visible: false,
			visibled: false 
		});
	}

	handleOkAll() {
		const user = getUser();
		const { selloutlist } = this.props;

		this.props.clearSellOutList({
			...user,
			all_clear: 1
		});	
		this.setState({ visibled: false });
		//清除所有设置沽清的菜品背景颜色
		
		for (let i = 0; i < selloutlist.length; i++) {
			const dish = selloutlist[i];

			this.props.updateDishSurplus(dish.dish_id, -1);
		};
	}
    navOk(){
    	console.log("点击了确定");
    	// 调取接口，登录并检验权限
    	const user = getUser();
		const { getFieldsValue } = this.props.form;
		const data = getFieldsValue();
		const obj={
			username:data.username,
			password:data.password,
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
    		   	   	token:data.data.token
    		   	   });
    		   	   this.setState({isshowfource:false});
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
    navCancel(){
    	this.setState({
    		isshowfource:false
    	})
    }
    onChange(event){
    	let parentsNode = event.target.parentNode.parentNode;
		const checked = event.target.checked;
		const user = getUser();
		this.props.updateCheckd(checked);
		if (checked) {
			parentsNode.setAttribute('class', 'checkbox-group-item group-item-checked');
		} else {
			parentsNode.setAttribute('class', 'checkbox-group-item');
		}
		let obj={
			...user,
			state:checked
		}
		let pomise = api.post('/set_surplus_state.json', { data: obj });
		pomise.then((data)=>{
    		     // notification.success({
		         //      	message: '提示信息！',
		         //      	description: resolved.msg
		         //  });
        }, (error)=>{
        	console.log(error);
        });


    }
	render() {
		const { dish } = this.state;
		const { selloutlist ,flag} = this.props;
		const dls = selloutlist.map((obj, key) => {
			return (
				<dl className="s-dl" key={key} onClick={() => this.deleteSellOut(obj)}>
					<dd className="dish-name">{obj.dish_name}</dd>
					<dd className="dish-sp">{obj.norms_name}</dd>
					<dd className="dish-ls">{obj.surplus}</dd>
					<dd className="dish-dbuy">{obj.day_limit}</dd>	
				</dl>
			)
		});

		const { getFieldDecorator } = this.props.form;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		const username='';
		const password='';

		return (
			<div className="menu sell-out-detail">
			   <div className="checkstyle">
			    	<label 
						className={`checkbox-group-item`} 
						// key={j} 
						// data-name={r.name}
						id='checkoutStatus'
					    >
						<span className="checkbox">
							<span className="checkbox-inner"></span>
							<input 
								type="checkbox" 
								className="checkbox-input" 
								// data-name={r.name} 
								// value={r.dish_remarks_id} 
								onClick={(e) => this.onChange(e)}
								defaultChecked={flag}
							/>	
						</span>	
						<span className="checkbox-name">日结后，自动清空</span>
					</label>	
			    </div>
				<h2 className="menu-table-position">沽清菜品</h2>
				<div className="menu-table-foods">
					<dl className="sell-title s-dl">
						<dt className="dish-name">品名</dt>
						<dt className="dish-sp">规格</dt>
						<dt className="dish-ls">剩余数量</dt>
						<dt className="dish-dbuy">每日限购</dt>
					</dl>
					<div className="sell-body">
						<div>
							{ dls }
						</div>
					</div>
				</div>
				<div className="menu-opreate menu-sellout">
					<Row type="flex" justify="start">
						<Col className="op op-billing" span={6} onClick={this.clearSellOutList}>
							<div>
								<span>清空</span>
							</div>
						</Col>
					</Row>	
				</div>
				<Modal title="提示信息"  width={250} visible={this.state.visible} onOk={::this.handleOk}  onCancel={::this.handleCancel} maskClosable={false} >
		          	<p>{dish && dish.dish_name || ''}正在取消沽清设置！</p>
		        </Modal>
		        <Modal title="提示信息"  width={250} visible={this.state.visibled} onOk={::this.handleOkAll}  onCancel={::this.handleCancel} maskClosable={false}>
		          	<p>是否清空全部沽清信息？</p>
		        </Modal>

		        <Modal title="当前帐号无权限，需有权限的员工完成操作" width={360} visible={this.state.isshowfource} onOk={() => this.navOk()}   onCancel={::this.navCancel} maskClosable={false}>
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
			</div>
		)
	}
}

SellOutNav = Form.create()(SellOutNav);

const mapStateToProps = (state) => {
	return {
		flag: state.sellout.flag
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...sellout}, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(SellOutNav)