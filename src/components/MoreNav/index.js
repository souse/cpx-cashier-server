import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button ,Form, Modal,Input} from 'antd';

import api from '../../api';
import { getUser } from '../../utils';

import * as login from '../../actions/user';

import './index.less';

const lis = [
	{
		id: 0,
		text: '数据更新',
		url: '/more/updatedatas'
	},
	{
		id: 1,
		text: '沽清管理',
		url: '/more/selloutmanage'	
	},
	{
		id: 2,
		text: '站点管理',
		url: '/more/siteset'	
	},
	{
		id: 3,
		text: '交班管理',
		url: '/more/TurnJob'	
	},
	{
		id: 4,
		text: '日结操作',
		url: '/more/MoreDaily'	
	},
	{
		id: 5,
		text: '下载点菜宝',
		url: '/more/download'	
	}
];

const FormItem = Form.Item;
class MoreNav extends Component {
	constructor(props) {
		super(props);
		this.state={
			stershow:false,
			numberpage:0
		}
		this.handleLogout = this.handleLogout.bind(this);
		this.markCancel=this.markCancel.bind(this);
	}
		
	handleChangeType(obj) {
		this.context.router.push(obj.url);
	}

	handleLogout() {
		
		//在退出前判断是否还有未结账的信息
		const user = getUser();
		let pomisss = api.get('/uncheckout_number.json', { params: user });
		    pomisss.then((data)=>{
    		       this.setState({numberpage:data.data});
    		       if (data.data!=0) {
    		       	this.setState({stershow:true});
    		       }else{
    		       	this.markOk();
    		       }
	        }, (error)=>{
	        	console.log(error);
	        });

	}
	markCancel(){
			this.setState({stershow:false});
	}
	markOk(){
		const user = getUser();

		let pomise = api.post('/waiter_logout.json', { data: user });

		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					//localStorage.removeItem('user');
					localStorage.clear();
					this.props.logout();
					//跳转到登录页面
					this.context.router.push('/login');	
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('reject.......waiter_logout: ', rejected);
			}
		);
	}
	render() {
		const { activeId } = this.props;
		const nav = lis.map((li, key) => {
			return (
				<li 
					className={li.id == activeId ? 'active' : ''}
					key={key} 
					onClick={() => this.handleChangeType(li)}
				>
					{li.text}
					<i></i>
				</li>
			)
		});
		const username='';
		const password='';
		const { getFieldDecorator } = this.props.form;
		const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 12 } };
		return (
			<div className="menu stic-nav">
				<h2 className="menu-table-position">更多</h2>
				<ul>
					{ nav }
				</ul>
				<Button 
					className="logout-btn" 
					type="default" 
					size={`large`}
					onClick={this.handleLogout}
				>
					注销
				</Button>
				<Modal title="确认注销" width={360} visible={this.state.stershow} onOk={() => this.markOk()}   onCancel={::this.markCancel} maskClosable={false} >
		        		<div className="iconstyle"></div>
		        		<div className="billstyle">还有{this.state.numberpage}笔未结账的账单</div>	
		        		<div className="tishi">是否确认要注销？</div>	        		
		        </Modal>
			</div>
		)
	}
}

MoreNav.contextTypes = {
	router: PropTypes.object.isRequired
}

MoreNav = Form.create()(MoreNav);

const mapStateToProps = (state) => {
	return {
		user: state.user
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators(login, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreNav);