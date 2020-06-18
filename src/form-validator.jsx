/**
  * <FormValidator />
  */

import React from 'react';
import xss from 'xss';

const myxss = new xss.FilterXSS({
  whiteList: {
    u: [],
    br: [],
    b: [],
    i: [],
    ol: ['style'],
    ul: ['style'],
    li: [],
    p: ['style'],
    sub: [],
    sup: [],
    div: ['style'],
    em: [],
    strong: [],
    span: ['style'],
  },
});

export default class FormValidator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
    };
  }

  componentWillMount() {    
    this.subscription = this.props.emitter.addListener('formValidation', (errors) => {
      this.setState({ errors });
    });
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  dismissModal(e) {
    e.preventDefault();
    this.setState({ errors: [] });
  }

  render() {
    const errors = this.state.errors.map((error, index) => <li key={`error_${index}`} dangerouslySetInnerHTML={{ __html: myxss.process(error) }} />);

    if(this.state.errors.length > 0){
      return (
        <div className="ui negative message">
        <i className="close icon" onClick={this.dismissModal.bind(this)}/>
        <div class="header">
          Form errors
        </div>
        <ul className="list">
          {errors}
        </ul>
      </div>
      )
    } else {
      return null
    }
  }
}
