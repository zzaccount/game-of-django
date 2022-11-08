
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
}