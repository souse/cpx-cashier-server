import React, { Component ,PropTypes} from 'react';
import {Row, Col ,Button} from 'antd';

import api from '../../api';
import Refresh from '../Refresh';
import MoreNav from '../MoreNav';
import { getUser } from '../../utils';


import './index.less';

// 更多模块中的 日结操作
class MoreDaily extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isshowAlert:false,
			amountnumber:0,
			notprice:0,
			isupload:false,
			islastshow:false
		};
		this.btnsure=this.btnsure.bind(this);
		this.btncomfin=this.btncomfin.bind(this);
		this.btnlastsure=this.btnlastsure.bind(this);
		this.btnlastback=this.btnlastback.bind(this);
	}
	
	componentDidMount() {
		// 刚进入界面的时候，判断未结账的账单数
   	    const user = getUser();
		let pomise = api.get('/uncheckout_number.json', { params: user });
		let pomisesecond = api.get('/notuploaded_order_number.json', { params: user });
        pomise.then((data)=>{
    		if (data.data==0) {
    			 pomisesecond.then((data)=>{
    			 		if (data.data==0) {
    			 			// 没有未上传订单,则弹出确定日结表
    			 			this.setState({islastshow:true});
    			 			console.log("代表没有未结账的账单和没有未上传的账单");
    			 		}else{
    			 			// 还有未上传订单，点击完确定以后，弹窗消失
    			 			this.setState({isupload:true});
    			 			this.setState({notprice:data.data});
    			 		}
    			 }, (error)=>{
    			 		console.log(error);
    			 });
    				
    		}else{
    			// 有未结账的账单
    		    this.setState({isshowAlert:true});
    		    this.setState({amountnumber:data.data});
    		}
        }, (error)=>{
        	console.log(error);
        })
	}
    btnsure(){
        this.setState({isshowAlert:false});
        this.context.router.push('/cashier/choosetable');
    }
    btncomfin(){
    	// 弹框消失，调取上传接口
    	this.setState({isupload:false});
    	const user = getUser();
		let pomise = api.post('/push_order_date.json', { data: user });
		pomise.then((data)=>{
			
			if (data.code==0) {
				this.setState({
				islastshow:true
			  })
			}else{
				console.log(data.code);
			}
		},(error)=>{
			console.log(error);
		})
    }
    btnlastback(){
    	// 点击取消以后，弹出框隐藏
    	this.setState({
    		islastshow:false
    	})
    }
    btnlastsure(){
    	// 调取接口进行日结操作,然后跳转到日结列表
    	this.setState({
    		islastshow:false
    	})
    	const user = getUser();
		let pomise = api.post('/daily_bill.json', { data: user });
		pomise.then((data)=>{
			console.log("日结成功");
			this.context.router.push('/statistics/Dailydayout');
		},(error)=>{
			console.log(error);
		})
		
    }
    handleRefresh(){
    	
    }
	render() {

		return (
			<div className="update-datas site-set">
				<MoreNav activeId={4} />
				<Row className="cash-controls">
					<h3>日结操作</h3>
					
					{this.state.isshowAlert ? <Row type="flex" justify="space-around" className="daystyle">
					     <div className="backbord"></div>
					     <div className="alertShow">
						 	<h4>确认日结</h4>
						    <span className="iconAlert"></span>
						    <section className="sectionstyle">还有<span> {this.state.amountnumber} </span>笔待结账账单，请完成结账</section>
						    <Row type="flex" justify="space-around" className="btntop">
								<Button onClick={this.btnsure} className="btnstyle">确定</Button>
						    </Row>
						 </div>
					</Row>:null}
                   
 					{this.state.isupload ?<Row type="flex" justify="space-around" className="daystyle">
 					   <div className="backbord"></div>
					     <div className="alertShow">
						 	<h4>确认日结</h4>
						    <span className="iconAlert"></span>
						    <section className="sectionstyle">还有<span> {this.state.notprice} </span>笔账单数据未上传，只有全部账单数据上传后才能进行日结操作。</section>
						    <Row type="flex" justify="space-around" className="btntop">
								<Button onClick={this.btncomfin} className="btnstyle">确定</Button>
						    </Row>
						 </div>
					</Row>:null}
					{this.state.islastshow ?<Row type="flex" justify="space-around" className="daystyle">
					   <div className="backbord"></div>
					     <div className="alertShow">
						 	<h4>确认日结</h4>
						    <span className="iconAlert"></span>
						    <section className="sectionstyle">正在对当前操作区间的数据进行日结，确认操作？</section>
						    <Row type="flex" justify="space-around" className="btntop">
								<Button onClick={this.btnlastback} className="btnstyleone">取消</Button>
								<Button onClick={this.btnlastsure} className="btnstyletwo">确定</Button>
						    </Row>
						 </div>
					</Row>:null}
					<Refresh handleRefresh={this.handleRefresh}  handlebtn={false} />
				</Row>

			</div>	
		)
	}
}

MoreDaily.contextTypes = {
	router: PropTypes.object.isRequired
}

export default MoreDaily;



