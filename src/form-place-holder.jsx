import React from 'react';
import PropTypes from 'prop-types';

const PLACE_HOLDER = 'ui placeholder center aligned segment';

export default class PlaceHolder extends React.Component {
  render() {
    return (
      this.props.show &&
      <div className={PLACE_HOLDER} >
        <div className="ui header">
          <span>{this.props.text}</span>
          </div>
      </div>
    );
  }
}

PlaceHolder.propTypes = {
  text: PropTypes.string,
  show: PropTypes.bool,
};

PlaceHolder.defaultProps = {
  text: 'Drop a item here....',
  show: false,
};
