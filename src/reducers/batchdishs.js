import cloneDeep from 'lodash/cloneDeep';

import { 
	ADD_BATCH_DISH, 
	DELETE_BATCH_DISH, 
	REMOVE_BATCH_DISH,
	MODIFY_BATCH_DISH, 
	CLEAR_BATCH_DISH,
	ADD_SINGLE_BATCH_DISH,
	UPDATE_IS_BATCH_DISH,
	COMBO_ADD,
	ADD_COMBO_DISH,
	DELETE_COMBO_DISH,
	UPDATE_COMBO_DISH
} from '../actions/batchdishs';

const initialState = {
	isBatchOperate: false,
	orderId: '',
	tableId: '',
	batchdishs: [],
	modifynumber:1,   //存放modify页面的菜品数量，展示当前到退或赠的数量
	combodishs:[] ,   //套餐菜的数据
	newcombolist:[]   //选择好以后的套餐
};

const batchDishs = (state = initialState, action = {}) => {
	const batchdishs = cloneDeep(state.batchdishs);
	let object = cloneDeep(state);
	switch(action.type) {
		case ADD_BATCH_DISH:
			return {
				...state,
				orderId: action.payload.orderId,
				tableId: action.payload.tableId,
				batchdishs: addDish(batchdishs, action.payload.dish, action.payload.operate)
			}
		case DELETE_BATCH_DISH:
			return {
				...state,
				batchdishs: deleteDish(batchdishs, action.payload.dish)
			}
		case REMOVE_BATCH_DISH:
			return {
				...state,
				batchdishs: removeDish(batchdishs, action.payload.record, action.payload.orderId)
			}
		case MODIFY_BATCH_DISH:
			return {
				...state,
				batchdishs: modifyDish(batchdishs, action.payload.dish, action.payload.remarks)
			}
		case CLEAR_BATCH_DISH:
			return {
				isBatchOperate: false, 
				orderId: '',
				tableId: '',
				batchdishs: [] 
			};
		case ADD_SINGLE_BATCH_DISH:
			let dish = action.payload.dish;
		    const ra = dish.cancel_number == undefined ? dish.dish_number : dish.dish_number - dish.cancel_number;
			//dish.dish_number = ra;   //界面显示需要，这里不需要重新赋值，要不然orderlist展示表格的数据显示错误
			dish['real_amount'] = ra;//退菜用
			return {
				...state,
				tableId: action.payload.tableId,
				orderId: action.payload.orderId,
				batchdishs: [dish]
			}
		case UPDATE_IS_BATCH_DISH:
			return Object.assign({}, state, { isBatchOperate: action.payload.flag });
		case COMBO_ADD:
		     return Object.assign({},state,{combodishs:action.payload.dishs});


	  
		 case ADD_COMBO_DISH:
		     const dishcom = action.payload.dish;
			 const ds = addCombo(object, dishcom);
		     return {
				...state, 
				combodishs: ds
		     };
		 case DELETE_COMBO_DISH:
		 	 const dishbo=action.payload.dh;
		 	 const dsbo = deleteCombo(object, dishbo);
		 	  return {
		 	  	...state,
				combodishs: dsbo
			  };
		 case UPDATE_COMBO_DISH:
		     const disw=updatecom(object);
		     return {
		     	...state,
				newcombolist: disw
		     };
		default:
			return state;
	}
}

export default batchDishs;

const addDish = (dishs, dish, operate) => {    //dish是新传过来的
	let flag = true;

	if (operate) {
		const ra = dish.cancel_number == undefined ? dish.dish_number : dish.dish_number - dish.cancel_number;
		
		dish.dish_number = ra;
		dish['real_amount'] = ra;
		dishs.push(dish);
		return dishs;	
	}

	for (let i = 0; i< dishs.length; i++) {     //对dish数组进行循环遍历，分当前菜品落单前和落单后
		let fd = dishs[i];

		if (dish.order_dish_id && fd.order_dish_id == dish.order_dish_id) {
			// 如果已经落单 退菜数量不能大于实际点菜数量
			const num = Number(fd.dish_number) + 1;
			
		    const nber=Number(fd.shownumber) + 1;
			if (nber > dish.real_amount) {
				dishs[i].dish_number = dish.dish_number;
				dishs[i].shownumber = Number(fd.shownumber);
			} else {
				// dishs[i].dish_number = Number(fd.dish_number) + 1;
				dishs[i].shownumber = Number(fd.shownumber) + 1;
			}

			flag = false;
			break;	
		} else if (dish.order_dish_id && fd.order_dish_id != dish.order_dish_id) {
			continue;
		}

		if (fd.dish_id === dish.dish_id) {
			dishs[i].dish_number = Number(fd.dish_number) + 1;
			flag = false;
			break;
		}
	}

	return dishs;	
}

const deleteDish = (batchdishs, dish) => {
	if (dish.allow_decimal==1) return batchdishs;
	for(let i = 0; i < batchdishs.length; i++) {
		const ds = batchdishs[i];
		// const lm = Number(ds.dish_number) - 1;
		const lm = Number(ds.shownumber) - 1;
		//处理的是已经落单的菜品，退菜时至少得保留 1 份
		if (dish.order_dish_id && ds.order_dish_id == dish.order_dish_id) {
			batchdishs[i].dish_number = ds.dish_number - 1 > 0 ? lm : 1;
			batchdishs[i].shownumber =ds.dish_number-1 >0 ? lm : 1 ;
			break;				
		}else if (dish.order_dish_id && ds.order_dish_id != dish.order_dish_id) {
			continue;
		}

		//未落单的菜 点菜时可以为 0 
		if (ds.dish_id === dish.dish_id) {
			batchdishs[i].dish_number = ds.dish_number - 1 <= 0 ? 0 : lm;
			break;
		}
	};
	return batchdishs;
}

const removeDish = (batchdishs, record, orderId) => {
	
	for(let i = 0; i < batchdishs.length; i++) {
		const bd = batchdishs[i];

		if (!!orderId && bd.order_dish_id === record.order_dish_id) {
			batchdishs = batchdishs.splice(0, i).concat(batchdishs.splice(1, batchdishs.length));	
			break;
		} else {
			if(bd.dish_id === record.dish_id) {
				batchdishs = batchdishs.splice(0, i).concat(batchdishs.splice(1, batchdishs.length));	
				break;	
			}		
		}		
	}
	return batchdishs;	
}

const modifyDish = (batchdishs, dish, remarks) => {
	for (let i = 0; i < batchdishs.length; i++) {
		const bd = batchdishs[i];

		if (dish.order_dish_id && bd.order_dish_id == dish.order_dish_id) {
			batchdishs[i].remarks = remarks;
			break;	
		}

		if (bd.dish_id === dish.dish_id) {
			batchdishs[i].remarks = remarks;
			break;
		}
	};

	return batchdishs;
}


const addCombo=(object, dishcom)=>{
	 let dishs = object.combodishs;
	 for (let i = 0; i < dishs.dish.package_category_list.length; i++) {
	 	   for (let j = 0; j < dishs.dish.package_category_list[i].package_dishes.length; j++) {
	 	        let dishli=dishs.dish.package_category_list[i].package_dishes[j];
	 	        if (dishli.dish_name==dishcom.dish_name) {
	 	        	if (dishli.dish_amout>=dishli.allow_selectcount) {
	 	        		
	 	        	}else{
	 	        	    dishli.dish_amout+=1;
	 	        	    dishs.dish.package_category_list[i].change_amout+=1;
	 	        	}
	 	        }
	 	   }
	 }

	 return dishs;
}


const deleteCombo=(object, dishcom)=>{
	 let dishs = object.combodishs;
	 for (let i = 0; i < dishs.dish.package_category_list.length; i++) {
	 	   for (let j = 0; j < dishs.dish.package_category_list[i].package_dishes.length; j++) {
	 	        let dishli=dishs.dish.package_category_list[i].package_dishes[j];
	 	        if (dishli.dish_name==dishcom.dish_name) {
	 	        	if (dishli.dish_amout>=1) {
	 	        		 dishli.dish_amout-=1;
	 	        	}
	 	        	 
	 	        }
	 	   }
	 }

	 return dishs;
}


const updatecom=(object)=>{
	 let dishs = object.combodishs;
	 let idelte=0,jdelete=0;
	 let deletelist=[];
	  for (let i = 0; i < dishs.dish.package_category_list.length; i++) {
	 	   const dishlengthone= dishs.dish.package_category_list[i].package_dishes;
	 	   for (let j = 0; j < dishlengthone.length; j++) {
	 	   	 let dishlione=dishs.dish.package_category_list[i].package_dishes[j];

	 	   	  if (dishs.dish.package_category_list[i].type==1) {
	 	          	  dishlione.dish_number=dishlione.allow_selectcount;
 	          }else{
 	          	 dishlione.dish_number=dishlione.dish_amout;
 	          }
	 	   	 if (dishlione.dish_amout==0&&dishs.dish.package_category_list[i].type==2) {
	 	         	// 完成以后将没有选的菜品删掉
	 	         	idelte=i; jdelete=j;
	 	         	deletelist.push([i,j]);
	 	      }
	 	   }
	 }
	 for (let b = 0; b < deletelist.length; b++) {
	 	  dishs.dish.package_category_list[deletelist[b][0]].package_dishes.splice(deletelist[b][1],1);
	 }
    
	 return dishs;
}



















