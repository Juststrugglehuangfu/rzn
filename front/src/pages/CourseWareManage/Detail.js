import React, { PureComponent } from 'react';
import ReactDOM from "react-dom";
import styles from './Detail.less';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber,
  Row, Col, Upload, Icon, Modal, message, Switch
} from 'antd';

import formsStyles from '../Forms/style.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

@connect(({ loading, courseWare }) => ({
  submitting: loading.effects[''],
  data: courseWare.data
}))
@Form.create()

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    console.log("props====", props)
    this.state = {
      fileList: []
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
     

  }
  componentWillReceiveProps() {
    console.log("componentWillReceiveProps ==")
    console.log("componentWillReceiveProps = props=", this.props)
    var data = this.props.data
    this.setState({
      fileList: data.fileList || []
    })
  }
  handleUpdate = fields => {
    let { dispatch, modifyCourseWare } = this.props;
    let params = {}
    params.coursewares_content = fields["coursewares_content"]
    params.coursewares_no = modifyCourseWare.coursewares_no
    params.coursewares_tea = modifyCourseWare.coursewares_tea
    dispatch({
      type: 'courseWare/update',
      payload: params,
      success: () => {
        message.success('修改成功！');
        console.log("this.props===", this.props)
        this.props.onCancel();
        this.props.onSearch()
      },
      fail: (res) => {
        console.log("fail====", res)
        message.error('修改失败！');
      },
    });
  };
  onDelete = () => {
    let { dispatch, modifyCourseWare } = this.props;
    dispatch({
      type: 'courseWare/delete',
      payload: {
        params: {
          coursewares_no: modifyCourseWare.coursewares_no
        }
      },
      success: () => {
        message.success('删除成功！');
        console.log("this.props===", this.props)
        this.props.onCancel();
        this.props.onSearch()
      },
      fail: (res) => {
        console.log("fail====", res)
        message.error('删除失败！');
      },
    });
  }
  handleChange = ({ file, fileList, event }) => {
    console.log("handleChange file==", file)
    console.log("handleChange fileList==", fileList)
    fileList = fileList.map((file) => {
      if (file.response && !file.response.code) {
        // Component will show file.url as link
        let fileAdress = file.response.data[file.name]["fileAdress"]
        console.log("fileAdress===", fileAdress)
        file.url = fileAdress
        const { dispatch, modifyCourseWare } = this.props;
        var data = {}
        data.coursewares_images = file.url
        data.coursewares_no = modifyCourseWare.coursewares_no
        dispatch({
          type: 'courseWare/saveImage',
          payload: data,
          success: (data) => {
            message.success("上传成功！")
            dispatch({
              type: 'courseWare/fetchImages',
              payload: {
                coursewares_no: modifyCourseWare.coursewares_no
              },
              success: (data) => {
              }
            })
          },
          fail: () => {
            message.warn("fail")
          }
        });
      }
      return file;
    });
    console.log("fileList===", fileList)
    this.setState({ fileList })
  }
  onFileRemove = (file) => {
    const { dispatch, modifyCourseWare } = this.props;
    var data = {}
    data.id = file.id
    dispatch({
      type: 'courseWare/deleteImage',
      payload: data,
      success: (data) => {
        message.success("删除成功！")
        dispatch({
          type: 'courseWare/fetchImages',
          payload: {
            coursewares_no: modifyCourseWare.coursewares_no
          },
          success: (data) => {
          }
        })
      },
      fail: () => {
        message.warn("fail")
      }
    });
  }
  okHandle = () => {
    const { form, type } = this.props
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.handleUpdate(fieldsValue);
    });
  };
  render() {
    const { submitting, modalVisible, onCancel, } = this.props;
    let modifyCourseWare = this.props.modifyCourseWare || {}
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { previewVisible, previewImage, fileList, current } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };
    return (
      <Modal
        destroyOnClose
        title="课件详情"
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={this.props.onCancel}
      >
        <Form onSubmit={this.handleSubmit} hideRequiredMark={false} style={{ marginTop: 8 }}>
          {/* 姓名 */}
          <FormItem {...formItemLayout} label="课件描述">
            {getFieldDecorator('coursewares_content', {
              initialValue: modifyCourseWare.coursewares_content,
              rules: [
                {
                  required: true,
                  message: "请输入课件描述",
                },
              ],
            })(<Input placeholder="课件描述" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="课件描述">
            <Upload
              action={"/frame-web/uploadApi/upload?teaId="
                + modifyCourseWare.coursewares_tea + "&coursewaresId=" + modifyCourseWare.coursewares_no}
              listType="picture-card"
              fileList={fileList}
              onPreview={this.handlePreview}
              onChange={this.handleChange}
              beforeUpload={this.beforeUpload}
              onRemove={this.onFileRemove}
            >
              {uploadButton}
            </Upload>
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="danger" style={{ marginLeft: 8 }} icon="delete" onClick={this.onDelete}>
              删除课件
            </Button>
          </FormItem>
        </Form>
      </Modal >
    )
  }
}

export default Detail;