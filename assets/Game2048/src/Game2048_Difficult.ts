import Game2048_Game from "./Game2048_Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game2048_Difficult extends cc.Component {

    difficultCallback(event, customData) {
        let difficult = Number(customData);
        Game2048_Game.GameDifficult = difficult;
        cc.director.loadScene('Game2048_Game');
    }
}