// pages/order/index.js
/**
 * 1 页面被打开的时候 onShow
 *   0 onShow不同于onLoad，没有办法接收到参数options
 *   0.5 判断缓存中有没有token，如果有则直接进行，没有跳转到授权页面
 *   1 获取url上的参数type
 *   2 根据type 去发送请求获取对应的订单数据
 *   3 渲染页面
 * 2 当点击不同的标题的时候，重新发送请求来获取和渲染数据
 */

import { request } from "../../request/index";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: '已付款',
        isActive: true
      },
      {
        id: 1,
        value: '待付款',
        isActive: false
      },
      {
        id: 2,
        value: '待发货',
        isActive: false
      },
      {
        id: 3,
        value: '退款/退货',
        isActive: false
      }

    ]
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  onShow(options) {

    const token = wx.getStorageSync("token");
    if (!token) {
      wx.navigateTo({
        url: '/pages/auth/index'
      });
      return;
    }

    // 1 获取当前的小程序的页面栈-数组，即小程序最多保存10个页面
    let pages = getCurrentPages();

    // 2 数组中 索引最大的就是当前页面
    let currrentPages = pages[pages.length - 1];

    // 3 获取url上的type参数
    const { type } = currrentPages.options;
    this.getOrders(type);

    // 激活选中页面标题
    this.changeTitleByIndex(type-1);

  },
  // 根据标题的索引，来激活选中的标题数组
  changeTitleByIndex(index) {
    // 2 修改源数组
    let { tabs } = this.data;
    tabs.forEach((e, i) => {
      i === index ? e.isActive = true : e.isActive = false;
    });
    // 3 赋值到data中
    this.setData({ tabs });
  },

  // 标题点击事件， 从子组件传递过来的
  handleTabsItemChange(e) {
    // 1 获取被点击的标题的索引
    const { index } = e.detail;
    this.changeTitleByIndex(index);

    // 2 重新发送请求，当type=1 的时候index = 0；
    this.getOrders(index+1);
  },

  // 获取订单列表的方法
  getOrders(type) {
    request({ url: "/my/orders/all", data: { type } })
      .then((res) => { console.log(res) })
  }
})