// MikeToToro my-app ver 1.0

import { Player, Ease } from 'textalive-app-api';
import * as THREE from 'three';
import { ThreeManager } from './ThreeManager';

class Main {
  constructor() {
    this.threeMng = new ThreeManager();
    this._keys();
    this._init();
    this.anime = false;
    this._textswich = false;
    this._texSpeed = 0.005;

    this._initPlayer();

    this._animate = this._animate.bind(this);

  }
  _init() {
    this._frameNum = 30;
    this._cubes = [];
    this._spanid = 0;
    this._pos = 0;
    this._spCount = 0;

    // ソングりストの定義
    this._commands = {
      song1: () =>
        // ストリートライト / 加賀(ネギシャワーP)
        this._player.createFromSongUrl("https://piapro.jp/t/ULcJ/20250205120202", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694275,
            chordId: 2830730,
            repetitiveSegmentId: 2946478,

            // 歌詞URL: https://piapro.jp/t/DPXV
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FULcJ%2F20250205120202
            lyricId: 67810,
            lyricDiffId: 20654
          }
        })
      ,
      song2: () =>
        //アリフレーション / 雨良 Amala
        this._player.createFromSongUrl("https://piapro.jp/t/SuQO/20250127235813", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694276,
            chordId: 2830731,
            repetitiveSegmentId: 2946479,

            // 歌詞URL: https://piapro.jp/t/GbYz
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FSuQO%2F20250127235813
            lyricId: 67811,
            lyricDiffId: 20655
          },
        })
      ,
      song3: () =>
        //インフォーマルダイブ / 99piano
        this._player.createFromSongUrl("https://piapro.jp/t/Ppc9/20241224135843", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694277,
            chordId: 2830732,
            repetitiveSegmentId: 2946480,

            // 歌詞URL: https://piapro.jp/t/77V2
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FPpc9%2F20241224135843
            lyricId: 67812,
            lyricDiffId: 20656
          },
        })
      ,
      song4: () =>
        //ハロー、フェルミ。 / ど～ぱみん
        this._player.createFromSongUrl("https://piapro.jp/t/oTaJ/20250204234235", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694278,
            chordId: 2830733,
            repetitiveSegmentId: 2946481,

            // 歌詞URL: https://piapro.jp/t/lbO1
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FoTaJ%2F20250204234235
            lyricId: 67813,
            lyricDiffId: 20657
          },
        })
      ,
      song5: () =>
        //パレードレコード / きさら
        this._player.createFromSongUrl("https://piapro.jp/t/GCgy/20250202202635", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694279,
            chordId: 2830734,
            repetitiveSegmentId: 2946482,

            // 歌詞URL: https://piapro.jp/t/FJ5N
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FGCgy%2F20250202202635
            lyricId: 67814,
            lyricDiffId: 20658
          },
        })
      ,
      song6: () =>
        // ロンリーラン / 海風太陽
        this._player.createFromSongUrl("https://piapro.jp/t/CyPO/20250128183915", {
          video: {
            // 音楽地図訂正履歴
            beatId: 4694280,
            chordId: 2830735,
            repetitiveSegmentId: 2946483,

            // 歌詞URL: https://piapro.jp/t/jn89
            // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FCyPO%2F20250128183915
            lyricId: 67815,
            lyricDiffId: 20659
          },
        })
    };
  }
  //プレイヤー関係
  _initPlayer() {
    const player = new Player({
      app: {
        token: "hkkD6dSKpzXej2xt",
        parameters: [
          {
            title: "テキスト色",
            name: "Color",
            className: "Color",
            initialValue: "#000000"
          },
          {
            title: "背景色",
            name: "BackgroundColor",
            className: "Color",
            initialValue: "#aaaaaa"
          },
        ],
      },
      mediaElement: document.querySelector("#media")
    })

    player.addListener({
      onAppReady: (app) => this._onAppReady(app),
      onTimerReady: () => this._onTimerReady(),
      onVideoReady: (v) => this._onVideoReady(v),
      onPlay: () => this._onPlay(),
      onPause: () => this._onPause(),
      onStop: () => this._onStop(),
      onTimeUpdate: (pos) => this._onTimeUpdate(pos),
      onAppMediaChange: (mediaUrl) => this._onAppMediaChange(mediaUrl)
    })
    this._player = player;
  }
  _onAppReady(app) {
    if (app.managed) {
      document.querySelector("#control").className = "disabled";
    }

    if (!app.songUrl) {
      let sn = Math.floor(Math.random() * 6 + 1);
      this._commands['song' + sn]();
    }
  }

  _onVideoReady(v) {
    // 歌詞のセットアップ
    const lyrics = [];
    if (v.firstChar) {
      let c = v.firstChar;
      while (c) {
        lyrics.push(new Lyric(c, this._frameNum));
        c = c.next;
      }

      this.threeMng.InitObjects(lyrics, this._frameNum);
      this._lyrics = lyrics;
    }

    console.log('lyrics ok');
    //

  }

  _onTimerReady() {
    console.log('onTimer');
    document.querySelector("#control > a#play").className = "";
    document.querySelector("#control > a#stop").className = "";
    document.querySelector("#control > a#left").className = "";
    document.querySelector("#control > a#up").className = "";
    document.querySelector("#control > a#down").className = "";
    document.querySelector("#control > a#right").className = "";
    console.log("開始");
    this.start();
    this._player.requestPlay();
  }

  _onPlay() {
    console.log('onplay');
    this.anime = true;
  }
  _onPause() {
    console.log('Pause');
    this.anime = false;
  }
  _onStop() {
    console.log('Stop');
    this.anime = false;
    this.resetall();
  }

  _onTimeUpdate(pos) {
    //console.log("再生位置のアップデート onTimer:", pos, "ミリ秒")
    this._pos = pos;
  }

  _onAppMediaChange() {
    console.log("新しい再生楽曲が指定されました:", mediaUrl);
  }

  //インプット関連
  _keys() {
    //キー確認
    document.addEventListener('keydown', (e) => {
      this.threeMng.cameraKey(e.code);
      if (e.code == 'Space') {
        this.playControl();
      }
    });
    //ボタン定義
    this.playButton = document.querySelector("#control > a#play");
    this.stopButton = document.querySelector("#control >a#stop");
    this.leftButton = document.querySelector("#control > a#left");
    this.upButton = document.querySelector("#control >a#up");
    this.downButton = document.querySelector("#control > a#down");
    this.rightButton = document.querySelector("#control >a#right");
    this.msButton = document.querySelector("#control >a#ms");

    // イベント登録（アロー関数を使って this を保つ）
    this.playButton.addEventListener("click", (e) => this.handlePlayClick(e));
    this.stopButton.addEventListener('click', (e) => this.handleStopClick(e));
    this.leftButton.addEventListener('click', (e) => this.handleLeftClick(e));
    this.upButton.addEventListener('click', (e) => this.handleUpClick(e));
    this.downButton.addEventListener('click', (e) => this.handleDownClick(e));
    this.rightButton.addEventListener('click', (e) => this.handleRightClick(e));
    this.msButton.addEventListener('click', (e) => this.handleMSClick(e));
  }
  handlePlayClick(e) {
    e.preventDefault();
    this.playControl();
  }
  handleStopClick(e) {
    if (this._player) {
      this._player.requestStop();
    }
  }
  _tap() {
    document.addEventListener('touchstart', function (e) {
      this.threeMng.tapStart(e);
    });

    document.addEventListener('touchmove', function (e) {
      this.threeMng.tapMove(e);
    });

    document.addEventListener('touchend', function () {
      this.threeMng.tapEnd(e);
    });
  }
  handleLeftClick(e) {
    e.preventDefault();
    this.threeMng.cameraKey('ArrowLeft');
  }
  handleUpClick(e) {
    e.preventDefault();
    this.threeMng.cameraKey('ArrowUp');
  }
  handleDownClick(e) {
    e.preventDefault();
    this.threeMng.cameraKey('ArrowDown');
  }
  handleRightClick(e) {
    e.preventDefault();
    this.threeMng.cameraKey('ArrowRight');
  }
  handleMSClick(e) {
    e.preventDefault();
    this.threeMng.cameraKey('Numpad5');
  }
  playControl() {
    if (this._player) {
      if (this._player.isPlaying) {
        this._player.requestPause();
      } else {
        this._player.requestPlay();
      }
    }
  }

  _animate() {

    requestAnimationFrame(this._animate);
    //
    if (this.anime) {

      const now = performance.now();
      const delta = (now - this._lastTime) / 1000;
      this._lastTime = now;
      //
      //const pos = this._player.timer.position;
      const pos = this._pos;
      const beat = this._player.findBeat(pos);
      const ch = this._player.findChord(pos);
      const cr = this._player.findChorus(pos);

      // cube 出現
      for (let i = this._spanid; i < this._lyrics.length; i++) {
        const lyr = this._lyrics[i];
        if (lyr.startTime <= pos) {
          if (lyr.animeFrag == 0) {
            lyr.animeFrag = 1;
            const ws = lyr.wordstat;
            const wl = lyr.wordcount;
            //カメラの向きによって目的地変更
            this.threeMng.cubeTarget(i, ws, wl);
            //コードによって色変更
            const ch1 = ch.name.charAt(0);
            this.threeMng.cubeColor(i, ch1);
            this._spanid = i + 1;
          }
        }
      }
      // オブジェクトアニメーション
      for (let i = 0; i < this._spanid; i++) {
        const lyr = this._lyrics[i];

        //1次アニメーション
        if (lyr.animeFrag == 1) {
          const val = lyr.animeVal / this._frameNum;
          if (val > 1) {
            lyr.animeVal = 0;
            lyr.animeFrag = 2;
          } else {
            this.threeMng.cubeMove1(i, val);
            //ターゲットをハイライト
            this.threeMng.cubeView(i, val);
            //1コマすすめる
            lyr.animeVal++;
          }
        }
        //2次アニメーション
        if (lyr.animeFrag == 2) {
          const val = lyr.animeVal / this._frameNum;
          if (val > 1) {
            lyr.animeVal = 0;
            lyr.animeFrag = 3;
          } else {
            this.threeMng.cubeMove2(i, val);
            //1コマすすめる
            lyr.animeVal++;
          }
        }
        //3次アニメーション
        if (lyr.animeFrag == 3) {
          if (!beat) { break; }
          const bp = beat.progress(pos);
          this.threeMng.cubeMove3(i, bp, pos);
          //sphereの回転
          //this.threeMng.sphereMove(i, 0.01);

        }

      }

      //床移動
      this.threeMng.floorMove(this._texSpeed);

      //this.floor.material.map.offset.y += Math.cos(this._camR) * this.floorSPD / 4;
      if (cr !== null && !this._textswich) {
        this._textswich = true;
        this._texSpeed += 0.005;
        this.threeMng.sphereChange(this._textswich);
      } else if (cr == null && this._textswich) {
        this._textswich = false;
        this.threeMng.sphereChange(this._textswich);
      }
      this.update(delta);
    }

    this.threeMng.render();

  }

  update(delta) {
    // 必要に応じて他の更新処理も
    this.threeMng.update(delta);
  }

  start() {
    this._animate(this._pos);
  }

  resetall() {
    for (let i = 0; i < this._lyrics.length; i++) {
      const lyr = this._lyrics[i];
      lyr.animeFrag = 0;
      lyr.animeVal = 0;
      this.threeMng.cubeReset(i);
      this._spanid = 0;
    }
  }
}

//マテリアル作成
export class Mat {
  constructor(texts) {
    this.texts = texts;
    const materials = [];
  }

  createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // 背景透明 + 文字描画
    ctx.fillStyle = 'rgb(127, 135, 248)';
    ctx.fillRect(0, 0, size, size);
    ctx.font = 'bold 200px sans-serif';
    ctx.fillStyle = 'rgb(7, 9, 76)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  textToMat(text) {
    const textMat = new THREE.MeshStandardMaterial({
      map: this.createTextTexture(text.text),
      transparent: true,
      //side: THREE.DoubleSide
    });

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 右
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 左
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 上
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 下
      textMat,
      new THREE.MeshStandardMaterial({ color: 0x0000ff }), // 後
    ];
    for (let i = 0; i < 6; i++) {
      materials[i].transparent = true;
      materials[i].roughness = 0.7;
      materials[i].metalness = 0.5;
      materials[i].opacity = 0;
    }
    return materials;
  }
  getMaterials() {
    return this.texts.map(text => this.textToMat(text))
  }
}

//歌詞情報作成
class Lyric {
  constructor(data, frameNum) {
    //
    const rate = 1000 / 60 * frameNum;
    //
    this.text = data.text;      // 歌詞文字
    this.startTime = data.startTime - rate; // 開始タイム [ms]
    this.endTime = data.endTime - rate;   // 終了タイム [ms]
    this.duration = data.duration;  // 開始から終了迄の時間 [ms]
    const wf = data.parent.firstChar;
    const wl = data.parent.lastChar;
    if (data == wf) {
      this.wordstat = 's'
    } else if (data == wl) {
      this.wordstat = 'l';
    } else {
      this.wordstat = 'n';
    }
    this.wordcount = data.parent.charCount;;
    this.wordpos = data.parent.pos;

    this.animeFrag = 0;
    this.animeVal = 0;

  }
}


const main = new Main();
