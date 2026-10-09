import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AimController')
export class AimController extends Component {
    @property({ type: Node, tooltip: 'Точка вылета струи (нода Nozzle внутри шланга)' })
    public nozzle: Node = null!;

    @property({ tooltip: 'Максимальный угол наклона вверх/вниз' })
    public pitchLimit: number = 45;

    @property({ tooltip: 'Реагировать на палец для прицела' })
    public aimWithPointer: boolean = false;

    private _baseYaw: number = 0;
    private _forward = new Vec3(0, 0, -1);
    private _aimDirCache = new Vec3();

    private start() {
        this._baseYaw = this.node.eulerAngles.y;
    }
    
    public getAimDirection(out: Vec3): Vec3 {
        Vec3.transformQuat(out, this._forward, this.node.worldRotation);
        return out;
    }

    public getNozzleWorldPosition(out: Vec3): Vec3 {
        if (!this.nozzle) {
            console.warn('[AimController] Nozzle не назначен, использую позицию AimPivot');
            return this.node.getWorldPosition(out);
        }
        return this.nozzle.getWorldPosition(out);
    }
}