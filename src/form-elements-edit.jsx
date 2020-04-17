import React from 'react';
import TextAreaAutosize from 'react-textarea-autosize';
import {
  ContentState, EditorState, convertFromHTML, convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';

import DynamicOptionList from './dynamic-option-list';
import { get } from './stores/requests';
import ID from './UUID';
import { stringToBool } from './form-elements';

const toolbar = {
  options: ['inline', 'list', 'textAlign', 'fontSize', 'link', 'history'],
  inline: {
    inDropdown: false,
    className: undefined,
    options: ['bold', 'italic', 'underline', 'superscript', 'subscript'],
  },
};

export default class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false,
    };
  }

  toggleRequired() {
    // const this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const this_element = this.state.element;
    this_element[elemProperty] = e.target[targProperty];

    this.setState({
      element: this_element,
      dirty: true,
    }, () => {
      if (targProperty === 'checked') { this.updateElement(); }
    });
  }

  onEditorStateChange(index, property, editorContent) {
    // const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/(?:\r\n|\r|\n)/g, ' ');
    const this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({ dirty: false });
    }
  }

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks || !newContent.contentBlocks.length) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentState = ContentState.createFromBlockArray(newContent);
    return EditorState.createWithContent(contentState);
  }

  addOptions() {
    const optionsApiUrl = document.getElementById('optionsApiUrl').value;
    if (optionsApiUrl) {
      get(optionsApiUrl).then(data => {
        this.props.element.options = [];
        const { options } = this.props.element;
        data.forEach(x => {
          // eslint-disable-next-line no-param-reassign
          x.key = '';
          options.push(x);
        });
        const this_element = this.state.element;
        this.setState({
          element: this_element,
          dirty: true,
        });
      });
    }
  }

  render() {
    if (this.state.dirty) {
      this.props.element.dirty = true;
    }

    const this_checked = this.props.element.hasOwnProperty('required') ? stringToBool(this.props.element.required) : false;
    const this_read_only = this.props.element.hasOwnProperty('readOnly') ? this.props.element.readOnly : false;
    const this_default_today = this.props.element.hasOwnProperty('defaultToday') ? this.props.element.defaultToday : false;
    const this_show_time_select = this.props.element.hasOwnProperty('showTimeSelect') ? this.props.element.showTimeSelect : false;
    const this_show_time_select_only = this.props.element.hasOwnProperty('showTimeSelectOnly') ? this.props.element.showTimeSelectOnly : false;
    const this_checked_inline = this.props.element.hasOwnProperty('inline') ? this.props.element.inline : false;
    const this_checked_bold = this.props.element.hasOwnProperty('bold') ? this.props.element.bold : false;
    const this_checked_italic = this.props.element.hasOwnProperty('italic') ? this.props.element.italic : false;
    const this_checked_center = this.props.element.hasOwnProperty('center') ? this.props.element.center : false;
    const this_checked_page_break = this.props.element.hasOwnProperty('pageBreakBefore') ? this.props.element.pageBreakBefore : false;
    const this_checked_alternate_form = this.props.element.hasOwnProperty('alternateForm') ? this.props.element.alternateForm : false;

    const {
      canHavePageBreakBefore, canHaveAlternateForm, canHaveDisplayHorizontal, canHaveOptionCorrect, canHaveOptionValue,
    } = this.props.element;

    const this_files = this.props.files.length ? this.props.files : [];
    if (this_files.length < 1 || (this_files.length > 0 && this_files[0].id !== '')) {
      this_files.unshift({ id: '', file_name: '' });
    }

    let editorState;
    if (this.props.element.hasOwnProperty('content')) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty('label')) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    return (
      <div>
        <div className="edit-form-element-title">
          <h3 className="ui header">{this.props.element.text}</h3>
          <i className="close icon" onClick={this.props.manualEditModeOff}/>
        </div>

        { this.props.element.hasOwnProperty('label') &&
          <div className="field">
            <label >ID</label>
            <input id="idInput" type="text" defaultValue={this.props.element.id} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'id', 'value')} />
          </div>
        }

        { this.props.element.hasOwnProperty('content') &&
          <div className="field">
            <label>Text to display:</label>

            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'content')}
              stripPastedStyles={true} />
          </div>
        }
        { this.props.element.hasOwnProperty('file_path') &&
          <div className="field">
            <label htmlFor="fileSelect">Choose file:</label>
            <select id="fileSelect" defaultValue={this.props.element.file_path} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'file_path', 'value')}>
              {this_files.map((file) => {
                const this_key = `file_${file.id}`;
                return <option value={file.id} key={this_key}>{file.file_name}</option>;
              })}
            </select>
          </div>
        }
        { this.props.element.hasOwnProperty('href') &&
          <div className="field">
            <TextAreaAutosize type="text" defaultValue={this.props.element.href} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'href', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('src') &&
          <div>
            <div className="field">
              <label htmlFor="srcInput">Link to:</label>
              <input id="srcInput" type="text" defaultValue={this.props.element.src} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'src', 'value')} />
            </div>
            <div className="field">
              <div className="ui checkbox">
                <input type="checkbox" checked={this_checked_center} value={true} onChange={this.editElementProp.bind(this, 'center', 'checked')} />
                <label>
                  Center?
                </label>
              </div>
            </div>
            <div className="double-field-container">
              <div className="field">
                <label htmlFor="elementWidth">Width:</label>
                <input id="elementWidth" type="text" defaultValue={this.props.element.width} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'width', 'value')} />
              </div>
              <div className="field">
                <label htmlFor="elementHeight">Height:</label>
                <input id="elementHeight" type="text" defaultValue={this.props.element.height} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'height', 'value')} />
              </div>
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('label') &&
          <div className="field">
            <label>Display Label</label>
            <Editor
              toolbar={toolbar}
              defaultEditorState={editorState}
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, 'label')}
              stripPastedStyles={true} />

            <br />

            <div className="field">
              <div className="ui checkbox">
                <input type="checkbox" checked={typeof this_checked === 'string' ? this_checked === "true" : this_checked } value={true} onChange={this.editElementProp.bind(this, 'required', 'checked')} />
                <label>Required</label>
              </div>
            </div>
            { this.props.element.hasOwnProperty('readOnly') &&
              <div className="field">
                <div className="ui checkbox">
                  <input type="checkbox" checked={typeof this_read_only === 'string' ? this_read_only === "true" : this_read_only } value={true} onChange={this.editElementProp.bind(this, 'readOnly', 'checked')} />
                  <label>Read only</label>
                </div>
              </div>
            }
            { this.props.element.hasOwnProperty('defaultToday') &&
              <div className="field">
                <div className="ui checkbox">
                  <input type="checkbox" checked={typeof this_default_today === 'string' ? this_default_today === "true" : this_default_today } value={true} onChange={this.editElementProp.bind(this, 'defaultToday', 'checked')} />
                  <label>Default to Today</label>
                </div>            
              </div>
            }
            { this.props.element.hasOwnProperty('showTimeSelect') &&
              <div className="field">
                <div className="ui checkbox">
                  <input type="checkbox" checked={typeof this_show_time_select === 'string' ? this_show_time_select === "true" : this_show_time_select } value={true} onChange={this.editElementProp.bind(this, 'showTimeSelect', 'checked')} />
                  <label>Show Time Select</label>
                </div>
              </div> 
            }
            { this_show_time_select && this.props.element.hasOwnProperty('showTimeSelectOnly') &&
              <div className="field">
                <div className="ui checkbox">
                  <input type="checkbox" checked={typeof this_show_time_select_only === 'string' ? this_show_time_select_only === "true" : this_show_time_select_only } value={true} onChange={this.editElementProp.bind(this, 'showTimeSelectOnly', 'checked')} />
                  <label>Show Time Select Only</label>
                </div> 
              </div>
            }
            { (this.state.element.element === 'RadioButtons' || this.state.element.element === 'Checkboxes') && canHaveDisplayHorizontal &&
              <div className="field">
                <div className="ui checkbox">
                  <input type="checkbox" checked={typeof this_checked_inline === 'string' ? this_checked_inline === "true" : this_checked_inline } value={true} onChange={this.editElementProp.bind(this, 'inline', 'checked')} />
                  <label>Display horizonal</label>
                </div> 
              </div>
            }
          </div>
        }

        {canHavePageBreakBefore &&
          <div className="field">
            <label>Print Options</label>
            <div className="ui checkbox">
              <input type="checkbox" checked={this_checked_page_break} value={true} onChange={this.editElementProp.bind(this, 'pageBreakBefore', 'checked')} />
              <label>
                Page Break Before Element?
              </label>
            </div>
          </div>
        }

        {canHaveAlternateForm &&
          <div className="field">
            <label>Alternate/Signature Page</label>
            <div className="ui checkbox">
              <input type="checkbox" checked={this_checked_alternate_form} value={true} onChange={this.editElementProp.bind(this, 'alternateForm', 'checked')} />
              <label>
                Display on alternate/signature Page?
              </label>
            </div>
          </div>
        }

        { this.props.element.hasOwnProperty('default_value') &&
          <div className="field">
            <label htmlFor="defaultSelected">Default Selected</label>
            <input id="defaultSelected" type="number" defaultValue={this.props.element.default_value} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'default_value', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('static') && this.props.element.static &&
          <div className="grouped fields">
            <label>Text Style</label>
            <div className="field">
              <div className="ui checkbox">
                <input type="checkbox" checked={this_checked_bold} value={true} onChange={this.editElementProp.bind(this, 'bold', 'checked')} />
                <label>
                  Bold
                </label>
              </div>
            </div>
            <div className="field">
              <div className="ui checkbox">
                <input type="checkbox" checked={this_checked_italic} value={true} onChange={this.editElementProp.bind(this, 'italic', 'checked')} />
                <label>
                  Italic
                </label>
              </div>
            </div>
          </div>
        }
        { this.props.showCorrectColumn && this.props.element.canHaveAnswer && !this.props.element.hasOwnProperty('options') &&
          <div className="form-group">
            <label className="control-label" htmlFor="correctAnswer">Correct Answer</label>
            <input id="correctAnswer" type="text" className="form-control" defaultValue={this.props.element.correct} onBlur={this.updateElement.bind(this)} onChange={this.editElementProp.bind(this, 'correct', 'value')} />
          </div>
        }
        { this.props.element.hasOwnProperty('options') &&
          <div className="field">
            <label htmlFor="optionsApiUrl">Populate Options from API</label>
            <div className="double-field-container">
              <input className="form-control" style={{ width: '100%' }} type="text" id="optionsApiUrl" placeholder="http://localhost:8080/api/optionsdata" />
              <button onClick={this.addOptions.bind(this)} className="ui button primary">Populate</button>
            </div>
          </div>
        }
        { this.props.element.hasOwnProperty('options') &&
          <DynamicOptionList showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length} />
        }
      </div>
    );
  }
}
FormElementsEdit.defaultProps = { className: 'edit-element-fields' };
