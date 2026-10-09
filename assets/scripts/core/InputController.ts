import { _decorator, Vec2, EventTouch, EventMouse, input, Input, KeyCode, EventKeyboard } from 'cc';
const { ccclass } = _decorator;

@ccclass('InputController')
export class InputController {
    private static _instance: InputController;

    public static get instance(): InputController {
        if (!this._instance) this._instance = new InputController();
        return this._instance;
    }
    
    public readonly pointer = new Vec2();
    public isFiring: boolean = false;

    private _keys: Set<number> = new Set();

    private constructor() {
        this._bindEvents();
    }

    private _bindEvents(): void {
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);

        input.on(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this._onMouseUp, this);

        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    public isKeyPressed(key: KeyCode): boolean {
        return this._keys.has(key);
    }

    private _onTouchStart(e: EventTouch): void {
        this.isFiring = true;
        this._updatePointerFromTouch(e);
    }
    private _onTouchMove(e: EventTouch): void {
        this._updatePointerFromTouch(e);
    }
    private _onTouchEnd(_e: EventTouch): void {
        this.isFiring = false;
    }

    private _onMouseDown(e: EventMouse): void {
        this.isFiring = true;
        this._updatePointerFromMouse(e);
    }
    private _onMouseMove(e: EventMouse): void {
        this._updatePointerFromMouse(e);
    }
    private _onMouseUp(_e: EventMouse): void {
        this.isFiring = false;
    }

    private _onKeyDown(e: EventKeyboard): void {
        this._keys.add(e.keyCode);
        if (e.keyCode === KeyCode.SPACE) this.isFiring = true;
    }
    private _onKeyUp(e: EventKeyboard): void {
        this._keys.delete(e.keyCode);
        if (e.keyCode === KeyCode.SPACE) this.isFiring = false;
    }

    private _updatePointerFromTouch(e: EventTouch): void {
        const p = e.getUILocation();
        const size = e.getCurrentTarget()?.scene?.getComponentInChildren?.('') ? null : null;
        // Нормализация через размер окна
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.pointer.set((p.x / w) * 2 - 1, (p.y / h) * 2 - 1);
    }

    private _updatePointerFromMouse(e: EventMouse): void {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.pointer.set((e.getLocationX() / w) * 2 - 1, (e.getLocationY() / h) * 2 - 1);
    }
}