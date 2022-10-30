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
            设置
          </div>
        </div>
      </div>
    `)
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
    })
  }
  show(){ /* 显示菜单界面 */
    this.$menu.show() /* jQueryAPI */
  }
  hide(){ /* 关闭菜单界面  */
    this.$menu.hide()
  }
}
/* AcGameObject */

let AC_GAME_OBJECTS = []
class AcGameObject{
  constructor(){
    AC_GAME_OBJECTS.push(this)

    this.hascalled_start = false /* 是否执行过start函数 */
    this.timedelta = 0  // 当前帧距离上一帧的时间间隔
  }
  start(){

  }

  update(){ /* 每一帧均会执行一次 */
    
  }
  on_destory(){ /* 在被销毁前执行一次 */
    
  }
  destory(){ /* 删除该物体 */
    this.on_destory()

    for (let i=0;i<AC_GAME_OBJECTS.length;i++){
      if (AC_GAME_OBJECTS[i] === this){
        AC_GAME_OBJECTS.splice(i,1);
        break;
      }
    }
  }
}

let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp){
  //循环
  for (let i=0;i<AC_GAME_OBJECTS.length;i++){

    let obj = AC_GAME_OBJECTS[i]
    //如果是第一次执行则执行start()  如果不是第一次执行 updata()
    if (!obj.hascalled_start){
      obj.start()
      obj.hascalled_start = true
    }else{
      obj.timedelta = timestamp - last_timestamp //记录时间间隔
      obj.update()
    }
  }
  last_timestamp = timestamp
  requestAnimationFrame(AC_GAME_ANIMATION)
}

requestAnimationFrame(AC_GAME_ANIMATION) /* 标准每秒调用60次 但不同浏览器可能不一样 */


/* game_map */
class GameMap extends AcGameObject{
  constructor(playground){
    super() //调用基类的构造函数
    this.playground = playground
    this.$canvas = $(`<canvas></canvas>`)
    this.ctx = this.$canvas[0].getContext('2d')
    this.ctx.canvas.width = this.playground.width
    this.ctx.canvas.height = this.playground.height

    this.playground.$playground.append(this.$canvas)
    
  }

  start(){

  }
  update(){
    this.render()
  }
  render(){
    this.ctx.fillStyle = "rgba(0,0,0,0.2)"
    this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
  }
}
class Particle extends AcGameObject{
  constructor(playground,x,y,vx,vy,radius,color,speed,move_length) {
    super()
    this.Playground = playground
    this.ctx = this.Playground.game_map.ctx
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.radius = radius
    this.color = color
    this.speed = speed
    this.move_length = move_length
    this.friction = 0.9
    this.eps = 1
  }

  start(){

  }
  update(){
    
    if (this.move_length < this.eps ||  this.speed < this.eps){
      this.destory()
      return false
    }
    let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000)
    this.x += this.vx * moved
    this.y += this.vy * moved
    this.move_length -= moved
    this.speed *= this.friction
    this.render()
  }
  render(){
    this.ctx.beginPath()
    this.ctx.arc(this.x,this.y,this.radius,0,Math.PI *2 ,false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }
}class Player extends AcGameObject{
  constructor(Playground,x,y,radius,color,speed,is_me){
    super()

    this.Playground = Playground
    this.ctx = this.Playground.game_map.ctx
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    /* 受到伤害后的方向速度 */
    this.damage_x = 0
    this.damage_y =0
    this.damage_speed = 0
    this.radius = radius
    this.move_length = 0 /* 要移动的距离 */
    this.color = color
    this.speed = speed
    this.is_me = is_me
    this.eps = 0.1
    /* 摩擦力 */
    this.friction = 0.9

    this.spent_time = 0

    this.cur_skill = null;
    this.start()
  }

  start(){
    if (this.is_me){
      this.add_listening_events()
    }else{
      let tx = Math.random() * this.Playground.width
      let ty = Math.random() * this.Playground.height
      this.move_to(tx,ty)
    }
  }

  add_listening_events(){
    let outer = this
    /* 禁止右键 弹出菜单 */
    this.Playground.game_map.$canvas.on("contextmenu",function(){
      return false
    })
    this.Playground.game_map.$canvas.mousedown(function(e){
      if (e.which === 3){
        //取得右键单击 的XY 坐标
        outer.move_to(e.clientX,e.clientY)

      }else if (e.which === 1){ /* 如果鼠标左键被点击 */
        if(outer.cur_skill === "fireball"){
          outer.shoot_fireball(e.clientX,e.clientY)
        }
        outer.cur_skill = null
      }
    })

    $(window).keydown(function(e){
      if (e.which === 81){
        outer.cur_skill = "fireball"
        return false
      }
    })

  } 

  shoot_fireball(tx,ty){
    let x = this.x,y = this.vy
    let radius = this.Playground.height * 0.01
    let angle = Math.atan2(ty-this.y,tx-this.x)
    let vx = Math.cos(angle),vy = Math.sin(angle)
    let color = "orange"
    let speed = this.Playground.height * 0.5
    let move_length = this.Playground.height*1.5
    new FireBall (this.Playground,this,this.x,this.y,radius,vx,vy,color,speed,move_length,this.Playground.height * 0.01)
    
  }
  /* 计算两点距离 */
  get_dist(x1,y1,x2,y2){
    let dx = x1 - x2
    let dy = y1 - y2
    return Math.sqrt(dx*dx+dy*dy)
  }
  
  move_to(tx,ty){
    this.move_length = this.get_dist(this.x,this.y,tx,ty)
    let angle = Math.atan2(ty-this.y,tx-this.x)
    this.vx = Math.cos(angle)
    this.vy = Math.sin(angle)
  }

  is_attacked(angle,damage){

     /* 渲染粒子 */
     for (let i=0;i<15+Math.random()*5;i++){
      let x = this.x 
      let y = this.y
      let radius = this.radius *( Math.random() * 0.1)
      let angle = Math.PI * 2 * Math.random()
      let vx = Math.cos(angle),vy = Math.sin(angle)
      let color = this.color
      let speed = this.speed * 10
      let move_length = this.radius * Math.random() * 5

      new Particle (this.Playground,x,y,vx,vy,radius,color,speed,move_length)
    }


    this.radius -= damage
    
    if (this.radius < 10) {
      this.destory()
      return false
    }

    this.damage_x = Math.cos(angle)
    this.damage_y = Math.sin(angle)
    this.damage_speed = damage *80

    /* 变小减速 */
    this.speed *= 0.9;

   
  }

  
  update(){
    this.spent_time += this.timedelta/1000
    if(!this.is_me&&this.spent_time > 2 && Math.random()<1/250.0){
      /* 都攻击自己 */
      let player = this.Playground.players[0]
      //let player = this.Playground.players[Math.floor(Math.random()*this.Playground.players.length)]
      let tx = player.x + player.speed * this.vx 
      this.shoot_fireball(player.x,player.y)
      
    }

    if (this.damage_speed>10){
      this.vx = this.vy = 0
      this.move_length  = 0
      this.x += this.damage_x * this.damage_speed * this.timedelta / 1000
      this.y += this.damage_y * this.damage_speed * this.timedelta / 1000
      this.damage_speed *= this.friction
    }else 
      {
        /* 需不需要移动 */
        if (this.move_length < this.eps){
        this.move_length = 0
        this.vx = this.vy = 0
        
        /* 如果是AI */
        if(!this.is_me){
          let tx = Math.random() * this.Playground.width
          let ty = Math.random() * this.Playground.height
          this.move_to(tx,ty)
        }
      }else{
        /* 真实移动的距离 */
        let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000)
        this.x += this.vx * moved
        this.y += this.vy * moved
        this.move_length -= moved
      }
    }
    this.render()
  }
  on_destory(){
    for(let i =0;i<this.Playground.players.length;i++){
      if (this.Playground.players[i] === this){
        this.Playground.players.splice(i,1)
        if(this.is_me) this.Playground.game_map.$canvas.off();
      }
    }
  }
  render(){
    this.ctx.beginPath()
    this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }
}class FireBall extends AcGameObject {
  constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length,damage) {
    super()
    this.Playground = playground
    this.player = player
    this.ctx = this.Playground.game_map.ctx
    this.x = x
    this.y = y
    this.radius = radius
    this.vx = vx
    this.vy = vy

    this.color = color
    this.speed = speed
    this.move_length = move_length
    this.damage = damage
    this.epx = 0.1
  }

  start() {

  }
  update() {
    if (this.move_length < this.eps) {
      this.destory()
      return false
    }
    let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
    this.x += this.vx * moved
    this.y += this.vy * moved
    this.move_length -= moved
    for (let i =0;i<this.Playground.players.length;i++){
      let player = this.Playground.players[i]
      if (this.player!= player && this.is_collision(player)){
        this.attack(player)
      }
    }
    this.render()
  }

  get_dist(x1,y1,x2,y2){
    let dx = x1-x2
    let dy = y1-y2
    return Math.sqrt(dx*dx+dy*dy)
  }
  /* 判断碰撞函数 */
  is_collision(Player){
    let distance = this.get_dist(this.x,this.y,Player.x,Player.y)
    if (distance< this.radius+Player.radius){
      return true
    }
    return false
  }
  /* 攻击函数 */
  attack(player){
    /* 碰撞角度 */
    let angel = Math.atan2(player.y - this.y, player.x -this.x)

    player.is_attacked(angel,this.damage)
    this.destory()
  }
  render() {
    /* canvas绘制火球 */
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }
}/* playground base */

class AcGamePlayground{
  constructor(root){
    this.root = root
    this.$playground = $(`<div class="ac-game-playground"></div>`)
    this.root.$ac_game.append(this.$playground)

    this.width = this.$playground.width() /* 存放宽度高度数据 */
    this.height = this.$playground.height()

    /* 地图类 */
    this.game_map = new GameMap(this)

    /* 玩家类 */
    this.players = []
    this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,"white",this.height*0.15,true))
    
    /* 创建NPC */
    for(let i =0;i<5;i++) {
      this.players.push(new Player(this,this.width/2,this.height/2,this.height*0.05,this.get_random_color(),this.height*0.15,false))

    }
    this.start()
  }
  /* 随机获取颜色 */
  get_random_color(){
    let colors = ["blue","pink","red","orange","green","grey"]
    return colors[Math.floor(Math.random()*5)]
  }
  start(){
    this.hide()
  }
  show(){ /* 打开playground界面 */
    this.$playground.show()
  }
  hide(){ /* 关闭playground界面 */
    this.$playground.hide()
  }
}export class AcGame{
  constructor(id){
    this.id = id
    this.$ac_game = $('#'+id)
    //this.menu = new AcGameMenu(this)  /* 方便调试 */
    this.playground = new AcGamePlayground(this)
    this.start()
  }

  start(){
    this.playground.show() /* 方便调试 */
  }
}