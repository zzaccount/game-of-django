class Settings {
  constructor(root) {
    this.root = root
    this.username = ""
    this.photo = ""
    this.platform = "WEB";

    this.$settings = $(`
      <div class="ac-game-settings">
        <div class="ac-game-settings-login">
          <div class= "ac-game-settings-title">登录</div>
          <input type="text" placeholder="账号" class= "ac-game-settings-account">
          <input type="password" placeholder="密码" class= "ac-game-settings-password">
          <button class="ac-game-settings-btn">登录</button>
          <div class="ac-game-settings-error-messages">
            
          </div>
          <span>没有账号?<a class = "ac-game-settings-login-register" href="#">去注册</a></span>
          <div class="ac-game-settings-acwing">
            <img style="width=20;" src = "../../static/image/settings/aclogo.png">
            
          </div>
          <div class="ac-yijiandenglu">AcWing一键登录</div>
        </div>
        <div class="ac-game-settings-register">
          <div class= "ac-game-settings-title">注册</div>
          <input type="text" placeholder="账号" class= "ac-game-settings-account">
          <input type="password" placeholder="密码" class= "ac-game-settings-password">
          <input type="password" placeholder="确认密码" class= "ac-game-settings-password-confirm">
          <button class="ac-game-settings-btn">注册</button>
          
          <div class="ac-game-settings-error-messages">
            
          </div>
          <div class="ac-game-settings-option">登录</div>
        
        </div>
      </div>
      `)
    
    this.$login = this.$settings.find(".ac-game-settings-login")
    this.$login.hide()
    /* 提取出登录中要用的要素 */
    this.$login_username = this.$login.find(".ac-game-settings-account")
    this.$login_password = this.$login.find(".ac-game-settings-password")
    this.$login_submit = this.$login.find(".ac-game-settings-btn")
    this.$login_error_message = this.$login.find(".ac-game-settings-error-messages")
    this.$login_register = this.$login.find(".ac-game-settings-login-register")

    /* 注册中要用的要素 */
    this.$register = this.$settings.find(".ac-game-settings-register")
    this.$register.hide()
    this.$register_username = this.$register.find(".ac-game-settings-account")
    this.$register_password = this.$register.find(".ac-game-settings-password")
    this.$register_password_confirm = this.$register.find(".ac-game-settings-password-confirm")
    this.$register_submit = this.$register.find(".ac-game-settings-btn")
    this.$register_error_message = this.$register.find(".ac-game-settings-error-messages")
    this.$register_login = this.$register.find(".ac-game-settings-option")


    this.root.$ac_game.append(this.$settings)
    this.start()
  }

  start() {
    this.getinfo()
    this.add_listening_events()

  }
  /* 统一调用监听函数 */
  add_listening_events(){
    this.add_listening_events_login()
    this.add_listening_events_register()
  }


  add_listening_events_login(){
    let outer = this
      /* 登录界面 注册按钮跳转 */
    this.$login_register.click(function(){
      outer.register()
    })
    this.$login_submit.click(function(){
      outer.login_on_remote()
    })
  }
  /* 注册界面 登录按钮跳转 */
  add_listening_events_register(){
    let outer = this
    this.$register_login.click(function(){
      outer.login()
    })
    this.$register_submit.click(function(){
      console.log("注册按钮单机");
      outer.register_on_remote()
    })
  }
  /* 在远程服务器上登录 */
  login_on_remote(){
    console.log("登录函数");
    let outer = this
    let username = this.$login_username.val()
    let password = this.$login_password.val()
    this.$login_error_message.empty()

    $.ajax({
      url:"http://120.76.138.204:8000/settings/login/",
      type:"GET",
      data:{
        username:username,
        password:password,
        
      },
      success:function(resp){
        console.log(resp);
        if (resp.result === "success")
        {
          location.reload()
        }else{
          outer.$login_error_message.html(resp.result)
        }
      }
    })
  }
  /* 在远程服务器注册 */
  register_on_remote(){
    console.log("注册函数");
    let outer = this
    let username = this.$register_username.val()
    let password = this.$register_password.val()
    let password_confirm = this.$register_password_confirm.val()
    this.$register_error_message.empty()

    $.ajax({
      url:"http://120.76.138.204:8000/settings/register/",
      type:"GET",
      data:{
        username:username,
        password:password,
        password_confirm,password_confirm
      },
      success:function(resp){
        console.log(resp);
        if (resp.result === "success")
        {
          location.reload()
        }else{
          outer.$register_error_message.html(resp.result)
        }
      }
    })
  }
  /* 在远程服务器登出 */
  logout_on_remote(){
    if (this.platform === "ACAPP") return false

    $.ajax({
      url:"http://120.76.138.204:8000/settings/logout/",
      type:"GET",
      success:function(resp){
        if (resp.result === "success"){
          location.reload()
        }
      }
    })
  }
  /* 打开登录界面 */
  login() {
    this.$register.hide()
    this.$login.show()
  }
  /* 打开注册界面 */
  register() {
    this.$login.hide()
    this.$register.show()
  }


  getinfo() {
    let outer = this
    $.ajax({
      url: "http://120.76.138.204:8000/settings/getinfo/",
      type: "GET",
      data: {
        platform: outer.platform
      },
      success: function (resp) {

        if (resp.result === "success") {
          outer.username = resp.username
          outer.photo = resp.photo

          outer.hide()
          outer.root.menu.show()
        } else {
          outer.login()

        }
      }
    })
  }

  hide() {
    this.$settings.hide()
  }
  show() {
    this.$settings.show()
  }
}