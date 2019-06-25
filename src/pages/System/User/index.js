import React, { PureComponent } from 'react';
import { Card, Button, Tooltip, Icon, Modal, Form, Divider, Table, message, Input } from 'antd';
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

@connect(({ userList }) => ({
  userList,
}))
@Form.create()
class userListPage extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userList/fetch',
    });
  }

  render() {
    const { userList, form, dispatch } = this.props;
    const { getFieldDecorator, validateFields, resetFields } = form;
    const { list = [], pagination, isEdit, modalVisible, editInfo } = userList;
    const { nickname, username, email } = editInfo;

    const editUser = record => {
      dispatch({
        type: 'userList/save',
        payload: {
          editInfo: record.toJSON(),
          modalVisible: true,
          isEdit: true,
        },
      });
    };

    const addUser = () => {
      dispatch({
        type: 'userList/save',
        payload: {
          modalVisible: true,
          isEdit: false,
        },
      });
    };

    const deletedUser = record => {
      confirm({
        title: '您确定删除该用户吗?',
        onOk() {
          dispatch({
            type: 'userList/deleteUser',
            payload: record,
          });
        },
        onCancel() {},
      });
    };

    const colseModal = () => {
      resetFields();
      dispatch({
        type: 'userList/save',
        payload: {
          modalVisible: false,
          editInfo: {},
        },
      });
      setTimeout(() => {
        dispatch({
          type: 'userList/save',
          payload: {
            isEdit: false,
          },
        });
      }, 500);
    };
    const submitModalForm = () => {
      validateFields((err, values) => {
        if (!err) {
          if (isEdit) {
            dispatch({
              type: 'userList/updateItem',
              payload: {
                ...values,
              },
            });
          } else {
            dispatch({
              type: 'userList/addItem',
              payload: {
                ...values,
              },
            });
          }
          colseModal();
        } else {
          message.info(err[Object.keys(err)[0]].errors[0].message);
        }
      });
    };

    const columns = [
      {
        title: '昵称',
        dataIndex: 'attributes.nickname',
      },
      {
        title: '用户名',
        dataIndex: 'attributes.username',
      },
      {
        title: '邮箱',
        dataIndex: 'attributes.email',
      },
      {
        title: '操作',
        render: record => (
          <span>
            <a onClick={() => editUser(record)}>
              <Tooltip title="修改">
                <Icon type="edit" />
              </Tooltip>
            </a>
            <Divider type="vertical" />
            <a onClick={() => deletedUser(record)}>
              <Tooltip title="删除">
                <Icon type="delete" />
              </Tooltip>
            </a>
          </span>
        ),
      },
    ];

    return (
      <PageHeaderWrapper title="用户管理">
        <Card
          bordered={false}
          title="用户列表"
          extra={
            <span>
              <Tooltip title="添加用户">
                <Button type="primary" onClick={() => addUser()} shape="circle" icon="plus" />
              </Tooltip>
            </span>
          }
        >
          <Table rowKey={r => r.id} dataSource={list} columns={columns} pagination={pagination} />
          <Modal
            title={isEdit ? '修改用户信息' : '添加用户信息'}
            visible={modalVisible}
            onCancel={colseModal}
            onOk={submitModalForm}
            okText="确定"
            cancelText="取消"
          >
            <Form>
              <FormItem label="用户名" {...formItemLayout}>
                {getFieldDecorator('nickname', {
                  rules: [{ required: true, message: '请输入用户名' }],
                  initialValue: nickname,
                })(<Input />)}
              </FormItem>
              <FormItem label="登录名" {...formItemLayout}>
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: '请输入登录名' }],
                  initialValue: username,
                })(<Input />)}
              </FormItem>
              <FormItem label="邮箱" {...formItemLayout}>
                {getFieldDecorator('email', {
                  rules: [{ required: true, message: '请输入邮箱地址' }],
                  initialValue: email,
                })(<Input />)}
              </FormItem>
            </Form>
          </Modal>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default userListPage;
