import ToastBase from "../../resources/libs/toast/ToastBase";
import Game2048_GameData from "./Game2048_GameData";
import { Game2048_Instance } from "./Game2048_Instance";
import Game2048_PropButton from "./Game2048_PropButton";
import Game2048_Result from "./Game2048_Result";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game2048_GameUI extends cc.Component {
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    bestLabel: cc.Label = null;

    @property(Game2048_PropButton)
    prop1Button: Game2048_PropButton = null;

    @property(Game2048_PropButton)
    prop2Button: Game2048_PropButton = null;

    @property(Game2048_PropButton)
    prop3Button: Game2048_PropButton = null;

    @property(Game2048_PropButton)
    prop4Button: Game2048_PropButton = null;

    @property(cc.Node)
    chooseBoard: cc.Node = null;

    @property(cc.Label)
    chooseTipsLabel: cc.Label = null;

    @property(Game2048_Result)
    result: Game2048_Result = null;




    start() {

        this.refreshAllPropButton();
    }

    refreshScoreLabel(number: number) {
        if (number == 0) {
            this.scoreLabel.string = 0 + ""
            return;
        }
        this.scoreLabel.string = number + "";
    }
    refrshBestLabel(number: number) {
        if (number == 0) {
            this.bestLabel.string = 0 + ""
            return;
        }
        this.bestLabel.string = number + "";
    }

    refreshProp1Button() {
        this.prop1Button.refreshNum(Game2048_GameData.prop1Num);
        let result = Game2048_GameData.checkProp1Valid().result;
        this.prop1Button.setValid(result);
    }
    refreshProp2Button() {
        this.prop2Button.refreshNum(Game2048_GameData.prop2Num);
        let result = Game2048_GameData.checkProp2Valid().result;
        this.prop2Button.setValid(result);
    }
    refreshProp3Button() {
        this.prop3Button.refreshNum(Game2048_GameData.prop3Num);
        let result = Game2048_GameData.checkProp3Valid().result;
        this.prop3Button.setValid(result);
    }
    refreshProp4Button() {
        this.prop4Button.refreshNum(Game2048_GameData.prop4Num);
        let result = Game2048_GameData.checkProp4Valid().result;
        this.prop4Button.setValid(result);
    }

    refreshAllPropButton() {
        this.refreshProp1Button();
        this.refreshProp2Button();
        this.refreshProp3Button();
        this.refreshProp4Button();
    }

    private _boardTouch: (touch: cc.Event.EventTouch) => void;
    showChooseBoard(tips: string, onTouch: (touch: cc.Event.EventTouch) => void) {
        this.chooseBoard.active = true;
        this.chooseTipsLabel.string = tips;
        this._boardTouch = onTouch;
        this.chooseBoard.on('touchend', this.touchChooseBoard, this);
    }
    hideChooseBoard() {
        this.chooseBoard.active = false;
        this._boardTouch = null;
        this.chooseBoard.off('touchend', this.touchChooseBoard, this);
    }

    touchChooseBoard(touch: cc.Event.EventTouch) {
        this._boardTouch && this._boardTouch(touch);
    }

    showResult(isWin: boolean, score: number, best: number) {
        this.result.show(isWin, score, best);
    }

    buttonCallback(event, customData: string) {
        switch (customData) {
            case "restart":
                Game2048_Instance.Game.restart();
                break;
            case "quit":
                cc.director.loadScene("Game2048_Difficult");
                break;

            case "cancelChoose":
                this.hideChooseBoard();
                break;

            case "prop1": {
                let valid = Game2048_GameData.checkProp1Valid();
                if (valid.result) {
                    Game2048_GameData.prop1Num--;
                    Game2048_Instance.Game.prop1();
                } else {
                    if (valid.type == 1) {
                        //看视频
                        Game2048_GameData.prop1Num += 5;
                        this.refreshProp1Button();
                        ToastBase.showToast({
                            title: "获得5个撤销"
                        });
                    }
                }
            }
                break;
            case "prop2": {
                let valid = Game2048_GameData.checkProp2Valid();
                if (valid.result) {
                    //出现消除界面
                    Game2048_Instance.Game.prop2();
                } else {
                    if (valid.type == 1) {
                        //看视频
                        Game2048_GameData.prop2Num += 5;
                        this.refreshProp2Button();
                        ToastBase.showToast({
                            title: "获得5个锤子"
                        });
                    }
                }
            }
                break;
            case "prop3": {
                let valid = Game2048_GameData.checkProp3Valid();
                if (valid.result) {
                    Game2048_GameData.prop3Num--;
                    Game2048_Instance.Game.prop3();
                } else {
                    if (valid.type == 1) {
                        //看视频
                        Game2048_GameData.prop3Num += 1;
                        this.refreshProp3Button();
                        ToastBase.showToast({
                            title: "获得1个刷子"
                        });
                    }
                }
            }
                break;
            case "prop4": {
                let valid = Game2048_GameData.checkProp4Valid();
                if (valid.result) {
                    //出现升级界面
                    Game2048_Instance.Game.prop4();
                } else {
                    if (valid.type == 1) {
                        //看视频
                        Game2048_GameData.prop4Num += 1;
                        this.refreshProp4Button();
                        ToastBase.showToast({
                            title: "获得1个魔棒"
                        });
                    }
                }
                break;
            }
        }
    }

}
