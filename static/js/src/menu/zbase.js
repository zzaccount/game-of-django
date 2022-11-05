class AcGameMenu{
  constructor(root){
    this.root = root
    this.$menu = $(`
      <div class ="ac-game-menu">
        <div class = "ac-game-menu-field">
          <div class = "ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
          </div>
          <div class = "ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
          </div>
          <div class = "ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
          </div>
        </div>
      </div>
    `)
    this.$menu.hide()
    /* jQuery获取元素 */
    this.root.$ac_game.append(this.$menu)
    this.$single_mode = this.$menu.find(".ac-game-menu-field-item-single-mode")
    this.$multi_mode = this.$menu.find(".ac-game-menu-field-item-multi-mode")
    this.$settings = this.$menu.find(".ac-game-menu-field-item-settings")
    
    this.start()

  }
  
  start(){
    this.add_listening_events()
  }
  add_listening_events(){
    let outer = this;/* 里面的this发生改变,所以存储之前的this */
    this.$single_mode.click(function(){
      /* jQuery的监听点击函数 */
      outer.hide()
      outer.root.playground.show()
    })
    this.$multi_mode.click(function(){
      /* jQuery的监听点击函数 */
      console.log("点击按钮2");

    })
    this.$settings.click(function(){
      /* jQuery的监听点击函数 */
      console.log("点击按钮3");
      outer.root.settings.logout_on_remote()
    })
  }
  show(){ /* 显示菜单界面 */
    this.$menu.show() /* jQueryAPI */
  }
  hide(){ /* 关闭菜单界面  */
    this.$menu.hide()
  }
}