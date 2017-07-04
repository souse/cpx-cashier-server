import React, { Component, PropTypes } from 'react';
import { Row, Button,notification } from 'antd';

import { getUser, printOrderDetail } from '../../utils';
import api from '../../api';
import './index.less';

let parentH, currentH, defaultH = 0;
class PaymentType extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pay_channel_id: 1,
			paytypes:[],     //支付方式列表集合
			isshwobtn:true,    //控制是否显示上下翻滚按钮
			pay_allnormal:1,   //进来默认正常账单按钮选中状态
			pay_allsty:0    //进来会员账单按钮的状态
		}

		this.handlePrint = this.handlePrint.bind(this);
		this.setactive=this.setactive.bind(this);
		this.seTact=this.seTact.bind(this);
	}

   componentDidMount() {
   	   const user = getUser();
   	   const { orderDetail } = this.props;
   	   const pay_allsty=this.state.pay_allsty;
	   const pay_allnormal=this.state.pay_allnormal;
   	   let pomise = api.get('/get_paychannels.json', { params: user });
		pomise.then(
			(resolved = {}) => {
				if (resolved.code === 0) {
					 this.setState({paytypes:resolved.data});
					 if (resolved.data.length>15) {
					 	this.setState({isshwobtn:true});
					 }
				} else {
					notification.error({
		              	message: '提示信息！',
		              	description: resolved.msg
		          	});
				}
			},
			(rejected = {}) => {
				console.log('reject.......print_order_detail: ', rejected);
			}
		);
		// if (orderDetail.type==1&&orderDetail.reversed!==1) {
		//      this.setState({pay_allnormal:false,pay_allsty:true});
		// }
		if (orderDetail.type==1&&orderDetail.reversed==1) {
			// this.setMember();
			this.seTact();
			this.setState({pay_allnormal:false,pay_allsty:true});
		}
   }
	handlePrint(){
		const user = getUser();
		const { orderDetail } = this.props;
		const obj = {
			...user,
			order_id: orderDetail.order_id,
			type: 4
		}

		printOrderDetail(obj);
	}

	setType(obj) {
		this.setState({ pay_channel_id: obj.pay_channel_id });
		this.props.choosePayType(obj);
	}

	// 正常账单点击
	setactive(){
		const pay_allsty=this.state.pay_allsty;
		const pay_allnormal=this.state.pay_allnormal;
        this.setState({pay_allnormal:true,pay_allsty:false});
		this.props.setNormal();
	}
	// 会员账单点击
   seTact(){
   		const pay_allsty=this.state.pay_allsty;
		const pay_allnormal=this.state.pay_allnormal;
		 this.setState({pay_allnormal:false,pay_allsty:true});
   		this.props.setMember();
   }
	maketop(){
		const pdh = document.getElementsByClassName('payment-all')[0];
		const cdh = document.getElementsByClassName('scrolllist')[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (defaultH <= 0) return false;
		defaultH -= parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
	}
    makebottom(){
    	const pdh = document.getElementsByClassName('payment-all')[0];
		const cdh = document.getElementsByClassName('scrolllist')[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (currentH <= parentH) return false;
		
		if (defaultH >= currentH-300) return false;

		defaultH += parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
    }
	render() {
		const pay_channel_id = this.state.pay_channel_id;
		const paytypes=this.state.paytypes;

		const payBtns = paytypes.map((obj, key) => {
			return (
				<Button 
					className={obj.pay_channel_id == pay_channel_id ? 'btn-normal active' : 'btn-normal'} 
					type="default"
					key={key}
					data-id={obj.pay_channel_id}
					onClick={() => this.setType(obj)}
				>
					{obj.name}
				</Button>	
			)
		});

		return (
			<Row  justify="start" className="payment-type">
			   <div className="pay-allway">
			   		<Button className={this.state.pay_allnormal ? "btn-nortop active" : "btn-nortop"} onClick={()=>this.setactive()}>正常账单<div className={this.state.pay_allnormal?"topicon active":"topicon" }></div></Button>
			   		<Button className={this.state.pay_allsty? "btn-norbottom active" : "btn-norbottom"} onClick={()=>this.seTact()}>会员账单<div className={this.state.pay_allsty?"bottomicon active":"bottomicon" }></div></Button>
			   		<div className="topicon"></div>
			   </div>
			   <div className="payment-all">
				    <div className="scrolllist">
						{ payBtns }
				   </div>
				   {this.state.isshwobtn?<Button 
							className={'btn-normal normal-top'} 
							type="default"
							onClick={() => this.maketop()}
						>
						     <div> </div>
						</Button>:null}
						{this.state.isshwobtn?<Button 
							className={'btn-normal normal-bottom'} 
							type="default"
							onClick={() => this.makebottom()}
						>
							 <div> </div>
						</Button>:null}
			   </div>			
			</Row>	
		)
	}
}

PaymentType.PropTypes = {
	orderDetail: PropTypes.object.isRequired,
	choosePayType: PropTypes.func.isRequired
}

export default PaymentType;