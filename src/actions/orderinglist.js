/**
 * 在点菜页面 点菜操作，点了多少菜的列表操作
 */
export const ADD_ORDERING_DISH = 'ADD_ORDERING_DISH';
export const DEL_ORDERING_DISH = 'DEL_ORDERING_DISH';
export const CLEAR_ORDERING_DISH = 'CLEAR_ORDERING_DISH';

export const addOrderingDish = dish => {
	return {
		type: ADD_ORDERING_DISH,
		payload: {
			dish
		}
	}
}

export const delOrderingDish = id => {
	return {
		type: DEL_ORDERING_DISH,
		payload: {
			id
		}
	}
}

