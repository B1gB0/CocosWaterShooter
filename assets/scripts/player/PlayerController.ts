import { _decorator, Component, Vec3, KeyCode, CapsuleCharacterController } from 'cc';
import { InputController } from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property public moveSpeed: number = 5.0;
    @property public turnSpeed: number = 8.0;
    @property public arenaHalfSize: number = 10;

    private _controller: CapsuleCharacterController = null!;
    private _input: InputController = null!;
    private _moveDir = new Vec3();
    private _tmpMove = new Vec3();
    private _verticalVel: number = 0;

    start() {
        this._controller = this.getComponent(CapsuleCharacterController)!;
        this._input = InputController.instance;
    }

    update(dt: number) {
        const input = this._input;

        let x = 0, z = 0;
        if (input.isKeyPressed(KeyCode.KEY_W)) z -= 1;
        if (input.isKeyPressed(KeyCode.KEY_S)) z += 1;
        if (input.isKeyPressed(KeyCode.KEY_A)) x -= 1;
        if (input.isKeyPressed(KeyCode.KEY_D)) x += 1;

        if (x === 0 && z === 0) return;

        this._moveDir.set(x, 0, z);
        if (this._moveDir.lengthSqr() > 1) this._moveDir.normalize();

        // Гравитация вручную (CharacterController не считает её сам)
        this._verticalVel -= 20 * dt;

        // Вектор движения за кадр
        this._tmpMove.set(
            this._moveDir.x * this.moveSpeed * dt,
            this._verticalVel * dt,
            this._moveDir.z * this.moveSpeed * dt
        );

        // ВОТ ЭТО — ключевое. move() сам обработает коллизии и скольжение
        this._controller.move(this._tmpMove);

        // Сброс вертикальной скорости, если на земле
        if (this._controller.isGrounded) {
            this._verticalVel = 0;
        }

        // Поворот персонажа
        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        const currentAngle = this.node.eulerAngles.y * Math.PI / 180;
        const smoothed = this._lerpAngle(currentAngle, targetAngle, this.turnSpeed * dt);
        this.node.setRotationFromEuler(0, smoothed * 180 / Math.PI, 0);
    }

    private _lerpAngle(a: number, b: number, t: number): number {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * Math.min(t, 1);
    }
}