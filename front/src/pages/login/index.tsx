import React, { useState } from 'react';
import { history } from 'umi';
import { Row, Col, Form, Input, Button, message } from 'antd';
import md5 from 'js-md5'
import store from '@/utils/store';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import instance from '@/api/instance';
import { LOGIN } from '@/api/api';
import logoImg from '@/assets/-s-image.png';
import styles from './index.less';
import './square.css';

import Register from './Register';


const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const LoginPage: React.FC<{}> = () => {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState<boolean>(false);
  const [randomNumber,setRandomNumber] = useState<number>(0);
  const [sendText,setSendText] = useState<string>("发送")
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [captcha, setCaptcha] = useState<string>("");

  const registerProps = {
    visible,
    setVisible
  }

  React.useEffect(() => {
    setCaptcha(`/api/captcha?_t=${new Date().getTime()}`)
  }, []);

  React.useEffect(() => {
    if(randomNumber <= 0){
      setSendText('发送')
    }else{
      setSendText(`${randomNumber}s 后发送`)
    }
  },[randomNumber])

  // 发送验证码
  const handleSendText = () => {
    const email = form.getFieldValue('email');
    instance.get(`/sendcode?email=${email}`)
    let timer = 60;
    setRandomNumber(timer);
    const timerId = setInterval(() => {
      timer -= 1;
      setRandomNumber(timer);
      if(timer === 0){
        clearInterval(timerId)
      }
    },1000)
  }

  // 表单提交
  const onFinish = (values: any) => {
    let params = {
      ...values,
      password: md5(values?.password)
    }
    setLoginLoading(true);
    instance
      .post(LOGIN, params)
      .then((res: any) => {
        if (res?.code === 200) {
          setLoginLoading(false);
          message.success("登录成功!");
          history.push('/home');
          store.setItem("token",res?.data?.token)
        } else {
          setLoginLoading(false);
          message.error(res?.message);
        }
        console.log(res, '登录信息。。。。');
      })
      .catch((err) => {
        setLoginLoading(false);
      });
  };

  //刷新验证码
  const onRefreshCatch = () => {
    setCaptcha(`/api/captcha?_t=${new Date().getTime()}`)
  };

  return (
    <>
      <Row className={styles.container} align="middle">
        <Col span={5} />
        <Col span={14}>
          <div className={styles.loginContent}>
            <div className={styles.imgContent}>
              <img src={logoImg} alt="" />
            </div>
            <div className={styles.loginRight}>
              <div className={styles.loginForm}>
                <div className={styles.logTit}>login</div>
                <Row>
                  <Col span={4} />
                  <Col
                    span={16}
                    className={styles.title}
                    style={{ textAlign: 'center' }}
                  >
                    Chenxing wallpaper
                  </Col>
                  <Col span={4} />
                </Row>
                <div style={{ textAlign: 'center', marginBottom: 5 }}>
                  还没有账号?立即<Button type='link' onClick={() => setVisible(!visible)}>注册</Button>
                </div>
                <Row>
                  <Col span={24} >
                    <div>
                      <Form
                        {...formItemLayout}
                        name="normal_login"
                        className="login-form"
                        size="large"
                        form={form}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                      >
                        <Form.Item
                          name="email"
                          label='邮箱'
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
                            placeholder=""
                          />
                        </Form.Item>
                        <Form.Item
                          name="password"
                          label='密码'
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
                            placeholder=""
                          />
                        </Form.Item>
                        <Form.Item label='验证码' >
                          <Row>
                            <Col span={12}>
                              <Form.Item
                                name="captcha"
                                rules={[
                                  {
                                    required: true,
                                    message: '请输入验证码',
                                  },
                                ]}
                              >
                                <Input placeholder="请输入验证码" />
                              </Form.Item>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Form.Item>
                                <img src={captcha} alt="" onClick={onRefreshCatch} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form.Item>
                        <Form.Item label='邮箱验证码' >
                          <Row gutter={8}>
                            <Col span={12}>
                              <Form.Item
                                name="emailcode"
                                rules={[
                                  {
                                    required: true,
                                    message: '请输入邮箱验证码',
                                  }
                                ]}
                              >
                                <Input  placeholder="请输入邮箱验证码" />
                              </Form.Item>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Form.Item>
                                <Button
                                  type="primary"
                                  style={{ width: '120px' }}
                                  disabled={randomNumber > 0}
                                  onClick={handleSendText}
                                >
                                  {sendText}
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Form.Item>
                        <Form.Item >
                          <Row>
                            <Col span={8} />
                            <Col span={16}>
                              <Button
                                type="primary"
                                htmlType="submit"
                                loading={loginLoading}
                                style={{ width: '100%' }}
                              >
                                Login
                              </Button>
                            </Col>
                          </Row>

                        </Form.Item>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div className="square">
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
          <div className="circle">
            <ul>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </Col>
        <Col span={5} />
      </Row>
      <Register {...registerProps} />
    </>
  );
};

export default LoginPage;
