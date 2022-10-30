export class AcGame{
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