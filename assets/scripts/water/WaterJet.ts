import { _decorator, Component, Prefab, Node, Vec3 } from 'cc';
import { ObjectPool } from '../core/ObjectPool';
import { InputController } from '../core/InputController';
import { WaterDrop } from './WaterDrop';
import { AimController } from '../player/AimController';
const { ccclass, property } = _decorator;

@ccclass('WaterJet')
export class WaterJet extends Component {
    @property({ type: Prefab, tooltip: 'Префаб капли воды' })
    public dropPrefab: Prefab = null!;

    @property({ type: AimController, tooltip: 'Компонент прицела (на AimPivot)' })
    public aimController: AimController = null!;

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

    @property({ tooltip: 'Логировать спавн капель (для отладки)' })
    public debugLog: boolean = false;

    private _pool: ObjectPool = null!;
    private _input: InputController = null!;
    private _spawnAccumulator: number = 0;
    private _spawnInterval: number = 0;
    private _spawnedTotal: number = 0;

    private _tmpPos = new Vec3();
    private _tmpDir = new Vec3();

    private start() {
        if (!this.dropPrefab) {
            console.error('[WaterJet] dropPrefab НЕ назначен! Струя работать не будет.');
            return;
        }
        if (!this.aimController) {
            console.error('[WaterJet] aimController НЕ назначен! Струя работать не будет.');
            return;
        }

        this._pool = new ObjectPool(this.dropPrefab, this.node, this.prewarm);
        this._input = InputController.instance;
        this._spawnInterval = 1 / this.dropsPerSecond;

        console.log(`[WaterJet] Инициализирован. Капель в секунду: ${this.dropsPerSecond}, интервал: ${this._spawnInterval.toFixed(3)}с`);
    }

    private update(dt: number) {
        if (!this._pool || !this._input || !this.aimController) return;

        if (!this._input.isFiring) return;

        this._spawnAccumulator += dt;

        while (this._spawnAccumulator >= this._spawnInterval) {
            this._spawnAccumulator -= this._spawnInterval;
            this._spawnDrop();
        }
    }

    private _spawnDrop(): void {
        this.aimController.getNozzleWorldPosition(this._tmpPos);
        this.aimController.getAimDirection(this._tmpDir);
        
        if (this.spreadAngle > 0) {
            const s = this.spreadAngle * Math.PI / 180;
            this._tmpDir.x += (Math.random() - 0.5) * s;
            this._tmpDir.y += (Math.random() - 0.5) * s;
            this._tmpDir.z += (Math.random() - 0.5) * s;
            this._tmpDir.normalize();
        }

        const dropNode = this._pool.get();
        const drop = dropNode.getComponent(WaterDrop);
        if (drop) {
            drop.gravity = this.dropGravity;
            drop.launch(this._tmpPos, this._tmpDir, this.dropSpeed, this.dropLife, this._onDropExpire);
        }

        this._spawnedTotal++;
        if (this.debugLog && this._spawnedTotal % 20 === 0) {
            console.log(`[WaterJet] Спавн #${this._spawnedTotal} из позиции (${this._tmpPos.x.toFixed(2)}, ${this._tmpPos.y.toFixed(2)}, ${this._tmpPos.z.toFixed(2)})`);
        }
    }

    private _onDropExpire = (node: Node): void => {
        this._pool.put(node);
    };
}