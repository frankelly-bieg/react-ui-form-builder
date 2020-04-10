import React from 'react';
import store from './src/stores/store';
import ReactFormGenerator from './src/form';

const answers = {};

export default class Demobar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
    };

    const update = this._onChange.bind(this);

    store.subscribe(state => update(state.data));
  }

  showPreview() {
    this.setState({
      previewVisible: true,
    });
  }

  showShortPreview() {
    this.setState({
      shortPreviewVisible: true,
    });
  }

  showRoPreview() {
    this.setState({
      roPreviewVisible: true,
    });
  }

  closePreview() {
    this.setState({
      previewVisible: false,
      shortPreviewVisible: false,
      roPreviewVisible: false,
    });
  }

  _onChange(data) {
    this.setState({
      data,
    });
  }

  render() {
    let modalClass = 'ui modal';
    if (this.state.previewVisible) {
      modalClass += ' active';
    }

    return (
      <div style={{ margin: '10px', width: '68%' }}>
        <div style={{
          display: 'flex', 
          justifyContent: 'space-between'
        }}>
          <h4 className="pull-left">Preview</h4>
          <button className="ui small button primary" style={{ marginRight: '10px' }} onClick={this.showPreview.bind(this)}>Preview Form</button>
        </div>
        
        { this.state.previewVisible && 
          <div style={{
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100vh',
              width: '100%',
              backgroundColor: 'rgba(0,0,0,.85)',
              zIndex: 1000
            }}
          >
            <div className={modalClass}>
              <div className="scrolling content" style={{overflow: 'visible'}}>
                <ReactFormGenerator
                  download_path=""
                  answer_data={answers}
                  variables={this.props.variables}
                  data={this.state.data} />
              </div>
                
              <div className="actions">
                <div className="ui mini basic button red" onClick={this.closePreview.bind(this)}>Close</div>
              </div>
            </div>
          </div>
        }

      </div>
    );
  }
}
