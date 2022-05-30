import axios from 'axios';
import store from '@/utils/store';
import { Modal } from 'antd';
import { history } from 'umi';

// 携带凭证
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api';

// axios.defaults.timeout = 6000;
/* eslint-disable */
axios.interceptors.request.use(
  (config: any) => {
    // token处理
    const token = store.getItem("token")
    if (token) {
      config.headers['Authorization'] = "Bearer" + token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// 响应拦截器
axios.interceptors.response.use(
  (res) => {
    console.log(res, 'response.....')
    if (res?.data?.code === 401 || res?.data.code === 403) {
      Modal.error({
        title: '系统提示',
        content: res?.data?.message,
        okText: '重新登录',
        onOk: () => {
          history.push('/');
          store.remove('token')
        }
      })
    }
    return res;
  },
  (error) => {
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    }
    // else if (message.includes('Request failed with status code')) {
    //   message = '系统接口' + message.substr(message.length - 3) + '异常';
    // }
    return Promise.reject(error);
  },
);

/* eslint-disable */
// 设置默认接口地址

const get = (url: string, params = {}) =>
  new Promise((resolve, reject) => {
    axios
      .get(url, {
        params,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
const post = (url: string, data: any, config = {}) =>
  new Promise((resolve, reject) => {
    axios.post(url, data, config).then(
      (response) => {
        resolve(response.data);
      },
      (err) => {
        reject(err);
      },
    );
  });
const put = (url: string, data: any, isGet = false) =>
  new Promise((resolve, reject) => {
    axios.put(url, data, isGet ? { params: data } : {}).then(
      (response) => {
        resolve(response.data);
      },
      (err) => {
        return false;
      },
    );
  });
const deletes = (url: string, params = {}) =>
  new Promise((resolve, reject) => {
    axios.delete(url, params).then(
      (response) => {
        resolve(response.data);
      },
      (err) => {
        return err;
      },
    );
  });
function postFile(
  url: string,
  data = {},
  headers = { 'Content-Type': 'multipart/form-data' },
) {
  return new Promise((resolve, reject) => {
    axios.post(url, data, { headers: headers }).then(
      (response) => {
        resolve(response.data);
      },
      (err) => {
        reject(err);
      },
    );
  });
}
export default { get, post, put, deletes, postFile, axios };
