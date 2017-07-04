import React, { Component } from 'react';

import {Row, Col } from 'antd';
import api from '../../api';
import {DoMain} from '../../api';
import MoreNav from '../MoreNav';
import QRCode from './seturl';

import './index.less';


class DownloadApp extends Component {
	constructor(props) {
		super(props);
		this.state={
			 urllist:[],
			 str:''
		};
	}
	
	componentDidMount(){
		console.log(DoMain);
	    let pomise = api.get('/get_versions_url.json',{});
		pomise.then((data)=>{
			this.setState({urllist:data.data});
			var qrcode = new QRCode(document.getElementById("qrcode"), {
	        width : 150,//设置宽高
	        height : 150
	        });
            qrcode.makeCode('http://houtai.staging.chupinxiu.com/src/downloadpage/android/index.html?download_url='+data.data[0].download_url);

            var qrma = new QRCode(document.getElementById("codetwo"), {
	        width : 150,//设置宽高
	        height : 150
	        });
            qrma.makeCode('http://houtai.staging.chupinxiu.com/src/downloadpage/ios/index.html?download_url='+data.data[1].download_url);
        }, (error)=>{
        	console.log(error);
        });
       
	}
	render() {

		return (
			<div className="update-datas">
				<MoreNav activeId={5} />
				<Row className="cash-controls">
					<h3>下载点菜宝</h3>
					<Row type="flex" justify="space-around">
						<div className="spaceandrio">
						  <span>安卓手机</span>
						  <div className="contain"><section id="qrcode"></section><div className="logostyle"></div></div>
						  <p>扫描此二维码。下载点菜宝APP</p>
						  <p></p>
						</div>
						<div className="spaceios">
						   <span>苹果手机</span>
						   <div className="contain"><section id="codetwo"></section><div className="logostyle"></div></div>
						   <p>扫描此二维码。下载点菜宝APP</p>
						  <p></p>
						</div>
					</Row>
				</Row>
			</div>	
		)
	}
}

export default DownloadApp;



