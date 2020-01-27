// pages/feedback/index.js
/**
 * 1 点击“+”触发tap事件
 *   1 调用小程序内置的 选择图片的api
 *   2 获取到 图片的路径 数组
 *   3 把图片路径存到data的变量中
 *   4 页面就可以根据图片数组进行循环显示 自定义组件
 * 
 * 2 点击 自定义图片 组件
 *   1 获取被点击的元素的索引
 *   2 获取data中的图片数组
 *   3 根据索引 数组中删除对应的元素
 *   4 把数组重新设置回data中
 * 
 * 3 点击“提交”
 *   1 获取文本域的内容
 *     1 data中定义一个变量表示输入框的内容
 *     2 文本域绑定输入事件，事件触发的时候，就把输入的值存入到变量中
 *   2 对这些内容 合法性验证
 *   3 验证通过 用户选择的图片上传到专门的图片服务器中，返回外网的图片链接
 *     1 遍历图片数组
 *     2 挨个上传
 *     3 自己再维护图片数组存放 图片上传后的外网链接
 *   4 文本域和外网的图片路径 一起提交到服务器 前端的模拟，并不会发送到真正的服务器上
 *   5 清空当前页面
 *   6 返回到上一页
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: '体验问题',
        isActive: true
      },
      {
        id: 1,
        value: '商品、商家投诉',
        isActive: false
      }
    ],
    // 被选中的图片路径数组
    chooseImages: [],
    // 文本域的内容
    textValue: ""
  },

  // 外网的图片路径的数组
  UploadImages: [],

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
  // 点击“+”进行选择图片
  handleChooseImg() {
    // 调用小程序内置的选择图片api
    wx.chooseImage({
      // 同时选中的图片数量
      count: 9,
      // 图片的格式 原图，压缩
      sizeType: ['original', 'compressed'],
      // 图片的来源 相册 照相机
      sourceType: ['album', 'camcera'],
      success: (result) => {
        this.setData({ chooseImages: [...this.data.chooseImages, ...result.tempFilePaths] })
        console.log(result)
      },
      fail: () => { },
      complete: () => { }
    });
  },
  // 点击图片，删除图片
  handleRemoveImage(e) {
    // 获取被点击的组件的索引
    const { index } = e.currentTarget.dataset;

    // 获取data中的图片数组
    let { chooseImages } = this.data;

    // 删除元素
    chooseImages.splice(index, 1);

    this.setData({ chooseImages });
  },
  // 文本域的输入事件
  handleTextInput(e) {
    this.setData({ textValue: e.detail.value })
  },
  // 提交按钮的点击事件
  handleFormSubmit() {
    // 1 获取文本域的内容,图片数组
    const { textValue, chooseImages } = this.data;
    // 2 合法性的验证
    if (!textValue.trim()) {
      // 不合法
      wx.showToast({
        title: '输入不合法',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: true
      });
      return;
    }
    // 3 准备上传图片 到专门的图片服务器
    // 上传文件的api 不支持多个文件同时上传，遍历数组挨个上传
    // 显示正在等待的图标
    wx.showLoading({
      title: "正在上传",
      mask: true
    });

    // 判断有没有需要上传的图片数组
    if (chooseImages.length !== 0) {
      chooseImages.forEach((item, index) => {
        wx.uploadFile({
          // 表示图片要上传到哪里
          url: 'https://imgurl.org/upload/ftp',
          // 被上传的文件的路径
          filePath: item,
          // 上传的文件的名称，给后台来获取文件的 file
          name: "file",
          // 顺带的文本信息
          formData: {},
          success: (result) => {
            console.log(result);
            let url = JSON.parse(result.data);
            this.UploadImages.push(url);

            if (index === chooseImages.length - 1) {
              wx.hideLoading();
              // 暂时没有服务器，模拟一下
              console.log("把文本的内容，和图片都上传到服务器上去");
              // 提交成功
              // 重置页面
              this.setData({ textValue: "", chooseImages: [] });
              //返回上一个页面
              wx.navigateBack({
                delta: 1
              });
            } // end if 
          }
        });
      });
    }else {
      wx.hideLoading();
      console.log("只是提交了文本");
      wx.navigateBack({
        delta: 1
      });
    }

  }
})