//歌詞情報作成
export class Lyric {
    constructor(data, frame) {
        //cubeアニメーションフレーム数による歌詞startTimeの調整
        const rate = 1000 / 60 * frame;
        this.text = data.text;
        this.startTime = data.startTime - rate; // 本来の開始タイムからrateを引く
        this.endTime = data.endTime;     // 終了タイム
        this.duration = data.duration;  // 開始から終了迄の時間 [ms]
        const wf = data.parent.firstChar;       // 単語の先頭文字を確認
        const wl = data.parent.lastChar;        // 単語の最後の文字を確認
        if (data == wf) {
            this.wordstat = 's'
        } else if (data == wl) {
            this.wordstat = 'l';
        } else {
            this.wordstat = 'n';
        }
        this.wordcount = data.parent.charCount;;
        //this.wordpos = data.parent.pos;

        this.animeFrag = 0;
        this.animeVal = 0;

    }
  }