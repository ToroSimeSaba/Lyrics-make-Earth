// MikeToToro my-app ver 1.0

import { Player, Ease } from 'textalive-app-api';
import { ThreeManager } from './ThreeManager'
import { Selector } from './Selector'
import { InputManager } from './InputManager'
import { Lyric } from './Lyric';

class Main {
  constructor() {
    this._init();
    this.threeMng = new ThreeManager();
    this.input = new InputManager(this);
    this._animate = this._animate.bind(this);
  }
  start() {
    this._animate();
  }
  //インプット処理
  keys(keycode) {
    //キー確認
    if (keycode == 'Space') {
      this.playControl();
    } else if (keycode == 'Enter') {
      this.playStop();
    } else {
      this.threeMng.cameraKey(keycode);
    }
  }
  mouse(deltaX, deltaY) {
    //カメラ処理
    this.threeMng.cameraMouse(
      deltaX / -50, deltaY / -50)
  }
  mouseWheel(deltaY) {
    this.threeMng.cameraWheel(deltaY);
  }
  playControl() {
    if (this._player) {
      if (this._player.isPlaying) {
        this._player.requestPause();
      } else {
        if (this._stop) {
          this._player.timer.seek(0);
          this._player.requestPlay();
          this._stop = false;
        } else {
          this._player.requestPlay();
        }
      }
    }
  }
  playStop() {
    this._stop = true;
    this._player.timer.seek(0);
    this._player.requestStop();
    this._resetall();
  }

  _onAppReady(app) {
    if (app.managed) {
      document.querySelector("#control").className = "disabled";
    }

    if (!app.songUrl) {
      this._commands[this._song]();
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
      //コード情報取得
      const cmap = {};
      const chords = this._player.data.getChords();
      for (const c of chords) {
        const w = c.name.charAt(0);
        cmap[w] = (cmap[w] || 0) + 1;
      };
      this._rankChords = Object.entries(cmap).sort((a, b) => b[1] - a[1]);
      this._lyrics = lyrics;
    }
  }

  _onTimerReady() {
    //cubeの作成
    this.threeMng.initObjects(this._lyrics);
    //sphere完成時のVector設定
    this.threeMng.initSphere(this._lyrics.length);
    //ボタン操作許可
    this.input.buttonOn();
    this._player.timer.seek(0);
    this.start();
    this._player.requestPlay();
    this._stop = false;
  }

  _onPlay() {
    this.anime = true;
  }
  _onPause() {
    this.anime = false;
  }
  _onStop() {
    this.anime = false;
  }

  // _onTimeUpdate(pos) {
  // }

  _onAppMediaChange() {
    console.log("新しい再生楽曲が指定されました:", mediaUrl);
  }

  //初期設定
  _init() {
    //アニメーションの状態
    this.anime = false;
    //cubeアニメーションのフレーム数
    this._frameNum = 30;
    //cube出現済み番号
    this._spanid = 0;
    //サビ場面番号
    this._sabi = 0;
    //背景テクスチャ切り替え
    this._textswich = false;
    //sphere回転速度
    this._sphereSpeed = 0.01 / (Math.PI * 2);
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
    // play状態
    this._stop = true;
  }
  //プレイヤー関係
  _initPlayer(song) {
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
    this._song = song;

    player.addListener({
      onAppReady: (app) => this._onAppReady(app),
      onTimerReady: () => this._onTimerReady(),
      onVideoReady: (v) => this._onVideoReady(v),
      onPlay: () => this._onPlay(),
      onPause: () => this._onPause(),
      onStop: () => this._onStop(),
      // onTimeUpdate: (pos) => this._onTimeUpdate(pos),
      onAppMediaChange: (mediaUrl) => this._onAppMediaChange(mediaUrl)
    })
    this._player = player;
  }
  //アニメーション関係
  _animate() {

    requestAnimationFrame(this._animate);
    //
    if (this.anime) {
      //
      //const pos = this._player.timer.position;
      const pos = this._player.timer.position;
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
            this.threeMng.cubeTarget(i, ws, wl, this._frameNum);
            //コードによって色変更
            const ch1 = ch.name.charAt(0);
            const index = this._rankChords.findIndex(obj => Object.values(obj).includes(ch1));
            this.threeMng.cubeColor(i, index);
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
          if (lyr.animeVal < this._frameNum) {
            this.threeMng.cubeMove1(i, val);
            //ターゲットをハイライト
            this.threeMng.cubeView(i, val);
            //1コマすすめる
            lyr.animeVal++;
          } else {
            lyr.animeVal = 0;
            lyr.animeFrag = 2;
          }
        }
        //2次アニメーション
        if (lyr.animeFrag == 2) {
          if (pos < lyr.endTime) {
            this.threeMng.lookMe(i);
          } else {
            const val = lyr.animeVal / this._frameNum;
            if (lyr.animeVal < this._frameNum) {
              this.threeMng.cubeMove2(i, val);
              //1コマすすめる
              lyr.animeVal++;
            } else {
              lyr.animeVal = 0;
              lyr.animeFrag = 3;
              if (i >= this.threeMng.spherelimit) {
                this.threeMng.changeCube(i);
                lyr.animeFrag = 4;
              }
            }
          }

        }
        //3次アニメーション
        if (lyr.animeFrag == 3) {
          if (!beat) { break; }
          const bp = beat.progress(pos);
          this.threeMng.cubeMove3(i, bp);
        }
        //4次アニメーション
        if (lyr.animeFrag == 4) {
          if (!beat) { break; }
          const bp = beat.progress(pos);
          this.threeMng.cubeMove4(i, bp);
        }
      }
      //sphereの回転
      // for(let i=0;i<this._lyrics.length;i++){
      //   this.threeMng.sphereMove(i, this._sphereSpeed);
      // }

      //Chorusの処理
      if (cr !== null && !this._textswich) {
        this._textswich = true;
        this.threeMng.backgroundChange(this._textswich, this._sabi);
        this._sabi++;
        if (this._sabi >= 5) { this._sabi = 0 };
      } else if (cr == null && this._textswich) {
        this._textswich = false;
        this.threeMng.backgroundChange(this._textswich);
      }
      //backgroundのテクスチャスクロール
      if (this._textswich) {
        this.threeMng.backtexMove(this._sabi);
      }
    }
    this.threeMng._cameraControl();
    this.threeMng.render();

  }
  _update() {
    this.threeMng.update();
  }
  _resetall() {
    this.anime = false;
    this.input.hidebtn();
    for (let i = 0; i < this._lyrics.length; i++) {
      const lyr = this._lyrics[i];
      lyr.animeFrag = 0;
      lyr.animeVal = 0;
      this.threeMng.cubeReset(i);
    }
    this.threeMng.cubesArrayReset();
    this.threeMng.initObjects(this._lyrics);
    this._spanid = 0;
    this._sabi = 0;
    this.threeMng.render();
    this.input.drawbtn();
  }
}

async function m() {
  const selector = new Selector();
  const selectedSong = await selector.getChoice();
  const main = new Main();
  main._initPlayer(selectedSong);
}

m();
