import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card,
  Table,
  Tooltip,
  Icon,
  Divider,
  Button,
  Modal,
  Input,
  Form,
  Switch,
  message,
} from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};
const { confirm } = Modal;

@connect(({ role }) => ({
  role,
}))
@Form.create()
class Role extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'role/fetch',
    });
  }

  render() {
    const { role, form, dispatch } = this.props;
    const { getFieldDecorator, validateFields, resetFields } = form;
    const { list = [], pagination = {}, isEdit, modalVisible, editRoleInfo } = role;
    const { name, displayName, status } = editRoleInfo;

    const editUser = record => {
      dispatch({
        type: 'role/save',
        payload: {
          modalVisible: true,
          isEdit: true,
          editRoleInfo: record.toJSON(),
        },
      });
    };
    const deleteRole = record => {
      confirm({
        title: '您确定要删除该角色吗',
        onCancel() {},
        onOk() {
          dispatch({
            type: 'role/remove',
            payload: {
              id: record.objectId,
            },
          });
        },
      });
    };

    const columns = [
      {
        title: '角色别名',
        dataIndex: 'attributes.displayName',
      },
      {
        title: '角色名称',
        dataIndex: 'attributes.name',
      },
      {
        title: '角色状态',
        dataIndex: 'attributes.status',
        render: text => (text ? '启用' : '禁用'),
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
            <a onClick={() => deleteRole(record)}>
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
        type: 'role/save',
        payload: {
          modalVisible: false,
          editRoleInfo: {},
        },
      });
      setTimeout(() => {
        dispatch({
          type: 'role/save',
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
              type: 'role/update',
              payload: {
                values,
                editRoleInfo,
              },
            });
          } else {
            dispatch({
              type: 'role/create',
              payload: {
                values,
              },
            });
          }
        } else {
          message.info(err[Object.keys(err)[0]].errors[0].message);
        }
      });
    };
    const addRole = () => {
      dispatch({
        type: 'role/save',
        payload: {
          modalVisible: true,
        },
      });
    };
    return (
      <Card
        title="角色管理"
        bordered={false}
        extra={
          <Button type="primary" shape="circle" onClick={() => addRole()}>
            <Icon type="plus" />
          </Button>
        }
      >
        <Table
          rowKey={record => record.id}
          dataSource={list}
          columns={columns}
          pagination={{
            ...pagination,
            showTotal: total => `共${total}条`,
          }}
        />
        <Modal
          title={isEdit ? '修改角色信息' : '添加角色信息'}
          visible={modalVisible}
          onCancel={colseModal}
          onOk={submitModalForm}
          okText="确定"
          cancelText="取消"
        >
          <Form>
            <FormItem label="角色名" {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入用户名' }],
                initialValue: name,
              })(<Input />)}
            </FormItem>
            <FormItem label="角色别名" {...formItemLayout}>
              {getFieldDecorator('displayName', {
                rules: [{ required: true, message: '请输入登录名' }],
                initialValue: displayName,
              })(<Input />)}
            </FormItem>
            <FormItem label="状态" {...formItemLayout}>
              {getFieldDecorator('status')(
                <Switch
                  defaultChecked={status || false}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                />
              )}
            </FormItem>
          </Form>
        </Modal>
      </Card>
    );
  }
}

export default Role;
