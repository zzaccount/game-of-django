/* playground base */

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
}