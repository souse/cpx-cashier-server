import React, { Component ,PropTypes} from 'react';
import {Row, Col ,Button,Input,Form} from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MoreNav from '../MoreNav';
import Refresh from '../Refresh';
// import DisciplineTable from '../DisciplineTable';
import api from '../../api';
import { getUser ,formatDate} from '../../utils';
// import {} from '../../utils';
import * as login from '../../actions/user';

import './index.less';
import KeyBoard from '../KeyBoard';

import KeyBoardTurn from '../Keyboradturn'


// 更多模块中的。     交班模块
const FormItem = Form.Item;
class TurnJob extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isAlert:true,
			number:0,
			shitjson:{},     //调用get_shift接口获取到的全部数据
			id:'personNameLine',
			number:0,
			inputnumber:0,
			shitarry:[],
			isShow:false,  //交班弹框是否显示
			isKnow:false
		}
		this.handleRefresh = this.handleRefresh.bind(this);
		this.btnback=this.btnback.bind(this);
		this.btnsure=this.btnsure.bind(this);
		this.getInfodetail=this.getInfodetail.bind(this);
		this.onPress=this.onPress.bind(this);
		this.handleClearPay=this.handleClearPay.bind(this);
		this.marksure=this.marksure.bind(this);
		this.trunback=this.trunback.bind(this);
		this.btncomfine=this.btncomfine.bind(this);
		this.knowall=this.knowall.bind(this);
	}

	handleRefresh(){
        // 刷新查看当前是否还有待结账账单 
	}
	// 取消按钮
	btnback(){
		this.context.router.goBack();
	}
	trunback(){
		this.setState({isShow:false});
	}
	btncomfine(){
    	const user = getUser();
        const remarks=document.getElementById('remarks').value;
        const imprest=document.getElementById('personNameLine').value;
		const obj={
			...user,
			imprest:imprest,
			remarks:remarks
		};
		this.setState({isShow:false});
    	this.setState({isKnow:true});   //即将退出登录框
		let pomise = api.post('/shift.json',{ params:obj});
		pomise.then((data)=>{ 
    		
        }, (error)=>{
        	console.log(error);
        });
    }
	// 确认按钮
	btnsure(){
		this.setState({
			isAlert:true
		})
      this.getInfodetail();
	}
	componentDidMount(){
       // 刚进入界面的时候，判断未结账的账单数
   	    const user = getUser();
		let pomise = api.get('/uncheckout_number.json', { params: user });
        pomise.then((data)=>{
    		if (data.data==0) {
    			this.setState({isAlert:true});
    			this.getInfodetail();
    		}else{
    			// 有未结账的账单
    		    this.setState({isAlert:false});
    		    this.setState({number:data.data});
    		}
        }, (error)=>{
        	console.log(error);
        })
		
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
		this.setState({ inputnumber: currentValue });
	}
	handleClearPay() {
		const { setFieldsValue } = this.props.form;
		const keyId = this.state.id;
		
		setFieldsValue({ [keyId]: '' });
		this.setState({inputnumber:''});
	}
	getInfodetail(){
		const user = getUser();
		let pomise = api.get('/get_shift.json',{ params: user});
		pomise.then((data)=>{
    		this.setState({shitjson:data.data,shitarry:data.data.list});
        }, (error)=>{
        	console.log(error);
        })
	}
	triggleBoard(e) {
		const id = e.target.id;
		this.setState({ id: id });	

	}
	blurback(){
		const data = this.props.form.getFieldsValue();
		this.setState({inputnumber:data.personNameLine});
	 }
	 marksure(){
       this.setState({isShow:true});
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
					console.log(this.context.router);
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
	   const { getFieldDecorator } = this.props.form;
	   const formItemLayout = {
	      	labelCol: { span: 4 },
	      	wrapperCol: { span: 15 },
	    };
	    if (this.state.shitarry[2]) {
			var listways=this.state.shitarry[2].list;
		}else{
			var listways=[];
		}

		return (
			<div className="update-datas">
				<MoreNav activeId={3} />
				<Row className="cash-controls">
					<h3>交班管理</h3>
				    
                    {this.state.isAlert ? <div className="jobturnleft">
 						 <div className="turnsty">
					    	  <Row type="flex" justify="space-between" className='norstyle'>
					    	  	   <Col span={9}>备用金: {this.state.inputnumber}</Col>
					    	  	   <Col span={13}>应交金额: {this.state.inputnumber?Number(this.state.shitjson.receive_amount)+Number(this.state.inputnumber):this.state.shitjson.receive_amount}</Col>
					    	  </Row>
					    	  <Row type="flex" justify="space-between" className='norstyle'>
					    	  	   <Col span={9}>交班员: {this.state.shitjson.shift_people}</Col>
					    	  	   <Col span={13}><span>备注 : </span><Input size="small" className="inputurn" id="remarks"/></Col>
					    	  </Row>
					    	  <Row type="flex" justify="space-between" className='norstyle'>
					    	  	   <Col>时间段: {formatDate(this.state.shitjson.start_time)} -- {formatDate(this.state.shitjson.shift_time)}</Col>
					    	  </Row>
			    	    </div>	
			    	    <div className="msgtotal">
			    	  	  <div className="masgone">
			    	  	  	 <h3>账单合计:  <span>{this.state.shitarry[0]&&this.state.shitarry[0].total}单</span></h3>
			    	  	  	 <ul>
			    	  	  	    <li><span>店内单合计:</span><span>{this.state.shitarry[0]&&(this.state.shitarry[0].list[0]?this.state.shitarry[0].list[0].total:0)}单</span></li>
			    	  	  	 	<li><span>外卖单合计:</span><span>0单</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgtwo">
			    	  	  	 <h3>营业收入: <span>{this.state.shitarry[1]&&this.state.shitarry[1].total}元</span></h3>
			    	  	  	 <ul>
			    	  	  	 	<li><span>消费合计:</span><span>{this.state.shitarry[1]&&this.state.shitarry[1].list[0].total}元</span></li>
			    	  	  	 	<li><span>折扣合计:</span><span>{this.state.shitarry[1]&&this.state.shitarry[1].list[1].total}元</span></li>
			    	  	  	 	<li><span>赠送合计:</span><span>{this.state.shitarry[1]&&this.state.shitarry[1].list[2].total}元</span></li>
			    	  	  	 	<li><span>应收合计:</span><span>{this.state.shitarry[1]&&this.state.shitarry[1].list[3].total}元</span></li>
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <div className="masgthree">
			    	  	  	 <h3>支付方式: <span>{this.state.shitarry[2]&&this.state.shitarry[2].total}项</span></h3>
			    	  	  	 <ul>
			    	  	  	 	{(listways).map((ele,key)=><li key={key}><span>{ele.name}:</span><span>{ele.total}</span></li>)}
			    	  	  	 </ul>
			    	  	  </div>
			    	  	  <Button className="showButtonhw" onClick={this.marksure}>确定</Button>
			    	  	   {this.state.isShow ?<div className="truenall"><div className="blackfill"></div><div className="comfine">
								  <h4>确认交班</h4>
									    <span className="iconAlert"></span>
									    <section>是否确认交班？</section>
									    <Row type="flex" justify="space-around" className="btnallsty">
											<Button onClick={this.trunback}>取消</Button>
											<Button onClick={this.btncomfine} className="btnsure">确定</Button>
									    </Row>
							  </div></div>:null}
							   {this.state.isKnow?<div className="knowall">
									 		<p>交班数据提交成功，即将退出登录</p>
									 		<Button onClick={this.knowall}>知道了</Button>
									 </div>:null}
			    	  </div>				
                    </div>:
                    <Row type="flex" justify="space-around" className="jioastyle">
                        <div className="backbord"></div>
						 <div className="alertShowOne">
						 	<h4>确认交班</h4>
						    <span className="iconAlert"></span>
						    <section>当前还有<span>{this.state.number}</span>笔待结账账单，是否继续？</section>
						    <Row type="flex" justify="space-around" className="btnall">
								<Button onClick={this.btnback} className="btnone">取消</Button>
								<Button onClick={this.btnsure} className="btntwo">确定</Button>
						    </Row>
						 </div>
					</Row>}
					
					{this.state.isAlert?<div className="jobturnright">
					  <Form horizontal>
					    <span className="turnspan">备用金</span>
						 <FormItem className="form-input turnform"
								          	{...formItemLayout}
								        >
								          	{getFieldDecorator('personNameLine', { initialValue: '' })(
								            	<Input id="personNameLine" placeholder="请输入备用金" onFocus={(e) => this.triggleBoard(e)} onPaste={()=>false} onBlur={()=>this.blurback()}/>
								          	)}
						</FormItem>
					  </Form>	
						 <KeyBoardTurn 
									onPress={this.onPress}
									handleClearPay={this.handleClearPay}
									btncanle={false}
									btnsure={false}
									id="qustyle"
								/>	
					</div>:null}
                    <Refresh handleRefresh={this.handleRefresh}  handlebtn={false} />
				</Row>
			</div>	
		)
	}
}


TurnJob.contextTypes = {
	router: PropTypes.object.isRequired
};
TurnJob = Form.create()(TurnJob);

const mapStateToProps = (state) => {
	return {
		user: state.user
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators(login, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TurnJob);



