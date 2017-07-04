import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Table, Row, Col, Button, notification } from 'antd';

import { getUser } from '../../utils';

import * as getTableArea from '../../actions/tableArea';
import { getTables } from '../../actions/tables';

import './index.less';

const propTypes = {
  	tableArea: PropTypes.object,
  	ajaxError: PropTypes.string
};

class TableArea extends Component {
	constructor(props) {
		super(props);
		this.state = { active: 0 };
		this.changeTableArea = this.changeTableArea.bind(this);
	}

	componentDidMount() {

		this.props.getTableArea();		
	}

	componentWillReceiveProps(nextProps) {
		const error = nextProps.ajaxError;

		if (error != this.props.ajaxError && error) {
          	notification.error({
              	message: '获取桌子区域信息失败！',
              	description: error
          	});
      	}
	}

	changeTableArea(table, key) {
		let user = getUser();
		
		if (this.props.isNotChooseTable) {
			this.context.router.replace('/cashier/choosetable');
		}

		this.props.getTables({
			...user,
			area_id: table.area_id,
			status: table.status != undefined ? table.status : ''
		});
		this.props.setTableAreaId(key, table);

		//滚动到最上边 ---begin---
		const lis = document.getElementsByClassName('clist')[0];

		lis.style.transition='all 0s';
		lis.style.transform='translateY(0px)';
		//滚动到最上边 ---end---
	}

	render() {
		let { currentTableAreaId, tableArea } = this.props.tableArea, area;

		area = tableArea.map((ta, key) => {
			return (
				<Col 
					span={24} 
					key={key}
					data-key={key}
					data-ta={ta}
					className={currentTableAreaId == key ? `change-common status_${ta.status} active` : `change-common status_${ta.status}`}
					onClick={() => this.changeTableArea(ta, key)}
				>
					{ta.area_name}
				</Col>
			)
		});

		return (
			<div className="ob-change">
				{ area }
			</div>
		)
	}
}

TableArea.propTypes = propTypes;
TableArea.contextTypes = {
	router: PropTypes.object.isRequired
}
export default TableArea;