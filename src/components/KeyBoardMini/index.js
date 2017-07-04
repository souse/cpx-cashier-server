import React, { Component, PropTypes } from 'react';

import { Button } from 'antd';

import './index.less';

const keyNumber = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', '.'];

class KeyBoardMini extends Component {
	constructor(props) {
		super(props);
		this.state = { inputValue: '' }

		this.selectLevel = this.selectLevel.bind(this);
		this.handleBackspace = this.handleBackspace.bind(this);
		this.handleClear = this.handleClear.bind(this);
	}

	selectLevel(e, num) {
		e.preventDefault();

		this.props.onPress(num);
	}
	handleBackspace(e) {
		e.preventDefault();
        this.props.onPress(null, 'backspace');
	}

	handleClear() {
		this.props.handleClear && this.props.handleClear();	
	}

	render() {
		return (
			<div className="keyboard-content keyboard-mini">
				<div className="keyboard-number">
					{keyNumber.map((num, i) => 
						<Button 
							className="btn-normal" 
							type="default" 
							key={i} 
							onClick={(e) => this.selectLevel(e, num)}
						>
							{num}
						</Button>		
					)}	
				</div>
				<div className="keyboard-operate">
					<Button className="btn-normal btn-cancle" type="default" onClick={(e) => this.handleBackspace(e)}>删除</Button>
					<Button className="btn-normal btn-confirm" type="default" onClick={this.handleClear}>清空</Button>
				</div>	
			</div>
		)
	}
}

KeyBoardMini.propTypes = {
	onPress: PropTypes.func.isRequired
};

export default KeyBoardMini;