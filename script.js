let currentCategory = '';
let targetListType = '';
let selectedIndex = null; // 現在メニューで選択しているカードの番号

const colorMap = {
    vegetables: '#ff9800',
    meat: '#e53935',
    fish: '#1e88e5',
    others: '#8e24aa'
};

// 全カテゴリのデータ（
let stockData = {
    vegetables: {
        shopping: [],
        fridge: []
    },
    meat: {
        shopping: [],
        fridge: []
    },
    fish: {
        shopping: [],
        fridge: []
    },
    others: {
        shopping: [],
        fridge: []
    }
};

window.onload = function() {
    renderAll();
};

/* --- 新規追加用の関数 --- */
function addCard(categoryId, listType) {
    currentCategory = categoryId;
    targetListType = listType;
    document.getElementById('input-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('input-modal').style.display = 'none';
    document.getElementById('emoji-input').value = '';
    document.getElementById('name-input').value = '';
    document.getElementById('count-input').value = '1';
}

function submitCard() {
    const emoji = document.getElementById('emoji-input').value;
    const name = document.getElementById('name-input').value;
    const count = parseInt(document.getElementById('count-input').value) || 1;

    if (emoji && name) {
        stockData[currentCategory][targetListType].push({ emoji: emoji, name: name, count: count });
        renderAll();
        closeModal();
    } else {
        alert('絵文字と名前を両方入力してください。');
    }
}

/* --- カードをタップした時のメニュー操作関数（新設） --- */
function openActionMenu(categoryId, listType, index) {
    currentCategory = categoryId;
    targetListType = listType;
    selectedIndex = index;

    const item = stockData[categoryId][listType][index];
    
    // メニューの見出しを設定
    document.getElementById('action-title').innerText = `${item.emoji} ${item.name}`;
    // 現在の数量をセット
    document.getElementById('edit-count-input').value = item.count;
    
    // ボタンのテキストを移動先に応じて変える
    const moveBtn = document.getElementById('move-btn-text');
    if (listType === 'shopping') {
        moveBtn.innerText = '🧊 冷蔵庫へ入れる';
        moveBtn.style.backgroundColor = '#2196f3'; // 青
    } else {
        moveBtn.innerText = '🛒 買い物リストへ戻す';
        moveBtn.style.backgroundColor = '#ff9800'; // オレンジ
    }

    document.getElementById('action-modal').style.display = 'flex';
}

function closeActionModal() {
    // 閉じる前に、もし数量が変更されていたら保存する
    if (selectedIndex !== null) {
        const newCount = parseInt(document.getElementById('edit-count-input').value) || 1;
        stockData[currentCategory][targetListType][selectedIndex].count = newCount;
    }
    document.getElementById('action-modal').style.display = 'none';
    selectedIndex = null;
    renderAll();
}

// メニューから「移動」を押したとき
function executeMove() {
    // 閉じる前に数量の変更を確定させる
    const newCount = parseInt(document.getElementById('edit-count-input').value) || 1;
    stockData[currentCategory][targetListType][selectedIndex].count = newCount;

    const item = stockData[currentCategory][targetListType][selectedIndex];
    stockData[currentCategory][targetListType].splice(selectedIndex, 1);
    
    const toList = (targetListType === 'shopping') ? 'fridge' : 'shopping';
    stockData[currentCategory][toList].push(item);

    document.getElementById('action-modal').style.display = 'none';
    selectedIndex = null;
    renderAll();
}

// メ認から「削除」を押したとき
function executeDelete() {
    if (confirm('この食材を削除しますか？')) {
        stockData[currentCategory][targetListType].splice(selectedIndex, 1);
        document.getElementById('action-modal').style.display = 'none';
        selectedIndex = null;
        renderAll();
    }
}

/* --- 画面描画ロジック --- */
function renderAll() {
    const categories = ['vegetables', 'meat', 'fish', 'others'];
    categories.forEach(catId => {
        renderList(catId, 'shopping');
        renderList(catId, 'fridge');
    });
}

function renderList(catId, listType) {
    const grid = document.querySelector(`#${catId} .${listType}-list`);
    if (!grid) return;

    const cards = grid.querySelectorAll('.icon-slot:not(.add-btn)');
    cards.forEach(card => card.remove());

    const addBtn = grid.querySelector('.add-btn');

    stockData[catId][listType].forEach((item, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'icon-slot';
        
        // カードをタップしたらメニューを開く
        cardDiv.onclick = () => openActionMenu(catId, listType, index);

        // コスト badge (数量を表示)
        const costBadge = document.createElement('div');
        costBadge.className = 'cost-badge';
        costBadge.innerText = item.count; // ここにデータ内の数量を反映！
        costBadge.style.borderColor = colorMap[catId];
        costBadge.style.color = colorMap[catId];

        // 絵文字
        const emojiDiv = document.createElement('div');
        emojiDiv.className = 'slot-emoji';
        emojiDiv.innerText = item.emoji;

        // 名前
        const nameDiv = document.createElement('div');
        nameDiv.className = 'slot-name';
        nameDiv.innerText = item.name;

        cardDiv.appendChild(costBadge);
        cardDiv.appendChild(emojiDiv);
        cardDiv.appendChild(nameDiv);

        if (addBtn) {
            grid.insertBefore(cardDiv, addBtn);
        } else {
            grid.appendChild(cardDiv);
        }
    });
}