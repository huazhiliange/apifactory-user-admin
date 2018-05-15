import axios from 'axios'
import qs from 'qs'
import { Message, MessageBox } from 'element-ui'
import store from '../store'
import { getToken, removeToken } from '@/utils/auth'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 15000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(config => {
  config.headers['X-Token'] = getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
  //config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  config.data = qs.stringify(config.data);//将对象解析成URL的形式
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
  /**
  * code为非20000是抛错 可结合自己业务进行修改
  */
    const res = response.data
    if (res.code === 100000 || res.code === 100001) {
      MessageBox.confirm('登录超时，请重新登录', '确定登出', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeToken()
        location.reload()
      })
      return Promise.reject('登录超时，请重新登录')
    }
    if (res.code === 100002) {
      Message({
        message: '抱歉，您无权操作',
        type: 'error',
        duration: 3 * 1000
      })
      return Promise.reject('抱歉，您无权操作')
    }
    if (res.code === 100003) {
      Message({
        message: '请先绑定代理商',
        type: 'error',
        duration: 3 * 1000
      })
      return Promise.reject('请先绑定代理商')
    }
    return response.data
  },
  error => {
    console.log('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service