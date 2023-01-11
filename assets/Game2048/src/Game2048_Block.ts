import { Game2048_GameDefine } from "./Game2048_GameDefine";

const { ccclass, property } = cc._decorator;
@ccclass
export class Game2048_Block extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Node)
    colorNode: cc.Node = null;

    follow: any = null;
    private _mScale: cc.Vec3 = null;
    private _mPos: cc.Vec3 = null;

    originScale: number = 1;

    setScore(score: number) {
        if (score > 0) {
            this.scoreLabel.node.active = true;
            this.scoreLabel.string = String(Math.pow(2, score));
        } else {
            this.scoreLabel.node.active = false;
        }
        this.colorNode.color = Game2048_GameDefine.TILE_COLOR[score];
    }

    resize(size: number) {
        this.node.scale = size / 300;
        this.originScale = this.node.scale;
    }

    onShow() {
        //动画
        let originScale = this.originScale;
        this.node.scale = 0;
        this.node.zIndex = 0;
        cc.tween(this.node)
            .to(.1, { scale: originScale })
            .call(() => {
                if (cc.isValid(this.node)) {
                    this.node.setScale(originScale);
                }
            })
            .start()
    }

    onMerge() {
        let originScale = this.originScale;
        let targetScale = this.originScale * 1.1;
        this.node.scale = originScale;
        cc.tween(this.node)
            .to(.05, { scale: targetScale })
            .to(.05, { scale: originScale })
            .call(() => {
                this.node.setScale(originScale);
            })
            .start()
    }

    onMove(to: cc.Vec3, onEnd?: any) {
        this._mPos = this.node.position;
        this.node.zIndex = 1;
        cc.tween(this.node)
            .to(.1, { position: to })
            .call(() => {
                this.node.position = to;
                this._mPos = null;
                onEnd && onEnd();
            })
            .start();
    }

    //被销毁
    beDestroy(onDestroy?: () => void) {
        cc.tween(this.node)
            .to(.2, { scale: 0 }, { easing: "backIn" })
            .call(() => {
                onDestroy && onDestroy();
            })
            .start();
    }

}