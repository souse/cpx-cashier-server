
export const ADD_BATCH_DISH = 'ADD_BATCH_DISH';
export const DELETE_BATCH_DISH = 'DELETE_BATCH_DISH';
export const MODIFY_BATCH_DISH = 'MODIFY_BATCH_DISH';
export const REMOVE_BATCH_DISH = 'REMOVE_BATCH_DISH';
export const CLEAR_BATCH_DISH = 'CLEAR_BATCH_DISH';
export const ADD_SINGLE_BATCH_DISH = 'ADD_SINGLE_BATCH_DISH';
export const UPDATE_IS_BATCH_DISH = 'UPDATE_IS_BATCH_DISH';
export const COMBO_ADD='COMBO_ADD';
export const ADD_COMBO_DISH='ADD_COMBO_DISH';
export const DELETE_COMBO_DISH='DELETE_COMBO_DISH';
export const UPDATE_COMBO_DISH='UPDATE_COMBO_DISH';


export const addBatchDish = (dish, orderId, tableId, operate) => {
	return {
		type: ADD_BATCH_DISH,
		payload: { 
			dish,
			orderId,
			tableId,
			operate
		}
	}
}

export const deleteBatchDish = dish => {
	return {
		type: DELETE_BATCH_DISH,
		payload: { 
			dish 
		}
	}
}

export const removeBatchDish = (record, orderId) => {
	return {
		type: REMOVE_BATCH_DISH,
		payload: { 
			record,
			orderId 
		}
	}
}

export const clearBatchDish = () => {
	return {
		type: CLEAR_BATCH_DISH,
		payload: {}
	}
}

// 增加备注
export const modifyBatchDish = (dish, remarks) => {
	return {
		type: MODIFY_BATCH_DISH,
		payload: {
			dish,
			remarks
		}
	}
}

export const addSingleBatchDish = (dish, tableId, orderId) => {
	return {
		type: ADD_SINGLE_BATCH_DISH,
		payload: {
			dish,
			tableId,
			orderId
		}
	}
}

export const updateIsBatchDish = (flag) => {
	return {
		type: UPDATE_IS_BATCH_DISH,
		payload: {
			flag
		}
	}
}


// 选择前的套餐数据存到batchdishs里面
export const comboadd = (dishs) => {
	return {
		type: COMBO_ADD,
		payload: {
			dishs
		}
	}
}


// 增加套餐里的菜品数量
export const addcombodish = (dish) => {
	return {
		type: ADD_COMBO_DISH,
		payload: {
			dish
		}
	}
}

// 减少套餐里的菜品数量
export const deletecombodish = (dh) => {
	return {
		type: DELETE_COMBO_DISH,
		payload: {
			dh
		}
	}
}

// 更新套餐，将选好的菜品放到一个数组里

export const updatecombodish = () => {
	return {
		type: UPDATE_COMBO_DISH,
		payload: {
			
		}
	}
}




