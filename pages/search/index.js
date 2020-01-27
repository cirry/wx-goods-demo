/**
 * 1 输入框绑定 值改变事件
 *   1 获取到输入框的值
 *   2 合法性判断
 *   3 检验通过，把输入框的值发送到后台
 *   4 返回来的数据显示到页面上
 * 
 * 2 防抖
 *   0 防抖一般是用在输入框中的，防止重复输入，重复发送请求
 *   1 节流一般是用在页面的下拉和上拉等等中
 *   1 定义全局的定时器
 * 
 */

import { request } from "../../request/index.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    // 取消按钮是否显示
    isFocus:false,
    // 输入框中的值
    inputValue:""
  },
  TimeId: -1,

  // 搜索框值改变就会获取到数据
  handleInput(e) {

    // 1 获取输入框的值
    const {value} = e.detail;

    // 2 检测合法性
    if(!value.trim()){
      this.setData({isFocus:false,goods:[]})
      // 值不合法
      return ;
    }

    this.setData({isFocus:true});
    // 准备发送请求的获取数据
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(() =>{
      this.qsearch(value);
    },1000);
    
  },

  // 发送请求，获取搜索建议的数据
  qsearch(query){
    request({url:"/goods/qsearch",data:{query}})
    .then((res) =>{
      this.setData({goods:res});
    });
  },
  
  // 点击取消按钮，删除数据
  handleCancel(){
    this.setData({inputValue:"",isFocus:false,goods:[]})
  }
})