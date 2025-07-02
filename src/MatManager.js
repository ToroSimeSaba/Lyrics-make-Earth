import * as THREE from 'three';

//マテリアル作成
export class MatManager {
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
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, size, size);
        ctx.font = 'bold 200px sans-serif';
        ctx.fillStyle = 'rgb(50, 50, 50)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    textToMat(text) {
        const textMat = new THREE.MeshBasicMaterial({
            map: this.createTextTexture(text.text),
            transparent: true,
            //side: THREE.DoubleSide
        });

        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 右
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 左
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 上
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 下
            textMat,
            new THREE.MeshBasicMaterial({ color: 0x0000ff }), // 後
        ];
        for (let i = 0; i < 6; i++) {
            materials[i].transparent = true;
            materials[i].roughness = 0.5;
            materials[i].metalness = 0.5;
            materials[i].opacity = 0;
        }
        return materials;
    }
    getMaterials() {
        return this.texts.map(text => this.textToMat(text))
    }
}