import { GET_TABLE_AREA, GET_TABLE_AREA_SUCCESS, SET_CURRENT_TABLE_AREA_ID } from '../actions/tableArea';

import { checkAjaxError } from '../utils';

const initialState = {
	currentTableAreaId: 0,
	currentTableArea: { area_id: '', area_name: '全部' },
	tableArea: [],
	ajaxError: null
};

const getTableArea = (state = initialState, action = {}) => {
	switch (action.type) {
		case GET_TABLE_AREA_SUCCESS:
			let area = action.payload.data;

			area.unshift({ area_id: '', area_name: '全部' });
			area.push({ area_id: '', status: 0, area_name: '空闲('+ area[1].un_seating_amount +')' });
			area.push({ area_id: '', status: 1, area_name: '占用('+ area[1].seating_amount +')' });
			return Object.assign({}, state, { tableArea: action.payload.data, ajaxError: checkAjaxError(action.payload)});
		case SET_CURRENT_TABLE_AREA_ID:
			return Object.assign({}, state, { 
				currentTableAreaId: action.payload.id, 
				currentTableArea: action.payload.tablearea
			});
		default:
			return state;
	}
}

export default getTableArea;