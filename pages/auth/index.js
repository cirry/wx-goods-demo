// pages/auth/index.js
import { request } from "../../request/index";

Page({
  // 获取用户信息
  handleGetUserInfo(e) {
    // 1 获取用户信息
    const { encryptedData,rawData,signature,iv } = e.detail;

    // 2 获取小程序登录成功后的code
    wx.login({
      timeout:10000,
      success:(res) =>{
        const {code} = res;
        const loginParams = {encryptedData, rawData, iv, signature,code};

        // 3 发送请求，获取用户token
        // 因为不是企业账号，没有支付权限，这里取到的token是null
        // 4 把token存入到缓存中，同时跳转到上一个页面
        request({url:"/user/wxlogin", data:loginParams,method:"post"}).then(res =>{ wx.setStorageSync("token", "wo shi token");} );
      }
    })
    // 4 把token存入到缓存中，同时跳转到上一个页面
    wx.navigateBack({
      delta: 1
    });
  }
})