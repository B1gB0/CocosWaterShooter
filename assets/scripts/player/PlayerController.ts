import { _decorator, Component, Vec3, KeyCode, CapsuleCharacterController, SkeletalAnimation } from 'cc';
import { InputController } from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property public moveSpeed: number = 5.0;
    @property public turnSpeed: number = 8.0;
    @property public arenaHalfSize: number = 10;

    @property({ type: SkeletalAnimation, tooltip: 'Компонент анимации модели (PlayerModel)' })
    public skeletalAnim: SkeletalAnimation = null!;

    @property({ tooltip: 'Смещение поворота модели (градусы). 0 или 180 — подбирается под модель' })
    public modelYawOffset: number = 180;

    private _controller: CapsuleCharacterController = null!;
    private _input: InputController = null!;
    private _moveDir = new Vec3();
    private _tmpMove = new Vec3();
    private _verticalVel: number = 0;
    
    private _currentAnim: string = '';
    private _isMoving: boolean = false;

    private start() {
        this._controller = this.getComponent(CapsuleCharacterController)!;
        this._input = InputController.instance;

        if (!this._controller) {
            console.error('[PlayerController] CapsuleCharacterController не найден на ноде!');
        }
        if (!this.skeletalAnim) {
            console.warn('[PlayerController] SkeletalAnimation не назначен — анимации работать не будут.');
        } else {
            this._playAnim('Armature|Idle');
        }
    }

    private update(dt: number) {
        const input = this._input;
        if (!input) return;

        let x = 0, z = 0;
        if (input.isKeyPressed(KeyCode.KEY_W)) z -= 1;
        if (input.isKeyPressed(KeyCode.KEY_S)) z += 1;
        if (input.isKeyPressed(KeyCode.KEY_A)) x -= 1;
        if (input.isKeyPressed(KeyCode.KEY_D)) x += 1;

        const moving = (x !== 0 || z !== 0);
        
        if (moving && !this._isMoving) {
            this._isMoving = true;
            this._playAnim('Armature|Run');
        } else if (!moving && this._isMoving) {
            this._isMoving = false;
            this._playAnim('Armature|Idle');
        }

        if (!moving) return;
        
        this._moveDir.set(x, 0, z);
        if (this._moveDir.lengthSqr() > 1) this._moveDir.normalize();
        
        this._verticalVel -= 20 * dt;

        this._tmpMove.set(
            this._moveDir.x * this.moveSpeed * dt,
            this._verticalVel * dt,
            this._moveDir.z * this.moveSpeed * dt
        );
        
        if (this._controller) {
            this._controller.move(this._tmpMove);
            if (this._controller.isGrounded) {
                this._verticalVel = 0;
            }
        } else {
            this._tmpMove.y = 0;
            const p = this.node.worldPosition;
            this.node.setWorldPosition(p.x + this._tmpMove.x, p.y, p.z + this._tmpMove.z);
        }
        
        // const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z);
        const yawOffsetRad = this.modelYawOffset * Math.PI / 180;
        const targetAngle = Math.atan2(this._moveDir.x, this._moveDir.z) + yawOffsetRad;
        
        const currentAngle = this.node.eulerAngles.y * Math.PI / 180;
        const smoothed = this._lerpAngle(currentAngle, targetAngle, this.turnSpeed * dt);
        this.node.setRotationFromEuler(0, smoothed * 180 / Math.PI, 0);
    }
    
    private _playAnim(name: string): void {
        if (this._currentAnim === name) return;
        if (!this.skeletalAnim) return;

        this.skeletalAnim.crossFade(name, 0.2);
        this._currentAnim = name;
    }

    private _lerpAngle(a: number, b: number, t: number): number {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * Math.min(t, 1);
    }
}