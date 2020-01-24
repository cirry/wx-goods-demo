// pages/cart/index.js
/**
 * 1 获取用户的收货地址
 *   1 绑定点击事件
 *   2 调用小程序内置的api，获取用户的收货地址，点击取消之后会有bug，再也调不回窗口了，得重新获取权限，采用下面这个第2步
 * 
 *   2 获取用户 对小程序所授予获取地址权限的状态 scope
 *     1 假设用户 点击获取收货地址的提示框是确定的话，scope为true authSetting,scope.address: true
 *     2 假设用户 点击获取收货地址的提示框是取消的话，scope为false
 *       1 诱导用户 自己打开授权设置页面(wx.openSetting)，重新给获取地址权限
 *       2 获取收货地址
 *     3 假设用户 从来没有点击过获取收货地址的按钮，此时scope的值是undefined
 * 
 * 2 页面加载完毕
 *   0 onLoad onShow
 *   1 获取本地存储中的地址数据
 *   2 把数据设置给data中的一个变量
 * 
 * 3 onShow
 *   0 回到商品详情页面 第一次添加商品的时候 手动添加了属性
 *     1 num = 1
 *     2 checked = true
 *   1 获取缓存中的购物车数组
 *   2 把购物车数据填充到data中
 * 
 * 4 全选的实现 数据的展示
 *   1 onShow中 获取缓存中购物车数组
 *   2 根据购物车中的商品数据 所有的商品都被选中checked = true
 * 
 * 5 总价格和总数量
 *   1 都需要商品被选中 我们才计算
 *   2 获取购物车数组
 *   3 遍历
 *   4 判断商品是否被选中
 *   5 总价格 += 商品的单价 * 商品的数量
 *   6 把计算后的价格和数量 设置回data中即可
 * 
 * 6 商品的选中功能
 *   1 绑定change事件
 *   2 获取到被修改的商品对象
 *   3 商品对象的选中状态取反
 *   4 重新填回到data中和缓存中 
 *   5 重新计算全选，总价格和总数量
 *
 * 7 全选和反选
 *   1 全选复选框绑定事件 change
 *   2 获取data中的全选变量 allChecked
 *   3 直接取反
 *   4 遍历购物车数组，让里面的商品对象的checked属性跟随allChecked
 *   5 把购物车数组和allChecked 重新设置回data和缓存中
 * 
 * 8 商品数量的编辑功能
 *   1 "+","-"按钮绑定同一个点击事件，区分的关键，自定义属性
 *     1 "+" => "+1"
 *     2 "-" => "-1"
 *   2 传递被点击的商品id
 *   3 获取到data中的购物车数组来获取需要被修改的商品对象
 *   4 直接修改商品的数量属性,当购物车的数量 = 1，且用户点击了-号，询问是否删除商品
 *   5 把cart数组重新设置回缓存和data中
 * 
 * 9 点击结算
 *   1 判断有没有收货地址信息
 *   2 判断用户有没有选购商品
 *   3 经过以上验证 跳转到支付页面 
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,//总价格
    totalNum: 0  // 总数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 点击选择收货地址
  handleChooseAddress() {
    // 1 获取权限状态
    wx.getSetting({
      success: (result) => {
        //2 获取权限状态,主要发现一些属性名很怪异的时候，都要使用[]形式来获取属性的值
        const scopeAddress = result.authSetting["scope.address"];
        if (scopeAddress || scopeAddress === undefined) {
          wx.chooseAddress({
            success: (result1) => {
              // 5 将地址存入到缓存中
              wx.setStorageSync("address", result1);
            }
          });
        } else {
          // 3 用户以前拒绝过授予权限，先诱导用户打开授权页面
          wx.openSetting({
            success: (result2) => {
              // 4 可以调用，收货地址的代码了
              wx.chooseAddress({
                success: (result3) => {
                  // 5 将地址存入到缓存中
                  wx.setStorageSync("address", result3);
                }
              }); // end chooseAddress
            }
          }); // end openSetting
        } // end if 
      },
      fail: () => { },
      complete: () => { }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");

    // 1 获取缓存中的购物车信息
    const cart = wx.getStorageSync("cart") || [];
    // 1 计算全选
    // 数组every方法，只有每个回调函数都返回true，every的返回值才是true
    // 注意：空数组调用every会返回true
    // 这里有了两次循环，没有必要，进行优化
    // const allChecked = cart.length?cart.every(item => item.checked):false;
    this.setCart(cart);
    this.setData({ address });
  },

  // 商品的选中
  handleItemCheck(e) {
    // 1 获取被修改的商品id
    const goods_id = e.currentTarget.dataset.id;
    // 2 获取购物车数组
    let { cart } = this.data;
    // 3 找到被修改的商品对象
    let index = cart.findIndex((item) => item.goods_id === goods_id);
    // 4 选中状态取反
    cart[index].checked = !cart[index].checked;
    // 5 重新计算全选，总价格和总数量
    this.setCart(cart);

  },

  // 全选和反选功能
  handleItemAllCheck() {
    // 1 获取data中的数据
    let { allChecked, cart } = this.data;
    // 2 修改值
    allChecked = !allChecked;
    // 3 循环修改cart商品的选中状态
    cart.forEach((item) => item.checked = allChecked);
    // 4 把修改后的值填回data和缓存中
    this.setCart(cart);
  },

  // 商品数量的增减
  handleGoodsNumChange(e) {
    // 1 获取传递过来的值
    const { id, operation } = e.currentTarget.dataset;
    // 2 获取购物车数组
    let { cart } = this.data;
    // 3 找到需要修改的商品的索引
    const index = cart.findIndex((item) => item.goods_id === id);
    // 判断是否删除
    if (cart[index].num === 1 && operation === -1) {
      wx.showModal({
        title: '提示',
        content: '是否删除该商品？',
        success: (res) => {
          if (res.confirm) {
            cart.splice(index, 1);
            this.setCart(cart);
          }
        }
      })
    } else {
      // 4 进行修改数量
      cart[index].num += operation;
      // 5 填回数据
      this.setCart(cart);
    } //end if

  },

  // 设置购物车样式，同时重新计算，全选，总价格和总数量
  setCart(cart) {
    let allChecked = true;

    // 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach(element => {
      if (element.checked) {
        totalPrice += element.goods_price * element.num;
        totalNum += element.num;
      } else {
        allChecked = false;
      }  // endif 
    });
    // 判断数组是否为空
    allChecked = cart.length !== 0 ? allChecked : false;
    // 2 给data中的address赋值
    this.setData({ cart, allChecked, totalNum, totalPrice });
    wx.setStorageSync("cart", cart);
  },

  // 点击结算
  handlePay() {
    // 1 判断收货地址
    const { address, totalNum } = this.data;
    if (!address.userName) {
      wx.showToast({
        title: "您还没有选择收货地址！",
        icon: "none"
      })
      return;
    }

    // 2 判断有没有选购商品
    if (totalNum === 0) {
      wx.showToast({
        title: "您还没有选择商品！",
        icon: "none"
      })
      return;
    }

    // 3 跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
  }

})