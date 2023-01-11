const { ccclass, property } = cc._decorator;

@ccclass
export default class Game2048_PropButton extends cc.Component {

    private valid: boolean = true;

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Node)
    addButton: cc.Node = null;

    setValid(valid: boolean) {
        this.valid = valid;
        this.node.opacity = valid ? 255 : 100;
    }

    getValid() {
        return this.valid;
    }

    refreshNum(num: number) {
        if (num > 0) {
            this.numLabel.node.active = true;
            this.numLabel.string = num + "";
            this.addButton.active = false;
        } else {
            this.numLabel.node.active = false;
            this.addButton.active = true;
        }
    }


}