import { _decorator, Component, Vec3, Node } from 'cc';
import {InputController} from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ tooltip: 'Скорость движения м/с' })
    public moveSpeed: number = 5.0;

    @property({ tooltip: 'Скорость поворота (рад/сек)' })
    public turnSpeed: number = 8.0;

    @property({ tooltip: 'Ограничить движение рамками арены' })
    public useArenaBounds: boolean = true;

    @property({ tooltip: 'Половина размера арены (X, Z)' })
    public arenaHalfSize: number = 10;

    // Кэшированные векторы — аллокаций в update нет
    private _moveDir = new Vec3();
    private _tmpPos = new Vec3();
    private _targetQuat = new (require('cc').Quat)();
    private _input: InputController = null!;

    start() {
        this._input = InputController.instance;
    }

    update(dt: number) {
        const input = this._input;

        // Считываем ввод (WASD или стрелки)
        let x = 0, z = 0;
        if (input.isKeyPressed(87 /* W */) || input.isKeyPressed(38)) z -= 1; // Вперёд
        if (input.isKeyPressed(83 /* S */) || input.isKeyPressed(40)) z += 1; // Назад
        if (input.isKeyPressed(65 /* A */) || input.isKeyPressed(37)) x -= 1; // Влево
        if (input.isKeyPressed(68 /* D */) || input.isKeyPressed(39)) x += 1; // Вправо

        if (x === 0 && z === 0) return;

        // Нормализация, чтобы диагональ не была быстрее
        this._moveDir.set(x, 0, z);
        if (this._moveDir.lengthSqr() > 1) {
            this._moveDir.normalize();
        }

        // Перемещение
        this._tmpPos.set(this.node.worldPosition);
        this._tmpPos.x += this._moveDir.x * this.moveSpeed * dt;
        this._tmpPos.z += this._moveDir.z * this.moveSpeed * dt;

        // Ограничение ареной
        if (this.useArenaBounds) {
            const h = this.arenaHalfSize;
            if (this._tmpPos.x < -h) this._tmpPos.x = -h;
            if (this._tmpPos.x > h) this._tmpPos.x = h;
            if (this._tmpPos.z < -h) this._tmpPos.z = -h;
            if (this._tmpPos.z > h) this._tmpPos.z = h;
        }

        this.node.setWorldPosition(this._tmpPos);

        // Плавный поворот в сторону движения
        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        const currentAngle = this.node.eulerAngles.y * Math.PI / 180;
        const smoothed = this._lerpAngle(currentAngle, targetAngle, this.turnSpeed * dt);
        this.node.setRotationFromEuler(0, smoothed * 180 / Math.PI, 0);
    }

    /** Плавная интерполяция угла с учётом перехода через 360° */
    private _lerpAngle(a: number, b: number, t: number): number {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * Math.min(t, 1);
    }
}