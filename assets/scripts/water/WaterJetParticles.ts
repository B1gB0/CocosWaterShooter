import { _decorator, Component, ParticleSystem, Node } from 'cc';
import { InputController } from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('WaterJetParticles')
export class WaterJetParticles extends Component {
    @property({ type: ParticleSystem, tooltip: 'ParticleSystem, который будет испускать струю' })
    public waterParticles: ParticleSystem = null!;

    @property({ type: Node, tooltip: 'Нода-дуло, куда привязывать эмиттер (опционально)' })
    public nozzle: Node = null;

    @property({ tooltip: 'Логировать переключения (для отладки)' })
    public debugLog: boolean = false;

    private _input: InputController = null!;
    private _isPlaying: boolean = false;

    private start() {
        this._input = InputController.instance;

        if (!this.waterParticles) {
            console.error('[WaterJetParticles] waterParticles НЕ назначен! Струя не будет работать.');
            return;
        }
        
        this.waterParticles.stop();
        
        if (this.nozzle) {
            this._syncEmitterToNozzle();
        }
    }

    private update() {
        if (!this._input || !this.waterParticles) return;
        
        if (this.nozzle) {
            this._syncEmitterToNozzle();
        }

        const shouldPlay = this._input.isFiring;

        if (shouldPlay && !this._isPlaying) {
            this.waterParticles.play();
            this._isPlaying = true;
            if (this.debugLog) console.log('[WaterJetParticles] Эмиссия ВКЛ');
        } else if (!shouldPlay && this._isPlaying) {
            this.waterParticles.stop();
            this._isPlaying = false;
            if (this.debugLog) console.log('[WaterJetParticles] Эмиссия ВЫКЛ');
        }
    }
    
    private _syncEmitterToNozzle(): void {
        if (!this.nozzle || !this.waterParticles) return;
        const wp = this.nozzle.worldPosition;
        this.waterParticles.node.setWorldPosition(wp);
    }
}