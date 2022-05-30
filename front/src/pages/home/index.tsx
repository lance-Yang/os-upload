import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Input,
  Divider,
  AutoComplete,
  Tabs,
  message,
  Layout,
  Button,
  Spin,
} from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import _ from 'lodash';

import instance from '@/api/instance';
import { UPLOAD_FILE, INFO } from '@/api/api';
import styles from './home.less';

import Tuozhuai from './Tuozhuai'
import Tuozhuai02 from './Tuozhuai02'
import SliceUpload from './SliceUpload'
import SliceUpload2 from './SliceUpload2'
// import './home.css';

const { TabPane } = Tabs;
const { Header, Footer, Sider, Content } = Layout;
const antIcon = <LoadingOutlined style={{ fontSize: 28 }} spin />;

const mockVal = (str: string, repeat: number = 1) => ({
  value: str.repeat(repeat),
});

const HomePage: React.FC<{}> = (props) => {
  const [value, setValue] = useState('');
  const [file, setFile] = useState<any>(null);
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const onSearch = (searchText: string) => {
    setOptions(
      !searchText
        ? []
        : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)],
    );
  };
  const onSelect = (data: string) => {
    console.log('onSelect', data);
  };
  const onChange = (data: string) => {
    setValue(data);
  };

  const extraContent = (
    <AutoComplete
      value={value}
      options={options}
      style={{ width: '300px' }}
      onSelect={onSelect}
      onSearch={onSearch}
      onChange={onChange}
    >
      <Input
        placeholder="搜索文件"
        size="large"
        style={{ borderRadius: '7px' }}
        suffix={
          <SearchOutlined
            style={{
              fontSize: 16,
              color: '#1890ff',
            }}
          />
        }
      />
    </AutoComplete>
  );

  useEffect(() => {
    // instance.get(INFO,).then(res => {
    //   console.log('info...', res)
    // })
  }, []);

  const handleChangeFile = (e: any) => {
    const file = e.target.files[0];
    setFile(file)
  }

  const handleUpload = () => {
    if (!file) {
      message.error('请选择文件')
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name)

    instance.post(UPLOAD_FILE, formData).then(res => {
      console.log(res, '文件上传')
    })
  }

  return (
    <Layout
      style={{ height: '100vh', backgroundColor: '#fff', overflow: 'hidden' }}
    >
      <Header>
        <Row align="middle">
          <Col flex={3}>
            <a href="#" className={styles.logo}>
              logo
            </a>
          </Col>
          <Col flex={2}>
            <div className={styles.nav}>
              <a href="#">我的</a>
              <a href="#">文件管理</a>
              {/* <a href="#">我的壁纸</a> */}
            </div>
          </Col>
          <Col flex={3}></Col>
        </Row>
      </Header>
      <Divider style={{ margin: 0 }} />
      <Content style={{ overflow: 'auto' }}>
        <div style={{ padding: '0 40px' }}>
          <Tabs
            size="large"
            defaultActiveKey="5"
            tabBarExtraContent={extraContent}
          >
            <TabPane tab="简单文件上传" key="1">
              <div className={styles.container}>
                <input type="file" onChange={handleChangeFile} />
                <Button type='primary' disabled={file == null} onClick={handleUpload}>上传</Button>
              </div>
            </TabPane>
            <TabPane tab="拖拽+进度条" key="2">
              <Tuozhuai />
            </TabPane>
            <TabPane tab="文件安全校验" key="3">
              <Tuozhuai02 />
            </TabPane>
            <TabPane tab="切片上传" key="4">
              <SliceUpload />
            </TabPane>
            <TabPane tab="切片上传+网格进度条" key="5">
              <SliceUpload2 />
            </TabPane>
          </Tabs>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        辰星壁纸 ©2022 Created by Lance 仅作学习使用
      </Footer>
      {/* <div className="sea">
                <div className="wave"></div>
                <div className="wave"></div>
            </div> */}
    </Layout>
  );
};

export default HomePage;
