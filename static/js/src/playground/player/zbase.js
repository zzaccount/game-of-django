class Player extends AcGameObject{
  constructor(Playground,x,y,radius,color,speed,character,username,photo){
    console.log(character,username,photo);
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
    this.character = character
    this.username = username
    this.photo = photo
    this.eps = 0.01
    /* 摩擦力 */
    this.friction = 0.9

    this.spent_time = 0

    this.cur_skill = null;
    if (this.character !== "robot"){
      this.img = new Image();
      this.img.src = this.photo
    }
   
    this.start()
  }

  start(){
    if (this.character === "me"){
      this.add_listening_events()
    }else if (this.character === "robot"){
      let tx = Math.random() * this.Playground.width/this.Playground.scale
      let ty = Math.random() * this.Playground.height/this.Playground.scale
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
      const rect = outer.ctx.canvas.getBoundingClientRect()

      if (e.which === 3){
        //取得右键单击 的XY 坐标
        outer.move_to((e.clientX-rect.left)/outer.Playground.scale,(e.clientY-rect.top)/outer.Playground.scale)

      }else if (e.which === 1){ /* 如果鼠标左键被点击 */
        if(outer.cur_skill === "fireball"){
          outer.shoot_fireball((e.clientX-rect.left)/outer.Playground.scale,(e.clientY-rect.top)/outer.Playground.scale)
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
    let radius = 0.01
    let angle = Math.atan2(ty-this.y,tx-this.x)
    let vx = Math.cos(angle),vy = Math.sin(angle)
    let color = "orange"
    let speed = 0.5
    let move_length = 1
    new FireBall (this.Playground,this,this.x,this.y,radius,vx,vy,color,speed,move_length,0.01)
    
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
    
    if (this.radius < this.eps) {
      this.destory()
      return false
    }

    this.damage_x = Math.cos(angle)
    this.damage_y = Math.sin(angle)
    this.damage_speed = damage *80

    /* 变小减速 */
    this.speed *= 0.9;

   
  }

  update_move(){/* 更新玩家移动 */
    this.spent_time += this.timedelta/1000
    if(this.character === "robot"&&this.spent_time > 2 && Math.random()<1/250.0){
      /* 都攻击自己 */
      let player = this.Playground.players[0]
      //let player = this.Playground.players[Math.floor(Math.random()*this.Playground.players.length)]
      let tx = player.x + player.speed * this.vx 
      this.shoot_fireball(player.x,player.y)
      
    }

    if (this.damage_speed>this.eps){
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
        if(this.character === "robot"){
          let tx = Math.random() * this.Playground.width / this.Playground.scale
          let ty = Math.random() * this.Playground.height / this.Playground.scale
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
  }
  
  update(){
    this.update_move()
    this.render()
  }
  on_destory(){
    for(let i =0;i<this.Playground.players.length;i++){
      if (this.Playground.players[i] === this){
        this.Playground.players.splice(i,1)
        
      }
    }
  }
  render(){
    let scale = this.Playground.scale
    if (this.character !== "robot"){
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.x * scale, this.y *scale, this.radius *scale, 0, Math.PI * 2, false);
      this.ctx.stroke();
      this.ctx.clip();
      this.ctx.drawImage(this.img, (this.x - this.radius)*scale, (this.y - this.radius)*scale, this.radius * 2*scale, this.radius * 2*scale); 
      this.ctx.restore();
    }else{
      this.ctx.beginPath()
      this.ctx.arc(this.x *scale,this.y*scale,this.radius*scale,0,Math.PI*2,false)
      this.ctx.fillStyle = this.color
      this.ctx.fill()
    }
    
  }
}