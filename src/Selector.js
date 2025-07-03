export class Selector {
    async getChoice() {
        return new Promise((resolve) => {
            // 選択処理
            const choices = document.querySelectorAll(".choice");
            const overlay = document.getElementById("overlay");
            const view = document.getElementById("view");
            view.style.display = "none";
            //ボタン出現
            choices.forEach((choice, index) => {
                setTimeout(() => {
                    choice.style.transform = "translateX(0)";
                    choice.style.opacity = "1";
                }, index * 100);
                setTimeout(() => {
                    choice.classList.remove("ape");
                }, 500);
            })
            choices.forEach(choice => {
                choice.addEventListener("click", () => {
                    const selectedValue = choice.dataset.value;

                    // bounce クラスを一旦削除して再追加（連続クリック対策）
                    choice.classList.remove("bounce");
                    void choice.offsetWidth; // 強制再描画（トリガーリセット）
                    choice.classList.add("bounce");
                    //
                    choices.forEach((choice, index) => {
                        setTimeout(() => {
                            choice.style.transform = "translateX(50%)";
                            choice.style.opacity = "0";
                        }, index * 100);
                    })
                    // アニメーション終了後にオーバーレイ非表示＆結果表示
                    choice.addEventListener("animationend", () => {
                        overlay.style.display = "none"; // オーバーレイを非表示に
                        view.style.display = "block";
                    }, { once: true }); // 一度だけ発火
                    resolve(selectedValue);

                });

            });

        });
    };
}

