import { _decorator, Component, AudioSource } from 'cc';
import { InputController } from '../core/InputController';
const { ccclass, property } = _decorator;

@ccclass('WaterSound')
export class WaterSound extends Component {
    @property(AudioSource)
    public waterAudio: AudioSource = null!;

    private _input: InputController = null!;
    private _isPlaying: boolean = false;

    private start() {
        this._input = InputController.instance;
    }

    private update() {
        if (!this._input || !this.waterAudio) return;

        const shouldPlay = this._input.isFiring;
        
        if (shouldPlay && !this._isPlaying) {
            this.waterAudio.play();
            this._isPlaying = true;
        }
        else if (!shouldPlay && this._isPlaying) {
            this.waterAudio.stop();
            this._isPlaying = false;
        }
    }
}