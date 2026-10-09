import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
const { ccclass } = _decorator;

@ccclass('ObjectPool')
export class ObjectPool {
    private _prefab: Prefab;
    private _parent: Node;
    private _available: Node[] = [];
    private _active: Set<Node> = new Set();

    constructor(prefab: Prefab, parent: Node, prewarm: number = 10) {
        this._prefab = prefab;
        this._parent = parent;

        // Прогрев пула — создаём заранее, чтобы не было фризов
        for (let i = 0; i < prewarm; i++) {
            const node = instantiate(prefab);
            node.active = false;
            parent.addChild(node);
            this._available.push(node);
        }
    }

    public get(): Node {
        let node = this._available.pop();
        if (!node) {
            // Расширяем пул при нехватке
            node = instantiate(this._prefab);
            this._parent.addChild(node);
        }
        node.active = true;
        this._active.add(node);
        return node;
    }

    public put(node: Node): void {
        if (!this._active.has(node)) return;
        this._active.delete(node);
        node.active = false;
        this._available.push(node);
    }

    public putAll(): void {
        this._active.forEach((node) => {
            node.active = false;
            this._available.push(node);
        });
        this._active.clear();
    }

    public get activeCount(): number {
        return this._active.size;
    }
}