/* playground base */

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
}