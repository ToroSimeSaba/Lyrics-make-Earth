import * as THREE from 'three';
import { Mat } from './main';
import { Ease } from 'textalive-app-api';

export class ThreeManager {
    constructor() {
        this._InitScene();
        this._InitVar();
        //resize
        window.addEventListener("resize", () => this._resize());
    }

    //初期化
    _InitScene() {
        // シーンを作成
        this._scene = new THREE.Scene();
        //this._scene.fog = new THREE.Fog(0xdd4488, 50, 200);

        // レンダラーを作成
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setClearColor(0x000088);
        //this._renderer.shadowMap.enabled = true;

        //　フロア作成
        const sphereTex = new THREE.TextureLoader().load('src/img/space.png');
        sphereTex.wrapS = sphereTex.wrapT = THREE.RepeatWrapping;
        sphereTex.repeat.set(32, 16);
        //
        const geometry = new THREE.SphereGeometry(500, 64, 64);

        const sphereMaterial = new THREE.MeshBasicMaterial({
            map: sphereTex,
            side: THREE.BackSide,
        });
        const sphere = new THREE.Mesh(geometry, sphereMaterial);
        this._scene.add(sphere);
        //this.floor = floor;

        // 光源(上部)
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 30, 0);
        light.target.position.set(0, 0, 0);
        this._scene.add(light);

        // 光源(下部)
        const lightD = new THREE.DirectionalLight(0xffffff, 1);
        lightD.position.set(0, -30, 0);
        lightD.target.position.set(0, 0, 0);
        this._scene.add(lightD);


        //光源（4側面)
        const lights = [];
        for (let i = 0; i < 4; i++) {
            lights[i] = new THREE.DirectionalLight(0xffffff, 1);
            const x = [0, 50, 0, -50];
            const z = [50, 0, -50, 0];
            lights[i].position.set(x[i], 8, z[i]);
            lights[i].target.position.set(0, 0, 0);
            this._scene.add(lights[i]);
        }

        // カメラを作成（視野角, アスペクト比, 最近距離, 最遠距離）
        this._camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1200
        );
        this._camdist = 52;

        this._camX = 0;
        this._camY = 0;
        this._camZ = this._camdist;
        this._camera.position.set(this._camX, this._camY, this._camZ);
        this._camera.lookAt(0, 0, 0); // 中心方向を見る

        const container = document.getElementById("view");
        container.appendChild(this._renderer.domElement);
    }

    //変数定義
    _InitVar() {


        //アニメーション定義
        this._spanid = 0;

        this.floorSPD = 0.2;

        //カメラ関係
        this._camArrowH = 0;//0.01; //水平方向
        this._camArrowV = 0;//0.01; //垂直方向
        this._camH = 0;
        this._camV = Math.PI / 2;
        this._isSwiping = false;
        this._camTX = 0;
        this._camTY = 0;

        //
        this.correctionQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), // Y軸
            Math.PI // 180度
        );
        //カラー関係
        this._col = {
            'N': '#888888',
            'C': '#A26769',
            'D': '#CBA135',
            'E': '#D6C58F',
            'F': '#C4A69F',
            'G': '#7A9E9F',
            'A': '#6C7A89',
            'B': '#8F7E91'
        };
        //重なり判定用
        this._yd = 20;
    }

    //cube定義
    InitObjects(lyrics) {
        this._lyrics = lyrics;
        //cube初期位置
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._cubes = [];
        //歌詞のテクスチャ作成
        const outMat = new Mat(this._lyrics).getMaterials();
        //立方体のジオメトリ（形状）とマテリアル（見た目）を作成
        const geometry = new THREE.BoxGeometry(3, 3, 0.5);
        for (let i = 0; i < this._lyrics.length; i++) {
            const cube = new THREE.Mesh(geometry, outMat[i]);
            //位置／回転の定義
            cube.position.set(this._x, this._y, this._z);

            //userData定義
            cube.userData.target = [];
            cube.userData.quat = [];

            this._scene.add(cube);
            this._cubes.push(cube);
            //this.edging(geometry, i);
        }
        // const geometry2 = new THREE.BoxGeometry(3, 3, 3);
        // this._testcam = new THREE.Mesh(geometry2, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
        // this._scene.add(this._testcam);
    }
    //cubeリセット
    cubeReset(i) {
        const cube = this._cubes[i];
        cube.position.set(0, 0, 0);
        for (let j = 0; j < 6; j++) {
            cube.material[j].opacity = 0;
        }
    }

    update(delta) {
        // アニメーションやオブジェクトの更新処理
        this._cameraControl();
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
                this._camArrowV -= 0.01;
                break;
            case 'ArrowDown':
                this._camArrowV += 0.01;
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
    _cameraControl() {
        this._camH += this._camArrowH / (Math.PI * 2);
        if (this._camH >= Math.PI * 2) {
            this._camH = 0;
        }
        if (this._camH < 0) {
            this._camH = Math.PI * 2;
        }

        this._camV += this._camArrowV / (Math.PI * 2);
        if (this._camV > Math.PI) {
            this._camV = Math.PI;
            this._camArrowV *= -1;
        }
        if (this._camV < 0) {
            this._camV -= this._camArrowV / (Math.PI * 2);
            this._camArrowV *= -1;
        }
        this._cameraMove();
    }
    _cameraMove() {
        const ch = this._camH;
        const cv = this._camV;
        this._camX = this._camdist * Math.sin(ch) * Math.sin(cv);
        this._camY = this._camdist * Math.cos(cv);
        this._camZ = this._camdist * Math.cos(ch) * Math.sin(cv);

        this._camera.position.set(this._camX, this._camY, this._camZ);
        // this._testcam.position.set(this._camX, this._camY, this._camZ);
        // this._camera.position.set(0, 120, 0);
        this._camera.lookAt(0, 0, 0); // 中心方向を見る
    }
    //cubeのターゲット設定
    cubeTarget(i, ws, wl) {
        const cube = this._cubes[i];
        // cube position 1の広がり具合
        const dep = 8;
        const dep2 = 3;
        // cube position 2の広がり具合
        //const depfl = 20;
        // ターゲット1までの中心からの距離
        const dist = 40;
        // ターゲット表示時の位置予測
        const yh = (this._camArrowH * 30) / Math.PI + this._camH;
        const yv = (this._camArrowV * 30) / Math.PI + this._camV;

        const rh = Math.random() * Math.PI * 2;
        const rv = Math.random() * Math.PI;

        let x1 = 0;
        let y1 = 0;
        let z1 = 0;
        //球体の半径
        const rdist = 15;//Math.random() * 20;

        //Wordの最初かどうかを判定
        if (ws == 's') {
            x1 = dist * Math.sin(yh) * Math.sin(yv)
                - Math.cos(yh) * (Math.random() * wl / 2 * dep2);
            y1 = (Math.random() - 0.5) * dep
                + dist * Math.cos(yv);
            z1 = dist * Math.cos(yh) * Math.sin(yv)
                + Math.sin(yh) * (Math.random() * wl * dep2);
            //重なり判定
            if (y1 - 3 < this._yd && this._yd < y1 + 3) {
                console.log('check', i);
                y1 += 3 * (Math.random() < 0.5 ? -1 : 1);
            }
            this._yd = y1;

        } else {
            const prex = this._cubes[i - 1].userData.target[0];
            const prey = this._cubes[i - 1].userData.target[1];
            const prez = this._cubes[i - 1].userData.target[2];
            x1 = prex + (3 * Math.cos(yh));
            y1 = prey + (Math.random() - 0.5) * dep2;
            z1 = prez - (3 * Math.sin(yh));

        }
        cube.userData.target[0] = x1;
        cube.userData.target[1] = y1;
        cube.userData.target[2] = z1;

        const x2 = rdist * Math.sin(rh) * Math.sin(rv);
        const y2 = rdist * Math.cos(rv);
        const z2 = rdist * Math.cos(rh) * Math.sin(rv);
        cube.userData.target[3] = x2;
        cube.userData.target[4] = y2;
        cube.userData.target[5] = z2;
        cube.userData.target[6] = rh;
        cube.userData.target[7] = rv;
        cube.userData.target[8] = rdist;

        //Quaternion 初期値
        const firstQuat = cube.quaternion.clone();
        const target1Position = new THREE.Vector3(
            this._camdist * Math.sin(yh) * Math.sin(yv),
            this._camY,
            this._camdist * Math.cos(yh) * Math.sin(yv)
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
    //cubeの運動
    cubeMove1(i, val) {
        const cube = this._cubes[i];
        const et = Ease.cubicOut(val);
        cube.position.x = et * cube.userData.target[0];
        cube.position.y = et * cube.userData.target[1];
        cube.position.z = et * cube.userData.target[2];
        //回転用ベクトル3,4と回転val 5
        cube.quaternion.slerpQuaternions(cube.userData.quat[0], cube.userData.quat[1], val);
    }
    cubeMove2(i, val) {
        const cube = this._cubes[i];
        const et = Ease.cubicIn(val);
        cube.position.x = cube.userData.target[0] + (et * (cube.userData.target[3] - cube.userData.target[0]));
        cube.position.y = cube.userData.target[1] + (et * (cube.userData.target[4] - cube.userData.target[1]));
        cube.position.z = cube.userData.target[2] + (et * (cube.userData.target[5] - cube.userData.target[2]));
        //回転用ベクトル3,4と回転val 5
        cube.quaternion.slerpQuaternions(cube.userData.quat[1], cube.userData.quat[2], val);
    }
    cubeMove3(i, bp) {
        const cube = this._cubes[i];

        const rh = cube.userData.target[6];
        const rv = cube.userData.target[7];
        if (bp <= 0.5) {
            const eo = Ease.sineOut(bp);
            cube.position.x = eo * 5 * (Math.sin(rh) * Math.sin(rv)) + cube.userData.target[3];
            cube.position.y = eo * 5 * (Math.cos(rv)) + cube.userData.target[4];
            cube.position.z = eo * 5 * (Math.cos(rh) * Math.sin(rv)) + cube.userData.target[5];
        } else {
            const ei = Ease.sineIn(bp);
            cube.position.x = (1 - ei) * 5 * (Math.sin(rh) * Math.sin(rv)) + cube.userData.target[3];
            cube.position.y = (1 - ei) * 5 * (Math.cos(rv)) + cube.userData.target[4];
            cube.position.z = (1 - ei) * 5 * (Math.cos(rh) * Math.sin(rv)) + cube.userData.target[5];
        }
    }
    cubeView(i, val) {
        const cube = this._cubes[i];
        for (let i = 0; i < 6; i++) {
            cube.material[i].opacity = Ease.quadInOut(val);
        }
    }
    cubeColor(i, ch) {
        const cube = this._cubes[i];

        for (let i = 0; i < 6; i++) {
            if (i != 4) {
                cube.material[i].color.set(this._col[ch]);
            }
        }
    }
    tapStart(e) {
        this._camTX = e.touches[0].clientX;
        this._camTY = e.touches[0].clientY;
        this._isSwiping = true;
    }
    tapMove(e) {
        if (!this._isSwiping) return;
        const deltaH = e.touches[0].clientX - this._camTX;
        const deltaV = e.touches[0].clientY - this._camTY;
        // 水平方向のスワイプを検出（縦方向は無視）
        this._isSwiping = false;

        if (deltaH > 0) {
            this._camArrowH += deltaH;
        } else {
            this._camArrowH -= deltaH;
        }
        if (deltaV > 0) {
            this._camArrowV -= deltaV;
        } else {
            this._camArrowV += deltaV;
        }

    }
    tapEnd(d) {
        this._isSwiping = true;
    }


    render() {
        // レンダリング処理
        this._renderer.render(this._scene, this._camera);
    }


    _resize() {
        let w = window.innerWidth;
        let h = window.innerHeight;

        this._camera.aspect = w / h;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize(w, h);

    }

}
