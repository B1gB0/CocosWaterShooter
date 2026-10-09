import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
    @property({ type: Node, tooltip: 'Цель слежки (нода Player)' })
    public target: Node = null!;

    @property({ type: Vec3, tooltip: 'Смещение камеры относительно цели' })
    public offset: Vec3 = new Vec3(0, 8, 10); // Высота 8, отступ назад 10

    @property({ tooltip: 'Скорость сглаживания (0 = без сглаживания)' })
    public smooth: number = 0.1;

    private _desiredPos = new Vec3();
    private _targetPos = new Vec3();

    update(dt: number) {
        if (!this.target) return;

        // Куда камера должна стремиться
        this.target.getWorldPosition(this._targetPos);
        this._targetPos.add(this.offset);
        this._desiredPos.set(this._targetPos);

        if (this.smooth <= 0) {
            // Мгновенное перемещение
            this.node.setWorldPosition(this._desiredPos);
        } else {
            // Плавное следование через интерполяцию
            const current = this.node.worldPosition;
            const t = Math.min(this.smooth * 60 * dt, 1); // Нормализация под FPS
            this._desiredPos.set(
                current.x + (this._desiredPos.x - current.x) * t,
                current.y + (this._desiredPos.y - current.y) * t,
                current.z + (this._desiredPos.z - current.z) * t
            );
            this.node.setWorldPosition(this._desiredPos);
        }
    }
}