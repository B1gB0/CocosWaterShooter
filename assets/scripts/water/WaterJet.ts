import { _decorator, Component, Prefab, Node, Vec3 } from 'cc';
import { ObjectPool } from '../core/ObjectPool';
import { InputController } from '../core/InputController';
import { WaterDrop } from './WaterDrop';
const { ccclass, property } = _decorator;

@ccclass('WaterJet')
export class WaterJet extends Component {
    @property({ type: Prefab, tooltip: 'Префаб капли воды' })
    public dropPrefab: Prefab = null!;

    @property({ tooltip: 'Сколько капель в секунду' })
    public dropsPerSecond: number = 40;

    @property({ tooltip: 'Начальная скорость капли' })
    public dropSpeed: number = 12;

    @property({ tooltip: 'Разброс угла струи (градусы)' })
    public spreadAngle: number = 6;

    @property({ tooltip: 'Время жизни капли (сек)' })
    public dropLife: number = 1.2;

    @property({ tooltip: 'Гравитация для капель' })
    public dropGravity: number = -12;

    @property({ tooltip: 'Сколько капель предсоздать в пуле' })
    public prewarm: number = 60;

    // Ссылки на игровые модули
    public playerNode: Node = null!;      // куда цепляем струю
    public aimController: any = null!;    // AimController

    private _pool: ObjectPool = null!;
    private _input: InputController = null!;
    private _spawnAccumulator: number = 0;
    private _spawnInterval: number = 0;

    // Кэш
    private _tmpPos = new Vec3();
    private _tmpDir = new Vec3();
    private _tmpRandom = new Vec3();

    start() {
        this._pool = new ObjectPool(this.dropPrefab, this.node, this.prewarm);
        this._input = InputController.instance;
        this._spawnInterval = 1 / this.dropsPerSecond;
    }

    update(dt: number) {
        if (!this._input.isFiring) return;

        this._spawnAccumulator += dt;

        // Спавним столько капель, сколько "накопилось" по времени
        while (this._spawnAccumulator >= this._spawnInterval) {
            this._spawnAccumulator -= this._spawnInterval;
            this._spawnDrop();
        }
    }

    private _spawnDrop(): void {
        const aim = this.aimController;
        if (!aim) return;

        const nozzlePos = aim.getNozzleWorldPosition(this._tmpPos);
        const aimDir = aim.getAimDirection(this._tmpDir);

        // Разброс
        if (this.spreadAngle > 0) {
            const spreadRad = this.spreadAngle * Math.PI / 180;
            this._tmpRandom.set(
                (Math.random() - 0.5) * spreadRad,
                (Math.random() - 0.5) * spreadRad,
                (Math.random() - 0.5) * spreadRad
            );
            // Простое возмущение направления (не идеально, но дёшево)
            aimDir.x += this._tmpRandom.x;
            aimDir.y += this._tmpRandom.y;
            aimDir.z += this._tmpRandom.z;
            aimDir.normalize();
        }

        const dropNode = this._pool.get();
        const drop = dropNode.getComponent(WaterDrop);
        if (drop) {
            drop.gravity = this.dropGravity;
            drop.launch(nozzlePos, aimDir, this.dropSpeed, this.dropLife, this._onDropExpire);
        }
    }

    private _onDropExpire = (node: Node): void => {
        this._pool.put(node);
    };
}