import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import {Modal, Row, Col, Button,Input ,Icon} from 'antd';
import { getUser } from '../../utils';
import * as carte from '../../actions/carte';
import * as sellout from '../../actions/sellout';
import Refresh from '../Refresh';
import SellOutNav from '../SellOutNav';
import SellOutTable from '../SellOutTable';
import './index.less';
class SellOutManage extends Component {
	static defaultProps = {
		ys: window.innerHeight - 163
	}
	constructor(props) {
		super(props);
		this.state = {
			active: 0
		}
		this.keydown=this.keydown.bind(this);
	}
	componentDidMount() {
		const user = getUser();
		this.props.getCarte({
			...user
		});	
	}
	handleRefresh() {
		
	}
	changeCategory(ta, key) {
		this.setState({ active: key });
		this.props.changeCategory(ta.category_id);
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
		 // const curCategoryDish = this.props.cur_category_dish;
		 this.props.changeDish(invalue);
		 console.log(invalue);
	}
	render() {
		const dishes = this.props.dish;
		const curCategoryDish = this.props.cur_category_dish;
		const dishCategory = this.getDishCategory(this.props.dish_category);
		const ys = this.props.ys;
		return (
			<div className="sell-out-manage">
				<SellOutNav {...this.props} />
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
								<ul className="clist" style={{ overflow: 'auto'}}>
									{ curCategoryDish.map((dish, key) => <SellOutTable {...this.props} key={key} i={key} dish={dish} />) }
								</ul>
							</div>
						</div>
						<Refresh 
							{...this.props}
							showGoBackBtn={true}
							handleRefresh={::this.handleRefresh} 
						/>
					</Row>
					<div className="ob-change">
						{ dishCategory }
					</div>
				</Row>
			</div>	
		)
	}
}
const mapStateToProps = (state) => {
	return {
		dish_category: state.carte.dish_category,
		dish: state.carte.dish,
		cur_category_dish: state.carte.cur_category_dish,
		selloutlist: state.sellout.selloutlist
	};
}
const mapDispatchToProps = (dispatch) => {
	return bindActionCreators({...carte, ...sellout}, dispatch);
}
export default connect(mapStateToProps, mapDispatchToProps)(SellOutManage);