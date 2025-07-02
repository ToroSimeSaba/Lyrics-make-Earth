export class InputManager {
    constructor(main) {
        this.main = main;
        this._init();
        this._addListners();
    }
    buttonOn() {
        document.querySelector("#control > a#play").className = "";
        document.querySelector("#control > a#stop").className = "";
    }
    hidebtn(){
        const imgp = document.querySelector("#control > a#play > img");
        const imgs = document.querySelector("#control > a#stop > img");
        imgp.style.display = "none";
        imgs.style.display = "none";
    }
    drawbtn(){
        const imgp = document.querySelector("#control > a#play > img");
        const imgs = document.querySelector("#control > a#stop > img");
        imgp.style.display = "inline";
        imgs.style.display = "inline";
    }
    _onStart(e) {
        this._isDragging = true;
        this._prevX = e.clientX;
        this._prevY = e.clientY;
    }
    _onMove(e) {
        if (!this._isDragging) return;
        const deltaX = e.clientX - this._prevX;
        const deltaY = e.clientY - this._prevY;
        //カメラ処理
        this.main.mouse(deltaX, deltaY);
        // 次の比較のために現在位置を保存
        this._prevX = e.clientX;
        this._prevY = e.clientY;
    }
    _onStop(e) {
        this._isDragging = false;
    }
    _addListners() {
        document.addEventListener('keydown', (e) => {
            this.main.keys(e.code);
        });
        const area = document.getElementById('view');
        area.addEventListener('mousedown', (e) => { this._onStart(e) });
        area.addEventListener('touchstart', (e) => {
            if (e.touches.length == 2) {
                this._initdist = this._getDist(e.touches[0], e.touches[1]);
            } else {
                const touch = e.touches[0];
                this._onStart(touch)
            }
        });
        area.addEventListener('mousemove', (e) => { this._onMove(e) });
        area.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length == 2 && this._initdist != null) {
                const currdist = this._getDist(e.touches[0], e.touches[1]);
                const dist = this._initdist - currdist;
                this.main.mouseWheel(dist);
            } else {
                const touch = e.touches[0];
                this._onMove(touch)
            }
        }, { passive: false });
        area.addEventListener('mouseup', (e) => { this._onStop() });
        area.addEventListener('touchend', (e) => {
            if (e.touches.length == 2) {
                this._initdist = null;
            } else {
                const touch = e.touches[0];
                this._onStop(touch)
            }
        });
        area.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.main.mouseWheel(e.deltaY);
        }, { passive: false });
    }
    _handlePlayClick(e) {
        e.preventDefault();
        this.main.playControl();
    }
    _handleStopClick(e) {
        this.main.playStop();
    }

    _init() {
        //ボタン定義
        this.playButton = document.querySelector("#control > a#play");
        this.stopButton = document.querySelector("#control >a#stop");
        // イベント登録
        this.playButton.addEventListener("click", (e) => this._handlePlayClick(e));
        this.stopButton.addEventListener('click', (e) => this._handleStopClick(e));

        //マウス変数定義
        this._isDragging = false;
        this._prevX = 0;
        this._prevY = 0;
        this._initdist = null;
    }
    _getDist(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}