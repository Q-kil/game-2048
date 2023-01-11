//toast
const { ccclass, property } = cc._decorator;

@ccclass
export default class ToastBase extends cc.Component {
    private static toastPrefabTemp: cc.Prefab = null;
    private static toastPool: cc.NodePool = new cc.NodePool();

    static create(success?: any, fail?: any) {
        let self = this;
        cc.resources.load('libs/toast/toastNode', cc.Prefab, (err?: any, res?: any) => {
            if (err) {
                console.log('load toast err', err);
                return fail && fail({
                    errMsg: 'Toast 资源加载失败',
                });
            }
            self.toastPrefabTemp = res;
            for (let i = 0; i < 5; i++) {
                let node = cc.instantiate(self.toastPrefabTemp);
                this.toastPool.put(node);
            }
            success && success();
        })
    }

    protected static getToast(success?: any, fail?: any) {
        let node;
        let self = ToastBase;
        if (self.toastPool.size() > 0) {
            node = self.toastPool.get();
            return success && success(node);
        }
        if (self.toastPrefabTemp) {
            node = cc.instantiate(self.toastPrefabTemp);
            return success && success(node);
        }

        cc.resources.load('libs/toast/toastNode', cc.Prefab, (err, res: cc.Prefab) => {
            if (err) {
                console.log('load toast err', err);
                return fail && fail({
                    errMsg: '资源加载失败',
                });
            }
            self.toastPrefabTemp = res;
            node = cc.instantiate(res);
            return success && success(node);
        })
    }

    static showToast({
        title = null,
        duration = 1.5,
        callback = null,
        success = null,
        fail = null,
        complete = null
    }) {
        ToastBase.getToast((res: cc.Node) => {
            let com = res.getComponent(ToastBase);
            cc.director.getScene().addChild(res, 999);
            com.show(title, duration, () => {
                this.toastPool.put(res);
                if (cc.game.isPersistRootNode(res)) {
                    cc.game.removePersistRootNode(res);
                }
                callback && callback();
            });
            if (!cc.game.isPersistRootNode(res)) {
                cc.game.addPersistRootNode(res);
            }
            success && success();
            complete && complete();
        }, () => {
            fail && fail();
            complete && complete();
        });
    }


    @property({
        tooltip: '动画时间'
    })
    waitTime = 1;

    @property(cc.Label)
    toastLabel: cc.Label = null;

    _waitTime = 0;

    _callback: any = null;

    _baseScale: number

    _nodeTween: cc.Tween<any> = null;
    onLoad() {
        let sceneWidthRatio = Math.min(cc.winSize.width / cc.view.getDesignResolutionSize().width, 1);
        let sceneHeightRatio = Math.min(cc.winSize.height / cc.view.getDesignResolutionSize().height, 1);

        this.node.scale = Math.min(sceneWidthRatio, sceneHeightRatio);
    }

    getNodeScale() {
        let sceneWidthRatio = Math.min(cc.winSize.width / cc.view.getDesignResolutionSize().width, 1);
        let sceneHeightRatio = Math.min(cc.winSize.height / cc.view.getDesignResolutionSize().height, 1);
        return Math.min(sceneWidthRatio, sceneHeightRatio);
    }

    show(str: string, time?: number, callback?: any) {
        this._waitTime = time || this.waitTime;
        this.node.active = true;
        this.toastLabel.string = str + '';
        if (this._nodeTween) {
            this._nodeTween.stop();
            this._nodeTween = null;
        }
        this.showAction();
        this._callback = callback;

    }

    hide(callback) {
        this.node.active = false;
        if (callback) {
            this._callback = callback;
        }
        this._callback && this._callback();
    }

    //提示语弹窗效果
    showAction() {
        this._fadeUpShow();
    }





    _fadeUpShow() {
        this.node.opacity = 255;
        let pos = this.node.parent.convertToNodeSpaceAR(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2));
        this.node.y = pos.y;
        let duration = Math.max(this._waitTime - (0.86 + 0.43), 0);

        this._nodeTween = cc.tween(this.node)
            .delay(duration)
            .by(.86, { y: 250 })
            .parallel(
                cc.tween().by(.43, { y: 125 }),
                cc.tween().to(.43, { opacity: 0 })
            )
            .call(() => {
                this.node.active = false;
                this._callback && this._callback();
            })
            .start()
    }


    onDisable() {
        this._nodeTween = null;
        ToastBase.toastPrefabTemp = null;
    }
}
