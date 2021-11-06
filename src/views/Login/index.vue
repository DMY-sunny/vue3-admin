<template>
  <div class="login-container">
    <div id="login-three-container"></div>
    <div class="login-plane">
      <div class="login-plane-container">
        <img
          class="login-plane-human"
          src="images/login_human.png"
          alt=""
        />
        <div class="login-plane-title">
          <p> 中国🇨🇳航天总局 <br>
            <div style="font-size: 12px; color: red;text-align: center;">收复个小台湾，就是简简单单</div>
          </p>
          <img
            class="login-plane-title-line"
            src="images/login_horizontal_line.png"
            alt=""
          />
        </div>
        <div class="login-plane-form">
          <el-form :model="ruleForm" :rules="rules" ref="loginForm">
            <el-form-item prop="username">
              <el-input
                placeholder="用户名 / 账号"
                type="text"
                v-model.trim="ruleForm.username"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                placeholder="密码"
                type="password"
                v-model.trim="ruleForm.password"
              ></el-input>
            </el-form-item>
            <div class="login-code-container">
              <el-form-item style="width: 50%" prop="code">
                <el-input
                  placeholder="验证码"
                  type="text"
                  v-model="ruleForm.code"
                ></el-input>
              </el-form-item>
              <ver-code ref="childCode" class="login-code" @getCode="getCode" @click="getValidateCodeHandle" />
            </div>
            <el-form-item prop="autoLogin">
              <el-checkbox
                v-model="ruleForm.whetherAutoLogin"
                label="自动登陆"
              ></el-checkbox>
            </el-form-item>
          </el-form>
          <el-button @click="submitForm" style="width: 100%" type="primary"
            >登录</el-button
          >
        </div>
      </div>
    </div>
    <div class="login-ground"></div>
  </div>
</template>

<script lang="ts">
// three start
import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { defineComponent, onMounted, ref, reactive, toRefs, unref } from "vue";
import _ from "lodash";
// import { ElMessage } from "element-plus";
import VerCode from "@/components/VerificationCode/index.vue";
// three end
//登陆start
import axios from "@/utils/axios";
import md5 from "js-md5";
import { localSet } from "@/utils";
//登陆end

export default defineComponent({
  components: {
    VerCode,
  },
  setup() {
    const getCode = (val: String) =>{
      console.log( val,'这不就船只了吗')
    }
    const ruleCode = (rule: any, value: string, callback: (arg0: Error|undefined) => void) => {
      if (value === '') {
        callback(new Error('验证码还能空？'))
      } else if (value !== '') {
        callback(new Error("fauk"))
      } else {
        callback(undefined)
      }
    }
    // 登陆逻辑 start
    const loginForm = ref();
    const state = reactive({
      ruleForm: {
        username: "",
        password: "",
      },
      checked: true,
      rules: {
        username: [
          { required: "true", message: "账户不能为空", trigger: "blur" },
        ],
        password: [
          { required: "true", message: "密码不能为空", trigger: "blur" },
        ],
        code: [
          { validator: ruleCode, trigger: 'blur' }
        ],
      },
    });
    const submitForm = async () => {
      loginForm.value.validate((valid: any) => {
        if (valid) {
          axios
            .post("/adminUser/login", {
              userName: state.ruleForm.username || "",
              passwordMd5: md5(state.ruleForm.password),
            })
            .then((res) => {
              localSet("token", res);
              window.location.href = "/";
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    const resetForm = () => {
      loginForm.value.resetFields();
    };
    // 登陆 end

    //界面动画start
    // 容器
    let container: any;
    // 声明视口宽度
    let width: number;
    // 声明视口高度
    let height: number;
    // 盒模型的深度
    const depth = 1400;
    // 声明场景
    let scene: any;
    // 声明球组
    let Sphere_Group: any;
    // 声明球体几何
    let sphereGeometry: any;
    // 声明完整球
    let sphere: any;
    // 声明相机
    let camera: any;
    // 声明相机在z轴的位置
    let zAxisNumber: number;
    // 声明相机目标点
    let cameraTarget: any = new THREE.Vector3(0, 0, 0);
    // 声明点材质
    let materials: any = [];
    // 声明点的参数
    let parameters: any;
    // 声明点在z轴上移动的进度
    let zprogress: number;
    // 声明同上（第二个几何点）
    let zprogress_second: number;
    // 声明粒子1
    let particles_first: any[];
    // 声明粒子1
    let particles_second: any[];
    // 声明粒子1的初始化位置
    let particles_init_position: number;
    // 声明流动的云对象1（包含路径、云实例）
    let cloudParameter_first: any;
    // 声明流动的云对象2（包含路径、云实例）
    let cloudParameter_second: any;
    // 声明云流动的渲染函数1
    let renderCloudMove_first: any;
    // 声明云流动的渲染函数1
    let renderCloudMove_second: any;
    // 声明性能监控
    let stats: any = new Stats();
    // 声明渲染器
    let renderer: any;
    // 声明调试工具
    let gui = new GUI();

    // 表单对象
    // const formRef = ref(null);

    // 响应式对象 - 表单对象
    // const ruleForm = reactive({
    //   username: "",
    //   password: "",
    //   code: "",
    // });

    // 表单校验规则
    // const rules = {
    //   username: [{ required: true, message: "请输入用户名账号", trigger: "blur" }],
    //   password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    //   code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
    // };

    onMounted(() => {
      container = document.getElementById("login-three-container");
      width = container.clientWidth;
      height = container.clientHeight;
      initScene();
      initSceneBg();
      initCamera();
      initLight();
      initSphereModal();
      initSphereGroup();
      particles_init_position = -zAxisNumber - depth / 2;
      zprogress = particles_init_position;
      zprogress_second = particles_init_position * 2;
      particles_first = initSceneStar(particles_init_position);
      particles_second = initSceneStar(zprogress_second);
      cloudParameter_first = initTubeRoute(
        [
          new THREE.Vector3(-width / 10, 0, -depth / 2),
          new THREE.Vector3(-width / 4, height / 8, 0),
          new THREE.Vector3(-width / 4, 0, zAxisNumber),
        ],
        400,
        200
      );
      cloudParameter_second = initTubeRoute(
        [
          new THREE.Vector3(width / 8, height / 8, -depth / 2),
          new THREE.Vector3(width / 8, height / 8, zAxisNumber),
        ],
        200,
        100
      );
      initRenderer();
      // 控制器必须放在renderer函数后面
      initOrbitControls();
      animate();
      // initGUI()
      // const axesHelper = new THREE.AxesHelper(2000)
      // scene.add(axesHelper)
    });

    // gui参数
    function Params (){
      this.color = "#000";
      this.length = 10;
      this.size = 3;
      this.visible = true;
      this.x = 0;
      this.y = 0;
      this.z = 100;
      this.widthSegments = 64;
      this.heightSegments = 32;
      this.radius = 16;
    }

    // 初始化gui
    const initGUI = () => {
      const params = new Params();
      gui.add(params, "x", -1500, 1500).onChange((x: number) => {
        //点击颜色面板，e为返回的10进制颜色
        Sphere_Group.position.x = x;
      });
      gui.add(params, "y", -50, 1500).onChange((y: number) => {
        //点击颜色面板，e为返回的10进制颜色
        Sphere_Group.position.y = y;
      });
      gui.add(params, "z", -200, 1000).onChange((z: number) => {
        //点击颜色面板，e为返回的10进制颜色
        Sphere_Group.position.z = z;
      });
      gui
        .add(params, "widthSegments", 0, 64)
        .onChange((widthSegments: number) => {
          //点击颜色面板，e为返回的10进制颜色
          sphereGeometry.parameters.widthSegments = widthSegments;
        });
      gui
        .add(params, "heightSegments", 0, 32)
        .onChange((heightSegments: number) => {
          //点击颜色面板，e为返回的10进制颜色
          sphereGeometry.parameters.heightSegments = heightSegments;
        });
      gui.add(params, "radius", 5, 30).onChange((radius: number) => {
        //点击颜色面板，e为返回的10进制颜色
        sphereGeometry.parameters.radius = radius;
        renderer.render(scene, camera);
      });
      gui.add(params, "visible").onChange((e) => {
        //这是一个单选框，因为params.visible是一个布尔值，e返回所选布尔值
        // points.visible = e
      });
      gui.addColor(params, "color").onChange((e) => {
        //点击颜色面板，e为返回的10进制颜色
        // pointsMaterial.color.set(e)
      });
    };

    // 初始化场景
    const initScene = () => {
      scene = new THREE.Scene();
      // 在场景中添加雾的效果，Fog参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
      scene.fog = new THREE.Fog(0x000000, 0, 10000);
    };

    // 初始化背景（盒模型背景，视角在盒子里面，看到的是盒子内部）
    const initSceneBg = () => {
      new THREE.TextureLoader().load("images/sky.png", (texture) => {
        const geometry = new THREE.BoxGeometry(width, height, depth); // 创建一个球形几何体 SphereGeometry
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
        }); // 创建基础为网格基础材料
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      });
    };

    // 初始化轨道控制器
    const initOrbitControls = () => {
      const controls = new OrbitControls(camera, renderer.domElement);
      // enabled设置为true是可以使用鼠标控制视角
      controls.enabled = false;
      controls.update();
    };

    // 初始化相机
    const initCamera = () => {
      /**
       * 方式1：固定视野的距离，求满足完整的视野画面需要多大的视域角度
       * tan正切值（直角边除以临边）
       * const mathTan_value = width / 2 / depth
       * 视域角度
       * const fov_angle = (Math.atan(mathTan_value) * 180) / Math.PI
       * 创建透视相机
       * new THREE.PerspectiveCamera(fov_angle, width / height, 1, depth)
       * 场景是一个矩形容器（坐标(0, 0, 0)是矩形容器的中心），相机能看到的距离是depth，
       * camera.position.set(0, 0, depth / 2)
       */

      /**
       * 使用透视相机
       * 参数值分别是：
       * fov（field of view） — 摄像机视锥体垂直视野角度
       * aspect — 摄像机视锥体长宽比
       * near — 摄像机视锥体近端面
       * far — 摄像机视锥体远端面
       * 这里需要注意：透视相机是鱼眼效果，如果视域越大，边缘变形越大。
       * 为了避免边缘变形，可以将fov角度设置小一些，距离拉远一些
       */

      /**
       * 方式2:固定视域角度，求需要多少距离才能满足完整的视野画面
       * 15度等于(Math.PI / 12)
       */
      const fov = 15;
      const distance = width / 2 / Math.tan(Math.PI / 12);
      zAxisNumber = Math.floor(distance - depth / 2);
      camera = new THREE.PerspectiveCamera(fov, width / height, 1, 30000);
      /**
       * 这里给z轴的距离加了100，原因是做调整，使得视域更完整
       * 这么做并不代表前面计算错误了，根据前面的计算值并不能很完整的看到
       * 至于原因，我想大概就类似于0.1+0.2不等于0.3吧
       * 所以我自作主张地加了100的值做调整（但是不建议，因为当屏幕足够宽时候会看到边缘）
       */
      // camera.position.set(0, 0, zAxisNumber + 100)
      camera.position.set(0, 0, zAxisNumber);
      camera.lookAt(cameraTarget);
      // const helper = new THREE.CameraHelper(camera)
      // helper.update()
      // scene.add(helper)
    };

    //光源
    const initLight = () => {
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      // 右下角点光源
      const light_rightBottom = new THREE.PointLight(0x0655fd, 5, 0);
      light_rightBottom.position.set(0, 100, -200);
      scene.add(light_rightBottom);
      scene.add(ambientLight);
    };

    // 初始化球体模型
    const initSphereModal = () => {
      //材质
      let material = new THREE.MeshPhongMaterial();
      material.map = new THREE.TextureLoader().load("images/earth_bg.png");
      material.blendDstAlpha = 1;
      //几何体
      sphereGeometry = new THREE.SphereGeometry(50, 64, 32);
      //模型
      sphere = new THREE.Mesh(sphereGeometry, material);
    };

    // 初始化组 --- 球体
    const initSphereGroup = () => {
      Sphere_Group = new THREE.Group();
      Sphere_Group.add(sphere);
      Sphere_Group.position.x = -400;
      Sphere_Group.position.y = 200;
      Sphere_Group.position.z = -200;
      scene.add(Sphere_Group);
    };

    // 初始化流动路径
    const initTubeRoute = (
      route?: any,
      geometryWidth?: number,
      geometryHeigh?: number
    ) => {
      const curve = new THREE.CatmullRomCurve3(route, false);
      const tubeGeometry = new THREE.TubeGeometry(curve, 100, 2, 50, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        // color: '0x4488ff',
        opacity: 0,
        transparent: true,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      scene.add(tube);

      const clondGeometry = new THREE.PlaneGeometry(
        geometryWidth,
        geometryHeigh
      );
      const textureLoader = new THREE.TextureLoader();
      const cloudTexture = textureLoader.load("images/cloud.png");
      const clondMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      });
      const cloud = new THREE.Mesh(clondGeometry, clondMaterial);
      scene.add(cloud);
      return {
        cloud,
        curve,
      };
    };

    // 初始化场景星星效果
    const initSceneStar = (initZposition: number): any => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const pointsGeometry: any[] = [];
      const textureLoader = new THREE.TextureLoader();
      const sprite1 = textureLoader.load("images/starflake1.png");
      const sprite2 = textureLoader.load("images/starflake2.png");
      parameters = [
        [[0.6, 100, 0.75], sprite1, 50],
        [[0, 0, 1], sprite2, 20],
      ];
      // 初始化500个节点
      for (let i = 0; i < 500; i++) {
        /**
         * const x: number = Math.random() * 2 * width - width
         * 等价
         * THREE.MathUtils.randFloatSpread(width)
         */
        const x: number = THREE.MathUtils.randFloatSpread(width);
        const y: number = _.random(0, height / 2);
        const z: number = _.random(-depth / 2, zAxisNumber);
        vertices.push(x, y, z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );

      // 创建2种不同的材质的节点（500 * 2）
      for (let i = 0; i < parameters.length; i++) {
        const color = parameters[i][0];
        const sprite = parameters[i][1];
        const size = parameters[i][2];

        materials[i] = new THREE.PointsMaterial({
          size,
          map: sprite,
          blending: THREE.AdditiveBlending,
          depthTest: true,
          transparent: true,
        });
        materials[i].color.setHSL(color[0], color[1], color[2]);
        const particles = new THREE.Points(geometry, materials[i]);
        particles.rotation.x = Math.random() * 0.2 - 0.15;
        particles.rotation.z = Math.random() * 0.2 - 0.15;
        particles.rotation.y = Math.random() * 0.2 - 0.15;
        particles.position.setZ(initZposition);
        pointsGeometry.push(particles);
        scene.add(particles);
      }
      return pointsGeometry;
    };

    // 渲染星球的自转
    const renderSphereRotate = () => {
      if (sphere) {
        Sphere_Group.rotateY(0.001);
      }
    };

    // 渲染星星的运动
    const renderStarMove = () => {
      const time = Date.now() * 0.00005;
      zprogress += 1;
      zprogress_second += 1;

      if (zprogress >= zAxisNumber + depth / 2) {
        zprogress = particles_init_position;
      } else {
        particles_first.forEach((item) => {
          item.position.setZ(zprogress);
        });
      }
      if (zprogress_second >= zAxisNumber + depth / 2) {
        zprogress_second = particles_init_position;
      } else {
        particles_second.forEach((item) => {
          item.position.setZ(zprogress_second);
        });
      }

      for (let i = 0; i < materials.length; i++) {
        const color = parameters[i][0];

        const h = ((360 * (color[0] + time)) % 360) / 360;
        materials[i].color.setHSL(color[0], color[1], parseFloat(h.toFixed(2)));
      }
    };

    // 初始化云的运动函数
    const initCloudMove = (
      cloudParameter: any,
      speed: number,
      scaleSpeed = 0.0006,
      maxScale = 1,
      startScale = 0
    ) => {
      let cloudProgress = 0;
      return () => {
        if (startScale < maxScale) {
          startScale += scaleSpeed;
          cloudParameter.cloud.scale.setScalar(startScale);
        }
        if (cloudProgress > 1) {
          cloudProgress = 0;
          startScale = 0;
        } else {
          cloudProgress += speed;
          if (cloudParameter.curve) {
            const point = cloudParameter.curve.getPoint(cloudProgress);
            if (point && point.x) {
              cloudParameter.cloud.position.set(point.x, point.y, point.z);
            }
          }
        }
      };
    };

    //渲染器
    const initRenderer = () => {
      // 开启抗锯齿
      // 在 css 中设置背景色透明显示渐变色
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      // 定义渲染器的尺寸；在这里它会填满整个屏幕
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      container.appendChild(stats.dom);
      renderCloudMove_first = initCloudMove(cloudParameter_first, 0.0002);
      renderCloudMove_second = initCloudMove(
        cloudParameter_second,
        0.0008,
        0.001
      );
    };

    //动画刷新
    const animate = () => {
      requestAnimationFrame(animate);
      renderSphereRotate();
      renderStarMove();
      renderCloudMove_first();
      renderCloudMove_second();
      renderer.render(scene, camera);
    };

    const childCode = ref()
    // 点击刷新验证码
    const getValidateCodeHandle = () => {
      // 请求获取验证码 并设置验证码的图片以及验证码token
      childCode && childCode?.value && childCode?.value?.drawPic()
    };

    // 提交表单
    // const submitForm = () => {
    //   const form: any = unref(formRef);
    //   if (!form) return;
    //   form.validate((valid: any) => {
    //     if (valid) {
    //       submitHandle();
    //     } else {
    //       ElMessage.warning({
    //         message: "随便输入用户名、密码、验证码即可登陆",
    //         type: "warning",
    //       });
    //     }
    //   });
    // };

    const refsState = toRefs(state);
    return {
      ...refsState,
      // rules,
      // ruleForm,
      // submitForm,
      // formRef,
      childCode,
      getCode,
      getValidateCodeHandle,
      ...toRefs(state),
      loginForm,
      submitForm,
      resetForm,
    };
  },
});
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  position: relative;
  #login-three-container {
    width: 100%;
    height: 100%;
  }
  .login-plane {
    position: absolute;
    z-index: 9999;
    width: 450px;
    height: 500px;
    background-image: url("images/login_border.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .login-plane-container {
      width: 100%;
      height: 100%;
      border-radius: 18px;
      background-color: #007eff2e;
      position: relative;
      @keyframes humanMove {
        0% {
          top: -100px;
        }
        25% {
          top: -120px;
        }
        50% {
          top: -100px;
        }
        75% {
          top: -80px;
        }
        100% {
          background: -100px;
        }
      }
      .login-plane-human {
        position: absolute;
        width: 260px;
        right: -120px;
        top: -100px;
        animation: humanMove 8s linear 0s infinite normal;
      }
      .login-plane-title {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-size: 35px;
        color: #fff;
        font-weight: 700;
        img {
          width: 50%;
        }
        .login-plane-title-line {
          width: 80%;
          position: absolute;
          bottom: 0;
        }
      }
      .login-plane-form {
        padding: 45px 55px;
        box-sizing: border-box;
        .login-code-container {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          .login-code {
            cursor: pointer;
            width: 41.4%;
            height: 40px;
            // background-color: #c8c8c8;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
  }
  .login-ground {
    position: absolute;
    z-index: 9998;
    width: 100%;
    height: 400px;
    background-image: url("images/ground.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    bottom: 0;
    left: 0;
  }
}
</style>

function to(to: any) {
  throw new Error("Function not implemented.");
}
