import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {Button,Input,Row} from 'antd';
import { getUser } from '../../utils';
import api from '../../api';
import './index.less';
import * as login from '../../actions/user';
import {formatDate} from '../../utils';

class DisciplineTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isShow:false,
			isKnow:false,
			shopName:''
		};
		this.marksure=this.marksure.bind(this);
		this.btnback=this.btnback.bind(this);
		this.btncomfine=this.btncomfine.bind(this);
		this.knowall=this.knowall.bind(this);
		this.printshit=this.printshit.bind(this);
	}
		
	handleChangeSticType(obj) {
		this.context.router.push(obj.url);
	}
    componentDidMount(){
        let pomise = api.get('/get_shop_info.json', { params: {} });

		pomise.then(resolved => {
			if (resolved.code == 0) {
				const data = resolved.data;

				this.setState({ shopName: data.name });
				
			}
		}, rejected => {
			console.log('rejected...get_shop_info...');
		})
    }
    marksure(){
       this.setState({isShow:true});
    }
    btncomfine(){
    	const user = getUser();
   		// const imprest=document.getElementById('imprest').value;
        const remarks=document.getElementById('remarks').value;
        const abc=document.getElementById('personName').value;
        // console.log(abc);
		const obj={
			...user,
			imprest:abc,
			remarks:remarks
		};
		let pomise = api.post('/shift.json',{ params:obj});
		pomise.then((data)=>{
    		console.log(data.msg);
    		this.setState({isShow:false});
    		this.setState({isKnow:true});
        }, (error)=>{
        	console.log(error);
        });
    }
    btnback(){
          this.setState({isShow:false});
    }
    knowall(){
    	  this.setState({isKnow:false});
    	  // 提示框消失以后，跳转到登录界面

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
    printshit(){
    	// 点击打印交接班按钮，调取接口
    	const user=getUser();
    	// console.log(this.props.shift_id);
    	console.log(this.props.dailymessage.shift_id);
    	const obj={
    		...user,
    		shift_id:this.props.dailymessage.shift_id
    	};
    	let promise=api.post('/print_shift_bill.json', { data: obj });
    	promise.then((data)=>{
    		 console.log("打印成功");
    	},(error)=>{
    		 console.log(error);
    	})
    }
	render() {
		const { activeId } = this.props;
		

		if (this.props.titleshow) {
			if (this.props.dailymessage.list) {
				var startime=this.props.dailymessage.start_time;
			    var stoptime=this.props.dailymessage.shift_time;
			    var shitpeople=this.props.dailymessage.shift_people;
				var amountoal=this.props.dailymessage.list[0].total;
				// var amountnumber=this.props.dailymessage.list[0].list[0].total;
				if (this.props.dailymessage.list[0].list[0]) {
					var amountnumber=this.props.dailymessage.list[0].list[0].total; 
				}else{
					var amountnumber=0;
				}
				var numbertotal=this.props.dailymessage.list[1].total;
				var numberdetail=this.props.dailymessage.list[1].list[0].total;
				var zhekou=this.props.dailymessage.list[1].list[1].total;
				var zengsong=this.props.dailymessage.list[1].list[2].total;
				var yingshou=this.props.dailymessage.list[1].list[3].total;
				var zhifu=this.props.dailymessage.list[2].total;
				if (this.props.dailymessage.list[2].list[0]) {
					  var xianjin=this.props.dailymessage.list[2].list[0].total;
				}else{
					var xianjin=0;
				}
				if (this.props.dailymessage.list[2].list[1]) {
					var yinhang=this.props.dailymessage.list[2].list[1].total;
				}else{
					var yinhang=0;
				}
				if (this.props.dailymessage.list[2].list[2]) {
					var weixin=this.props.dailymessage.list[2].list[2].total;
				}else{
					var weixin=0;
				}
				if (this.props.dailymessage.list[2].list[3]) {
					var zhibao=this.props.dailymessage.list[2].list[3].total;
				}else{
					var zhibao=0;
				}
				if (this.props.dailymessage.list[2].list[2]) {
					var meituan=this.props.dailymessage.list[2].list[2].total;
				}else{
					var meituan=0;
				}
				if (this.props.dailymessage.list[2].list[3]) {
					var baidu=this.props.dailymessage.list[2].list[3].total;
				}else{
					var baidu=0;
				}
			}

		}else{
			if (this.props.shitmessage.list) {
			    var startime=this.props.shitmessage.start_time;
			    var stoptime=this.props.shitmessage.shift_time;
			    var shitpeople=this.props.shitmessage.shift_people;
				var amountoal=this.props.shitmessage.list[0].total;
				 if (this.props.shitmessage.list[0].list[0]) {
				 	 var amountnumber=this.props.shitmessage.list[0].list[0].total;
				 }else{
				 	var amountnumber=0;
				 }
				
				var numbertotal=this.props.shitmessage.list[1].total;
				var numberdetail=this.props.shitmessage.list[1].list[0].total;
				var zhekou=this.props.shitmessage.list[1].list[1].total;
				var zengsong=this.props.shitmessage.list[1].list[2].total;
				var yingshou=this.props.shitmessage.list[1].list[3].total;
				var zhifu=this.props.shitmessage.list[2].total;
				if (this.props.shitmessage.list[2].list[0]) {
					var xianjin=this.props.shitmessage.list[2].list[0].total;
				}else{
					var xianjin=0;
				}
				if (this.props.shitmessage.list[2].list[1]) {
					var yinhang=this.props.shitmessage.list[2].list[1].total;
				}else{
					var yinhang=0;
				}
				if (this.props.shitmessage.list[2].list[2]) {
					var weixin=this.props.shitmessage.list[2].list[2].total;
				}else{
					var weixin=0;
				}
				if (this.props.shitmessage.list[2].list[3]) {
					var zhibao=this.props.shitmessage.list[2].list[3].total;
				}else{
					var zhibao=0;
				}
				if (this.props.shitmessage.list[2].list[2]) {
					var meituan=this.props.shitmessage.list[2].list[2].total;
				}else{
					var meituan=0;
				}
				if (this.props.shitmessage.list[2].list[3]) {
					var baidu=this.props.shitmessage.list[2].list[3].total;
				}else{
					var baidu=0;
				}

		}
		}

		return (
			<div className="discipline">
			   {this.props.titleshow? <h3>{this.state.shopName}</h3>:null}
				 <p>交班表</p>
				 <ul>
				 	<li>时间段: {formatDate(startime)}--{formatDate(stoptime)}</li>
				 	
				 	<li>交班人员: {shitpeople}</li>
				 </ul>
				 <table cellPadding="0" cellSpacing="0">
				   <tbody>
					 	<tr>
					 	  <td colSpan={3} className="tdstyle">账单汇总表</td>
					 	</tr>
					 	<tr>
					 	  <td rowSpan={2}>账单合计: {amountoal}</td>
					 	  <td>店内单合计</td>
					 	  <td>{amountnumber}单</td>
					 	</tr>
					 	<tr>
					 	  <td>外卖单合计</td>
					 	  <td>0单</td>
					 	</tr>
					 	<tr>
					 	  <td rowSpan={4}>营业收入: {numbertotal}</td>
					 	  <td>消费合计</td>
					 	  <td>{numberdetail}</td>
					 	</tr>
					 	<tr>
					 	  <td>折扣合计</td>
					 	  <td>{zhekou}</td>
					 	</tr>
					 	<tr>
					 	  <td>赠送合计</td>
					 	  <td>{zengsong}</td>
					 	</tr>
					 	<tr>
					 	  <td>应收合计</td>
					 	  <td>{yingshou}</td>
					 	</tr>
					 	<tr>
					 	  <td rowSpan={7}>支付方式: {zhifu}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[0].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[0].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[1].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[1].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[2].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[2].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[3].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[3].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[4].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[4].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[5].name}</td>
					 	  <td>{this.props.shitmessage.list&&this.props.shitmessage.list[2].list[5].total}</td>
					 	</tr>
					 	<tr>
					 	  <td>444</td>
					 	  <td>0</td>
					 	</tr>
					 	<tr>
					 	  <td colSpan={3}>
							 {this.props.ulshow?<ul className="ulonlystyle">
								<li>备用金: {this.props.dailymessage.imprest}</li>
								<li>提交金额: {this.props.dailymessage.shift_amount}</li>
								<li>交接备注: {this.props.dailymessage.remarks}</li>
								<li>打印次数: {this.props.dailymessage.print_count}</li>
								<li>最近打印: {this.props.dailymessage.last_print_time?formatDate(this.props.dailymessage.last_print_time):this.props.dailymessage.last_print_time}</li>
							 </ul>:<ul>
							         
							         <li><span>备注 : </span>  <Input size="small" className="inputtwo" id="remarks"/></li>
							         <li>备用金: {this.props.inputnumber}</li>
							         <li>应交金额: {this.props.inputnumber?Number(this.props.shitmessage.receive_amount)+Number(this.props.inputnumber):this.props.shitmessage.receive_amount}</li>
							       </ul>}
					 	  </td>
					 	</tr>
					 </tbody>	
				 </table>
			
				 {this.props.btnshow?<Button className="showButton" onClick={this.printshit}>打印交班单</Button>:<Button className="showButton btnother" onClick={this.marksure}>确定</Button>}
				 {this.state.isShow ? <div className="comfine">
					  <h4>确认交班</h4>
						    <span className="iconAlert"></span>
						    <section>是否确认交班？</section>
						    <Row type="flex" justify="space-around" className="btnallsty">
								<Button onClick={this.btnback}>取消</Button>
								<Button onClick={this.btncomfine} className="btnsure">确定</Button>
						    </Row>
				 </div>:null}
				 
				 {this.state.isKnow?<div className="knowall">
				 		<p>交班数据提交成功，即将退出登录</p>
				 		<Button onClick={this.knowall}>知道了</Button>
				 </div>:null}
			</div>
		)
	}
}

DisciplineTable.contextTypes = {
	router: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
	return {
		user: state.user
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators(login, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DisciplineTable);
