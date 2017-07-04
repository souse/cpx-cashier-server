import React, { Component, PropTypes } from 'react';
import { Form, Input, Button, Row, Col, notification } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { login } from '../../actions/user';

import api from '../../api';
import { setUser ,setDevice,setDish} from '../../utils';
import KeyBoardMini from '../../components/KeyBoardMini';

import './index.less';

const FormItem = Form.Item;

const propTypes = {
  user: PropTypes.object,
  loggingIn: PropTypes.bool,
  ajaxError: PropTypes.string
};

const contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
};

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id : '',
			inputValue: '',
			shopName: '',
			deviceName: typeof Utils  != 'undefined' ? Utils.GetComputerName() : ''
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleExit = this.handleExit.bind(this);
	}

	componentDidMount() {
		let pomise = api.get('/get_shop_info.json', { params: {} });

		pomise.then(resolved => {
			if (resolved.code == 0) {
				const data = resolved.data;

				this.setState({ shopName: data.name });
				localStorage.setItem('SHOPMESSAGE', JSON.stringify(data));	
			}
		}, rejected => {
			console.log('rejected...get_shop_info...');
		})

	    try{
			var deviceid=Utils.GetComputerName();
		}catch(e){
			var deviceid=0;
		}
		setDevice(deviceid);

		//每次将菜品信息缓存
		let pomisetable = api.get('/get_dishs.json',{ params:{}});
		pomisetable.then((data)=>{
    		 setDish(data.data.dish);
        }, (error)=>{
        	console.log(error);
        });

	}

	componentWillReceiveProps(nextProps) {
		const error = nextProps.ajaxError;
      	const isLoggingIn = nextProps.loggingIn;
      	const user = nextProps.user;

      	if (error != this.props.ajaxError && error) {
          	notification.error({
              	message: '登录失败！',
              	description: error
          	});
      	}

      	if (!isLoggingIn && !error && user)  {
          	notification.success({
              	message: '登录成功！',
              	description: '欢迎 ' + user.name + ' !'
          	});
          	
          	setUser(user);
      	}

      	if (user) {
      		this.context.router.replace('/cashier/choosetable');
      	}
	}

	handleSubmit(e) {
		e.preventDefault();

		const data = this.props.form.getFieldsValue();
		this.props.login(data.user, data.password);
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

	handleExit() {
		try{
			Utils.Exit();
		}catch(e){}
	}

	render() {
		const { shopName, deviceName } = this.state;
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 14 } };

		return (
			<div className="login-controls">
				<Row type="flex" justify="center" className="login-title-content">
					<div className="login-title">欢迎使用厨品秀云收银</div>
				</Row>
				<Row type="flex" justify="center" align="middle" className="login-main">
					<Row type="flex" justify="start">
						<Col span={12} className="login-form">
							<Form layout="horizontal">
					            <FormItem label='门店名称：' {...formItemLayout} >
					              	<span className="txt">{shopName}</span>
					            </FormItem>
					            <FormItem label='设备名称：' {...formItemLayout} >
					              	<span className="txt">{deviceName}</span>
					            </FormItem>
					            <FormItem label='用户名：' {...formItemLayout} >
					              	{getFieldDecorator('user', {
					              		initialValue: '',
					              		rules:[
					              			{required: true, message: '用户名不能为空'}
					              		]
					              	})(
					                	<Input type="text" id="user" placeholder='用户名' autoFocus  onFocus={(e) => this.triggleBoard(e)} />
					              	)}
					            </FormItem>
					            <FormItem label='密码：' {...formItemLayout} >
					              	{getFieldDecorator('password', {
					              		initialValue: '',
					              		rules:[
					              			{required: true, message: '用户名不能为空'}
					              		]	
					              	})(
					                	<Input type='password' id="password" placeholder='密码' onClick={(e) => this.triggleBoard(e)}  />
					              	)}
					            </FormItem>
					            <Row className="log-btns">
					              	<Button type='primary' size="large"  onClick={this.handleSubmit}>登录</Button>
					              	<Button type='default' size="large" onClick={this.handleExit}>退出</Button>
					            </Row>
				          	</Form>
						</Col>
						<Col span={12} className="login-kb">
							<KeyBoardMini 
								onPress={::this.onPress} 
								handleClear={::this.handleClear}
							/>
						</Col>
					</Row>
				</Row>
				<div className="dontshow"><img src="/static/images/bg.png"/></div>
			</div>		
		)
	}
}

Login.contextTypes = contextTypes;

Login.propTypes = propTypes;

Login = Form.create()(Login);

const mapStateToProps = (state) => {
	return state.user;
}

const mapDispatchToProps = (dispatch) => {
	return {
		login: bindActionCreators(login, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
