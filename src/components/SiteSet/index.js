import React, { Component } from 'react';
import {Row, Col } from 'antd';

import api from '../../api';

import MoreNav from '../MoreNav';

import './index.less';


class SiteSet extends Component {
	constructor(props) {
		super(props);

		this.state = {
			server_ip: '',
			server_port: '',
			client_ip: '',
			webapi_version: '',
			system_no: '',
			deviceName: ''
		};
	}
	
	componentDidMount() {
		let pomise = api.get('/site_info.json', { params: {} });

		pomise.then(resolved => {
			if (resolved.code == 0) {
				const data = resolved.data;
				let shopMessage = localStorage.getItem('SHOPMESSAGE');

				shopMessage = JSON.parse(shopMessage);
				console.log( typeof data.server_ip);
				this.setState({
					server_ip: data.server_ip.split(',')[0],
					server_port: data.server_port,
					client_ip: data.client_ip,
					webapi_version: data.webapi_version,
					system_no: data.system_no,
					deviceName: shopMessage.name	
				});
			}
		}, rejected => {
			console.log('rejected...site_info...');
		});
	}
	
	render() {
		const { server_ip, server_port, client_ip, webapi_version, system_no, deviceName } = this.state;

		return (
			<div className="update-datas site-set">
				<MoreNav activeId={2} />
				<Row className="cash-controls plist">
					<h3>站点管理</h3>
					<p><span>识别机器: </span>{deviceName}</p>
					<p className="oushu"><span>系统编号:  </span>{system_no}</p>
					<p><span>服务器地址:  </span>{server_ip}</p>
					<p className="oushu"><span>点菜宝登录IP:  </span>{server_ip}</p>
					<p><span>端口号:  </span>{server_port}</p>
					<p className="oushu"><span>版本:  </span>{webapi_version}</p>
				</Row>
			</div>	
		)
	}
}

export default SiteSet;



