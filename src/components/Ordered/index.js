import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Table, Row, Col, Button, notification ,Input,AutoComplete,Icon} from 'antd';

import OrderDetail from '../OrderDetail';
import DishTable from '../DishTable';
import Refresh from '../Refresh';
import api from '../../api';

import { getUser , getDevice, getDish,setDish} from '../../utils';
import * as carte from '../../actions/carte';
import * as orderDetail from '../../actions/orderDetail';
import * as batchdishs from '../../actions/batchdishs';

import './index.less';

/** 点菜 */


const Search=Input.Search;
let parentH, currentH, defaultH = 0;
class Ordered extends Component {

	static defaultProps = {
		showOrderBtn: true,
		ys: window.innerHeight - 163
		// ulmessagelist:[],
		// allnochangelist:[]     //保存固定的菜品数据
	}

	constructor(props) {
		super(props);
		this.state = {
			active: 0,
			ulmessagelist:[],
		    allnochangelist:[],     //保存固定的菜品数据
		    showCombo:false     //套餐界面是否显示  
		}

		this.changeCategory = this.changeCategory.bind(this);
		this.handleRefresh = this.handleRefresh.bind(this);
		this.keydown=this.keydown.bind(this);
		this.clearbtn=this.clearbtn.bind(this);
		this.loaddishlist=this.loaddishlist.bind(this);
		this.clickUp=this.clickUp.bind(this);
		this.clickDown=this.clickDown.bind(this);

		this.comboback=this.comboback.bind(this);
		this.combosave=this.combosave.bind(this);
	}

	componentWillMount() {
		this.props.clearBatchDish();
		const listmessage=this.props.cur_category_dish;
		this.setState({ulmessagelist:listmessage});
	}
	
	componentDidMount() {
		const user = getUser();
		const dishlist=getDish();
		const { orderDetail } = this.props;

		// this.setState({showCombo:orderDetail.ifCombo});
		this.props.getCarte({
			...user
		});
		this.props.ifmembercheckout(false);    //正常账单
		// if (orderDetail.order_id&&orderDetail.membercheck) {
		// 	this.props.searchFood({
		// 		...user,
		// 		order_id: orderDetail.order_id,
		// 		table_id: orderDetail.table_id,
		// 		is_member:0
		// 	});
		// }		
		this.setState({ulmessagelist:dishlist});
	    this.setState({allnochangelist:dishlist});
		
        this.loaddishlist();

	}
    loaddishlist(){
    	const user = getUser();
		const newobj={
			...user
		}
		let pomisetable = api.get('/get_dishs.json',{ params:newobj});
		pomisetable.then((data)=>{
    		 setDish(data.data.dish);
        }, (error)=>{
        	console.log(error);
        });
    }

	handleRefresh() {
		const user = getUser();
		//1、刷新菜品列表
		//2、刷新订单列表
		const { orderDetail } = this.props;

		this.props.getCarte({
			...user
		});
		// this.props.searchFood({
		// 	...user,
		// 	order_id: orderDetail.order_id,
		// 	table_id: orderDetail.table_id
		// });
	}

	changeCategory(ta, key) {
		const {allnochangelist}=this.state;
		this.setState({ active: key });
		this.props.changeCategory(ta.category_id);

		let newlist=[];
		if (ta.category_id=='all') {
			newlist=allnochangelist;
		}else{
			allnochangelist.forEach((dish) => {
				if (dish.category_id == ta.category_id) newlist.push(dish);
			});
		}
		this.setState({ulmessagelist:newlist});

		//滚动到最上边 ---begin---
		const lis = document.getElementsByClassName('clist')[0];

		lis.style.transition='all 0s';
		lis.style.transform='translateY(0px)';
		//滚动到最上边 ---end---
	}

	getDishCategory(list) {
		const active = this.state.active;

		return list.map((ta, key) => {
			return (
				<Col 
					span={24} 
					key={key}
					className={active == key ? 'change-common active' : 'change-common'}
					onClick={() => this.changeCategory(ta, key)}
				>
					{ta.name}
				</Col>
			)
		});
	}
	keydown(){
		 const invalue=document.getElementById('onlydish').value;
		 const ullistmssg=this.state.ulmessagelist;
		 const {allnochangelist}=this.state;
		 const newlistmsg=[];
		 for (var i = 0; i < allnochangelist.length; i++) {
		 	     if (allnochangelist[i].pinyin.indexOf(invalue)!==-1||allnochangelist[i].dish_name.indexOf(invalue)!==-1||allnochangelist[i].first_letter.indexOf(invalue)!==-1||allnochangelist[i].identifier.indexOf(invalue)!==-1) {
		 	     		newlistmsg.push(allnochangelist[i]);
		 	     }
		 }
		 this.setState({ulmessagelist:newlistmsg});
	}
	clearbtn(){
		document.getElementById('onlydish').value='';
		// this.loaddishlist();
		// this.setState({ulmessagelist:this.props.cur_category_dish});
		const dishullist=this.state.allnochangelist;
		this.setState({ulmessagelist:dishullist});
	}

	//点击向上移动 
	clickUp(){
		const pdh = document.getElementsByClassName('scrollstyle')[0];
		const cdh = document.getElementsByClassName('listscroll')[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (defaultH <= 0) return false;
		defaultH -= parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
	}
	// 点击向下移动
	clickDown(){
		const pdh = document.getElementsByClassName('scrollstyle')[0];
		const cdh = document.getElementsByClassName('listscroll')[0];

		parentH = pdh.clientHeight;
		currentH = cdh.clientHeight;

		if (currentH <= parentH) return false;
		
		if (defaultH >= currentH-300) return false;

		defaultH += parentH / 2;
		cdh.style.transition='all .5s';
		cdh.style.transform='translateY(-'+ defaultH +'px)';
	}

   //套餐页面取消按钮 
	comboback(){
		const { orderDetail } = this.props;
	    console.log(orderDetail);
		// this.props.ifCombo({false});
		this.setState({showCombo:false});
		// orderDetail.ifCombo=false;
	}
    //套餐页面保存按钮 
	combosave(){

	}
	render() {
		const dishes = this.props.dish;
		const { orderDetail } = this.props;
		// const curCategoryDish = this.props.cur_category_dish;
		const dishCategory = this.getDishCategory(this.props.dish_category);
		const { dataSource ,showCombo} = this.state;
		const suffix =<Icon type="close-circle" />
		const ys = this.props.ys;

		return (
			<div>
				<OrderDetail />
				<Row type="flex" justify="end" className="cash-controls">
					<Row type="flex" justify="start" className="cash-control">
						
						<div className="cashs dishes cashsList">
						   	<div className="dishlisttop">
	 							<Input
							        placeholder="输入菜品名称或编码"
							        prefix={<Icon type="search" />}
							        onChange={this.keydown}
							        className="inputnewstyle"
							        id="onlydish"
							    />
						       	<Button onClick={this.clearbtn} className="clearbtn">清空</Button>
						   	</div>
					       	<div className="ulstyle" style={{ height: ys }}>
								<ul className="clist" style={{ overflow: 'auto', paddingTop: '10px'}}>
									{this.state.ulmessagelist.map((dish, key) => <DishTable key={key} i={key} dish={dish}/>) }				
								</ul>
						   	</div>
						 </div>
						<Refresh 
							{...this.props}
							showGoBackBtn={true}
							handlebtn={true}
							handleRefresh={this.handleRefresh} 
						/>	
					</Row>
					<div className="ob-change order-change">
						<Col 
							span={24} 
							className={'change-top'}
							onClick={() => this.clickUp()}
						>
							<div></div>
						</Col>
						<div className="scrollstyle">
							<div className="listscroll">
						    {dishCategory}	
						    </div>
						</div>
						<Col 
							span={24} 
							className={'change-bottom'}
							onClick={() => this.clickDown()}
						>
						  <div></div>	
						</Col>	
					</div>
				</Row>
			</div>
		)
	}
}

Ordered.propTypes = {
	dish_category: PropTypes.array,
	dish: PropTypes.array,
	cur_category_dish: PropTypes.array,
  	ajaxError: PropTypes.string
};

const mapStateToProps = (state) => {
	return {
		batchDishs: state.batchDishs,
		dish_category: state.carte.dish_category,
		dish: state.carte.dish,
		cur_category_dish: state.carte.cur_category_dish,
		orderDetail: state.orderDetail
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...carte, ...orderDetail, ...batchdishs }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Ordered);