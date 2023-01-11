// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game2048_Result extends cc.Component {
    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    bestLabel: cc.Label = null;


    show(isWin: boolean, score: number, best: number) {
        this.node.active = true;
        this.title.string = isWin ? '游戏胜利' : "游戏结束";
        this.scoreLabel.string = `本局得分:${score}`;
        this.bestLabel.string = `最高得分:${best}`;
    }

    buttonCallback(event, customData: string) {
        switch (customData) {
            case "back":
                cc.director.loadScene('Game2048_Difficult');
                break;
            case "again":
                cc.director.loadScene('Game2048_Game');
                break;
        }
    }

    // update (dt) {}
}
