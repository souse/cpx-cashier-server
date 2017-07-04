import api from '../api';

export const SEARCH_FOOD = 'SEARCH_FOOD';
export const SEARCH_FOOD_SUCCESS = 'SEARCH_FOOD_SUCCESS';
export const ADD_FOOD = 'ADD_FOOD';
export const DELETE_FOOD = 'DELETE_FOOD';
export const OPERATE_FOOD = 'OPERATE_FOOD';
export const SALEOPRE_FOOD = 'SALEOPRE_FOOD';
export const MODIFY_FOOD_REMARKS = 'MODIFY_FOOD_REMARKS';
export const CHANGE_TABLE_ID = 'CHANGE_TABLE_ID';
export const UPDATE_FOOD_ORDER_ID = 'UPDATE_FOOD_ORDER_ID';
export const CLEAR_FOOD = 'CLEAR_FOOD';
export const UPDATE_FOOD_PAYPRICE = 'UPDATE_FOOD_PAYPRICE';
export const UPDATE_UNORDERED_DISHS = 'UPDATE_UNORDERED_DISHS'; //更新还没有落单菜的数量，备注
export const SET_REVERSED_MESSAGE = 'SET_REVERSED_MESSAGE';
export const UPDATE_SHOULD_CLICK = 'UPDATE_SHOULD_CLICK'; //点击落单快速点击结账。出现菜品翻倍的问题
export const IF_MEMBER_CHECKOUT = 'IF_MEMBER_CHECKOUT'; //全局判断是否按照会员账单结账
export const IF_COMBO = 'IF_COMBO';
export const SPECILE_NOTE = 'SPECILE_NOTE';


export const searchFood = obj => {
	return {
		type: SEARCH_FOOD,
		payload: {
			promise: api.get('/get_order_ver2.json', {
				params: obj
			}),
		}
	}
}

export const addFood = (dish) => {
	return {
		type: ADD_FOOD,
		payload: {
			dish
		}
	}
}

export const deleteFood = (dish) => {
	return {
		type: DELETE_FOOD,
		payload: {
			dish
		}
	}
}


export const operateFood = (dishs) => {
	return {
		type: OPERATE_FOOD,
		payload: {
			dishs
		}
	}
}

export const saleopreFood = (dishs) => {
	return {
		type: SALEOPRE_FOOD,
		payload: {
			dishs
		}
	}
}

export const modifyFoodRemarks = (dish, remarks) => {
	return {
		type: MODIFY_FOOD_REMARKS,
		payload: {
			dish,
			remarks
		}
	}
}

export const changeTableId = table => {
	return {
		type: CHANGE_TABLE_ID,
		payload: {
			table
		}
	}
}

export const updateOrderDetailOrderId = id => {
	return {
		type: UPDATE_FOOD_ORDER_ID,
		payload: {
			id
		}
	}
}

export const updateshouldclick = fag => {
	return {
		type: UPDATE_SHOULD_CLICK,
		payload: {
			fag
		}
	}
}

//结账过程中，是否点击了会员结账
export const ifmembercheckout = ifmember => {
	return {
		type: IF_MEMBER_CHECKOUT,
		payload: {
			ifmember
		}
	}
}

// 菜品是否是套餐
export const ifCombo = lag => {
	return {
		type: IF_COMBO,
		payload: {
			lag
		}
	}
}

export const clearFood = () => {
	return {
		type: CLEAR_FOOD,
		payload: {}
	}
}

export const updateFoodPayPrice = obj => {
	return {
		type: UPDATE_FOOD_PAYPRICE,
		payload: {
			obj
		}
	}
}

export const updateUnOrderDishs = batchdishs => {
	return {
		type: UPDATE_UNORDERED_DISHS,
		payload: {
			batchdishs
		}
	}
}

export const specileNote = str => {
	return {
		type: SPECILE_NOTE,
		payload: {
			str
		}
	}
}

export const setReversedMessage = (reversedRemarks, ifreverse) => {
	return {
		type: SET_REVERSED_MESSAGE,
		payload: {
			reversedRemarks,
			ifreverse
		}
	}
}