<template>
  <div class="s-canvas">
    <canvas id="s-canvas" :width="contentWidth" :height="contentHeight" />
    <p>看不清？那就多点几次！</p>
  </div>
</template>
<script>
import { ElMessage } from "element-plus";
// 创建随机数字典库
/**
     * 随机数数组
     * 去除了易混淆的   数字 0 和 字母 o O
     *                数字 1 和 字母 i I l L
     *                数字 6 和 字母 b
     *                数字 9 和 字母 q
     *                字母 c C 和 G
     *                字母 t （经常和随机线混在一起看不清）
     */
const Dictionaries = [
  '2', '3', '4', '5', '7', '8',
  'a', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm',
  'n', 'p', 'r', 's', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'D', 'E', 'F', 'H', 'J', 'K', 'M',
  'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export default {
  name: 'VerCode',
  props: {
    identifyCode: {
      type: String,
      default: '1234'
    },
    defaultCodeLength: {
      type: Number,
      default: 4
    },
    fontSizeMin: {
      type: Number,
      default: 25
    },
    fontSizeMax: {
      type: Number,
      default: 30
    },
    colorMin: {
      type: Number,
      default: 0
    },
    colorMax: {
      type: Number,
      default: 160
    },
    lineColorMin: {
      type: Number,
      default: 100
    },
    lineColorMax: {
      type: Number,
      default: 255
    },
    dotColorMin: {
      type: Number,
      default: 0
    },
    dotColorMax: {
      type: Number,
      default: 255
    },
    contentWidth: {
      type: Number,
      default: 140
    },
    contentHeight: {
      type: Number,
      default: 38
    },
    repet: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      codes: '',
      backNum: 0.4
    }
  },
  methods: {
    // 在自定义字典库里随机生成验证码
    createVerificationCode() {
      const { defaultCodeLength: L, repet,codes } = this
      const payload = []
      // 验证码数字是否可重复 关键字：repet
      let sArr = [...Dictionaries]
      for (let i = 0; i < L; i++) {
        const m = Math.floor(Math.random() * (Dictionaries.length))
        repet ? payload.push(sArr[m]) : payload.push(sArr.splice(m, 1)[0])
      }
      this.codes = payload.join('')
      this.$emit('getCode', this.codes)
    },
    // 生成一个颜色随机数
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },
    // 生成一个随机的颜色
    randomColor(min, max) {
      let r = this.randomNum(min, max)
      let g = this.randomNum(min, max)
      let b = this.randomNum(min, max)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    },
    // 使用canvas绘制验证码
    drawPic() {
      // 先生成随机验证码数字
      this.createVerificationCode()
      let canvas = document.getElementById('s-canvas')
      let ctx = canvas.getContext('2d')
      // 每次先把canvas状态重置，否则会出现画布重叠的效果
      canvas.width = canvas.width
      ctx.textBaseline = 'bottom'
      // 绘制背景
      const { backNum: n } = this
      this.backNum = n < 1 ? n + 0.1 : 0.4
      n > 1 && ElMessage({
        type: 'error',
        showClose: true,
        message: '可不能太清楚了哦',
        center: true,
      })
      ctx.fillStyle = `rgba(64,158,255,${n})`
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight)
      // 绘制文字
      for (let i = 0; i < this.codes.length; i++) {
        this.drawText(ctx, this.codes[i], i)
      }
      this.drawLine(ctx)
      this.drawDot(ctx)
    },
    drawText(ctx, txt, i) {
      ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax)
      ctx.font = this.randomNum(this.fontSizeMin, this.fontSizeMax) + 'px SimHei'
      let x = (i + 1) * (this.contentWidth / (this.codes.length + 1))
      let y = this.randomNum(this.fontSizeMax, this.contentHeight - 5)
      var deg = this.randomNum(-45, 45)
      // 修改坐标原点和旋转角度
      ctx.translate(x, y)
      ctx.rotate(deg * Math.PI / 180)
      ctx.fillText(txt, 0, 0)
      // 恢复坐标原点和旋转角度
      ctx.rotate(-deg * Math.PI / 180)
      ctx.translate(-x, -y)
    },
    drawLine(ctx) {
      // 绘制干扰线
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = this.randomColor(this.lineColorMin, this.lineColorMax)
        ctx.beginPath()
        ctx.moveTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.lineTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.stroke()
      }
    },
    drawDot(ctx) {
      // 绘制干扰点
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = this.randomColor(0, 255)
        ctx.beginPath()
        ctx.arc(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight), 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  },
  watch: {
    identifyCode() {
      this.drawPic()
    }
  },
  mounted() {
    this.drawPic()
  }
}
</script>
<style scoped>
p {
  color: #f56c6c;
  text-decoration: underline;
}
.s-canvas {
  height: 38px;
}
.s-canvas canvas {
  margin-top: 1px;
}
</style>
