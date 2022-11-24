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
      outer.root.playground.show("single mode")
    })
    this.$multi_mode.click(function(){
      /* jQuery的监听点击函数 */
      outer.hide()
      outer.root.playground.show("multi mode")

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
/* AcGameObject */

let AC_GAME_OBJECTS = []
class AcGameObject{
  constructor(){
    AC_GAME_OBJECTS.push(this)

    this.hascalled_start = false /* 是否执行过start函数 */
    this.timedelta = 0  // 当前帧距离上一帧的时间间隔
    this.uuid = this.create_uuit()
  }
  create_uuit(){
    let res = ""
    for (let i=0;i<8;i++) {
      let x = parseInt(Math.floor(Math.random()*10))
      res += x
    }
    return res
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
  /* 动态修改长宽 */
  resize(){
    this.ctx.canvas.width = this.playground.width
    this.ctx.canvas.height = this.playground.height
    this.ctx.fillStyle = "rgba(0,0,0,1)"
    this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height)
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
}class NoticeBoard extends AcGameObject{
  constructor(playground){
    super()

    this.playground = playground
    this.ctx = this.playground.game_map.ctx
    this.text = "已就绪:0人"

  }

  start(){

  }
  write(text){
    this.text = text
  }
  update(){
    this.render()
  }

  render(){
    // canvas渲染文本
    this.ctx.font = "20px serif"
    this.ctx.fillStyle = "white"
    this.ctx.textAlign = "center"
    this.ctx.fillText(this.text,this.playground.width / 2,20)
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
    this.eps = 0.01
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
    let scale = this.Playground.scale
    this.ctx.beginPath()
    this.ctx.arc(this.x * scale,this.y* scale,this.radius* scale,0,Math.PI *2 ,false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }
}class Player extends AcGameObject {
  constructor(Playground, x, y, radius, color, speed, character, username, photo) {
    super()

    this.Playground = Playground
    this.ctx = this.Playground.game_map.ctx
    this.x = x
    this.y = y
    this.vx = 0
    this.vy = 0
    /* 受到伤害后的方向速度 */
    this.damage_x = 0
    this.damage_y = 0
    this.damage_speed = 0
    this.radius = radius
    this.move_length = 0 /* 要移动的距离 */
    this.color = color
    this.speed = speed
    this.character = character
    this.username = username
    this.photo = photo
    this.eps = 0.01
    /* 摩擦力 */
    this.friction = 0.9

    this.spent_time = 0

    this.fireballs = [] /* 存放子弹 */

    this.cur_skill = null;
    if (this.character !== "robot") {
      this.img = new Image();
      this.img.src = this.photo
    }
    if (this.character === "me") {
      this.fireballs_coldtime = 3; /* 冷却时间 单位:秒 */
      this.fireballs_img = new Image()
      this.fireballs_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png"

      this.blink_coldtime = 5; /* 闪现冷却 */
      this.blink_img = new Image()
      this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png"
    }

    this.start()
  }

  start() {
    this.Playground.player_count++
    /* 不知道为什么人数要除以二 */
    this.Playground.notice_board.write("已就绪: " + this.Playground.player_count / 2 + "人")

    if (this.Playground.player_count / 2 >= 3) {
      this.Playground.state = "fighting"
      this.Playground.notice_board.write("Fighting")
    }

    if (this.character === "me") {
      this.add_listening_events()
    } else if (this.character === "robot") {
      let tx = Math.random() * this.Playground.width / this.Playground.scale
      let ty = Math.random() * this.Playground.height / this.Playground.scale
      this.move_to(tx, ty)
    }
  }

  add_listening_events() {
    let outer = this
    /* 禁止右键 弹出菜单 */
    this.Playground.game_map.$canvas.on("contextmenu", function () {
      return false
    })
    this.Playground.game_map.$canvas.mousedown(function (e) {

      /* 判断状态 */
      if (outer.Playground.state !== "fighting") {
        return false
      }
      const rect = outer.ctx.canvas.getBoundingClientRect()

      if (e.which === 3) {
        //取得右键单击 的XY 坐标
        let tx = (e.clientX - rect.left) / outer.Playground.scale
        let ty = (e.clientY - rect.top) / outer.Playground.scale

        outer.move_to(tx, ty)

        if (outer.Playground.mode === "multi mode") {
          outer.Playground.maps.send_move_to(tx, ty)
        }
      } else if (e.which === 1) { /* 如果鼠标左键被点击 */


        let tx = (e.clientX - rect.left) / outer.Playground.scale
        let ty = (e.clientY - rect.top) / outer.Playground.scale

        if (outer.cur_skill === "fireball") {
          /* 判断冷却时间 */
          if (outer.fireballs_coldtime > outer.eps) {
            return false
          }
          let fireball = outer.shoot_fireball(tx, ty)

          if (outer.Playground.mode === "multi mode") {
            outer.Playground.maps.send_shoot_fireball(tx, ty, fireball.uuid)
          }
        } else if (outer.cur_skill === "blink") {
          /* 判断冷却时间 */
          if (outer.blink_coldtime > outer.eps) {
            return false
          }
          outer.blink(tx, ty)
          if (outer.Playground.mode === "multi mode") {
            outer.Playground.maps.send_blink(tx,ty)
          }
        }
        outer.cur_skill = null
      }
    })

    $(window).keydown(function (e) {
      /* 判断状态 */
      if (outer.Playground.state !== "fighting") {
        return true
      }
      if (e.which === 81) {
        if (outer.fireballs_coldtime > outer.eps) {
          return true
        }
        outer.cur_skill = "fireball"
        return false
      }
      if (e.which === 70) {
        if (outer.blink_coldtime > outer.eps) {
          return true
        }
        outer.cur_skill = "blink"
        return false
      }
    })

  }

  shoot_fireball(tx, ty) {
    let x = this.x, y = this.vy
    let radius = 0.01
    let angle = Math.atan2(ty - this.y, tx - this.x)
    let vx = Math.cos(angle), vy = Math.sin(angle)
    let color = "orange"
    let speed = 0.5
    let move_length = 1
    let fireball = new FireBall(this.Playground, this, this.x, this.y, radius, vx, vy, color, speed, move_length, 0.01)
    this.fireballs.push(fireball)

    this.fireballs_coldtime = 0.5;
    return fireball
  }

  destory_fireball(uuid) {
    for (let i = 0; i < this.fireballs.length; i++) {
      let fireball = this.fireballs[i]
      if (fireball.uuid === uuid) {
        fireball.destory()
        break
      }
    }
  }

  /* 闪现 */
  blink(tx, ty) {
    let d = this.get_dist(this.x, this.y, tx, ty)
    d = Math.min(d, 0.8)

    let angle = Math.atan2(ty - this.y, tx - this.x)
    this.x += d * Math.cos(angle)
    this.y += d * Math.sin(angle)

    this.blink_coldtime = 5

    /* 闪现后停下来 */
    this.move_length = 0;
  }
  /* 计算两点距离 */
  get_dist(x1, y1, x2, y2) {
    let dx = x1 - x2
    let dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy)
  }

  move_to(tx, ty) {
    this.move_length = this.get_dist(this.x, this.y, tx, ty)
    let angle = Math.atan2(ty - this.y, tx - this.x)
    this.vx = Math.cos(angle)
    this.vy = Math.sin(angle)
  }

  is_attacked(angle, damage) {

    /* 渲染粒子 */
    for (let i = 0; i < 15 + Math.random() * 5; i++) {
      let x = this.x
      let y = this.y
      let radius = this.radius * (Math.random() * 0.1)
      let angle = Math.PI * 2 * Math.random()
      let vx = Math.cos(angle), vy = Math.sin(angle)
      let color = this.color
      let speed = this.speed * 10
      let move_length = this.radius * Math.random() * 5

      new Particle(this.Playground, x, y, vx, vy, radius, color, speed, move_length)
    }


    this.radius -= damage

    if (this.radius < this.eps) {
      this.destory()
      return false
    }

    this.damage_x = Math.cos(angle)
    this.damage_y = Math.sin(angle)
    this.damage_speed = damage * 80

    /* 变小减速 */
    this.speed *= 0.9;


  }
  receive_attack(x, y, angle, damage, ball_uuid, attacker) {
    attacker.destory_fireball(ball_uuid)
    this.x = x
    this.y = y
    this.is_attacked(angle, damage)
  }
  /* 更新冷却时间 */
  update_coldtime() {
    this.fireballs_coldtime -= this.timedelta / 1000;
    this.fireballs_coldtime = Math.max(this.fireballs_coldtime, 0);

    this.blink_coldtime -= this.timedelta / 1000
    this.blink_coldtime = Math.max(this.blink_coldtime, 0);
  }
  update_move() {/* 更新玩家移动 */
    if (this.character === "robot" && this.spent_time > 2 && Math.random() < 1 / 250.0) {
      /* 都攻击自己 */
      let player = this.Playground.players[0]
      //let player = this.Playground.players[Math.floor(Math.random()*this.Playground.players.length)]
      let tx = player.x + player.speed * this.vx
      this.shoot_fireball(player.x, player.y)

    }

    if (this.damage_speed > this.eps) {
      this.vx = this.vy = 0
      this.move_length = 0
      this.x += this.damage_x * this.damage_speed * this.timedelta / 1000
      this.y += this.damage_y * this.damage_speed * this.timedelta / 1000
      this.damage_speed *= this.friction
    } else {
      /* 需不需要移动 */
      if (this.move_length < this.eps) {
        this.move_length = 0
        this.vx = this.vy = 0

        /* 如果是AI */
        if (this.character === "robot") {
          let tx = Math.random() * this.Playground.width / this.Playground.scale
          let ty = Math.random() * this.Playground.height / this.Playground.scale
          this.move_to(tx, ty)
        }
      } else {
        /* 真实移动的距离 */
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
        this.x += this.vx * moved
        this.y += this.vy * moved
        this.move_length -= moved
      }
    }
  }


  update() {
    this.spent_time += this.timedelta / 1000
    if (this.character === "me" && this.Playground.state === "fighting") {
      this.update_coldtime()
    }
    this.update_move()
    this.render()
  }
  on_destory() {
    if (this.character === "me")
    {
      this.Playground.state = "over"
    }
    for (let i = 0; i < this.Playground.players.length; i++) {
      if (this.Playground.players[i] === this) {
        this.Playground.players.splice(i, 1)
        break;
      }
    }
  }

  /* 渲染技能冷却图片 */
  render_skill_coldtime() {
    let scale = this.Playground.scale
    let x = 1.5, y = 0.9, r = 0.04
    /* 渲染图片 */
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
    this.ctx.stroke();
    this.ctx.clip();
    this.ctx.drawImage(this.fireballs_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
    this.ctx.restore();

    if (this.fireballs_coldtime > 0) {
      /* 渲染蒙版 圆 */
      this.ctx.beginPath()
      this.ctx.moveTo(x * scale, y * scale)

      this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (this.fireballs_coldtime / 0.5) - Math.PI / 2, false)

      this.ctx.lineTo(x * scale, y * scale)
      this.ctx.fillStyle = "rgba(0,0,255,0.6)"
      this.ctx.fill()
    }

  /* -------- */
    x = 1.62,y=0.9,r=0.04
    /* 渲染图片 */
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
    this.ctx.stroke();
    this.ctx.clip();
    this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
    this.ctx.restore();

    if (this.blink_coldtime > 0) {
      /* 渲染蒙版 圆 */
      this.ctx.beginPath()
      this.ctx.moveTo(x * scale, y * scale)

      this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (this.blink_coldtime / 5) - Math.PI / 2, false)

      this.ctx.lineTo(x * scale, y * scale)
      this.ctx.fillStyle = "rgba(0,0,255,0.6)"
      this.ctx.fill()
    }



  }
  render() {
    let scale = this.Playground.scale
    if (this.character !== "robot") {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
      this.ctx.stroke();
      this.ctx.clip();
      this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
      this.ctx.restore();
    } else {
      this.ctx.beginPath()
      this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false)
      this.ctx.fillStyle = this.color
      this.ctx.fill()
    }
    if (this.character === "me" && this.Playground.state === "fighting") {
      this.render_skill_coldtime()
    }

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
    this.eps = 0.01
  }

  start() {

  }
  update() {
    if (this.move_length < this.eps) {
      this.destory()
      return false
    }
    this.update_move()
    if (this.player.character !== "enemy"){
      this.update_attack()
    }    
    
    this.render()
  }

  update_move(){
    let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
    this.x += this.vx * moved
    this.y += this.vy * moved
    this.move_length -= moved
  }
  update_attack(){
    for (let i =0;i<this.Playground.players.length;i++){
      let player = this.Playground.players[i]
      if (this.player!= player && this.is_collision(player)){
        this.attack(player)
        break;
      }
    }

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

    if (this.Playground.mode === "multi mode"){
  
      this.Playground.maps.send_attack(player.uuid,player.x,player.y,angel,this.damage,this.uuid)
    }
    this.destory()
  }

  render() {
    let scale = this.Playground.scale
    /* canvas绘制火球 */
    this.ctx.beginPath()
    this.ctx.arc(this.x * scale, this.y* scale, this.radius* scale, 0, Math.PI * 2, false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }

  on_destory()
  {
    let fireballs = this.player.fireballs
    for (let i=0;i<fireballs.length;i++){
      if(fireballs[i] === this){
        fireballs.splice(i,1)
        break
      }
    }
  }
}class MultiPlayerSocket {
  constructor(playground) {
    this.playground = playground

    this.ws = new WebSocket("wss://app819.acapp.acwing.com.cn/wss/multiplayer/")
    console.log(this.ws);
    this.start()
  }
  start(){
    this.receive()
  }

  /* 从前端接收信息 */
  receive() {
    let outer = this
    this.ws.onmessage = function(e) {
      let data = JSON.parse(e.data);
      let uuid = data.uuid
      if (uuid === outer.uuid) return false;

      let event = data.event
      if(event === "create_player"){
        outer.receive_create_player(uuid,data.username,data.photo)
      }else if (event === "move_to") {
        outer.receive_move_to(uuid,data.tx,data.ty)
      }else if (event === "shoot_fireball"){
        outer.receive_shoot_fireball(uuid,data.tx,data.ty,data.ball_uuid)
      }else if (event === "attack") {
        outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
      }else if (event === "blink") {
        outer.receive_blink(uuid,data.tx,data.ty)
      }

    }
  }
  send_create_player(username,photo){
    let outer = this
    
    this.ws.send(JSON.stringify({
      'event':"create_player",
      'uuid':outer.uuid,
      'username':username,
      'photo':photo
    }))
  }
  receive_create_player(uuid,username,photo){

    let player = new Player(
      this.playground,
      this.playground.width/2/this.playground.scale,
      0.5,0.05,"white",0.15,"enemy",username,photo
    )

    player.uuid = uuid
    console.log(uuid);
    this.playground.players.push(player)
  }

  get_player(uuid) {
    let players = this.playground.players; //寻找玩家
    for (let i=0;i<players.length;i++)
    {
      let player = players[i]
      if (player.uuid === uuid)
        return player
    }
    return null
  }
  send_move_to (tx,ty) {
    let outer = this
    this.ws.send(JSON.stringify({
      'event':"move_to",
      'uuid':outer.uuid,
      'tx':tx,
      'ty':ty,
    }))
  }

  receive_move_to(uuid,tx,ty){
    let player = this.get_player(uuid)

    if (player){
      player.move_to(tx,ty);
    }
  }

  send_shoot_fireball(tx,ty,ball_uuid)
  {
    let outer = this

    this.ws.send(JSON.stringify({
      'event':"shoot_fireball",
      'uuid':outer.uuid,
      'tx':tx,
      'ty':ty,
      'ball_uuid':ball_uuid,
    }))
  }

  receive_shoot_fireball(uuid,tx,ty,ball_uuid)
  {
    let player = this.get_player(uuid)
    if (player)
    {
      let fireball = player.shoot_fireball(tx,ty)
      fireball.uuid = ball_uuid
    }
  }

  send_attack(attackee_uuid,x,y,angle,damage,ball_uuid){
    let outer = this
    this.ws.send(JSON.stringify({
      'event':"attack",
      'uuid':outer.uuid,
      'attackee_uuid':attackee_uuid,
      'x':x,
      'y':y,
      'angle':angle,
      'damage':damage,
      'ball_uuid':ball_uuid
    }))
  }
  receive_attack(uuid,attackee_uuid,x,y,angle,damage,ball_uuid){
    let attacker = this.get_player(uuid)
    let attackee = this.get_player(attackee_uuid)
    
    if (attackee && attacker){
      attackee.receive_attack(x,y,angle,damage,ball_uuid,attacker)
    }
  }

  send_blink(tx,ty) {
    let outer = this
    this.ws.send(JSON.stringify({
      'event':"blink",
      'uuid':outer.uuid,
      'tx':tx,
      'ty':ty,
    }))
  }

  receive_blink(uuid,tx,ty){
    let player = this.get_player(uuid)
    if (player){
      player.blink(tx,ty)
    }
  }
}/* playground base */

class AcGamePlayground {
  constructor(root) {
    this.root = root
    this.$playground = $(`<div class="ac-game-playground"></div>`)
    /* 打开后再加载高度  */
    this.root.$ac_game.append(this.$playground)
    this.start()
  }
  /* 随机获取颜色 */
  get_random_color() {
    let colors = ["blue", "pink", "red", "orange", "green", "grey"]
    return colors[Math.floor(Math.random() * 5)]
  }
  start() {
    let outer = this
    this.hide()

    $(window).resize(function () {
      outer.resize()
    })
  }

  resize() {
    this.width = this.$playground.width()
    this.height = this.$playground.height()
    let unit = Math.min(this.width / 16, this.height / 9)
    this.width = unit * 16
    this.height = unit * 9
    this.scale = this.height

    if (this.game_map) this.game_map.resize()
  }
  show(mode) { /* 打开playground界面 */
    let outer = this
    outer.resize()
    this.$playground.show()
    


    this.width = this.$playground.width() /* 存放宽度高度数据 */
    this.height = this.$playground.height()

    /* 地图类 */
    this.game_map = new GameMap(this)

    this.mode = mode

    /* 玩家状态 提示文本 */
    this.state = "waiting"
    this.notice_board = new NoticeBoard(this)
    this.player_count = 0;
    /* 玩家类 */
    this.players = []
    this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me",this.root.settings.username,this.root.settings.photo))

    if (mode === "single mode") {
      /* 创建NPC */
      for (let i = 0; i < 5; i++) {
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"))
      }
    } else if (mode === "multi mode") {
      this.maps = new MultiPlayerSocket(this)
      this.maps.uuid = this.players[0].uuid
      this.maps.ws.onopen = function (){
        outer.maps.send_create_player(outer.root.settings.username,outer.root.settings.photo)
      }
    }

  } 
  hide() { /* 关闭playground界面 */
    this.$playground.hide()
  }
}class Settings {
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
          console.log(resp);
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
}export class AcGame{
  constructor(id,AcWingOS){
    this.id = id
    this.$ac_game = $('#'+id)
    this.AcWingOS = AcWingOS
    
    this.settings = new Settings(this)
    
    this.menu = new AcGameMenu(this)  
    this.playground = new AcGamePlayground(this)
    

    this.start()
  }

  start(){
    
    this.playground.hide() 

  }
}