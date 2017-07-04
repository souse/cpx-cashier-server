import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import {Row, Col, Button, notification ,Spin,Alert} from 'antd';

import { getUser } from '../../utils';
import {formatDate} from '../../utils';

import api from '../../api';

import MoreNav from '../MoreNav';

import './index.less';

class UpdateDatas extends Component {
	constructor(props) {
		super(props);
		this.state={
			timelist:[]
		}
		this.updateSetData = this.updateSetData.bind(this);
		this.updatedaydata=this.updatedaydata.bind(this);
	}

	componentDidMount(){
		const user=getUser();
		const newoog={

			...user,
			type:4
		}
		let pomisetable = api.get('/get_updata_time.json',{ params:newoog});
		pomisetable.then((data)=>{
			this.setState({
				timelist:data.data
			}); 
			console.log(data.data); 	       
        }, (error)=>{
        	console.log(error);
        });
	}

	updateSetData(e) {
		const user = getUser();
		if (e==1) {
			var newobj={
				...user,
				type:1
			};
		}else if(e==2){
			var newobj={
				...user,
				type:2
			};
		}else if(e==3){
			var newobj={
				...user,
				type:3
			};
		}else if(e==4){
			var newobj={
				...user,
				type:4
			};
		}else if (e==5) {
			var newobj={
				...user,
				type:5
			};
		}else{
			var newobj={
				...user
			};
		}

		let promist=api.post('/update_data.json', { data: newobj });
		let pomisetable = api.get('/get_updata_time.json',{ params:user});
		promist.then((data)=>{
			 if (data.code==0) {
			 		pomisetable.then((data)=>{
						this.setState({
							timelist:data.data
						});  	       
			        }, (error)=>{
			        	console.log(error);
			        });
			          notification.open({
					    message: data.msg,
					    description: '',
					    duration:5
					  });
					 
			 }
		},(error)=>{
				console.log(error);
		});

	}

	// updateTableMsg() {
	// 	const user = getUser();
	// 	let promist=api.post('/client_update.json', { data: user });
	// 	let pomisetable = api.get('/get_updata_time.json',{ params:user});
	// 	  promist.then((data)=>{
	// 		 if (data.code==0) {
	// 		 		pomisetable.then((data)=>{
	// 					this.setState({
	// 						timelist:data.data
	// 					});  	       
	// 		        }, (error)=>{
	// 		        	console.log(error);
	// 		        });
	// 		         notification.open({
	// 				    message: data.msg,
	// 				    description: '',
	// 				    duration:5
	// 				  });
	// 		 }
	// 	},(error)=>{
	// 			console.log(error);
	// 	});

	// }

	//上传数据 
    updatedaydata(){
    	const user = getUser();
		let promist=api.post('/push_order_date.json', { data: user });
		let pomisetable = api.get('/get_updata_time.json',{ params:user});
		  promist.then((data)=>{
			 if (data.code==0) {
			 		pomisetable.then((data)=>{
						this.setState({
							timelist:data.data
						});  	       
			        }, (error)=>{
			        	console.log(error);
			        });
			         notification.open({
					    message: data.msg,
					    description: '',
					    duration:5
					  });
			 }
		},(error)=>{
				console.log(error);
		});
    }
	render() {

		return (
			<div className="update-datas">
				<MoreNav activeId={0} />
				<Row className="cash-controls">
					<Row type="flex" justify="space-between" className="updatetop"><i>数据更新</i><input type="button" className="btnstr" value="一键更新全部数据" onClick={()=>this.updateSetData(8)}/></Row>
					<Row type="flex" justify="space-between" className="moreall">
						<Col>
							<p className="zepotstyle">更新用户信息</p>
							<p className="newtime">上次更新于：{this.state.timelist[3]?formatDate(this.state.timelist[3].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={()=>this.updateSetData(1)}>更新数据</Button></Col>
					</Row>
					<Row type="flex" justify="space-between" className="moreall testr">
						<Col>
							<p className="zepotstyle">更新桌台信息</p>
							<p className="newtime">上次更新于：{this.state.timelist[4]?formatDate(this.state.timelist[4].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={()=>this.updateSetData(2)}>更新数据</Button></Col>
					</Row>
					<Row type="flex" justify="space-between" className="moreall">
						<Col>
							<p className="zepotstyle">更新菜品信息</p>
							<p className="newtime">上次更新于：{this.state.timelist[5]?formatDate(this.state.timelist[5].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={()=>this.updateSetData(3)}>更新数据</Button></Col>
					</Row>
					<Row type="flex" justify="space-between" className="moreall testr">
						<Col>
							<p className="zepotstyle">更新配置信息</p>
							<p className="newtime">上次更新于：{this.state.timelist[0]?formatDate(this.state.timelist[0].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={()=>this.updateSetData(5)}>更新数据</Button></Col>
					</Row>
					<Row type="flex" justify="space-between" className="moreall">
						<Col>
							<p className="zepotstyle">更新打印数据</p>
							<p className="newtime">上次更新于：{this.state.timelist[2]?formatDate(this.state.timelist[2].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={()=>this.updateSetData(4)}>更新数据</Button></Col>
					</Row>
					<Row type="flex" justify="space-between" className="moreall testr">
						<Col>
							<p className="zepotstyle">更新数据到云:</p>
							<p className="newtime">上次更新于：{this.state.timelist[1]?formatDate(this.state.timelist[1].time):''}</p>
						</Col>
						<Col><Button type="primary" onClick={this.updatedaydata}>上传数据</Button></Col>
					</Row>
					
				</Row>
			</div>
		)
	}
}

export default UpdateDatas;



