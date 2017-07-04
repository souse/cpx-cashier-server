import React, { PropTypes, Component } from 'react';

import './index.less';

const lis = [
    {
		id: 0,
		text: '菜品销售统计',
		url: '/statistics/Dailydishdata'	
	},
	{
		id: 1,
		text: '每日营业数据',
		url: '/statistics/daystic'
	},
	{
		id: 2,
		text: '综合营业数据',
		url: '/statistics/DailyComprehensive'	
	},
	{
		id: 6,
		text: '退菜统计',
		url: '/statistics/refunddishreport'	
	},
	{
		id: 7,
		text: '套餐销售统计',
		url: '/statistics/dishcomboreport'
	},
	{
		id: 8,
		text: '赠菜统计',
		url: '/statistics/presentdishreport'	
	},
	{
		id: 3,
		text: '班结日志',
		url: '/statistics/DailyRecord'	
	},
	{
		id: 4,
		text: '日结日志',
		url: '/statistics/Dailydayout'	
	},
	{
		id:5,
		text:'操作日志',
		url:'/statistics/Dailyhandle'
	}
];

class SticNav extends Component {
	constructor(props) {
		super(props);
	}
		
	handleChangeSticType(obj) {
		this.context.router.push(obj.url);
	}

	render() {
		const { activeId } = this.props;
		const nav = lis.map((li, key) => {
			return (
				<li 
					className={li.id == activeId ? 'active' : ''}
					key={key} 
					onClick={() => this.handleChangeSticType(li)}
				>
					{li.text}
					<i></i>
				</li>
			)
		});

		return (
			<div className="menu stic-nav">
				<h2 className="menu-table-position">统计</h2>
				<ul>
					{ nav }
				</ul>
			</div>
		)
	}
}

SticNav.contextTypes = {
	router: PropTypes.object.isRequired
}

export default SticNav;