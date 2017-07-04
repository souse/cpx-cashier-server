import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import { Table, Row, Col } from 'antd';
import { getUser,getDevice } from '../../utils';
import api from '../../api';
import cloneDeep from 'lodash/cloneDeep';

import './index.less';

const columns = [
	{
		title: '品名',
		dataIndex: 'dish_name',
		className: 'name',
		width: 250,
		render: (text, record, index) => {
			 if (record.cancel_remarks==null) {
			 	var remark = getCancleRemarks([]);
			 }else{
			 	var remark = getCancleRemarks(record.cancel_remarks);
			 }
			 if (record.present_remarks==null) {
			 	var presentremark=getCancleRemarks([]);
			 }else{
			 	var presentremark=getCancleRemarks(record.present_remarks);
			 }
			if (record.package_id||record.senteId==66) {   //套餐里面的菜品
				  
				if (record.cancel) {   //只有退菜
				
				  // 如果点菜份数等于退菜份数的话，直接将这条抹掉
				  if (record.cancel_number == record.dish_number) {
					return (
						<div className="del-line combosui">{record.dish_name}</div>
					)
				  }
				  return (
						<div>
							<span className="salstyle combosui">{record.dish_name}</span>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
								
			    }else if(record.group_name){
			    	return (
			    			<div>
			    				<span className="salstyle tablest">{record.group_name}</span>
			    			</div>
			    		);
			    }else{
				   return (
				   	   <div>
				   	   	  <span className="salstyle combosui">{record.dish_name}</span>
				   	   </div>
				   	 );
			    }

			}else{    //普通菜品
				if (record.cancel&&record.is_present&&record.is_present!=='0') {  //有退有赠

					return (
						<div>
							<span className="salstyle">{record.dish_name}</span>
							<div className="cel-rmk od-r">【赠】{presentremark}</div>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
			    }else if (record.cancel) {   //只有退菜
				
				// 如果点菜份数等于退菜份数的话，直接将这条抹掉
				if (record.cancel_number == record.dish_number) {
					if (record.dish_type==2) {
						return (
							<div className="del-line taoicon">{record.dish_name}</div>
						)
					}else{
						return (
							<div className="del-line">{record.dish_name}</div>
						)
					}
					
				}
					return (
						<div>
							<span>{record.dish_name}</span>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
				
								
			}else if(record.is_present&&record.is_present!=='0'){   //只有赠菜
				if (record.dish_type==2) {
					return (
						<div className="taoicon">
							<span className="salstyle">{record.dish_name}</span>

							<div className="cel-rmk od-r">【赠】{presentremark}</div>
						</div>
					)
				}else{
					return (
						<div>
							<span className="salstyle">{record.dish_name}</span>

							<div className="cel-rmk od-r">【赠】{presentremark}</div>
						</div>
					)
				}
					
			}else if(record.group_name){
			    	return (
			    			<div>
			    				<span className="salstyle tablest">{record.group_name}</span>
			    			</div>
			    		);
			}else{
				if (record.dish_type==2) {

					return (
						<div className="taoicon">
							<span>
								{record.urge == 1 ? <span className="od-r">[急]</span> : ''}
								{record.dish_name}
							</span>
						</div>
					 )
				}else{
					return (
					<span>
						{record.urge == 1 ? <span className="od-r">[急]</span> : ''}
						{record.dish_name}
					</span>
				  )
				}
				
			  }
			}			 
			
		}	
	},
	{
		title: '数量',
		dataIndex: 'amount',
		className: 'amount',
		width: 50,
		render: (text, record, index) => {
			if (record.group_name) {
				return (
						<div>
							<span></span>
						</div>
					);
			}
			if (record.package_id||record.senteId==66) {
				if (record.cancel && record.cancel_number != record.dish_number) {
					return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else {
					return (
						<span>x{record.dish_number}{record.norms_name}</span>
					)
				}
			}else{
				if (record.cancel && record.cancel_number != record.dish_number&&record.is_present&&record.is_present!=='0') {
					return (
						<div>
							<span>x{record.dish_number-record.cancel_number}{record.norms_name}</span>
							<div className="od-r">x{record.is_present}{record.norms_name}</div>	
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else if (record.cancel && record.cancel_number != record.dish_number) {
					return (
						<div>
							<span>x{record.dish_number-record.cancel_number}{record.norms_name}</span>
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else if(record.is_present&&record.is_present!=='0'){
						return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.is_present}{record.norms_name}</div>	
						</div>
					)
				}else if(record.cancel && record.cancel_number == record.dish_number){
					return (
						<span>x{record.dish_number-record.cancel_number}{record.norms_name}</span>
					)
				}else {
					return (
						<span>x{record.dish_number}{record.norms_name}</span>
					)
				}
		  }
		}
	},
	{
		title: '金额(元)',
		dataIndex: 'money',
		className: 'money',
		width: 85,
		render: (text, record, index) => {
			const num = record.cancel_number == undefined ? record.dish_number : record.dish_number - record.cancel_number-record.is_present;
			if (record.group_name) {
				return (
							<span></span>
					);
			}
			if(record.package_id||record.senteId==66){
				return (
				  <span></span>
			    )
			}else{
				return (
				<span>{(num * record.unit_price).toFixed(2)}</span>
			  )
			}
			
		}
	},
	{
		title: '口味/做法',                                                                                                                                       
		dataIndex: 'remarks',
		className: 'remark',
		width: 117,
		render: (text, record, index) => {
			const remarks = record.remarks;
			let str = '';

			if (remarks == null) return ( <span>{``}</span> );

			for (let i = 0; i < remarks.length; i++) {
				let rm = remarks[i].data;
               
                	for (let j = 0; j < rm.length; j++) {
                		if (rm[j]) {
                			 str += rm[j].name + '、';
                		}
					  
				  };
             
				
			};
			
			if (record.temp_remark) {
				str+=record.temp_remark+'、';
			}
			str = str.substring(0, str.length - 1);
			return (<span>{str}</span>);
		}
	},
	{
		title: '服务员',                                                                                                                                       
		dataIndex: 'create_by',
		className: 'create_by',
		width: 120,
		
	}
	
];
const columnsmember = [
	{
		title: '品名',
		dataIndex: 'dish_name',
		className: 'name',
		width: 250,
		render: (text, record, index) => {
			 if (record.cancel_remarks==null) {
			 	var remark = getCancleRemarks([]);
			 }else{
			 	var remark = getCancleRemarks(record.cancel_remarks);
			 }
			 if (record.present_remarks==null) {
			 	var presentremark=getCancleRemarks([]);
			 }else{
			 	var presentremark=getCancleRemarks(record.present_remarks);
			 }
			if (record.package_id||record.senteId==66) {   //套餐里面的菜品
				  
				if (record.cancel) {   //只有退菜
				
				  // 如果点菜份数等于退菜份数的话，直接将这条抹掉
				  if (record.cancel_number == record.dish_number) {
					return (
						<div className="del-line combosui">{record.dish_name}</div>
					)
				  }
				  return (
						<div>
							<span className="salstyle combosui">{record.dish_name}</span>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
								
			    }else{
				   return (
				   	   <div>
				   	   	  <span className="salstyle combosui">{record.dish_name}</span>
				   	   </div>
				   	 );
			    }

			}else{    //普通菜品
				if (record.cancel&&record.is_present&&record.is_present!=='0') {  //有退有赠

					return (
						<div>
							<span className="salstyle">{record.dish_name}</span>
							<div className="cel-rmk od-r">【赠】{presentremark}</div>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
			    }else if (record.cancel) {   //只有退菜
				
				// 如果点菜份数等于退菜份数的话，直接将这条抹掉
				if (record.cancel_number == record.dish_number) {
					return (
						<div className="del-line">{record.dish_name}</div>
					)
				}
				return (
						<div>
							<span>{record.dish_name}</span>
							<div className="cel-rmk od-r">【退】{remark}</div>
						</div>
					)
								
			}else if(record.is_present&&record.is_present!=='0'){   //只有赠菜
					return (
						<div>
							<span className="salstyle">{record.dish_name}</span>

							<div className="cel-rmk od-r">【赠】{presentremark}</div>
						</div>
					)
			}else{
				return (
					<span>
						{record.urge == 1 ? <span className="od-r">[急]</span> : ''}
						{record.dish_name}
					</span>
				)
			}
			}			 
			
		}	
	},
	{
		title: '数量',
		dataIndex: 'amount',
		className: 'amount',
		width: 50,
		render: (text, record, index) => {
			if (record.package_id||record.senteId==66) {
				if (record.cancel && record.cancel_number != record.dish_number) {
					return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else {
					return (
						<span>x{record.dish_number}{record.norms_name}</span>
					)
				}
			}else{
				if (record.cancel && record.cancel_number != record.dish_number&&record.is_present&&record.is_present!=='0') {
					return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.is_present}{record.norms_name}</div>	
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else if (record.cancel && record.cancel_number != record.dish_number) {
					return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.cancel_number}{record.norms_name}</div>	
						</div>
					)
				}else if(record.is_present&&record.is_present!=='0'){
						return (
						<div>
							<span>x{record.dish_number}{record.norms_name}</span>
							<div className="od-r">x{record.is_present}{record.norms_name}</div>	
						</div>
					)
				}else {
					return (
						<span>x{record.dish_number}{record.norms_name}</span>
					)
				}
		  }
		}
	},
	{
		title: '金额(元)',
		dataIndex: 'money',
		className: 'money',
		width: 85,
		render: (text, record, index) => {
			const num = record.cancel_number == undefined ? record.dish_number : record.dish_number - record.cancel_number-record.is_present;
			if(record.package_id||record.senteId==66){
				return (
				  <span></span>
			    )
			}else{
				return (
				<span>{(num * record.vip_price).toFixed(2)}</span>
			  )
			}
			
		}
	},
	{
		title: '口味/做法',                                                                                                                                       
		dataIndex: 'remarks',
		className: 'remark',
		width: 117,
		render: (text, record, index) => {
			const remarks = record.remarks;
			let str = '';

			if (remarks == null) return ( <span>{``}</span> );

			for (let i = 0; i < remarks.length; i++) {
				let rm = remarks[i].data;
               
                	for (let j = 0; j < rm.length; j++) {
                		if (rm[j]) {
                			 str += rm[j].name + '、';
                		}
					  
				  };
             
				
			};
			str = str.substring(0, str.length - 1);
			return (<span>{str}</span>);
		}
	},
	{
		title: '服务员',                                                                                                                                       
		dataIndex: 'create_by',
		className: 'create_by',
		width: 120,
		
	}
	
];
const getCancleRemarks = arr => {
	let arrs = [];

	if (arr.length == 0) return '';

	for (let i = 0; i < arr.length; i++) {
		const mark = arr[i].data;

		for (let j = 0; j < mark.length; j++) {
			const m = mark[j];

			arrs.push(m.name);
		};
	};

	return arrs.join(',');
}

const getPresentRemarks = arr => {
	let arrs = [];

	if (arr.length == 0) return '';

	for (let i = 0; i < arr.length; i++) {
		const mark = arr[i].data;

		for (let j = 0; j < mark.length; j++) {
			const m = mark[j];

			arrs.push(m.name);
		};
	};

	return arrs.join(',');
}


class OrderList extends Component {
	constructor(props) {
		super(props);
		this.state={
			dishlist:[],    //存放table数据源的数据落单以后的dish列表
			beforedishlist:[]     //落单前存放dish列表
		};
		this.setRowClassName = this.setRowClassName.bind(this);
		this.onRowClick = this.onRowClick.bind(this);
		this.comboDishs=this.comboDishs.bind(this);
		this.fomatdish=this.fomatdish.bind(this);
		this.generateUUID=this.generateUUID.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}
    componentDidMount(){
    	// let titlesty=document.getElementsByClassName('tablest');
    	// for (let i = 0; i < titlesty.length; i++) {
    	// 	titlesty[i].parentNode.parentNode.parentNode.setAttribute('class','trshouldst');
    	// }
    }
	setRowClassName(record, index) {
		return 'col-' + index;
	}

	onRowClick(record, index) {
		const key = 'col-' + index;
		let curRowDom = document.getElementsByClassName(key)[0];
		let className = curRowDom.className;
		const { orderId, tableId, isBatchOperate } = this.props;
		const href = window.location.href;
		//const href = window.location.href;
		/*
			2.4的新需求是如果退菜数量 = 点菜数量的话，也是可以点击进去的，需要显示退菜人员
		*/
		//如果 退菜数量 = 点菜数量 点击无效
		// if (record.cancel_number == record.dish_number) return;
        if (record.group_name) {
        	return;
        }
		//isBatchOperate true—>批量
		if (!isBatchOperate) {
			//每次只能编辑一个
			if (href.indexOf('/modifydishs') == -1) {
				record.shownumber=1;    //菜品退赠界面的对象增加一个属性，用来显示退赠数量
				this.props.addSingleBatchDish(record, tableId, orderId);
			}
			//判断路由是否跳转 如果不在modify页面就跳
			this.goModifySet();
		}
	}

	rowSelection() {
		const self= this;
		const { orderId, tableId, batchDishs, addBatchDish, removeBatchDish } = self.props;
		const batchdishs = batchDishs.batchdishs;
		return {
			onSelect: (record, selected, selectedRows) => {
		    	if (selected) {
		    		addBatchDish(record, orderId, tableId, 'add');
		    		self.goModifySet();
		    	} else {//移除
		    		const { order_dish_id, dish_id } = record;

		    		removeBatchDish(record, orderId);
		    		//this.context.router.push('/cashier/choosetable');	
		    	}	
		  	},
		  	getCheckboxProps: record => {
		  		let flag = false;

		  		for (var i = 0; i < batchdishs.length; i++) {
		  			const bt = batchdishs[i];

		  			if (orderId) {
		  				if (record.order_dish_id == bt.order_dish_id) {
			  				flag = true;
			  				break;
			  			}
		  			} else {
		  				if (record.dish_id == bt.dish_id) {
			  				flag = true;
			  				break;
			  			}
		  			}
		  		};

		  		return {
			  		defaultChecked: flag
			  	}
		  	}	
		}
	}

	goModifySet() {
		const href = window.location.href;
		
		//判断路由是否跳转 如果不在modify页面就跳
		if (href.indexOf('/modifydishs') == -1) {
			this.context.router.push('/cashier/modifydishs');
		}	
	}

	filterDishs(flag, orderDetail) {
		let dishs = [];
		if (flag) {//批量处理
			if(!orderDetail.order_id) {
				dishs = orderDetail.dishs;
			} else {
				//for (let i = orderDetail.dishs.length - 1; i >= 0; i--) {
				for (let i = 0; i < orderDetail.dishs.length; i++) { 
					const ds = orderDetail.dishs[i];

					//顺便过滤掉 退菜数量 = 点菜数量的菜品
					if (ds.order_dish_id && ds.cancel_number != ds.dish_number) dishs.push(ds);
				};	
			}			
		} else {
			dishs = orderDetail.dishs;
		}

		for (var i = 0; i < dishs.length; i++) {
			const dd = dishs[i];
			dishs[i]['key'] = i;
			
      }
		return dishs;
	} 
	// 落单后套餐数据的初始化
	comboDishs(dishs,cartdish){
		 let newdish=[];
		 let dish=[];
		 if (dishs[0]) {
		 	 dish=dishs[0].group_dishes
		 }
		 // 循环菜品的时候，可能存在有部分落单，有部分没落单的情况，需要分别判断
		 if (dishs.length==1) {   //判断有无并台
     		 for (let i = 0; i < dish.length; i++) {
		    	if (dish[i].dish_type==2&&dish[i].order_id) {    
			 		 dish[i].dish_number=1;
			 		 if (dish[i].package_dish_group) {
			 		 	for (let n = 0; n < dish[i].package_dish_group.length; n++) {
			 		 		 let dishmodel=cloneDeep(dish[i]);
			 		 	    if (dish[i].package_dish_group[n].is_package_cancel==0) {
			 		 	    	 dishmodel.cancel=0;
			 		 	    	 dishmodel.cancel_number='0';
			 		 	     } 
			 		 	     if(dish[i].package_dish_group[n].is_package_present==0){
			 		 	     	 dishmodel.is_present='0';
			 		 	     }
			 		 	     if (dish[i].package_dish_group[n].is_package_cancel==1) {
			 		 	     	 dishmodel.cancel_number='1';
			 		 	     }
			 		 	     if(dish[i].package_dish_group[n].is_package_present==1){
			 		 	     	 dishmodel.is_present='1';
			 		 	     }
			 			    dishmodel.key=this.generateUUID();
			 		        newdish.push(dishmodel);
	                        for (let m = 0; m < dish[i].package_dish_group[n].package_dishes.length; m++) {
			 					let bottomdish=dish[i].package_dish_group[n].package_dishes[m];
			 					newdish.push(bottomdish);
			 				}
			 		   }
			 		 }
		 		
		 	}else if(dish[i].dish_type==2&&dish[i].order_id==undefined){
		 	      let dishmodeltt=cloneDeep(dish[i]);
		 	      dishmodeltt.key=this.generateUUID();
		 		  newdish.push(dishmodeltt);
                  for (let j = 0; j < dish[i].package_category_list.length; j++) {
			  	   		for (let k = 0; k < dish[i].package_category_list[j].package_dishes.length; k++) {
			  	         	   const dishpacklist=dish[i].package_category_list[j].package_dishes[k];
			  	         	   dishpacklist.senteId='66';
			  	         	  
			  	         	   if (dishpacklist.remarks==undefined) {
			  	         	   	   dishpacklist.remarks=[];
			  	         	   }
			  	         	   dishpacklist.key=Math.random();
			  	         	   newdish.push(dishpacklist);
			  	         }
			  	         
			  	  }

		 	}else{
		 		dish[i].key=this.generateUUID();
		 		newdish.push(dish[i]);
		 	}
		 }
		 newdish=cartdish.concat(newdish);
		 return newdish;
	  }else{
	  	 for (let p = 0; p < dishs.length; p++) {
	  	 	 newdish.push({group_name:dishs[p].group_name});
	  	 	  for (let i = 0; i < dishs[p].group_dishes.length; i++) {
		    	if (dishs[p].group_dishes[i].dish_type==2&&dishs[p].group_dishes[i].order_id) {    
			 		 dishs[p].group_dishes[i].dish_number=1;
			 		 if (dishs[p].group_dishes[i].package_dish_group) {
			 		 	for (let n = 0; n < dishs[p].group_dishes[i].package_dish_group.length; n++) {
			 		 		 let dishmodel=cloneDeep(dishs[p].group_dishes[i]);
			 		 	    if (dishs[p].group_dishes[i].package_dish_group[n].is_package_cancel==0) {
			 		 	    	 dishmodel.cancel=0;
			 		 	    	 dishmodel.cancel_number='0';
			 		 	     } 
			 		 	     if(dishs[p].group_dishes[i].package_dish_group[n].is_package_present==0){
			 		 	     	 dishmodel.is_present='0';
			 		 	     }
			 		 	     if (dishs[p].group_dishes[i].package_dish_group[n].is_package_cancel==1) {
			 		 	     	 dishmodel.cancel_number='1';
			 		 	     }
			 		 	     if(dishs[p].group_dishes[i].package_dish_group[n].is_package_present==1){
			 		 	     	 dishmodel.is_present='1';
			 		 	     }
			 			    dishmodel.key=this.generateUUID();
			 		        newdish.push(dishmodel);
	                        for (let m = 0; m < dishs[p].group_dishes[i].package_dish_group[n].package_dishes.length; m++) {
			 					let bottomdish=dishs[p].group_dishes[i].package_dish_group[n].package_dishes[m];
			 					newdish.push(bottomdish);
			 				}
			 		   }
			 		 }
		 		
		 	 }else if(dishs[p].group_dishes[i].dish_type==2&&dishs[p].group_dishes[i].order_id==undefined){
		 	      let dishmodeltt=cloneDeep(dishs[p].group_dishes[i]);
		 	      dishmodeltt.key=this.generateUUID();
		 		  newdish.push(dishmodeltt);
                  for (let j = 0; j < dishs[p].group_dishes[i].package_category_list.length; j++) {
			  	   		for (let k = 0; k < dishs[p].group_dishes[i].package_category_list[j].package_dishes.length; k++) {
			  	         	   const dishpacklist=dishs[p].group_dishes[i].package_category_list[j].package_dishes[k];
			  	         	   dishpacklist.senteId='66';
			  	         	  
			  	         	   if (dishpacklist.remarks==undefined) {
			  	         	   	   dishpacklist.remarks=[];
			  	         	   }
			  	         	   dishpacklist.key=Math.random();
			  	         	   newdish.push(dishpacklist);
			  	         }
			  	         
			  	  }

		 	}else{
		 		dishs[p].group_dishes[i].key=this.generateUUID();
		 		newdish.push(dishs[p].group_dishes[i]);
		 	}
		 }
		
	  	 }
	  	  newdish=cartdish.concat(newdish);
	  	  return newdish;
	  }
	}
	generateUUID() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  var r = (d + Math.random()*16)%16 | 0;
		  d = Math.floor(d/16);
		  return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	};
	//落单前对套餐数据格式化
	fomatdish(dish){      //可能有多个套餐
		let newdish=[];
		for (let  i = 0; i < dish.length; i++) {
			let packdishlist=[];
			  if (dish[i].dish_type==2) {    //套餐
			  	   
			  	   packdishlist.push(dish[i]);
			  	   for (let j = 0; j < dish[i].package_category_list.length; j++) {
			  	   		for (let k = 0; k < dish[i].package_category_list[j].package_dishes.length; k++) {
			  	         	   const dishpacklist=dish[i].package_category_list[j].package_dishes[k];
			  	         	   dishpacklist.senteId='66';
			  	         	  
			  	         	   if (dishpacklist.remarks==undefined) {
			  	         	   	   dishpacklist.remarks=[];
			  	         	   }
			  	         	   dishpacklist.key=Math.random();
			  	         	   packdishlist.push(dishpacklist);
			  	         }
			  	         
			  	   }
			  	    newdish=newdish.concat(packdishlist);
			  }else{     //普通菜
			  		newdish.push(dish[i]);
			  }

		}

		return newdish;
	}

	render() {
		//不管已经落单 OR 没有落单 点击单个处理 右侧都是单一处理操作
		//1、未落单：批量处理 每选中一个orderDetail的菜品 右侧就会新增一个菜的操作
		//2、已落单：批量处理 显示时会过滤掉orderDetail中 未落单的菜。
		//   选中一个右侧就会新增一个菜的操作，《不能修改备注》
		const { isBatchOperate, orderDetail } = this.props;
		const {dishlist,beforedishlist}=this.state;
		const rS = isBatchOperate ? this.rowSelection() : null;
		let dishs = this.filterDishs(isBatchOperate, orderDetail);
		let lastdishs=[];
		if (orderDetail.order_id) {     //落单以后
			 lastdishs=this.comboDishs(orderDetail.dish_groups,orderDetail.dishs);
		}else{
			 lastdishs=this.fomatdish(dishs);
		}
		return (
			<Table
				key={Math.random()}
				rowSelection={rS}
				columns={orderDetail.membercheck?columnsmember:columns} 
				pagination={false} 
				dataSource={lastdishs} 
				scroll={{ y: this.props.yScroll }} 
				rowClassName={this.setRowClassName}
				onRowClick={this.onRowClick}
			/>
		)
	}
}

OrderList.contextTypes = {
	router: PropTypes.object.isRequired,
  	store: PropTypes.object.isRequired
}

export default OrderList;