import React from 'react';
import { Form, Row, Col, Input, Button } from 'antd';

const FormItem = Form.Item;

const Filter = props => {
  const { form, query = {}, handleSearch, handleReset } = props;
  const { getFieldDecorator, validateFields, resetFields } = form;
  const { nickname = '', username = '' } = query;
  const onSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        handleSearch(values);
      }
    });
  };

  const onReset = () => {
    resetFields();
    handleReset();
  };

  return (
    <div className="tableListForm">
      <Form onSubmit={onSubmit}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('nickname', {
                initialValue: nickname,
              })(<Input placeholder="请输入" style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="登录名">
              {getFieldDecorator('username', {
                initialValue: username,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={onReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Form.create()(Filter);
