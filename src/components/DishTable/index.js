import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Row, Col } from 'antd';

import { getUser } from '../../utils';

import * as orderDetail from '../../actions/orderDetail';
import * as batchdishs from '../../actions/batchdishs';

import './index.less';

const user = getUser();

class DishTable extends Component {
	static defaultProps = {
		pcInnerWidth: window.innerWidth
	}
	constructor(props) {
		super(props);
	}

   //增加菜品的功能 
	handleNumUp(event, dish) {
		event.stopPropagation();
		const newdish=[];
		//套餐特殊处理 
		if (dish.dish_type==2) {
			this.props.ifCombo(true);
			for (let i = 0; i < dish.package_category_list.length; i++) {
				     dish.package_category_list[i].change_amout=0;
				for (let j = 0; j < dish.package_category_list[i].package_dishes.length; j++) {
					 dish.package_category_list[i].package_dishes[j].dish_amout=0;
				}
			}
			this.props.comboadd({dish});
			this.context.router.push('/cashier/comboorder');

		}else{
			this.props.addFood(dish);
		    this.props.updateshouldclick(null);	
		}
		
	}

	handleNumDown(event, dish) {
		event.stopPropagation();
		this.props.deleteFood(dish);
	}

	render() {
		let ct5;
		const { dish, i, pcInnerWidth } = this.props;
		const { dishs } = this.props.orderDetail;
		let amount = 0, choosed = '';

		if (pcInnerWidth <= 1350) {
			ct5 = (i + 1) % 4 == 0 ? 'ct5' : '';
		} else {
			ct5 = (i + 1) % 5 == 0 ? 'ct5' : '';
		}

		for (let j = 0; j < dishs.length; j++) {
			const ds = dishs[j];

			if(ds.order_dish_id == undefined && ds.dish_id == dish.dish_id) {
				amount = ds.dish_number;
				choosed = 'active';
				break;
			}
		};
		//沽清的菜点击无效 背景红色，字体变白色
		if (dish.surplus == 0) {//-1无限量 >=0限量
			return (
				<li className={`cash dish ctable soldout ${ct5}`}>
					<div>
						<span className="title">{dish.dish_name}</span>
						<span className="posi">{dish.category_name}</span>
						<span className="yang">￥{dish.unit_price}/{dish.norms_name}</span>
					</div>
				</li>
			)
		}

		return (
			<li 
				className={`cash dish ctable ${ct5} ${choosed}`}
				data-table={dish}
				onClick={(e) => this.handleNumUp(e, dish)}
			>
				<div>
					{amount !== 0 ? <i className="amount">{amount}</i> : ''}
					<span className="title">{dish.dish_name}</span>
					<span className="posi">{dish.category_name}</span>
					<span className="yang">￥{dish.unit_price}/{dish.norms_name}</span>
					<div className="quantity">
						<i className="num-down" onClick={(event) => this.handleNumDown(event, dish)}></i>
						<i className="num-up" onClick={(event) => this.handleNumUp(event, dish)}></i>
					</div>
				</div>
			</li>
		);	
	}
}

DishTable.propTypes = {
	dish: PropTypes.object,
};
DishTable.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
};


//export default Table;
const mapStateToProps = state => {
	return {
		orderDetail: state.orderDetail,
		batchDishs: state.batchDishs
	}
}

const mapDispatchToProps = dispatch => {
	return bindActionCreators({...orderDetail,...batchdishs}, dispatch);	
}

export default connect(mapStateToProps, mapDispatchToProps)(DishTable);

