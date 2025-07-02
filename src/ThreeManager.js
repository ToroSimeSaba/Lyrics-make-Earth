import * as THREE from 'three';
import { Ease } from 'textalive-app-api';
import { RoundedBoxGeometry } from 'three-stdlib';
import { MatManager } from './MatManager';

export class ThreeManager {
    constructor() {
        this._initScene();
        this._initVar();
        window.addEventListener("resize", () => this._resize());
    }

    //sphere完成時のVector設定 this._spoint
    initSphere(moji) {
        //歌詞の文字数に応じて定数(1半円のcube個数)計算
        const sps = Math.floor(Math.sqrt(moji / 2));
        //sphere半径
        this._sdist = sps * 3 / Math.PI - 0.5;
        //sphere必要数
        this.spherelimit = sps ** 2 * 2;
        //文字数とsphere必要数の差
        const mojiover = moji - this.spherelimit;
        //sphereの各座標ベクトル設定
        this._spoint = [];
        const spoint = [];
        //sphereの構成にかかるcube(target3)の位置決め
        for (let i = 0; i < sps * 2; i++) {
            for (let j = 0; j < sps; j++) {
                const h = Math.PI / sps * i;
                const v = Math.PI / sps * j + (Math.PI / (sps * 2));
                spoint[i * sps + j] = this._calcVector(this._sdist, h, v);
            }
        }
        this._spoint = spoint.sort(() => Math.random() - 0.5);
        //sphereの完成後に余った分の位置決め
        for (let i = sps ** 2 * 2; i < moji; i++) {
            const h = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;
            const d = (2 + Math.random() * 2) * this._sdist;
            spoint[i] = this._calcVector(d, h, v);
            this._spoint[i] = spoint[i];
        }
    }
    //cube定義
    initObjects(lyrics) {
        this._lyrics = lyrics;
        //cube初期位置
        this._x = 0;
        this._y = 0;
        this._z = 0;
        //歌詞のテクスチャ作成
        const outMat = new MatManager(this._lyrics).getMaterials();
        //立方体のジオメトリ（形状）とマテリアル（見た目）を作成
        const geometry = new RoundedBoxGeometry(3, 3, 0.5, 4, 0.5);
        for (let i = 0; i < this._lyrics.length; i++) {
            const cube = new THREE.Mesh(geometry, outMat[i]);
            //位置／回転の定義
            cube.position.set(this._x, this._y, this._z);

            //userData定義
            cube.userData.target = [];
            cube.userData.quat = [];

            this._scene.add(cube);
            this._cubes.push(cube);
        }
    }
    //cubeリセット
    cubeReset(i) {
        const cube = this._cubes[i];
        this._scene.remove(cube);
        cube.geometry.dispose();
        if (Array.isArray(cube.material)) {
            for (let i = 0; i < 6; i++) {
                if (i == 4) {
                    cube.material[i].map.dispose();
                }
                cube.material[i].dispose();
            }
        } else {
            cube.material.dispose();
        }
    }
    cubesArrayReset() {
        this._cubes.length = 0;
    }
    cameraKey(keyCode) {
        switch (keyCode) {
            case 'ArrowRight':
                this._camArrowH += 0.01;
                break;
            case 'ArrowLeft':
                this._camArrowH -= 0.01;
                break;
            case 'ArrowUp':
                this._camdist -= 1;
                if (this._camdist < this._camdistMin) { this._camdist = this._camdistMin }
                break;
            case 'ArrowDown':
                this._camdist += 1;
                if (this._camdist > this._camdistMax) { this._camdist = this._camdistMax }
                break;
            case 'Numpad2':
                this._camH = 0;
                this._camV = Math.PI / 2;
                break;
            case 'Numpad5':
                this._camArrowH = 0;
                this._camArrowV = 0;
                break;
            case 'Numpad4':
                this._camH = Math.PI * 1.5;
                this._camV = Math.PI / 2;
                break;
            case 'Numpad6':
                this._camH = Math.PI / 2;
                this._camV = Math.PI / 2;
                break;
            case 'Numpad8':
                this._camH = Math.PI;
                this._camV = Math.PI / 2;
                break;
        }
    }
    cameraWheel(val) {
        this._camdist += (val / 20);
        if (this._camdist < this._camdistMin) { this._camdist = this._camdistMin }
        if (this._camdist > this._camdistMax) { this._camdist = this._camdistMax }
    }
    cameraMouse(h, v) {
        this._camArrowH = h;
        this._camArrowV = v;
    }
    //cubeのターゲット設定
    cubeTarget(i, ws, wl, fn) {
        const cube = this._cubes[i];
        // 1-2次アニメーション用
        // 縦方向の広がり具合
        const ranV = (Math.random() - 0.5) * 6;
        //　横方向の広がり具合
        const ranH = (Math.random() - 0.5) * 3 - (wl * 0.5 * 3);
        // ターゲット1までの中心からの距離
        const dist = this._camdist - this._camdistMin;
        // ターゲット表示時の位置予測
        let yh = (this._camArrowH / (Math.PI * 2)) * fn + this._camH;
        yh = ((yh % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        let yv = (this._camArrowV / (Math.PI * 2)) * fn + this._camV;
        yv = ((yv % (Math.PI)) + Math.PI) % (Math.PI);
        const sinh = Math.sin(yh);
        const cosh = Math.cos(yh);
        const sinv = Math.sin(yv);
        const cosv = Math.cos(yv);

        let x1 = 0;
        let y1 = 0;
        let z1 = 0;

        //Wordの最初かどうかを判定
        if (ws == 's') {
            x1 = dist * sinh * sinv - ranV * sinh * cosv + ranH * cosh;
            y1 = dist * cosv + ranV * sinv;
            z1 = dist * cosh * sinv - ranV * cosh * cosv - ranH * sinh;
            const sd = this._preSy - y1;
            if (Math.abs(sd) < 3) {
                y1 += Math.sign(sd) * (sd % 3);
            }
            this._preSy = y1;
        } else {
            const prex = this._cubes[i - 1].userData.target[0];
            const prey = this._cubes[i - 1].userData.target[1];
            const prez = this._cubes[i - 1].userData.target[2];
            x1 = prex + (3 * cosh);
            y1 = prey;
            z1 = prez - (3 * sinh);
        }
        cube.userData.target[0] = x1;
        cube.userData.target[1] = y1;
        cube.userData.target[2] = z1;

        const x2 = this._spoint[i].x;
        const y2 = this._spoint[i].y;
        const z2 = this._spoint[i].z;
        const spherical = new THREE.Spherical().setFromVector3(this._spoint[i]);
        //ランダムな角度設定
        const rh = spherical.theta;
        const rv = spherical.phi;
        //中心からの距離
        const rdist = spherical.radius;

        cube.userData.target[3] = x2;
        cube.userData.target[4] = y2;
        cube.userData.target[5] = z2;
        cube.userData.target[6] = rh;
        cube.userData.target[7] = rv;
        cube.userData.target[8] = rdist;

        //Quaternion 初期値
        const firstQuat = cube.quaternion.clone();
        const target1Position = new THREE.Vector3(
            this._camdist * sinh * sinv,
            this._camY,
            this._camdist * cosh * sinv
        ).normalize();
        const target2Position = new THREE.Vector3(x2, y2, z2);
        const endPosition = new THREE.Vector3(0, 0, 0);

        const cubePos = new THREE.Vector3();
        cube.getWorldPosition(cubePos);

        const target1Quat = new THREE.Quaternion();
        const lookAtMatrix1 = new THREE.Matrix4().lookAt(
            cubePos,
            target1Position,
            new THREE.Vector3(0, 1, 0)
        );
        target1Quat.setFromRotationMatrix(lookAtMatrix1);
        target1Quat.multiply(this.correctionQuat);

        const target2Quat = new THREE.Quaternion();
        const lookAtMatrix2 = new THREE.Matrix4().lookAt(
            target2Position,
            endPosition,
            new THREE.Vector3(0, 1, 0)
        );
        target2Quat.setFromRotationMatrix(lookAtMatrix2);
        target2Quat.multiply(this.correctionQuat);

        cube.userData.quat[0] = firstQuat;
        cube.userData.quat[1] = target1Quat;
        cube.userData.quat[2] = target2Quat;
    }
    //cubeの1次運動
    cubeMove1(i, val) {
        const cube = this._cubes[i];
        const ec = Ease.cubicOut(val);
        cube.position.x = this._x + ec * (cube.userData.target[0] - this._x);
        cube.position.y = this._y + ec * (cube.userData.target[1] - this._y);
        cube.position.z = this._z + ec * (cube.userData.target[2] - this._z);
        //回転用ベクトル3,4と回転val 5
        cube.quaternion.slerpQuaternions(cube.userData.quat[0], cube.userData.quat[1], val);
        cube.rotation.y = val * Math.PI * 2;
    }
    //cubeの2次運動
    cubeMove2(i, val) {
        const cube = this._cubes[i];
        const et = Ease.cubicIn(val);
        cube.position.x = cube.userData.target[0] + (et * (cube.userData.target[3] - cube.userData.target[0]));
        cube.position.y = cube.userData.target[1] + (et * (cube.userData.target[4] - cube.userData.target[1]));
        cube.position.z = cube.userData.target[2] + (et * (cube.userData.target[5] - cube.userData.target[2]));
        //回転用ベクトル3,4と回転val 5
        cube.quaternion.slerpQuaternions(cube.userData.quat[1], cube.userData.quat[2], val);
    }
    //cubeの3次運動
    cubeMove3(i, bp) {
        const cube = this._cubes[i];

        const x = cube.userData.target[3];
        const y = cube.userData.target[4];
        const z = cube.userData.target[5];
        const rh = cube.userData.target[6];
        const rv = cube.userData.target[7];
        const rd = cube.userData.target[8];

        if (bp <= 0.5) {
            const eo = Ease.sineOut(bp);
            cube.position.x = eo * 5 * (Math.sin(rh) * Math.sin(rv)) + x;
            cube.position.y = eo * 5 * (Math.cos(rv)) + y;
            cube.position.z = eo * 5 * (Math.cos(rh) * Math.sin(rv)) + z;
        } else {
            const ei = Ease.sineIn(bp);
            cube.position.x = (1 - ei) * 5 * (Math.sin(rh) * Math.sin(rv)) + x;
            cube.position.y = (1 - ei) * 5 * (Math.cos(rv)) + y;
            cube.position.z = (1 - ei) * 5 * (Math.cos(rh) * Math.sin(rv)) + z;
        }
    }
    //cubeの4次運動
    cubeMove4(i, bp) {
        const cube = this._cubes[i];
        let val = 1;
        if (bp <= 0.5) {
            val = Ease.sineOut(bp) * 2 + 1;
        } else {
            val = (1 - Ease.sineIn(bp)) * 2 + 1;
        }
        cube.scale.set(val, val, val);
    }
    //sphereの回転
    sphereMove(i, rot) {
        const cube = this._cubes[i];

        const x = cube.userData.target[3];
        const z = cube.userData.target[5];
        const rh = cube.userData.target[6];
        const rv = cube.userData.target[7];
        const rd = cube.userData.target[8];
        let theta = rh + rot;
        theta = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const sv = this._calcVector(rd, theta, rv);
        cube.userData.target[3] = sv.x;
        cube.userData.target[5] = sv.z;
        cube.userData.target[6] = theta;
        cube.lookAt(0, 0, 0);
    }
    //backgroundのスクロール
    backtexMove(num) {
        this._background.material.map.offset.y += this._sabispeed[num];
    }
    //cube出現時の透過性調整
    cubeView(i, val) {
        const cube = this._cubes[i];
        for (let i = 0; i < 6; i++) {
            cube.material[i].opacity = Ease.sineOut(val);
        }
    }
    //cubeの色設定
    cubeColor(i, ch) {
        const cube = this._cubes[i];
        for (let i = 0; i < 6; i++) {
            if (i != 4) {
                cube.material[i].color.set(this._ecol[ch]);
            }
        }
    }
    //cubeの視点をカメラに向ける
    lookMe(i) {
        this._cubes[i].lookAt(this._camX, this._camY, this._camZ);
    }
    //サビ時のbackground変更
    backgroundChange(b, num) {
        if (b) {
            this._background.material.map = this._sabiTex[num];
            console.log('sabi', num);
        } else {
            this._background.material.map = this._backgroundTex;
        }
    }
    //sphere完成後のcubeを変形する
    changeCube(i) {
        const cube = this._cubes[i];
        cube.geometry.dispose();
        const geometry = new THREE.SphereGeometry(1, 16, 8);
        const material = new THREE.MeshBasicMaterial({
            color: this._ecol[i % 8],
            transparent: true,
            opacity: 0.6
        });
        cube.geometry = geometry;
        cube.material = material;
    }
    // レンダリング処理
    render() {
        this._renderer.render(this._scene, this._camera);
    }

    //変数定義
    _initVar() {
        this._cubes = [];
        //アニメーション定義
        this._spanid = 0;
        this.floorSPD = 0.2;
        this.spherelimit = 0;

        //カメラ関係
        this._isSwiping = false;
        this._camTX = 0;
        this._camTY = 0;
        //中心からのカメラ初期距離
        this._camdist = 60;
        //カメラの初期position(z軸上)
        this._camX = 0;
        this._camY = 0;
        this._camZ = this._camdist;
        //カメラ加速度(水平方向 x-z面)
        this._camArrowH = -0.01;
        //カメラ加速度(垂直方向 x-y面)
        this._camArrowV = 0.01;
        //カメラ中心からの角度(x-z面上)
        this._camH = 0;
        //カメラ中心からの角度(x-y面上の中央)
        this._camV = Math.PI / 2;

        //カメラ中心からの距離限界値
        this._camdistMin = 10;
        this._camdistMax = 100;

        //cubeの方向に関する変数定義
        this.correctionQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), // Y軸
            Math.PI // 180度
        );
        //カラー関係
        this._col = {
            'N': 'rgb(255, 255, 255)',
            'C': 'rgb(255, 148, 148)',
            'D': 'rgb(255, 200, 156)',
            'E': 'rgb(255, 237, 150)',
            'F': 'rgb(162, 255, 177)',
            'G': 'rgb(165, 237, 255)',
            'A': 'rgb(171, 159, 255)',
            'B': 'rgb(224, 145, 255)'
        };
        this._ecol = [
            '#1E2A56',
            '#526199',
            '#42503C',
            '#1560FF',
            '#BDB5A0',
            '#8DA473',
            '#BBBDC7',
            '#CCCCEE'
        ];
        //重なり判定用
        this._preSy = 10;

        //背景の星描画
        // for (let i = 0; i < 100; i++) {
        //     const geotest = new THREE.SphereGeometry(0.1, 8, 8); // 半径0.1の球
        //     const matetest = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 緑色
        //     const sphetest = new THREE.Mesh(geotest, matetest);

        //     // 座標を指定
        //     sphetest.position.copy(this._spoint[i]);

        //     this._scene.add(sphetest);
        // }
        //sabi用の配列数設定
        const sabix = [32, 64, 28, 32, 32];
        const sabiy = [16, 32, 14, 16, 16];
        this._sabispeed = [0.04, 0.04, 0.06, 0.06, 0.08];
        this._sabiTex = [];
        //背景テクスチャの作成
        for (let i = 0; i < 5; i++) {
            this._sabiTex[i] = new THREE.TextureLoader().load(`/img/back${i}.png`);
            this._sabiTex[i].wrapS = this._sabiTex[i].wrapT = THREE.RepeatWrapping;
            this._sabiTex[i].repeat.set(sabix[i], sabiy[i]);
        }


    }
    //シーン、カメラ、レンダラーの初期化
    _initScene() {
        // シーンを作成
        this._scene = new THREE.Scene();
        //this._scene.fog = new THREE.Fog(0xdd4488, 50, 200);

        // レンダラーを作成
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x000088);
        //this._renderer.shadowMap.enabled = true;

        // 背景を 作成
        this._backgroundTex = new THREE.TextureLoader().load('/img/space.png');
        this._backgroundTex.wrapS = this._backgroundTex.wrapT = THREE.RepeatWrapping;
        this._backgroundTex.repeat.set(12, 6);

        //
        const geometry = new THREE.SphereGeometry(500, 64, 64);

        const backgroundMaterial = new THREE.MeshBasicMaterial({
            map: this._backgroundTex,
            side: THREE.BackSide,
        });
        this._background = new THREE.Mesh(geometry, backgroundMaterial);
        this._scene.add(this._background);

        // 光源(太陽)
        // const sunlight = new THREE.DirectionalLight(0xffffff, 1);
        // sunlight.position.set(450, 50, 0);
        // sunlight.target.position.set(0, 0, 0);
        // this._scene.add(sunlight);

        // 光源(下部)
        // const lightD = new THREE.DirectionalLight(0xffffff, 0.5);
        // lightD.position.set(-450, -50, 0);
        // lightD.target.position.set(0, 0, 0);
        // this._scene.add(lightD);


        //光源（4側面)
        // const lights = [];
        // for (let i = 0; i < 4; i++) {
        //     lights[i] = new THREE.DirectionalLight(0xffffff, 1);
        //     const x = [0, 50, 0, -50];
        //     const z = [50, 0, -50, 0];
        //     lights[i].position.set(x[i], 8, z[i]);
        //     lights[i].target.position.set(0, 0, 0);
        //     this._scene.add(lights[i]);
        // }
        // ライトの範囲を可視化
        // const helper = new THREE.PointLightHelper(light);
        // this._scene.add(helper);

        // カメラを作成（視野角, アスペクト比, 最近距離, 最遠距離）
        this._camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1200
        );

        this._camera.position.set(this._camX, this._camY, this._camZ);
        this._camera.lookAt(0, 0, 0); // 中心方向を見る

        const container = document.getElementById("view");
        container.appendChild(this._renderer.domElement);
    }
    _cameraControl() {
        this._camH += this._camArrowH / (Math.PI * 2);
        //正規化
        this._camH = ((this._camH % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        this._camV += this._camArrowV / (Math.PI * 2);
        if (this._camV > Math.PI) {
            this._camV = Math.PI * 2 - this._camV;
            this._camArrowV *= -1;
        }
        if (this._camV < 0) {
            this._camV *= -1;
            this._camArrowV *= -1;
        }
        this._cameraMove();
    }
    _cameraMove() {
        const ch = this._camH;
        const cv = this._camV;
        const cp = this._calcVector(this._camdist, this._camH, this._camV);
        this._camX = cp.x;
        this._camY = cp.y;
        this._camZ = cp.z;
        // this._camX = this._camdist * Math.sin(ch) * Math.sin(cv);
        // this._camY = this._camdist * Math.cos(cv);
        // this._camZ = this._camdist * Math.cos(ch) * Math.sin(cv);

        this._camera.position.set(this._camX, this._camY, this._camZ);
        // this._testcam.position.set(this._camX, this._camY, this._camZ);
        // this._camera.position.set(0, 120, 0);
        this._camera.lookAt(0, 0, 0); // 中心方向を見る
    }
    _resize() {
        let w = window.innerWidth;
        let h = window.innerHeight;

        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(w, h);

    }

    _rotateZ(x, y, z, alpha) {
        const sinA = Math.sin(alpha);
        const cosA = Math.cos(alpha);
        const newX = x * sinA + y * cosA;
        const newY = x * cosA - y * sinA;
        return { x: newX, y: newY, z: z }
    }
    _calcVector(d, h, v) {
        return new THREE.Vector3(
            d * Math.sin(h) * Math.sin(v),
            d * Math.cos(v),
            d * Math.cos(h) * Math.sin(v)
        )
    }
}