import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import {Icon,Modal ,Button} from 'antd';
import { Link } from 'react-router';

import { getUser } from '../../utils';
import * as orderDetail from '../../actions/orderDetail';
import api from '../../api';

import './index.less';

const defaultProps = {
  items: [
	  	{ key: 1, name: '收银', icon: 'icon-nav-cashier', path: '/cashier/choosetable' },
	    { key: 2, name: '账单', icon: 'icon-nav-bill', path: '/bill/billing' },
	    { key: 8, name: '统计', icon: 'icon-nav-statistics', path: '/statistics/Dailydishdata' },
	    { key: 4, name: '更多', icon: 'icon-nav-more', path: '/more/updatedatas' }
    ]
};
const propTypes = { items: PropTypes.array };

class Sidebar extends Component {
	constructor(props) {
		super(props);

      //这个状态用来保存提示框是否弹出 
		this.state = {
			visible: false,
			hoBtn: false,
			ifcontine:false,
			urlobj:{}
		};
		this.menuClickHandle = this.menuClickHandle.bind(this);
		this.keybordshow=this.keybordshow.bind(this);
		this.contineOk=this.contineOk.bind(this);
		this.contineCancel=this.contineCancel.bind(this);
	}

	componentDidMount() {}

	menuClickHandle(item) {
		const href = window.location.href;
		this.setState({urlobj:item})
		if (href.indexOf('cashier/payment/1')!==-1) {
			 this.setState({ifcontine:true});
		}else{
			this.setState({ activeKey: item.path });
			//点击切换以后，要判断是否需要落单
			this.context.router.replace(item.path);

			const {reversed_remarks}=this.props.orderDetail;
			const ifreverse=0;
			
			this.props.setReversedMessage(reversed_remarks ,ifreverse);
		}
		
		
	}
	// 提示框中的确认和取消按钮执行的方法
	handleOk(){

	}
    handleCancel(){

    }
    //反结账界面切换给的提示框 
    contineOk(){
    	const urlobj=this.state.urlobj;
    	this.setState({ activeKey: urlobj.path,ifcontine:false});
		//点击切换以后，要判断是否需要落单
		this.context.router.replace(urlobj.path);

		const {reversed_remarks}=this.props.orderDetail;
		const ifreverse=0;
		
		this.props.setReversedMessage(reversed_remarks ,ifreverse);
    }
    contineCancel(){
    	this.setState({ifcontine:false});
    }
    keybordshow(){
    	// 调用底层接口的键盘
    	try {
		  Utils.OSK()
		} catch (e) {
		  console.log(e);
		}
    }
    btnDev(){
    	try {
		  Utils.DevTools()
		} catch (e) {
		  console.log(e);
		}
    }
	render() {
		const user = getUser();
		const { location, items } = this.props;
		const { router } = this.context;
		const pathname = location.pathname;

	    const menu = items.map((item) => {
	    	return (
	    		<li 
	    			className={item.path.split('\/')[1] == pathname.split('\/')[1] ? 'ant-menu-item active' : 'ant-menu-item'} 
	    			key={item.key}
	    			onClick={ () => this.menuClickHandle(item) } 
	    		>
		          	<i className={`anticon ${item.icon}`}></i>
		          	<Link className="nav-a" to={item.url}>{item.name}</Link>
		        </li>	
	    	)
	    });

		return (
			<aside className="ant-layout-sider">
				{/** <Link to="/home" ></Link> **/}
				<div className="ant-layout-logo">
					<div className="icon-admin"></div>
					<p className="username">{user != null ? user.name : ''}</p>
				</div>
				<ul className="ant-menu" >
		          	{menu}
		        </ul>

		        <Button className="sliderleft" onClick={this.keybordshow}></Button>
		        <Button className="sliderbottom" onClick={this.btnDev}></Button>
		        <Modal
				  width={300} 
				  title={`提示信息`}
		          visible={this.state.visible}
		          onOk={::this.handleOk}
		          onCancel={::this.handleCancel}
		        >
		        	当前桌台含有未落单的菜品，是否进行落单？
		        </Modal>

		         <Modal
				  width={300} 
				  title={`提示信息`}
		          visible={this.state.ifcontine}
		          onOk={::this.contineOk}
		          onCancel={::this.contineCancel}
		          maskClosable={false}
		        >
		        	<p>您正在进行反结账，完成后才能进行下一步操作</p>
		        	<p className="phhsty">是否离开当前界面?</p>
		        </Modal>
			</aside>	
		)
	}
}

Sidebar.propTypes = propTypes;
Sidebar.defaultProps = defaultProps;
Sidebar.contextTypes = {
	router: React.PropTypes.object
}


const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail		
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators(orderDetail, dispatch);	
}


export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);



