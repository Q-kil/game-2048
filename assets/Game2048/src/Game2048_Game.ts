import MyPool from "./common/MyPool";
import { Game2048_Block } from "./Game2048_Block";
import Game2048_GameData from "./Game2048_GameData";
import { Game2048_GameDefine } from "./Game2048_GameDefine";
import Game2048_GameLogic from "./Game2048_GameLogic";
import Game2048_GameUI from "./Game2048_GameUI";
import Game2048_InputHandler from "./Game2048_InputHandler";
import { Game2048_Instance } from "./Game2048_Instance";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Game2048_Game extends cc.Component {
    static GameDifficult: Game2048_GameDefine.DIFFICULT = Game2048_GameDefine.DIFFICULT["6x6"];
    @property(Game2048_GameUI)
    gameUI: Game2048_GameUI = null;

    @property(cc.Node)
    blockLayer: cc.Node = null;

    @property(cc.Node)
    board: cc.Node = null;

    @property(cc.Node)
    blockBgLayer: cc.Node = null;

    @property(cc.Node)
    merge: cc.Node = null;
    
    @property(cc.Node)
    bgMergeLayer: cc.Node = null;
    
    @property(cc.Node)
    mergeLayer: cc.Node = null;

    @property(cc.Prefab)
    blockPrefab: cc.Prefab = null;

    blockPool: MyPool
    gameLogic: Game2048_GameLogic = null;
    haveTemp: boolean = false;  //是否存在历史对局
    isMove: boolean = false;  //是否是移动状态
    // inputHandler: Game2048_InputHandler = null;

    onLoad() {
        Game2048_Instance.Game = this;
    }

    onDestroy() {
        // this.inputHandler.destroy();
        Game2048_Instance.Game = null;
    }

    start() {

        this.blockPool = new MyPool(this.blockPrefab);
        this.blockPool.create(9);

        // this.inputHandler = new Game2048_InputHandler({
        //     target: this.board,
        //     onKeyUp: (dir: string) => {
        //         if (!this.isMove) {
        //             let obj = this.gameLogic.move(dir);
        //             this.onMapChange(obj);
        //         }
        //     }
        // })
        this.gameLogic = new Game2048_GameLogic();
        this.gameLogic.init(Game2048_Game.GameDifficult);

        this.haveTemp = this.gameLogic.initWithTemp(Game2048_Game.GameDifficult);
        this.board.width = this.board.height = this.gameLogic.mapSize;

        this.createBlockByMap();
        this.checkMap();
        // this.inputHandler.inputToggle = true;
    }

    createBlockByMap() {
        let children = this.blockLayer.children.slice();
        console.log('** children', children);
        let mergeChildren = this.mergeLayer.children.slice();
        console.log('** mergeChildren', mergeChildren);

        for (let i = 0; i < children.length; ++i) {
            this.blockPool.put(children[i]);
        }

        let gl = this.gameLogic;
        for (let row = 0; row < gl.colNum; row++) {
            for (let col = 0; col < gl.colNum; col++) {
                let block = gl.gameMap[row][col];
                if (block !== null) {
                    this.createBlock(block.number, col, row, this.blockLayer);
                }
                this.createBlock(0, col, row, this.blockBgLayer);
            }
        }

        //合并框
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 4; col++) {
                let block = gl.gameMap[row][col];
                this.createBlock(0, col, row, this.bgMergeLayer);
            }
        }
    }

    createBlock(score: number, col: number, row: number, parent: cc.Node, show: boolean = true): Game2048_Block {
        let b: cc.Node = this.blockPool.get();
        parent.addChild(b);
        let pos = this.gameLogic.getBlockPosByRC(col, row);
        b.position = pos;
        let com = b.getComponent(Game2048_Block);
        com.setScore(score);
        com.resize(this.gameLogic.blockSize);
        if (score > 0) {
            this.gameLogic.gameMap[row][col].target = com;
            if (show) {
                com.onShow();
            }
        }
        return com;
    }

    checkMap() {
        if (!this.haveTemp) {
            this.gameLogic.logMap();
        } else {
            this.haveTemp = false;
            this.gameLogic.checkMaxNumber();
        }
        let best = Game2048_GameData.getBest();
        let score = Game2048_GameData.getScore();
        this.gameUI.refreshScoreLabel(score);
        this.gameUI.refrshBestLabel(best);
        this.gameUI.refreshAllPropButton();
        this.checkEnd();
    }

    //检测完成最大目标
    checkEnd() {
        let curNeed = Game2048_GameDefine.TILE_COLOR.length - 1;
        if (this.gameLogic.maxNumber >= curNeed) {
            this.showWin();
        }
    }

    //返回上一步
    prop1() {
        Game2048_GameData.saveByPrevious();
        this.gameLogic.initWithTemp(Game2048_Game.GameDifficult);
        this.createBlockByMap();
        this.gameUI.refreshAllPropButton();
    }

    //锤子
    prop2() {
        // this.inputHandler.inputToggle = false;
        this.gameUI.showChooseBoard('请选择你要移除的方块', (touch: cc.Event.EventTouch) => {
            let location = touch.getLocation();
            let nodePos = this.blockLayer.convertToNodeSpaceAR(location);
            let { row, col } = this.gameLogic.getRCByPos(nodePos);
            console.log(row, col);
            if (!this.gameLogic.checkSide(row, col)) return;
            let block = this.gameLogic.gameMap[row][col];
            if (block) {
                Game2048_GameData.prop2Num--;
                this.gameLogic.removeBlock(block);
                block.target && block.target.beDestroy(() => {
                    this.blockPool.put(block.target.node);

                    this.gameUI.hideChooseBoard();
                    // this.inputHandler.inputToggle = true;
                    this.checkMap();
                });
                this.gameUI.refreshAllPropButton();
            }
        });
    }

    //刷子
    prop3() {
        let removeList = this.gameLogic.brushMap();
        for (let i = 0; i < removeList.length; i++) {
            let block = removeList[i];
            let target: Game2048_Block = block.target;
            target.beDestroy(() => {
                this.blockPool.put(target.node);
            });
        }
        this.checkMap();
        this.gameUI.refreshAllPropButton();
    }
    //魔棒
    prop4() {
        // this.inputHandler.inputToggle = false;
        this.gameUI.showChooseBoard('请选择你要升级的方块', (touch: cc.Event.EventTouch) => {
            let location = touch.getLocation();
            let nodePos = this.blockLayer.convertToNodeSpaceAR(location);
            let { row, col } = this.gameLogic.getRCByPos(nodePos);
            if (!this.gameLogic.checkSide(row, col)) return;
            let block = this.gameLogic.gameMap[row][col];
            if (block) {
                Game2048_GameData.prop4Num--;
                this.levelUp(block);
                this.gameUI.hideChooseBoard();
                // this.inputHandler.inputToggle = true;
                this.checkMap();
                this.gameUI.refreshAllPropButton();
            }
        });
    }

    levelUp(block) {
        this.gameLogic.levelUp(block);
        block.target && (this.blockPool.put(block.target.node));
        let com = this.createBlock(block.number, block.col, block.row, this.blockLayer);
    }

    showFail() {
        let best = Game2048_GameData.getBest();
        let score = Game2048_GameData.getScore();
        this.gameUI.showResult(false, score, best);
        Game2048_GameData.clearTempConfig(Game2048_GameData.curDifficult);
    }
    showWin() {
        let best = Game2048_GameData.getBest();
        let score = Game2048_GameData.getScore();
        this.gameUI.showResult(true, score, best);
        Game2048_GameData.clearTempConfig(Game2048_GameData.curDifficult);
    }

    restart() {
        Game2048_GameData.clearTempConfig(Game2048_GameData.curDifficult);
        this.haveTemp = this.gameLogic.initWithTemp(Game2048_Game.GameDifficult);
        this.createBlockByMap();
        this.checkMap();
    }

    onMapChange(obj) {
        if (obj.isOver) {
            this.showFail();
            return;
        }
        if (obj.moved) {
            this.checkMap();
            this.isMove = true;

            let moveList = obj.moveList;
            let addList = obj.addList;
            let mergeList = obj.mergeList;
            for (let add of addList) {
                let com = this.createBlock(add.number, add.col, add.row, this.blockLayer, false);
                com.node.scale = 0;
            }
            for (let merge of mergeList) {
                let com = this.createBlock(merge.number, merge.col, merge.row, this.blockLayer, false);
                com.node.scale = 0;
            }
            // PPG2_SoundUtils.playSFX('move');

            if (obj.hasMerge) {
                // PPG2_SoundUtils.playSFX('merge');
            }
            let doAdd = () => {
                for (let add of addList) {
                    add.target.onShow();
                }
                for (let merge of mergeList) {
                    merge.target.onMerge();
                }

                this.isMove = false;
            }

            if (moveList.length > 0) {
                let removeList = [];
                let completCount = 0;
                for (let moveObj of moveList) {
                    let block = moveObj.block
                    let target: Game2048_Block = block.target;
                    let pos = this.gameLogic.getBlockPosByRC(moveObj.to.col, moveObj.to.row);

                    target.onMove(pos, () => {
                        if (moveObj.needRemove) {
                            removeList.push(target);
                        }
                        completCount++;
                        if (completCount >= moveList.length) {
                            for (let i = 0; i < removeList.length; i++) {
                                this.blockPool.put(removeList[i].node);
                            }

                            doAdd();
                        }
                    })

                }
            } else {
                doAdd();
            }
        }
    }



}