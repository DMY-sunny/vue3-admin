  // fps 监控
    var animationFrame = (function () {
      return (
        window?.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
          setTimeout(callback, 1000 / 60);
        }
      );
    })();

    var frame = 0;
    var allFrameCount = 0;
    var lastTime = Date.now();
    var lastFameTime = Date.now();

    var loop = function () {
      var now = Date.now();
      var fs = now - lastFameTime;
      var fps = Math.round(1000 / fs); // fps可能会有一定误差

      lastFameTime = now;
      // 不置 0，在动画的开头及结尾记录此值的差值算出 FPS
      allFrameCount++;
      frame++;

      if (now > 1000 + lastTime) { // 定时获取fps
        var fps = Math.round((frame * 1000) / (now - lastTime)); // 毫秒取整 保证精确值
        console.log(fps,'60帧数间距获取fps结果，在这里写结果是有原因的，使用的时候别自作聪明的改变懂了吗')
        frame = 0;
        lastTime = now;
      }
      animationFrame(loop);
    };

export default loop