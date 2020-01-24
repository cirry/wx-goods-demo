import { request } from "../../request/index";

// pages/category/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //左侧的菜单数据
    leftMenuList: [],
    //右侧的商品数据
    rightContentList: [],
    //左边被选中的菜单项
    currentIndex: 0,
    // 右侧内容滚动条的位置
    scrollTop: 0
  },
  // 接口的返回数据，全局变量
  Cates: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * 0 web中的本地存储和小程序的区别
     *    1 写法区别
     *    web: localStorage.setItem("key","value"); localStorage.getItem("key");
     *    小程序： wx.setStorageSync("key", "value"); wx.getStorageSync("key");
     *    2 存的时候有没有做类型的转换
     *    web:不管存入的是什么数据，最终都会先调用toString()方法，把数据变成字符串在存进去
     *    小程序：不存在类型转换的操作，存什么获取的就是什么类型
     * 1 先判断一下本地存储中有没有旧的数据
     *   {time:Date.now(), data:[...]}
     * 2 没有旧数据，直接发送新气你去
     * 3 有旧的数据，同时旧的数据没有过期，就使用本地存储中的数据
     */
    // 1 先获取本地存储中的数据(小程序也是存在本地存储技术的)
    const Cates = wx.getStorageSync("cates");
    // 2 判断
    if (!Cates) {
      // 不存在发送请求获取数据
      this.getCategory();
    } else {
      // 有旧的数据 定义过期的时间 10s 改成五分钟

      if (Date.now() - Cates.time > 1000 * 10) {
        this.getCategory();
      } else {
        // 可以使用旧的数据
        this.Cates = Cates.data;
        //构造左侧的大菜单数据
        let leftMenuList = this.Cates.map(item => item.cat_name);
        //构造右侧的商品数据
        let rightContentList = this.Cates[0].children;
        this.setData({ leftMenuList, rightContentList });
      }
    }

  },

  // 获取分类数据
  getCategory() {
    request({
      url: "/categories"
    }).then((res) => {
      this.Cates = res;

      // 把数据存入本地
      wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

      //构造左侧的大菜单数据
      let leftMenuList = this.Cates.map(item => item.cat_name);
      //构造右侧的商品数据
      let rightContentList = this.Cates[0].children;
      this.setData({ leftMenuList, rightContentList });
    })

    // 1 使用es7的async和await来发送请求
    // const res = await request({ url: "/categories" });

    // this.Cates = res;

    // // 把数据存入本地
    // wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

    // //构造左侧的大菜单数据
    // let leftMenuList = this.Cates.map(item => item.cat_name);
    // //构造右侧的商品数据
    // let rightContentList = this.Cates[0].children;
    // this.setData({ leftMenuList, rightContentList });
  },
  // 左侧菜单的点击事件
  handleItemTap(e) {
    /*
    1 获取被点击的菜单项身上的索引值
    2 给data中的currentIndex赋值
    3 根据不同的索引渲染不同的商品内容
    */
    const { index } = e.currentTarget.dataset;
    let rightContentList = this.Cates[index].children;
    // 重新设置了一下右边scroll-view的默认加载高度为0
    this.setData({ currentIndex: index, rightContentList, scrollTop: 0 });
  }
})