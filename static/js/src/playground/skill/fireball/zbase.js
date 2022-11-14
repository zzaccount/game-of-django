class FireBall extends AcGameObject {
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
    let scale = this.Playground.scale
    /* canvas绘制火球 */
    this.ctx.beginPath()
    this.ctx.arc(this.x * scale, this.y* scale, this.radius* scale, 0, Math.PI * 2, false)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
  }
}