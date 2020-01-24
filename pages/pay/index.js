/**
 * 1 页面加载的时候
 *   1 从缓存中获取购物车数据，渲染页面，这些数据的check属性为true
 * 
 * 2 微信支付
 *   1 那些人，哪些账号可以实现微信支付
 *     1 企业账号
 *     2 企业账号的小程序后台中必须给开发者添加上白名单
 *       1 一个 appId 可以绑定多个开发者
 *       2 这些开发者就可以共用这个appId和他的开发权限
 * 
 * 3 支付按钮
 *   1 先判断缓存中是否有token
 *   2 没有则跳转到授权页面，进行获取token
 *   3 有token则正常执行
 */
import { request } from "../../request/index.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart: [],
    totalPrice: 0,//总价格
    totalNum: 0  // 总数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");

    // 1 获取缓存中的购物车信息
    let cart = wx.getStorageSync("cart") || [];

    // 过滤后的购物车数组
    cart = cart.filter((item) => item.checked);

    // 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(element => {
      totalPrice += element.goods_price * element.num;
      totalNum += element.num;
    });

    this.setData({ cart, totalNum, totalPrice, address });
  },

  // 点击支付按钮
  handleOrderPay(){
    // 1 判断缓存中有没有token
    const token = wx.getStorageSync("token");

     // 2 判断
    if(!token){
      wx.navigateTo({
        url:'/pages/auth/index'
      })
      return ;
    }else {
      console.log("已经存在token");
    } // end if 
   
    // 3 创建订单
    // 3.1 准备请求头参数
    const header = {Authorization: token};
    // 3.2 准备请求体参数
    const order_price = this.data.totalPrice;
    const consignee_addr = this.data.address.all;

    const cart = this.data.cart;

    let goods = [];
    cart.forEach((item)=>{
      goods.push({
        goods_id:item.goods_id,
        goods_number:item.num,
        goods_price:item.goods_price
      })
    })

    const orderParams ={order_price,consignee_addr,goods};

    // 4 准备发送请求创建订单，获取订单编号
    request({url:"/my/orders/create",method:"POST",data:orderParams,header}).then((res) =>{
      // 这里的res是订单编号
      return request({url:"my/orders/req_unifiedorder",method:"POST",header,data:{res}})
      // 这里的res2是pay属性，调起微信支付所需的参数内容
    }).then((res2) =>{
      // 5 发起 预支付接口,发起微信支付
      wx.requestPayment({
        ...res2,
        success: (result)=>{
          // 6 查询后台订单状态是否成功
          request({url:"/my/orders/chkOrder", method:"POST",header,data:{order_number}}).then((res3)=>{
            // 7 删除购物车中已经支付完成的商品
            let newCart = wx.getStorageSync("cart");
            newCart = newCart.filter(item => !item.checked);
            wx.setStorageSync("cart", newCart);
          });
        },
        fail: ()=>{}
      })
    })
  }, 

    
    
})