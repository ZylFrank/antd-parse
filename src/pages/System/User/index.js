import React, { PureComponent } from 'react';
import {
  Card,
  Button,
  Tooltip,
  Icon,
  Modal,
  Form,
  Divider,
  Table,
  message,
  Input,
  Select,
} from 'antd';
import { connect } from 'dva';
import qs from 'qs';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import Filter from './Filter';

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

@connect(({ userList, global }) => ({
  userList,
  global,
}))
@Form.create()
class userListPage extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userList/fetch',
    });
    dispatch({
      type: 'global/fetchAllRoles',
    });
  }

  render() {
    const { userList, form, dispatch, global, history } = this.props;
    const { getFieldDecorator, validateFields, resetFields } = form;
    const {
      list = [],
      pagination,
      isEdit,
      modalVisible,
      userRoles,
      userInfo,
      query,
      loading,
    } = userList;
    const { allRoles } = global;
    const { nickname, username, email } = userInfo;
    const roleValue = userRoles.map(item => item.id);

    const editUser = record => {
      dispatch({
        type: 'userList/save',
        payload: {
          modalVisible: true,
          isEdit: true,
        },
      });
      dispatch({
        type: 'userList/getItem',
        payload: {
          id: record.id,
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
          userInfo: {},
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
                values,
                editingUserRoles: userRoles,
                id: userInfo.objectId,
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

    const handleSearch = values => {
      const search = qs.stringify({ ...values });
      history.push({ search });
    };
    const handleReset = () => {
      history.push();
    };
    const filterProps = {
      query,
      handleSearch,
      handleReset,
    };

    return (
      <PageHeaderWrapper title="用户管理">
        <Card title="查询条件" bordered={false}>
          <Filter {...filterProps} />
        </Card>
        <div style={{ height: 10 }} />
        <Card
          bordered={false}
          loading={loading}
          title="用户列表"
          extra={
            <span>
              <Tooltip title="添加用户">
                <Button type="primary" onClick={() => addUser()} shape="circle" icon="plus" />
              </Tooltip>
            </span>
          }
        >
          <Table
            rowKey={r => r.id}
            dataSource={list}
            columns={columns}
            pagination={{
              ...pagination,
              showTotal: total => `共${total}条`,
            }}
          />
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
                  rules: [
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入正确的邮箱地址' },
                  ],
                  initialValue: email,
                })(<Input />)}
              </FormItem>
              <FormItem label="角色" {...formItemLayout}>
                {getFieldDecorator('roles', {
                  rules: [{ required: true, message: '请选择用户角色' }],
                  initialValue: roleValue,
                })(
                  <Select mode="multiple">
                    {allRoles.map(item => (
                      <Option key={item.objectId} value={item.objectId}>
                        {item.displayName}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Form>
          </Modal>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
export default userListPage;
