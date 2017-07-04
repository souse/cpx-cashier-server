import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Affix , Row, Col } from 'antd';


import LiveUpdate from '../../components/LiveUpdate';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { fetchProfile, logout } from '../../actions/user';

import {message, Button} from 'antd';
import {disableMenuNSelection} from '../../utils';
import {banBackSpace} from '../../utils';

import './index.less';

const info=function(){
	message.info('黄宏伟的弹窗口');
}

class App extends Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		const { actions } = this.props;
        
       // 禁止鼠标默认右键事件
        disableMenuNSelection();
        //处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外 
		//禁止后退键 作用于Firefox、Opera 
		document.onkeypress=banBackSpace; 
		//禁止后退键 作用于IE、Chrome 
		document.onkeydown=banBackSpace; 

		
	}	

	render() {
		const {user, actions} = this.props;
		
		return (
			<div className="ant-layout-aside">
				<Sidebar {...this.props} user={this.props.user} />
				<div className="ant-layout-main">
					<Header user={user} />
					<div className="ant-layout-container">
						<div className="ant-layout-content">
							{this.props.children}	
						</div>	
					</div>
				</div>
				<LiveUpdate />
			</div>	
		)	
	}
}

App.propTypes = {
  user: PropTypes.object,
  children: PropTypes.node.isRequired
};

const mapStateToProps = (state) => {
	const { user } = state;

	return { user: user ? user : null };
}

const mapDispatchToProps = (dispatch) => {
	return { actions: bindActionCreators({ fetchProfile, logout }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);