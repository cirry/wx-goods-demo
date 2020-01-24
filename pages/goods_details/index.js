// pages/goods_details/index.js
import { request } from "../../request/index";

/**
 * 1 发送请求获取数据
 * 2 点击轮播图 预览大图
 *   1 给轮播图绑定事件
 *   2 调用小程序的api previewImage
 * 3 点击加入购物车
 *   1 绑定点击事件
 *   2 获取缓存中的购物车数据 数组格式
 *   3 先判断当前的商品是否已经存在于购物车里面了
 *   4 修改商品数据 执行购物车数量++ 重新把购物车数组填充回缓存中
 *   5 不存在于购物车数组中，直接给购物车数组添加一个新元素，新元素带上购买数量属性，重新填回缓存
 *   6 弹出提示
 * 
 * 4 商品收藏功能
 *   1 页面onShow的时候，加载缓存中的商品收藏的数据
 *   2 判断当前商品是不是被收藏了
 *     1 改变页面的图标
 *   3 点击商品收藏按钮
 *     1 判断该商品是否存在于缓存数组中
 *     2 已经存在把该商品删除掉
 *     3 没有存在过，把商品添加到收藏数组中，存入到缓存中即可
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsObj: {},
    // 商品是否被收藏
    isCollect:false
  },
  // 商品信息
  GoodsInfo: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {

    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options;

    const { goods_id } = options;
    this.getGoodsDetail(goods_id);

  },

  // 获取商品信息
  getGoodsDetail(goods_id) {
    request({ url: "/goods/detail", data: { goods_id } }).then((res) => {
      this.GoodsInfo = res;

      // 1 获取缓存中的商品收藏数组
      let collect = wx.getStorageSync("collect") || [];

      // 2 判断当前商品是否被收藏
      let isCollect = collect.some((item) => item.goods_id === this.GoodsInfo.goods_id);

      this.setData({
        goodsObj: {
          goods_name: res.goods_name,
          goods_price: res.goods_price,
          // 部分iphone手机可能不支持图文详情中的webp格式的图片，需要处理
          // 临时自己改，确保后台存在1.webp => 1.jpg
          goods_introduce: res.goods_introduce.replace(/\.webp/g, '.jpg'),
          pics: res.pics,
        },
        isCollect
      })
    })
  },
  // 点击轮播图放大预览
  handlePreviewImage(e) {
    const urls = this.GoodsInfo.pics.map((item) => item.pics_mid);
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  // 点击加入购物车
  handleCartAdd() {
    // 1 先获取缓存中购物车的数组
    let cart = wx.getStorageSync("cart") || [];

    // 2 判断商品对象是否存在于cart数组中
    let index = cart.findIndex(item => item.goods_id === this.GoodsInfo.goods_id);
    if (index === -1) {
      // 3 不存在或者是第一次添加
      this.GoodsInfo.num = 1;
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    } else {
      // 4 数组中已经存在商品
      cart[index].num++;
    }

    // 5 把购物车重新添加回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹出框提示
    wx.showToast({
      title: "加入成功",
      icon: 'success',
      mask: true
    });
  },

  // 处理点击收藏的功能
  handleCollect(){
    let isCollect = false;
    // 1 获取缓存中的商品收藏数组
    let collect = wx.getStorageSync("collect") || [];
    // 2 判断该商品是否被收藏过
    let index = collect.findIndex((item)=>item.goods_id === this.GoodsInfo.goods_id);

    // 3 当idnex ！== -1 表示已经收藏过了
    if(index !== -1){
      // 能找到,已经收藏过了，在数组中删除该商品
      collect.splice(index , 1);
      isCollect = false;
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask:true
      });
    }else{
      collect.push(this.GoodsInfo);
      isCollect = true;
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        mask:true
      });
    } //end if 
    // 4 把数组存入到缓存中
    wx.setStorageSync("collect", collect);

    // 修改data中的属性
    this.setData({isCollect});
  }
})