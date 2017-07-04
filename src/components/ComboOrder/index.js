import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Modal, Row, Col, Button, Checkbox, notification ,Form ,Input} from 'antd';

import OrderDetail from '../OrderDetail';
import Refresh from '../Refresh';
import TableArea from '../TableArea';
import OperateDishs from '../OperateDishs';

import api from '../../api';
import { getUser } from '../../utils';

import { getTables } from '../../actions/tables';
import * as batchdishs from '../../actions/batchdishs';
import * as getTableArea from '../../actions/tableArea';
import * as orderDetail from '../../actions/orderDetail';

import './index.less';

let user;
const CheckboxGroup = Checkbox.Group;

class ComboOrder extends Component {

	constructor(props) {
		super(props);

		this.state = {
		     combonumber:1,    //存储套餐数量
		     combodishs:[]   //套餐里选中的菜品集合
		}
		user = getUser();

	   this.comboback=this.comboback.bind(this);
	   this.combosave=this.combosave.bind(this);
	   this.handleDishUp=this.handleDishUp.bind(this);
	   this.handleDishDown=this.handleDishDown.bind(this);
	   this.handleNumUp=this.handleNumUp.bind(this);
	   this.handleNumDown=this.handleNumDown.bind(this);
	   this.updateCombod=this.updateCombod.bind(this);

       this.loopcombo=this.loopcombo.bind(this);
       this.formatObj=this.formatObj.bind(this);
	}

	componentDidMount() {  
	   const { combodishs } = this.props.batchDishs;
	   const {batchDishs}=this.props;
	   this.props.updatecombodish(); 
	}


	// 整个套餐数量
	handleDishUp(event) {
		event.stopPropagation();
		const {combonumber}=this.state;
		this.setState({combonumber:combonumber+1});
	}

	handleDishDown(event) {   
		event.stopPropagation(); 
		const {combonumber}=this.state;
		if (combonumber>1) {
			this.setState({combonumber:combonumber-1});
		}  
		
	}

	// 具体每个菜的数量选择
	handleNumUp(event, dish){
		event.stopPropagation();
		const { combodishs } = this.props.batchDishs;
		this.props.addcombodish(dish);
	}
	handleNumDown(event, dish){
		event.stopPropagation();
		this.props.deletecombodish(dish);
   }
	
   //套餐页面取消按钮 
	comboback(){
		const { orderDetail } = this.props;
		this.props.ifCombo(false);
		this.context.router.goBack();
	}
    //套餐页面保存按钮 
	combosave(){        // 将套餐存入bathDish变量中   判断里面的菜品是否选够。 是否沽清
		this.updateCombod();
		const {newcombolist}=this.props.batchDishs;
		const {combonumber}=this.state;
		// const { combodishs } = this.props.batchDishs;
	    const flg=this.loopcombo();
	    if (flg||(newcombolist.dish.surplus<combonumber&&newcombolist.dish.surplus!=-1)) {
	    	notification.error({
		           message: '保存失败！',
		           description: '有菜品被沽清，不能正确保存'
		    });
	    }else{
	    	// let comlist=this.formatObj(newcombolist.dish);
	    	for (let i = 0; i < combonumber; i++) {
			 // 这里传过去的dish是经过选择的菜品，包括数量
			 this.props.addFood(newcombolist.dish);
			 // this.props.addFood(comlist);
		     }
	         this.props.updateshouldclick(null);	
	         this.context.router.goBack();
	    }
	}
	formatObj(obj){
		let newcombo=[obj];
		for (let i = 0; i < obj.package_category_list.length; i++) {
			 for (let j = 0; j < obj.package_category_list[i].package_dishes.length; j++) {
			 	  const codish=obj.package_category_list[i].package_dishes[j];
			 	  codish.senteId='66';    //套餐里的菜添加特殊标记
			 	 newcombo.push(codish);
			 }
		}
		return newcombo;
	}

	updateCombod(){
		this.props.updatecombodish();  
	}

	loopcombo(){
		const {newcombolist}=this.props.batchDishs;
		let flseg=false;  //标记当前选择菜品是否有被沽清的
		for (let i = 0; i < newcombolist.dish.package_category_list.length; i++) {
			  for(let j=0; j<newcombolist.dish.package_category_list[i].package_dishes.length;j++){
			  	  const newdish=newcombolist.dish.package_category_list[i].package_dishes[j];
			  	  if (newdish.surplus!==-1&&newdish.dish_number>=newdish.surplus) {
			  	  	   flseg=true;
			  	  }
			  }
		}
		return flseg;
	}


	render() {
		const { batchdishs } = this.props.batchDishs;
		const { combodishs } = this.props.batchDishs;
		// const  packagedish=combodishs.dish.package_category_list;
		const {orderDetail}=this.props;
		const {combonumber}=this.state;
		
		const changedish=combodishs.dish.package_category_list.map((dishclass, key)=>{
			// 固定搭配分类
		    if (dishclass.type==1) {
				return (
					<li key={key}>
						<Row type="flex" justify="start" className="dishclass">
						    <Col className="dishclassone"><span>{dishclass.name}</span></Col>
						   
						    <Col className="dishclasstwo"><span>(固定搭配，不可选择)</span></Col>
						    <Col className="dishclassthree"><span>已选菜品</span></Col>
						</Row>
						<Row type="flex" justify="start">
						  <ul className="dishsty">
							{dishclass.package_dishes.map((dish,key)=>{
								return (
									<li className={'comboli active'}  key={key}>
									    <i className="amount">{dish.allow_selectcount}</i>
										<div className="comtop"><span>{dish.dish_name}</span></div>
										<div className="quantity">
											<i className="num-down"></i>
											<i className="num-up"></i>
										</div>
									</li>
								);
							})}
						  </ul>
						</Row>
					</li>
				);
			}else{
				return (
					<li key={key}>
						<Row type="flex" justify="start" className="dishclass">
						    <Col className="dishclassone"><span>{dishclass.name}</span></Col>
						   
						    <Col className="dishclasstwo"><span>(共{dishclass.option_total}项，可以选择{dishclass.option_number}项)</span></Col>
						    <Col className="dishclassthree"><span>已选菜品{dishclass.change_amout}</span></Col>
						</Row>
						<Row type="flex" justify="start">
						  <ul className="dishsty">
							{dishclass.package_dishes.map((dish,key)=>{
								return (
									<li className={dish.dish_amout==0?'comboli':'comboli active'}  key={key} onClick={(event) => this.handleNumUp(event, dish)}>
									    {dish.dish_amout!==0?<i className="amount">{dish.dish_amout}</i>:null}
										<div className="comtop"><span>{dish.dish_name}</span></div>
										<div className="quantity">
											<i className="num-down" onClick={(event) => this.handleNumDown(event, dish)}></i>
											<i className="num-up" onClick={(event) => this.handleNumUp(event, dish)}></i>
										</div>
									</li>
								);
							})}
						  </ul>
						</Row>
					</li>
			  );
			}
			
		});

		return (
			<div>
				<OrderDetail />
				<Row type="flex" justify="end" className="cash-controls comstyle">
					<Row type="flex" justify="start" className="cash-control">
						 <div className="combo">
								   <Row type="flex" justify="start" className="combo_top">
										<Col span={8} className="dish_first"><span className="dish-name">{combodishs.dish.dish_name}-搭配(共5项)</span></Col>
										<Col span={4}><div className="operate-dish">
										    <span>数量</span>
											<i className="dish-down" onClick={(e) => this.handleDishDown(e)}></i>
											<span>{combonumber}{combodishs.dish.norms_name}</span>
											<i className="dish-up" onClick={(e) => this.handleDishUp(e)}></i>
										</div></Col>	
									</Row>
									<div className="combolist">
										<ul>{changedish}</ul>
									</div>
									<div className="bom-btn">
										<div className="savebtn" onClick={this.combosave}><span>保存</span></div>
										<div className="canlebtn" onClick={this.comboback}><span>取消</span></div>
									</div>
						</div>
						<Refresh 
							{...this.props}
							showGoBackBtn={true}
							handleRefresh={false} 
						/>	
					</Row>
					<TableArea 
						{...this.props} 
						isNotChooseTable={true}
					/>
				</Row>
			</div>
		)
	}
}

ComboOrder.contextTypes = {
	router: PropTypes.object.isRequired,
	store: PropTypes.object.isRequired
}

ComboOrder = Form.create()(ComboOrder);

const mapStateToProps = (state) => {
	return {
		batchDishs: state.batchDishs,
		tableArea: state.tableArea,
		orderDetail: state.orderDetail
	};
}

const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({getTables, ...batchdishs, ...getTableArea, ...orderDetail}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ComboOrder);