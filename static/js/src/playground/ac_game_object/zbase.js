
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

