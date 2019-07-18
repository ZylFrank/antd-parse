import React, { PureComponent } from 'react';
import { Table, Card, Tooltip, Icon, Modal, Form, Input, Button, message, InputNumber } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const FormItem = Form.Item;
const { confirm } = Modal;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

@connect(({ dictionary }) => ({
  dictionary,
}))
@Form.create()
class dictionaryList extends PureComponent {
  render() {
    const { form, dispatch, dictionary } = this.props;
    const { getFieldDecorator, validateFields, resetFields } = form;
    const { modalVisible, data, isEdit, editInfo = {}, loading, parent } = dictionary;
    const { label = '', value = '', order } = editInfo;
    const onAdd = () => {
      dispatch({
        type: 'dictionary/save',
        payload: {
          modalVisible: true,
        },
      });
    };
    const addItem = e => {
      dispatch({
        type: 'dictionary/save',
        payload: {
          modalVisible: true,
          parent: e,
        },
      });
    };
    const editItem = e => {
      dispatch({
        type: 'dictionary/save',
        payload: {
          modalVisible: true,
          isEdit: true,
          editInfo: e,
        },
      });
    };
    const deleteItem = e => {
      confirm({
        title: '您确定删除吗？',
        okText: '确定',
        cancelText: '取消',
        onCancel() {},
        onOk() {
          dispatch({
            type: 'dictionary/deleteItem',
            payload: e,
          });
        },
      });
    };
    const columns = [
      {
        title: '标签',
        dataIndex: 'label',
      },
      {
        title: '值',
        dataIndex: 'value',
      },
      {
        title: '排序',
        dataIndex: 'order',
      },
      {
        title: '操作',
        render: record => (
          <span>
            {record.parent === '' && (
              <a style={{ marginRight: 10 }} onClick={() => addItem(record)}>
                <Tooltip title="添加子项">
                  <Icon type="plus" />
                </Tooltip>
              </a>
            )}
            <a style={{ marginRight: 10 }} onClick={() => editItem(record)}>
              <Tooltip title="修改">
                <Icon type="edit" />
              </Tooltip>
            </a>
            <a onClick={() => deleteItem(record)}>
              <Tooltip title="删除">
                <Icon type="delete" />
              </Tooltip>
            </a>
          </span>
        ),
      },
    ];

    const colseModal = () => {
      resetFields();
      dispatch({
        type: 'dictionary/save',
        payload: {
          modalVisible: false,
          isEdit: false,
          editInfo: {},
        },
      });
    };
    const submitModalForm = () => {
      validateFields((err, values) => {
        if (!err) {
          if (isEdit) {
            dispatch({
              type: 'dictionary/updateItem',
              payload: {
                values,
                itemJson: { ...editInfo },
              },
            });
          } else {
            dispatch({
              type: 'dictionary/addItem',
              payload: {
                ...values,
                parent: parent.value || '',
              },
            });
          }
          colseModal();
        } else {
          message.info(err[Object.keys(err)[0]].errors[0].message);
        }
      });
    };

    return (
      <PageHeaderWrapper title="字典管理">
        <Card
          bordered={false}
          title="字典列表"
          extra={
            <Button type="primary" onClick={() => onAdd()}>
              新建
            </Button>
          }
        >
          <Table
            loading={loading}
            dataSource={data}
            columns={columns}
            rowKey={record => record.objectId}
          />
        </Card>
        <Modal
          title={isEdit ? '修改字典信息' : '添加字典信息'}
          visible={modalVisible}
          onCancel={colseModal}
          onOk={submitModalForm}
          okText="确定"
          cancelText="取消"
        >
          <Form>
            <FormItem label="标签" {...formItemLayout}>
              {getFieldDecorator('label', {
                rules: [{ required: true, message: '请输入标签名' }],
                initialValue: label,
              })(<Input />)}
            </FormItem>
            <FormItem label="值" {...formItemLayout}>
              {getFieldDecorator('value', {
                rules: [{ required: true, message: '请输入值' }],
                initialValue: value,
              })(<Input />)}
            </FormItem>
            <FormItem label="排序" {...formItemLayout}>
              {getFieldDecorator('order', {
                initialValue: order,
              })(<InputNumber placeholder="请输入大于0的数字" style={{ width: '100%' }} min={1} />)}
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}
export default dictionaryList;
