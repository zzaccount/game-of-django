class Player extends AcGameObject {
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
}