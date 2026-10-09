import { _decorator, Component, Node, Vec3, Quat } from 'cc';
import {InputController} from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('AimController')
export class AimController extends Component {
    @property({ type: Node, tooltip: 'Точка вылета струи (дуло)' })
    public nozzle: Node = null!;

    @property({ tooltip: 'Максимальный угол поворота вверх/вниз' })
    public pitchLimit: number = 45;

    @property({ tooltip: 'Реагировать на палец для прицела' })
    public aimWithPointer: boolean = false;

    private _input: InputController = null!;
    private _aimDir = new Vec3(0, 0, -1);
    private _baseYaw: number = 0;

    start() {
        this._input = InputController.instance;
        this._baseYaw = this.node.eulerAngles.y;
    }

    update(dt: number) {
        if (this.aimWithPointer) {
            // Горизонтальный прицел через позицию пальца
            const px = this._input.pointer.x;
            const py = this._input.pointer.y;
            const yaw = this._baseYaw + px * 60;
            const pitch = -py * this.pitchLimit;
            this.node.setRotationFromEuler(pitch, yaw, 0);
        }
        // Иначе — прицел совпадает с направлением персонажа (родителя)
    }

    /** Возвращает текущее направление струи (мировое) */
    public getAimDirection(out: Vec3): Vec3 {
        return Vec3.transformQuat(out, new Vec3(0, 0, -1), this.node.worldRotation);
    }

    public getNozzleWorldPosition(out: Vec3): Vec3 {
        return this.nozzle.getWorldPosition(out);
    }
}