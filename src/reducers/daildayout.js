

import { 
	GET_DAYOUT_LIST,
	GET_DAYOUT_LIST_SUCCESS,
} from '../actions/daildayout';

const initialState = {
	dayoutlist: {}
};

// 统计模块中的。  日结日志
const getdayoutlist = (state = initialState, action = {}) => {

	switch(action.type) {
		case GET_DAYOUT_LIST_SUCCESS:
			return { dayoutlist: action.payload.data};
		default:
			return state;	
	}
 }

 export default getdayoutlist;