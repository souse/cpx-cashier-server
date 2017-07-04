import cloneDeep from 'lodash/cloneDeep';
import { 
	GET_TABLES, 
	GET_TABLES_SUCCESS, 
	SET_CURRENT_TABLE_ID,
	CLEAR_CURRENT_TABLE 
} from '../actions/tables';

import { checkAjaxError } from '../utils';

const initialState = {
	currentTableId: null,
	currentTable: {},
	tables: [],
	ajaxError: null
};

const getTables = (state = initialState, action = {}) => {
	switch (action.type) {
		case GET_TABLES_SUCCESS:
			return Object.assign({}, state, { tables: action.payload.data, ajaxError: checkAjaxError(action.payload)});
		case SET_CURRENT_TABLE_ID:
			const id = action.payload.id;
			const tables = cloneDeep(state.tables);
			const currentTable = setCurrentTable(id, tables);

			return Object.assign({}, state, { 
				currentTableId: id,
				currentTable: currentTable 
			});
		case CLEAR_CURRENT_TABLE:
			return Object.assign({}, state, { currentTableId: null, currentTable: {} });	
		default:
			return state;
	}
}

export default getTables;

const setCurrentTable = (id, tables) => {
	let cTable;

	for (let i = 0; i < tables.length; i++) {
		const table = tables[i];

		if (table.table_id == id) {
			cTable = table;
			break;
		}
	};
	return cTable;
}
