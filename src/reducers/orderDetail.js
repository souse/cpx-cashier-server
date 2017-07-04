import cloneDeep from 'lodash/cloneDeep';

import { 
	SEARCH_FOOD, 
	SEARCH_FOOD_SUCCESS,
	ADD_FOOD, 
	DELETE_FOOD,
	OPERATE_FOOD,
	MODIFY_FOOD_REMARKS,
	CHANGE_TABLE_ID,
	UPDATE_FOOD_ORDER_ID,
	CLEAR_FOOD,
	UPDATE_FOOD_PAYPRICE,
	UPDATE_UNORDERED_DISHS,
	SET_REVERSED_MESSAGE ,
	SALEOPRE_FOOD,
	UPDATE_SHOULD_CLICK,
	IF_MEMBER_CHECKOUT,
	IF_COMBO,
	SPECILE_NOTE
} from '../actions/orderDetail';

const initialState = {
	order_id: null,
	area_name: null,
	table_id: null,
	table_name: null,
	create_by: null,
	curr_person: null,
	create_time: null,
	update_time: null,
	dish_number: '0',
	amount: '0.00',   //消费总额
	discount_amount: '0.00',
	receive_amount: '0.00', //应收金额
	dishs:[],
	dish_groups:[],
	reversed: '', //（空、0)否，1是 //反结账用
	reversed_remarks: '',
	shouldfag:null,   //判断是否点击了落单按钮
	membercheck:false,   //默认不是会员结账
	ifCombo:false,    //默认不是套餐
	specilenote:''   //存放整个账单的全局特殊备注
}

const orderDetail = (state = initialState, action = {}) => {
	let object = cloneDeep(state);
   
	switch (action.type) {
		case SEARCH_FOOD_SUCCESS:
			return Object.assign({}, state, action.payload.data);
		case ADD_FOOD:
			const dish = action.payload.dish;
			const ds = addFood(object, dish);
			// const os=addOrderFood(object,dish);
			return {
				...state, 
				dishs: ds,
				...calculateAmount(object, dish, 'add')
			};
		case DELETE_FOOD:
			const fd = action.payload.dish;
			const dss = deleteFood(object, fd);

			return {
				...state, 
				dishs: dss,
				...calculateAmount(object, fd, 'del')
			};
		case OPERATE_FOOD:
			const dishs = action.payload.dishs;
			const dsss = operateFood(object, dishs);

			return {
				...state,
				dishs: dsss,
				...calculateNewDishsAmount(dsss)
			};
		case SALEOPRE_FOOD:
		    // const dishs=action.payload.dishs;
		    const dsale=saleFood(object, action.payload.dishs);

		    return {
		    	 ...state,
				dishs: dsale,
				...calculateNewDishsAmount(dsale)
		    }
		case MODIFY_FOOD_REMARKS:
			return {
				...state,
				dishs: modifyFoodRemarks(object, action.payload.dish, action.payload.remarks)
			}
		case CHANGE_TABLE_ID:
			return Object.assign({}, state, {
				table_id: action.payload.table.table_id,
				table_name: action.payload.table.table_name
			});
		case UPDATE_FOOD_ORDER_ID:
			return Object.assign({}, state, { order_id: action.payload.id });
		case CLEAR_FOOD:
			return initialState;
		case UPDATE_FOOD_PAYPRICE:
			return Object.assign({}, state, {...action.payload.obj});
		case UPDATE_UNORDERED_DISHS:
			const bds = updateUnOrderDishs(action.payload.batchdishs, object.dishs);

			return Object.assign({}, state, { ...bds });
		case SET_REVERSED_MESSAGE:
			return Object.assign({}, state, { reversed: action.payload.ifreverse, reversed_remarks: action.payload.reversedRemarks });	

		case UPDATE_SHOULD_CLICK:
		     return  Object.assign({}, state, { shouldfag: action.payload.fag});
		case IF_MEMBER_CHECKOUT:
		     return Object.assign({},state,{membercheck:action.payload.ifmember});
	    case IF_COMBO:
	         return Object.assign({},state,{ifCombo:action.payload.lag});

	    case SPECILE_NOTE:
	         return Object.assign({},state,{specilenote:action.payload.str});
		default:
			return state;	
	}
}

export default orderDetail;

const deleteFood = (object, food) => {
	let dishs = object.dishs;

	for (let i = 0; i< dishs.length; i++) {
		let fd = dishs[i];

		//同addFood
		if (fd.order_dish_id == undefined && fd.dish_id === food.dish_id) {
			//如果删除的food 数量 - 当前food数量
			// 0：删除， > 0 减去数量
			let ls = Number(fd.dish_number) - 1;
			if(ls > 0) {
				dishs[i].dish_number = ls;
			}else {//移除
				dishs = dishs.splice(0, i).concat(dishs.splice(1, dishs.length));
			}
			break;
		}
	}
	return dishs;
}

const addFood = (object, food) => {
	let dishs = object.dishs;
	let flag = true;
	for (let i = 0; i< dishs.length; i++) {
		let fd = dishs[i];

		//如果 fd 的 order_dish_id 为undefined
		//且 fd.dish_id === food.dish_id +1 否则 新加
		if (fd.order_dish_id == undefined && fd.dish_id === food.dish_id) {
			dishs[i].dish_number = Number(fd.dish_number) + 1;
			dishs[i].pay_price = 0;
			flag = false;
			break;
		}
	}
	if (flag) {
		// 如果点击了整单备注，则后来的菜每个都要加上整单备注
		if (object.specilenote) {
			let remark=[];
			remark.push({
			   	  title:'点菜状态',
			   	  type:'5',
			   	  data:[{
			   	  	name:object.specilenote,
			   	  	dish_remarks_id:'193'
			   	  }]
			 });
			if (food.dish_type==2) {
				 for (let m = 0; m < food.package_category_list.length; m++) {
				 	  for (let j = 0; j < food.package_category_list[m].package_dishes.length; j++) {
				 	  	    food.package_category_list[m].package_dishes[j].remarks=remark;
				 	  }
				 }
			}
			food = {...food, dish_number: 1, remarks: remark};
		}else{
			food = {...food, dish_number: 1, remarks: []};
		}
		
	    dishs.unshift(food);
		
	}
	
	return dishs;
}

const isArray=(obj)=>{
	return Object.prototype.toString.call(obj) === '[object Array]'; 
}

const calculateAmount = (obj, dish, type) => {
	let amount;
	let flag = false;

	if (type == 'add') {
		if (isArray(dish)) {
			amount = (eval(obj.amount) + eval(dish[0].unit_price)).toFixed(2);
		}else{
			amount = (eval(obj.amount) + eval(dish.unit_price)).toFixed(2);
		}
		
		return {
			dish_number: obj.dish_number + 1,
			amount: amount,
			receive_amount: amount,
			discount_amount: '0.00'	
		};
	}

	//复杂 循环查看当前obj dishs列表里是否还有dish
	for (let i = 0; i < obj.dishs.length; i++) {
		const ds = obj.dishs[i];

		if(ds.order_dish_id == undefined&&ds.dish_id == dish.dish_id) {
			flag = true;
			break;
		}
	};

	//解决 点菜 “—” 金额一直减少问题 
	if (!flag) {
		return {
			dish_number: obj.dish_number,
			amount: obj.amount,
			receive_amount: obj.amount	
		}
	}else{
		amount = (eval(obj.amount) - eval(dish.unit_price)).toFixed(2);
		return {
			dish_number: obj.dish_number - 1,
			amount: amount,
			receive_amount: amount
		};
	}

	
}

const calculateNewDishsAmount = dishs => {
	let dishNumber = 0;
	let amount = 0;

	for(let i = 0; i < dishs.length; i++) {
		const dish = dishs[i];
		let dn=dish.real_amount==undefined?(Number(dish.dish_number)-Number(dish.cancel_number)-Number(dish.is_present)):(Number(dish.real_amount) - Number(dish.dish_number));
		

		dishNumber += dn;
		amount += dn * eval(dish.unit_price);
	};
	amount = amount.toFixed(2);

	return {
		dish_number: dishNumber,
		amount: amount,
		receive_amount: amount
	};
}

const operateFood = (object, foods) => {
	let dishs = object.dishs;

	for(let i = 0; i < dishs.length; i++) {
		const dish = dishs[i];

		for(let j = 0; j < foods.length; j++) {
			const food = foods[j];

			if(dish.order_dish_id === food.order_dish_id) {
				dishs[i].dish_number = food.dish_number;
				dishs[i].remarks = food.remarks;
				dishs[i].real_amount=food.real_amount;
				//移除当前foods 中的 i 对象
				foods = foods.splice(0, j).concat(foods.splice(1, foods.length));
				break;	
			}
		};
	};
	return dishs;	
}

const saleFood=(object, foods)=>{
   let dishs = object.dishs;

	for(let i = 0; i < dishs.length; i++) {
		const dish = dishs[i];

		for(let j = 0; j < foods.length; j++) {
			const food = foods[j];

			if(dish.order_dish_id === food.order_dish_id) {
				dishs[i].dish_number = food.dish_number;
				dishs[i].remarks = food.remarks;
				//移除当前foods 中的 i 对象
				foods = foods.splice(0, j).concat(foods.splice(1, foods.length));
				break;	
			}
		};
	};
	return dishs;	
}
const modifyFoodRemarks = (object, dish, remarks) => {
	let dishs = object.dishs;

	for (let i = 0; i < dishs.length; i++) {
		const bd = dishs[i];

		if (dish.order_dish_id && bd.order_dish_id == dish.order_dish_id) {
			dishs[i].remarks = remarks;
			break;	
		}

		if (bd.dish_id === dish.dish_id) {
			dishs[i].remarks = remarks;
			break;
		}
	};

	return dishs;
}

// 更新未下单的菜品
const updateUnOrderDishs = (batchdishs, dishs) =>{
	let arr = [];
	let dishNumber = 0, amount = 0;

	for (var i = 0; i < dishs.length; i++) {
		const ds = dishs[i];

		for (var j = 0; j < batchdishs.length; j++) {
			const bd = batchdishs[j];

			if (ds.order_dish_id == undefined && ds.dish_id == bd.dish_id) {
				dishs[i].dish_number = bd.dish_number;
				dishs[i].remarks = bd.remarks;
				batchdishs = batchdishs.splice(0, j).concat(batchdishs.splice(1, batchdishs.length));
				break;	
			}
		};
	};
	//这里处理的有点复杂 后期优化	
	for (var m = 0; m < dishs.length; m++) {
		const d = dishs[m];

		if (d.dish_number != 0) {
			arr.push(d);
			dishNumber += d.allow_decimal == 1 ? 1 : d.dish_number;
			amount += d.dish_number * d.unit_price;
		}

	};
	amount=amount.toFixed(2);
	return { dishs: arr, dish_number: dishNumber, amount: amount, receive_amount: amount };
}