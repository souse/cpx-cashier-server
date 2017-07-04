

import { 
	GET_DAYDETAIL_LIST,
	GET_DAYDETAIL_LIST_SUCCESS
} from '../actions/DailyRevenue';

const initialState = {
	dayToalDetail:{}
};

// 每日营收模块
const getDayDetail = (state = initialState, action = {}) => {

	switch(action.type) {
	    case GET_DAYDETAIL_LIST_SUCCESS:
			return { dayToalDetail: action.payload.data }
		default:
			return state;	
	}
 }

 export default getDayDetail;