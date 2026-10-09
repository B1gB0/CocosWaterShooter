import { _decorator, Component, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('WaterDrop')
export class WaterDrop extends Component {
    public velocity = new Vec3();
    public lifeRemaining: number = 0;
    public gravity: number = -9.8;

    private _tmpPos = new Vec3();
    private _onExpire: ((node: Node) => void) | null = null;

    public launch(pos: Vec3, dir: Vec3, speed: number, life: number, onExpire: (n: Node) => void): void {
        this.node.setWorldPosition(pos);
        this.velocity.set(dir).multiplyScalar(speed);
        this.lifeRemaining = life;
        this._onExpire = onExpire;
    }

    private update(dt: number) {
        if (this.lifeRemaining <= 0) return;

        this.lifeRemaining -= dt;
        this.velocity.y += this.gravity * dt;

        this._tmpPos.set(this.node.worldPosition);
        this._tmpPos.x += this.velocity.x * dt;
        this._tmpPos.y += this.velocity.y * dt;
        this._tmpPos.z += this.velocity.z * dt;
        this.node.setWorldPosition(this._tmpPos);

        if (this.lifeRemaining <= 0 && this._onExpire) {
            this._onExpire(this.node);
        }
    }
}