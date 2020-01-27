// pages/goods_list/index.js
/**
 * 1 用户上滑页面 滚动条触底，开始加载下一页数据
 *   1 找到滚动条触底事件
 *   2 判断还有没有下一页的数据
 *     1 获取到总页数
 *     2 获取到当前的页码
 *     3 只要判断当前的页码是否大于等于 总页数
 *   3 假如没有下一页数据，弹出提示
 *   4 假如还有下一页的数据，加载下一页的数据
 *     1 当前页码数++
 *     2 重新发送请求
 *     3 添加数据
 * 
 *  2 下拉刷新数据
 *     1 触发下拉刷新事件，需要在json文件中开启一个配置项
 *       1 找到触发下拉刷新的事件
 *     2 重置数据，数组
 *     3 重置页码为1
 *     4 重新发送请求
 *     5 数据请求回来了需要手动的关闭等待效果
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
        value: '综合',
        isActive: true
      },
      {
        id: 1,
        value: '销量',
        isActive: false
      },
      {
        id: 2,
        value: '价格',
        isActive: false
      },
    ],
    goodsList: []
  },
  // 接口要的参数
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10
  },
  // 总页数
  totalPages: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid = options.cid ||"";
    this.QueryParams.query = options.query ||"";
    this.getGoodsList();
  },
  getGoodsList() {
    request({ url: "/goods/search", data: this.QueryParams })
      .then((res) => {
        // 获取总条数
        const { total } = res;
        // 计算总页数
        this.totalPages = Math.ceil(total / this.QueryParams.pagesize);
        // 添加数据
        this.setData({ goodsList: [...this.data.goodsList, ...res.goods] });

        // 关闭下拉刷新样式,如果第一次没有调用直接关闭，不影响什么
        wx.stopPullDownRefresh()
      });
  },

  // 标题点击事件， 从子组件传递过来的
  handleTabsItemChange(e) {
    // 1 获取被点击的标题的索引
    const { index } = e.detail;
    // 2 修改源数组
    let { tabs } = this.data;
    tabs.forEach((e, i) => {
      i === index ? e.isActive = true : e.isActive = false;
    });
    // 3 赋值到data中
    this.setData({ tabs });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 1 重置数组
     this.setData({goodsList:[]});
     // 2重置页码
     this.QueryParams.pagenum =1;
     // 3 发送请求
     this.getGoodsList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 判断还有没有下一页的数据
    if (this.QueryParams.pagenum >= this.options) {
      // 表示没有下一页的数据了
      // console.log("没有下一页的数据了");
      wx.showToast({title: '没有下一页数据了'});
    } else {
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})