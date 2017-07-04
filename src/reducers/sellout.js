import cloneDeep from 'lodash/cloneDeep';
import {
	GET_SELLOUT_LIST,
	GET_SELLOUT_LIST_SUCCESS,
	UPDATE_SELLOUT,
	ADD_SELLOUT,
	DELETE_SELLOUT,
	CLEAR_SELLOUT_LIST,
	CLEAR_SELLOUT_LIST_SUCCESS,
	UPDATE_CHECKD
} from '../actions/sellout';

const initialState = {
	selloutlist: [],
	flag:false   // 记录日结清空沽清菜品按钮状态
}

const sellout = (state = initialState, action = {}) => {
	switch(action.type) {
		case GET_SELLOUT_LIST_SUCCESS:
			return { selloutlist: action.payload.data };
		case UPDATE_SELLOUT:
			const sl = cloneDeep(state.selloutlist);

			return { 
				selloutlist:  updateSellOut(sl, action.payload)
			};
		case ADD_SELLOUT:
			const list = cloneDeep(state.selloutlist);

			list.unshift(action.payload.obj);
			return { selloutlist: list };

		case DELETE_SELLOUT:
			return {
				selloutlist:
				deleteSellOut(cloneDeep(state.selloutlist), action.payload.id)
			};
		case CLEAR_SELLOUT_LIST_SUCCESS:
			return initialState; 
		case UPDATE_CHECKD:
	    return Object.assign({},state,{flag:action.payload.flg});
		default:
			return state;
	}
}

export default sellout;

const updateSellOut = (list, obj) => {
	for (let i = 0; i < list.length; i++) {
		const li = list[i];

		if (li.dish_id  == obj.id) {
			list[i].surplus = obj.surplus;
			list[i].day_limit = obj.dayLimit;

			break;
		}
	};

	return list;
}

const deleteSellOut = (list, id) => {
	for (let i = 0; i < list.length; i++) {
	 	const li = list[i];

	 	if (li.dish_id == id) {
	 		list = list.splice(0, i).concat(list.splice(1, list.length));
	 		break;
	 	}
	}; 

	return list;
}








