//基于cc.NodePool封装的对象池
export default class  MyPool {
    private prefab: cc.Prefab | cc.Node = null;
    private component: any;

    protected pool: cc.NodePool = null;

    constructor(prefab: cc.Prefab | cc.Node, component?: any) {
        this.prefab = prefab;
        if (component) {
            this.component = component;
        }

        this.pool = new cc.NodePool(component);
    }

    create(count: number = 0) {
        let node: any;
        for (let i = 0; i < count; i++) {
            node = cc.instantiate(this.prefab);
            this.pool.put(node);
        }
    }

    size() {
        return this.pool.size();
    }

    get(): any {
        if (this.size() > 0) {
            return this.pool.get();
        }
        let node = cc.instantiate(this.prefab);
        return node;
    }

    put(node) {
        this.pool.put(node);
    }

    clear() {
        this.pool.clear();
    }

    getWithComponent() {
        if (this.component) {
            return this.get().getComponent(this.component);
        }
        return null;
    }
}