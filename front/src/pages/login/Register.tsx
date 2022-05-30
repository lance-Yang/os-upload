
import React, { useState } from 'react'
import { Modal, Button, Form, Input, message, Row, Col } from 'antd';
import md5 from "js-md5";

import axios from '@/api/instance';
import { RegisterType } from './loginType'


const Register: React.FC<RegisterType> = (props) => {

  const { visible, setVisible } = props;
  const [form] = Form.useForm()

  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [captcha, setCaptcha] = useState<string>("");


  React.useEffect(() => {
    setCaptcha(`/api/captcha?_t=${new Date().getTime()}`)
  }, []);

  const onRefreshCatch = () => {
    setCaptcha(`/api/captcha?_t=${new Date().getTime()}`)
  };


  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };


  const handleOk = async () => {
    setConfirmLoading(true);
    form.validateFields().then(value => {
      let obj = {
        ...value,
        password: md5(value?.password)
      }
      axios.post('/user/register', obj).then((res: any) => {
        console.log(res, 'res....')
        if (res.code === 200) {
          message.success(res.message)
          setConfirmLoading(false);
          setVisible(false);
        } else {
          message.error(res.message)
          setConfirmLoading(false);
        }
      })
    }).catch(err => {
      console.log(err, 'err....')
      setConfirmLoading(false);
    })

  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setVisible(false);
    form.resetFields()
  };


  return (
    <Modal
      title="注册账号"
      visible={visible}
      onOk={handleOk}
      okText='注册'
      cancelText='取消'
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      destroyOnClose
    >
      <Form
        {...formItemLayout}
        form={form}
        name="register"
        size="large"
      >
        <Form.Item
          name="nickname"
          label="昵称"
          initialValue={'Nick'}
          rules={[
            {
              required: true,
              message: '请输入昵称',
            },
          ]}
        >
          <Input
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          initialValue={'1029840711@qq.com'}
          rules={[
            {
              required: true,
              message: '请输入邮箱',
            },
            {
              type: 'email',
              message: '请输入正确的Email格式'
            }
          ]}
        >
          <Input
          />
        </Form.Item>
        <Form.Item label="验证码" >
          <Row gutter={8} >
            <Col span={12}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  {
                    required: true,
                    message: '请输入验证码',
                  },
                  // { validator: handleVerfiCaptcha },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <img src={captcha} alt="" onClick={onRefreshCatch} />
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          initialValue={'123456'}
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        >
          <Input
            type="password"
          />
        </Form.Item>
        <Form.Item
          name="reqPassword"
          label="确认密码"
          initialValue={'123456'}
          rules={[
            {
              required: true,
              message: '请再次输入密码',
            },
            ({ getFieldValue }) => ({
              validator: (rule, value) => {
                if (value !== getFieldValue('password')) {
                  return Promise.reject("两次密码不一致")
                }
                return Promise.resolve()
              }
            })
          ]}
        >
          <Input
            type="password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default Register;