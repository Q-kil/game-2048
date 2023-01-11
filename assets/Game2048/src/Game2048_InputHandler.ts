interface InputOption {
    target: cc.Node;
    onKeyUp: (dir: string) => void;
}


export default class Game2048_InputHandler {
    private _inputToggle: boolean = false;
    set inputToggle(t: boolean) {
        if (t !== this._inputToggle) {
            t ? this._onEvent() : this._offEvent();
            this._inputToggle = t;
        }
    }
    get inputToggle(): boolean {
        return this._inputToggle;
    }

    option: InputOption = null;

    constructor(option: InputOption) {
        this.option = option;
    }

    private _onEvent() {
        let target = this.option.target;
        target.on("touchstart", this._touchStart, this);
        target.on("touchmove", this._touchMove, this);
        target.on("touchcancel", this._touchEnd, this);
        target.on("touchend", this._touchEnd, this);

        //监听键盘事件
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

    }

    private _offEvent() {
        let target = this.option.target;
        target.off("touchstart", this._touchStart, this);
        target.off("touchmove", this._touchMove, this);
        target.off("touchcancel", this._touchEnd, this);
        target.off("touchend", this._touchEnd, this);

        //监听键盘事件
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _startPosition: cc.Vec2 = null;
    private _touchStart(touch: cc.Touch, event: cc.Event.EventTouch) {
        this._startPosition = touch.getLocation();
    }

    private _touchMove(touch: cc.Touch, event: cc.Event.EventTouch) {
        if (!this._startPosition) return;
        let space = 10;
        let location = touch.getLocation();
        let delta = location.subtract(this._startPosition);
        let lengthSqr = delta.lengthSqr();
        if (lengthSqr >= space * space) {
            let dir = delta;
            if (Math.abs(dir.x) > Math.abs(dir.y)) {        //横向
                if (dir.x > 0) {        //右
                    this.option.onKeyUp && this.option.onKeyUp('RIGHT');
                } else {                  //左
                    this.option.onKeyUp && this.option.onKeyUp('LEFT');
                }
            } else {                      //纵向
                if (dir.y > 0) {          //上
                    this.option.onKeyUp && this.option.onKeyUp('UP');
                } else {                    //下
                    this.option.onKeyUp && this.option.onKeyUp('DOWN')
                }
            }

            this._startPosition = null;
        }
    }
    private _touchEnd(touch: Touch,) {
        this._startPosition = null;
    }

    private _onKeyDown(event: cc.Event.EventKeyboard) {

    }
    private _onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case 87:    //w
            case 38:
                this.option.onKeyUp && this.option.onKeyUp("UP");
                break;
            case 83:    //s
            case 40:
                this.option.onKeyUp && this.option.onKeyUp('DOWN');
                break;
            case 65:    //a
            case 37:
                this.option.onKeyUp && this.option.onKeyUp('LEFT');
                break;
            case 68:    //d
            case 39:
                this.option.onKeyUp && this.option.onKeyUp('RIGHT');
                break;
        }
    }

    destroy() {
        this._offEvent();
    }
}