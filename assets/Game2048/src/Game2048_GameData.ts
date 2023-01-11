import { Game2048_GameDefine } from "./Game2048_GameDefine";


interface TempConfig {
    score: number;
    best: number;
    cur: number[];
    history: number[][];
}

export class Game2048_GameHandler {
    private _tempConfig: { [difficult: string]: TempConfig } = null;
    get tempConfig() {
        if (!this._tempConfig) {
            let storage = localStorage.getItem('tempConfig');
            if (storage == null || storage == undefined || storage == "") {
                return {};
            }
            this._tempConfig = JSON.parse(storage);
        }
        return this._tempConfig;
    }
    set tempConfig(v) {
        this._tempConfig = v;
        localStorage.setItem("tempConfig", JSON.stringify(v))
    }

    private _prop1Num: number;
    get prop1Num() {
        if (this._prop1Num == undefined) {
            let storage = localStorage.getItem('prop1Num');
            if (storage == null || storage == undefined || storage == "") {
                return 1;
            }
            this._prop1Num = Number(storage);
        }
        return this._prop1Num;
    }
    set prop1Num(v) {
        this._prop1Num = v;
        localStorage.setItem('prop1Num', String(v));
    }

    private _prop2Num: number;
    get prop2Num() {
        if (this._prop2Num == undefined) {
            let storage = localStorage.getItem('prop2Num');
            if (storage == null || storage == undefined || storage == "") {
                return 1;
            }
            this._prop2Num = Number(storage);
        }
        return this._prop2Num;
    }
    set prop2Num(v) {
        this._prop2Num = v;
        localStorage.setItem('prop2Num', String(v));
    }

    private _prop3Num: number;
    get prop3Num() {
        if (this._prop3Num == undefined) {
            let storage = localStorage.getItem('prop3Num');
            if (storage == null || storage == undefined || storage == "") {
                return 3;
            }
            this._prop3Num = Number(storage);
        }
        return this._prop3Num;
    }
    set prop3Num(v) {
        this._prop3Num = v;
        localStorage.setItem('prop3Num', String(v));
    }

    private _prop4Num: number;
    get prop4Num() {
        if (this._prop4Num == undefined) {
            let storage = localStorage.getItem('prop4Num');
            if (storage == null || storage == undefined || storage == "") {
                return 4;
            }
            this._prop4Num = Number(storage);
        }
        return this._prop4Num;
    }
    set prop4Num(v) {
        this._prop4Num = v;
        localStorage.setItem('prop4Num', String(v));
    }
    curDifficult: Game2048_GameDefine.DIFFICULT;


    initDifficult(diff: Game2048_GameDefine.DIFFICULT) {
        this.curDifficult = diff;
    }

    /**
     * 返回是否还有历史步数
     * @returns 
     */
    checkHasHistoryTemp(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        if (difficult in this.tempConfig == false) {
            return false;
        }
        let { history } = this.tempConfig[difficult];
        if (history.length > 0) return true;
        return false;
    }

    /**
     * 保存当前及历史步数
     * @param levelId 
     * @param levelLv 
     * @param idList 
     * @param saveLast 
     */
    saveTempConfig(idList: number[], score: number, difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let tempConfig = this.tempConfig;
        if (difficult in this.tempConfig == false) {
            tempConfig[difficult] = {
                cur: [],
                history: [],
                score: score,
                best: score,
            }
        }
        let { cur, history } = tempConfig[difficult];
        if (history.length > 10) {
            history.shift();
        }
        history.push(cur);

        tempConfig[difficult].history = history;
        tempConfig[difficult].cur = idList;
        tempConfig[difficult].score = score;
        if (score > tempConfig[difficult].best) {
            tempConfig[difficult].best = score;
        }
        this.tempConfig = tempConfig;
    }

    /**
     * 清空步数信息
     * @param difficult 
     */
    clearTempConfig(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let tempConfig = this.tempConfig;
        tempConfig[difficult] = {
            cur: [],
            history: [],
            score: 0,
            best: tempConfig[difficult].best
        }
        this.tempConfig = tempConfig;
    }

    /**
     * 获得步数信息
     * @param difficult 
     * @returns 
     */
    getTempConfig(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        if (this.tempConfig && difficult in this.tempConfig) {
            return this.tempConfig[difficult];
        }
        return null
    }


    getScore(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let config = this.getTempConfig(difficult)
        if (config) {
            return config.score || 0;
        }
        return 0;
    }

    getBest(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let config = this.getTempConfig(difficult)
        if (config) {
            return config.best || 0;
        }
        return 0;
    }

    /**
     * 返回上一步
     * @param difficult 
     * @returns 
     */
    getPreviousStep(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult): number[] {
        if (!this.tempConfig) return null;
        if (difficult in this.tempConfig == false) {
            return null;
        }
        let { history } = this.tempConfig[difficult];
        if (history.length > 0) {
            return history[history.length - 1];
        }
        return null;
    }

    /**
     * 返回大于number和小与等于number的列表
     * @param number 
     * @returns 
     */
    getMoreThanArr(number: number, difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let tempConfig = this.getTempConfig(difficult);
        if (tempConfig) {
            let idList = tempConfig.cur;
            let list = [];
            let smallList = [];
            for (let i = 0; i < idList.length; i++) {
                if (idList[i] > number) {
                    list.push(i);
                } else {
                    if (idList[i] !== 0) {
                        smallList.push(i);
                    }
                }
            }
            return {
                list, smallList
            };
        }
        return {
            list: [],
            smallList: []
        };
    }

    /**
     * 保存上一步
     */
    saveByPrevious(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let history = this.getTempConfig(difficult)!.history;
        if (history && history.length > 0) {
            let previous = history.pop();
            let cur = previous;
            let tempConfig = this.tempConfig;
            tempConfig[difficult].history = history;
            tempConfig[difficult].cur = cur;
            this.tempConfig = tempConfig;
        }
    }

    /**
    * 获得当前块数量
    */
    getIdListCount(difficult: Game2048_GameDefine.DIFFICULT = this.curDifficult) {
        let tempConfig = this.getTempConfig();
        if (tempConfig) {
            let idList = tempConfig.cur;
            let count = 0;
            for (let i = 0; i < idList.length; i++) {
                if (idList[i] > 0) {
                    count++;
                }
            }
            return count;
        }
        return 0;
    }

    checkProp1Valid() {
        let lastTemp = this.getPreviousStep();
        if (this.prop1Num > 0 && lastTemp) {
            return { result: true }
        }
        if (this.prop1Num <= 0) {
            return { result: false, type: 1 }
        }
        return { result: false, type: 2 }
    }

    checkProp2Valid() {
        let count = this.getIdListCount();
        if (this.prop2Num > 0 && count > 1) {
            return { result: true }
        }
        if (this.prop2Num <= 0) {
            return { result: false, type: 1 }
        }
        return { result: false, type: 2 }
    }

    checkProp3Valid() {
        let { list, smallList } = this.getMoreThanArr(2);
        if (this.prop3Num > 0 && (list.length > 0 && smallList.length > 0)) {
            return { result: true }
        }
        if (this.prop3Num <= 0) {
            return { result: false, type: 1 }
        }
        return { result: false, type: 2 }
    }

    checkProp4Valid() {
        let count = this.getIdListCount();
        if (this.prop4Num > 0 && count > 0) {
            return { result: true }
        }
        if (this.prop4Num <= 0) {
            return { result: false, type: 1 }
        }
        return { result: false, type: 2 }
    }
}

let Game2048_GameData = (function () {
    return new Game2048_GameHandler();
})()
export default Game2048_GameData;