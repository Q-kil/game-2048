import { Game2048_Block } from "./Game2048_Block";
import Game2048_GameData from "./Game2048_GameData";
import { Game2048_GameDefine } from "./Game2048_GameDefine";


class LogicBlock {
    number: number;
    col: number;
    row: number;
    previousRC: any;
    constructor(number: number, col: number, row: number) {
        this.number = number;
        this.col = col;
        this.row = row;
    }

    upgrade() {
        this.number++;
    }
    isMerged: boolean = false;

    target: Game2048_Block = null;
}

const MoveDir = {
    UP: cc.v2(0, 1),
    DOWN: cc.v2(0, -1),
    LEFT: cc.v2(-1, 0),
    RIGHT: cc.v2(1, 0)
}

interface RC {
    col: number,
    row: number
}

export default class Game2048_GameLogic {
    gameMap: LogicBlock[][] = [];
    mergeMap: LogicBlock[][] = [];
    originNum: number = 10;
    mapSize: number;
    blockSize: number;
    colNum: number;
    maxNumber: number = 1;
    blockSpace: number;


    private _score: number = 0;
    set score(v: number) {
        this._score = v;
    }
    get score(): number {
        return this._score;
    }

    isOver: boolean = false;

    init(difficult: Game2048_GameDefine.DIFFICULT) {
        let mapSize = Math.min(cc.winSize.width, cc.view.getDesignResolutionSize().width) - 2 * Game2048_GameDefine.SIDE_SPACE;
        let count = difficult == Game2048_GameDefine.DIFFICULT["3x3"] ? 3
            : difficult == Game2048_GameDefine.DIFFICULT['4x4'] ? 4
                : difficult == Game2048_GameDefine.DIFFICULT['5x5'] ? 5
                    : difficult == Game2048_GameDefine.DIFFICULT["6x6"] ? 6
                        : difficult == Game2048_GameDefine.DIFFICULT['8x8'] ? 8 : 0;

        this.blockSpace = Game2048_GameDefine.getBlockSpace(difficult);
        let blockSize = (mapSize - (count + 1) * this.blockSpace) / count;
        this.blockSize = blockSize;
        this.mapSize = mapSize;
        this.colNum = count;
        console.log('--init', blockSize, mapSize, count);
        Game2048_GameData.initDifficult(difficult);
    }

    /**
     * ???????????????
     */
    initMap() {
        this.gameMap = [];
        for (let row = 0; row < this.colNum; row++) {
            this.gameMap[row] = [];
            for (let col = 0; col < this.colNum; col++) {
                this.gameMap[row][col] = null;
            }
        }
    }

    initMergeMap(){
        console.log('** initMergeMap');
        this.mergeMap = [];
        for (let row = 1; row >= 0; row--) {
            this.mergeMap[row] = [];
            for (let col = 0; col < 4; col++) {
                this.mergeMap[row][col] = null;
            }
        }
    }

    /**
     * ????????????????????????
     * @param difficult 
     */
    initWithTemp(difficult: Game2048_GameDefine.DIFFICULT): boolean {
        let haveTemp: boolean = false;
        // let temp = Game2048_GameData.getTempConfig(difficult);
        let temp = null;
        if (temp && temp.cur && temp.cur.length > 0) {
            if (this.gameMap.length === 0) {
                console.log('** gameMap init');
                this.initMap();
            }

            for (let i = 0; i < temp.cur.length; i++) {
                let col = i % this.colNum;
                let row = Math.floor(i / this.colNum);
                let value = temp.cur[i];
                if (value === 0) {
                    this.gameMap[row][col] = null;
                } else {
                    this.gameMap[row][col] = new LogicBlock(value, col, row);
                }
            }
            haveTemp = true;
            this.score = Game2048_GameData.getScore();
        } else {
            this.initMap();
            this.initOriginBlock();
            this.score = 0;
            haveTemp = false;
        }
        this.initMergeMap();
        return haveTemp;
    }

    /**
     * ????????????????????????
     * @param col 
     * @param row 
     * @returns 
     */
    getBlockPosByRC(col: number, row: number) {
        return cc.v3(
            (col + 1) * (this.blockSize + this.blockSpace) - this.blockSize / 2,
            (row + 1) * (this.blockSize + this.blockSpace) - this.blockSize / 2,
        );
    }

    /**
     * ????????????????????????
     * @param pos 
     */
    getRCByPos(pos: cc.Vec2): RC {
        let col = Math.floor((pos.x) / (this.blockSize + this.blockSpace));
        let row = Math.floor((pos.y) / (this.blockSize + this.blockSpace));
        return {
            row, col
        }
    }

    /**
     * ????????????
     */
    checkSide(row: number, col: number) {
        return row >= 0 && row < this.colNum && col >= 0 && col < this.colNum;
    }



    /**
     * ???????????????
     */
    initOriginBlock() {
        for (let i = 0; i < this.originNum; i++) {
            this.addRandomBlock();
        }
    }

    /**
     * ???????????????????????????
     */
    addRandomBlock() {
        let pos = this.getEmptyPos();
        console.log('pos', pos);
        if (pos.length > 0) {
            let value = Math.random() < Game2048_GameDefine.BURN_2_CHANCE ? 1 : 2;
            let randomPos = pos[Math.floor(Math.random() * pos.length)];
            let block = new LogicBlock(value, randomPos.col, randomPos.row);
            this.gameMap[randomPos.row][randomPos.col] = block;
            return block;
        }
        return null;
    }

    /**
     * ?????????????????????
     */
    getEmptyPos(): { col: number, row: number }[] {
        let list = [];
        this._eachBlock((col: number, row: number, block) => {
            if (block == null) {
                list.push({ col: col, row: row });
            }
        });
        return list;
    }

    /**
     * ??????????????????
     */
    addMergeBox(){
        let list = [];
        this._eachMergeBlock((col: number, row: number, block) => {
            if (block == null) {
                list.push({ col: col, row: row });
            }
        });
        console.log('** list', list);
        if (list.length > 0) {
            let value = Math.random() < Game2048_GameDefine.BURN_2_CHANCE ? 1 : 2;
            // let firstPos = list[Math.floor(Math.random() * list.length)];
            let firstPos = list[0];
            let block = new LogicBlock(value, firstPos.col, firstPos.row);
            this.mergeMap[firstPos.row][firstPos.col] = block;
            return block;
        }
        return null;
    }


    /**
     * ?????????
     * @param block 
     * @returns 
     */
    removeBlock(block) {
        this.gameMap[block.row][block.col] = null;
        return block;
    }

    /**
     * ?????????????????????????????????
     * @returns 
     */
    getCanMerge(): boolean {
        for (let col = 0; col < this.colNum; col++) {
            for (let row = 0; row < this.colNum; row++) {
                let block = this.gameMap[row][col];
                if (block) {

                    for (let key in MoveDir) {
                        let dir = MoveDir[key];
                        let nextRc = { col: dir.x + col, row: dir.y + row };
                        let next = this._rcBlock(nextRc);

                        if (next && next.number === block.number) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * ??????
     */
    move(dirStr: string) {
        if (!this._checkCanMove()) {
            this.isOver = true;
            return {
                isOver: this.isOver
            }
        }
        this.isOver = false;

        let dir = MoveDir[dirStr];
        let traversals = this._buideTraversals(dir);
        let moved = false;
        let moveList = [], addList = [], mergeList = [];
        let pos: RC, block: LogicBlock;
        let hasMerge = false;
        traversals.cols.forEach(col => {
            traversals.rows.forEach(row => {
                pos = { col: col, row: row };
                block = this._rcBlock(pos);
                if (block) {
                    let fp = this._findFarhestPostion(pos, dir);
                    let next = this._rcBlock(fp.next);

                    //??????
                    if (next && next.number === block.number && !next.isMerged) {
                        hasMerge = true;
                        //??????
                        moveList.push({
                            block: next,
                            to: { col: next.col, row: next.row },
                            needRemove: true
                        })
                        moveList.push({
                            block: block,
                            to: { col: next.col, row: next.row },
                            needRemove: true
                        })
                        let merged = new LogicBlock(block.number + 1, next.col, next.row);
                        merged.isMerged = true;
                        this.mergeMap[next.row][next.col] = merged;
                        mergeList.push(merged);
                        //??????
                        this.mergeMap[block.row][block.col] = null;

                        //??????
                        this.score += Math.pow(2, merged.number);

                        moved = true;
                    }
                    //??????
                    else {
                        this.mergeMap[block.row][block.col] = null;
                        this.mergeMap[fp.farthest.row][fp.farthest.col] = block;
                        block.col = fp.farthest.col;
                        block.row = fp.farthest.row;
                        if (!this._rcEqual(block, pos)) {
                            moved = true;
                            moveList.push({
                                block: block,
                                to: { col: block.col, row: block.row },
                                needRemove: false,
                            })
                        }
                    }
                }
            })
        });
        for (let merge of mergeList) {
            merge.isMerged = false;
        }

        if (moved) {
            let block = this.addRandomBlock();
            addList.push(block);
        }
        return {
            isOver: this.isOver,
            moved: moved,
            addList: addList,
            mergeList: mergeList,
            moveList: moveList,
            hasMerge: hasMerge
        };
    }

    moveMergeBox(dirStr: string) {
        if (!this._checkCanMove()) {
            this.isOver = true;
            return {
                isOver: this.isOver
            }
        }
        this.isOver = false;

        let dir = MoveDir[dirStr];
        let traversals = this._buideTraversalsMerge(dir);
        let moved = false;
        let moveList = [], addList = [], mergeList = [];
        let pos: RC, block: LogicBlock;
        let hasMerge = false;
        console.log('-- traversals', traversals);
        for (let row = 1; row >= 0; row--) {
            for (let col = 0; col < 4; col++) {
                pos = { col: col, row: row };
                block = this._rcBlockMerge(pos);
                console.log('-- block', block);
                if (block) {
                    let fp = this._findFarhestPostionMerge(pos, dir);
                    console.log('fp', fp);
                    let next = this._rcBlockMerge(fp.next);
                    console.log('next', next);

                    //??????
                    if (next && next.number === block.number && !next.isMerged) {
                        console.log('++ ??????');
                        hasMerge = true;
                        //??????
                        moveList.push({
                            block: next,
                            to: { col: next.col, row: next.row },
                            needRemove: true
                        })
                        moveList.push({
                            block: block,
                            to: { col: next.col, row: next.row },
                            needRemove: true
                        })
                        let merged = new LogicBlock(block.number + 1, next.col, next.row);
                        merged.isMerged = true;
                        this.mergeMap[next.row][next.col] = merged;
                        console.log('++ merged', merged);
                        mergeList.push(merged);
                        //??????
                        this.mergeMap[block.row][block.col] = null;

                        //??????
                        this.score += Math.pow(2, merged.number);
                        console.log('++ score', this.score);

                        moved = true;
                    }
                    //??????
                    else {
                        console.log('++ ??????');
                        this.mergeMap[block.row][block.col] = null;
                        this.mergeMap[fp.farthest.row][fp.farthest.col] = block;
                        block.col = fp.farthest.col;
                        block.row = fp.farthest.row;
                        if (!this._rcEqual(block, pos)) {
                            moved = true;
                            moveList.push({
                                block: block,
                                to: { col: block.col, row: block.row },
                                needRemove: false,
                            })
                        }
                    }
                }
            }
        }

        for (let merge of mergeList) {
            merge.isMerged = false;
        }

        if (moved) {
            // let block = this.addMergeBox();
            // addList.push(block);
        }
        return {
            isOver: this.isOver,
            moved: moved,
            addList: addList,
            mergeList: mergeList,
            moveList: moveList,
            hasMerge: hasMerge
        };
    }

    /**
    * ??????
    */
    levelUp(block: LogicBlock) {
        block.upgrade();
        this.score += Math.pow(2, block.number)
    }

    logMap() {
        // let str = '';
        // for (let row = this.mapRow - 1; row >= 0; row--) {
        //     str += '\n';
        //     for (let col = 0; col < this.mapCol; col++) {
        //         let block = this.gameMap[col][row];
        //         if (block == null) {
        //             str += '0 ';
        //         } else {
        //             str += block.number + ' ';
        //         }
        //     }
        // }
        // console.log(str);

        //??????
        let idList = [];
        for (let row = 0; row < this.colNum; row++) {
            for (let col = 0; col < this.colNum; col++) {
                let block = this.gameMap[row][col];
                if (block === null) {
                    idList.push(0);
                } else {
                    idList.push(block.number);
                    if (block.number > this.maxNumber) {
                        this.maxNumber = block.number;
                    }
                }
            }
        }
        Game2048_GameData.saveTempConfig(idList, this.score);
    }

    checkMaxNumber() {
        for (let row = 0; row < this.colNum; row++) {
            for (let col = 0; col < this.colNum; col++) {
                let block = this.gameMap[row][col];
                if (block === null) {
                } else {
                    if (block.number > this.maxNumber) {
                        this.maxNumber = block.number;
                    }
                }
            }
        }
    }

    /**
     * ????????????????????????2??????
     */
    brushMap() {
        let removeList = [];
        for (let row = 0; row < this.colNum; row++) {
            for (let col = 0; col < this.colNum; col++) {
                let block = this.gameMap[row][col];
                if (block && block.number <= 2) {
                    removeList.push(block);
                    this.gameMap[row][col] = null;
                }
            }
        }
        return removeList;
    }

    private _findFarhestPostion(rc: RC, dir: cc.Vec2): { farthest: RC, next: RC } {
        let previous;
        do {
            previous = rc;
            rc = { col: previous.col + dir.x, row: previous.row + dir.y };
        } while (this._withinBounds(rc) && this._rcEmpty(rc));

        return {
            farthest: previous,
            next: rc,
        }
    }
    private _findFarhestPostionMerge(rc: RC, dir: cc.Vec2): { farthest: RC, next: RC } {
        let previous;
        do {
            previous = rc;
            rc = { col: previous.col + dir.x, row: previous.row + dir.y };
        } while (this._withinBoundsMerge(rc) && this._rcEmptyMerge(rc));

        return {
            farthest: previous,
            next: rc,
        }
    }

    /**
     * ??????????????????????????????
     * @param rc1 
     * @param rc2 
     * @returns 
     */
    private _rcEqual(rc1: RC, rc2: RC) {
        return rc1.col === rc2.col && rc1.row === rc2.row;
    }

    /**
     * ???????????????????????????
     * @param rc 
     * @returns 
     */
    private _rcEmpty(rc: RC): boolean {
        return !this._rcNotEmpty(rc);
    }
    private _rcEmptyMerge(rc: RC): boolean {
        return !this._rcNotEmptyMerge(rc);
    }

    /**
     * ????????????????????????
     * @param rc 
     * @returns 
     */
    private _rcNotEmpty(rc: RC): boolean {
        return !!this._rcBlock(rc);
    }
    private _rcNotEmptyMerge(rc: RC): boolean {
        return !!this._rcBlockMerge(rc);
    }

    private _buideTraversals(dir: cc.Vec2): { cols: number[], rows: number[] } {
        let traversals = { cols: [], rows: [] };
        for (let col = 0; col < this.colNum; col++) {
            traversals.cols.push(col);
        }
        for (let row = 0; row < this.colNum; row++) {
            traversals.rows.push(row);
        }
        if (dir.x === 1) traversals.cols = traversals.cols.reverse();
        if (dir.y === 1) traversals.rows = traversals.rows.reverse();
        return traversals;
    }
    private _buideTraversalsMerge(dir: cc.Vec2): { cols: number[], rows: number[] } {
        let traversals = { cols: [], rows: [] };
        for (let col = 0; col < 4; col++) {
            traversals.cols.push(col);
        }
        for (let row = 0; row < 2; row++) {
            traversals.rows.push(row);
        }
        if (dir.x === 1) traversals.cols = traversals.cols.reverse();
        if (dir.y === 1) traversals.rows = traversals.rows.reverse();
        return traversals;
    }

    /**
     * ??????????????????????????????
     * @returns 
     */
    private _checkCanMove() {
        return this.getEmptyPos().length > 0 || this.getCanMerge();
    }

    /**
     * ????????????????????????
     * @param rc 
     * @returns 
     */
    private _rcBlock(rc: RC): LogicBlock {
        if (this._withinBounds(rc)) {
            return this.gameMap[rc.row][rc.col];
        }
        return null;
    }
    private _rcBlockMerge(rc: RC): LogicBlock {
        if (this._withinBoundsMerge(rc)) {
            return this.mergeMap[rc.row][rc.col];
        }
        return null;
    }

    /**
     * ????????????
     * @param rc 
     * @returns 
     */
    private _withinBounds(rc: RC): boolean {
        return rc.col >= 0 && rc.col < this.colNum &&
            rc.row >= 0 && rc.row < this.colNum;
    }
    private _withinBoundsMerge(rc: RC): boolean {
        return rc.col >= 0 && rc.col < 4 &&
            rc.row >= 0 && rc.row < 2;
    }


    /**
     * ?????????
     * @param callback 
     */
    private _eachBlock(callback: (col: number, row: number, block: LogicBlock) => void) {
        for (let row = 0; row < this.colNum; row++) {
            for (let col = 0; col < this.colNum; col++) {
                callback(col, row, this.gameMap[row][col]);
            }
        }
    }
    private _eachMergeBlock(callback: (col: number, row: number, block: LogicBlock) => void) {
        for (let row = 1; row >= 0; row--) {
            for (let col = 0; col < 4; col++) {
                callback(col, row, this.mergeMap[row][col]);
            }
        }
    }
}