/**
  * <HeaderBar />
  */

import React from 'react';

export default class HeaderBar extends React.Component {
  render() {
    return (
      <div className="toolbar-header">
        <div className="ui tiny label">{this.props.data.text}</div>
        <div className="toolbar-header-buttons">
          { this.props.data.element !== 'LineBreak' &&
            <div className="btn is-isolated btn-school" onClick={this.props.editModeOn.bind(this.props.parent, this.props.data)}><i className="is-isolated fa fa-pencil-square-o"></i></div>
          }
          <div className="btn is-isolated btn-school" onClick={this.props.onDestroy.bind(this, this.props.data)}><i className="is-isolated fa fa-trash-o"></i></div>
        </div>
      </div>
    );
  }
}
