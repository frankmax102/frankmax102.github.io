class LotterySystem {
    constructor() {
        this.prizes = [];
        this.results = [];
        this.isRolling = false;
        this.cheatMode = false;
        this.cheatItems = [];
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.minRangeInput = document.getElementById('minRange');
        this.maxRangeInput = document.getElementById('maxRange');
        this.totalDrawCountDisplay = document.getElementById('totalDrawCount');
        this.prizeInputs = document.getElementById('prizeInputs');
        this.addPrizeBtn = document.getElementById('addPrize');
        this.startLotteryBtn = document.getElementById('startLottery');
        this.numberDisplay = document.getElementById('numberDisplay');
        this.prizeDisplay = document.getElementById('prizeDisplay');
        this.resultsList = document.getElementById('resultsList');
        this.clearResultsBtn = document.getElementById('clearResults');
        
        // 作弊功能元素
        this.cheatPanel = document.getElementById('cheatPanel');
        this.closeCheatPanel = document.getElementById('closeCheatPanel');
        this.cheatInputs = document.getElementById('cheatInputs');
        this.addCheatItemBtn = document.getElementById('addCheatItem');
        this.enableCheatBtn = document.getElementById('enableCheat');
        this.disableCheatBtn = document.getElementById('disableCheat');
        this.clearCheatBtn = document.getElementById('clearCheat');
        this.cheatStatus = document.getElementById('cheatStatus');
    }

    bindEvents() {
        this.addPrizeBtn.addEventListener('click', () => this.addPrize());
        this.startLotteryBtn.addEventListener('click', () => this.startLottery());
        this.startLotteryBtn.addEventListener('dblclick', () => this.toggleCheatPanel()); // 雙擊抽獎按鈕開啟作弊面板
        this.clearResultsBtn.addEventListener('click', () => this.clearResults());
        
        // 範圍驗證
        this.minRangeInput.addEventListener('input', () => this.validateRange());
        this.maxRangeInput.addEventListener('input', () => this.validateRange());
        
        // 監聽獎項變化，自動更新抽取數量
        this.prizeInputs.addEventListener('input', () => this.updateTotalDrawCount());
        
        // 作弊功能事件
        this.closeCheatPanel.addEventListener('click', () => this.toggleCheatPanel());
        this.addCheatItemBtn.addEventListener('click', () => this.addCheatItem());
        this.enableCheatBtn.addEventListener('click', () => this.enableCheat());
        this.disableCheatBtn.addEventListener('click', () => this.disableCheat());
        this.clearCheatBtn.addEventListener('click', () => this.clearCheat());
        
        // 監聽作弊項目變化
        this.cheatInputs.addEventListener('input', () => this.updateCheatItems());
        
        // 快捷鍵 Ctrl+Q - 移到DOMContentLoaded事件中
    }

    addPrize() {
        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-item';
        prizeItem.innerHTML = `
            <input type="text" placeholder="獎項名稱" class="prize-name">
            <input type="number" placeholder="數量" class="prize-quantity" min="1" value="1">
            <button class="remove-prize" onclick="lotterySystem.removePrize(this)">刪除</button>
        `;
        this.prizeInputs.appendChild(prizeItem);
        this.updateTotalDrawCount(); // 添加獎項後更新總數
    }

    removePrize(button) {
        button.parentElement.remove();
        this.updateTotalDrawCount(); // 刪除獎項後更新總數
    }

    validateRange() {
        const min = parseInt(this.minRangeInput.value);
        const max = parseInt(this.maxRangeInput.value);
        
        if (min >= max) {
            this.maxRangeInput.value = min + 1;
        }
        
        if (min < 1) {
            this.minRangeInput.value = 1;
        }
    }

    updateTotalDrawCount() {
        const prizes = this.getPrizes();
        const totalCount = prizes.reduce((sum, prize) => sum + prize.quantity, 0);
        this.totalDrawCountDisplay.textContent = totalCount;
    }

    getPrizes() {
        this.prizes = [];
        const prizeItems = this.prizeInputs.querySelectorAll('.prize-item');
        
        prizeItems.forEach(item => {
            const name = item.querySelector('.prize-name').value.trim();
            const quantity = parseInt(item.querySelector('.prize-quantity').value) || 0;
            
            if (name && quantity > 0) {
                this.prizes.push({ name, quantity });
            }
        });
        
        return this.prizes;
    }

    async startLottery() {
        if (this.isRolling) return;
        
        const min = parseInt(this.minRangeInput.value);
        const max = parseInt(this.maxRangeInput.value);
        const prizes = this.getPrizes();
        
        if (prizes.length === 0) {
            alert('請至少設定一個獎項！');
            return;
        }
        
        if (min >= max) {
            alert('最大數字必須大於最小數字！');
            return;
        }
        
        // 計算總抽取數量（所有獎項數量加總）
        const drawCount = prizes.reduce((sum, prize) => sum + prize.quantity, 0);
        
        if (drawCount === 0) {
            alert('請設定獎項數量！');
            return;
        }
        
        // 檢查可抽取的數字範圍是否足夠
        const availableNumbers = max - min + 1;
        if (drawCount > availableNumbers) {
            alert(`抽取數量不能超過可用數字範圍！\n需要抽取：${drawCount}個數字\n可用範圍：${min}-${max} (共${availableNumbers}個數字)`);
            return;
        }
        
        this.isRolling = true;
        this.startLotteryBtn.disabled = true;
        this.startLotteryBtn.textContent = '抽獎中...';
        
        // 開始滾動動畫
        this.startRollingAnimation(min, max, drawCount);
        
        // 等待動畫完成後顯示結果
        setTimeout(() => {
            this.stopRollingAndShowResult(min, max, prizes, drawCount);
        }, 2000);
    }

    startRollingAnimation(min, max, drawCount) {
        this.numberDisplay.classList.add('rolling');
        this.prizeDisplay.textContent = '';
        
        const rollInterval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            this.numberDisplay.textContent = drawCount > 1 ? `${randomNum}...` : randomNum;
        }, 50);
        
        this.rollInterval = rollInterval;
    }

    stopRollingAndShowResult(min, max, prizes, drawCount) {
        clearInterval(this.rollInterval);
        this.numberDisplay.classList.remove('rolling');
        
        let drawnNumbers, drawnResults;
        
        if (this.cheatMode && this.cheatItems.length > 0) {
            // 作弊模式：使用預設的號碼和獎項
            drawnNumbers = this.cheatItems.map(item => item.number).sort((a, b) => a - b);
            drawnResults = this.cheatItems.map(item => ({
                number: item.number,
                prize: item.prize,
                timestamp: new Date()
            }));
        } else {
            // 正常模式：生成隨機數字並分配獎項
            drawnNumbers = this.generateUniqueNumbers(min, max, drawCount);
            drawnResults = this.assignPrizesToNumbers(drawnNumbers, prizes);
        }
        
        // 顯示結果
        this.displayMultipleResults(drawnNumbers, drawnResults);
        
        // 記錄所有結果
        this.results.push(...drawnResults);
        
        this.updateResultsDisplay();
        
        // 重置按鈕狀態
        this.isRolling = false;
        this.startLotteryBtn.disabled = false;
        this.startLotteryBtn.textContent = '開始抽獎';
    }

    generateUniqueNumbers(min, max, count) {
        const numbers = [];
        const availableNumbers = [];
        
        // 創建可用數字陣列
        for (let i = min; i <= max; i++) {
            availableNumbers.push(i);
        }
        
        // 隨機選擇不重複的數字
        for (let i = 0; i < count && availableNumbers.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            numbers.push(availableNumbers[randomIndex]);
            availableNumbers.splice(randomIndex, 1);
        }
        
        return numbers.sort((a, b) => a - b); // 排序結果
    }

    assignPrizesToNumbers(numbers, prizes) {
        const results = [];
        let numberIndex = 0;
        
        // 為每個獎項類型分配對應數量的數字
        prizes.forEach(prize => {
            for (let i = 0; i < prize.quantity && numberIndex < numbers.length; i++) {
                results.push({
                    number: numbers[numberIndex],
                    prize: prize.name,
                    timestamp: new Date()
                });
                numberIndex++;
            }
        });
        
        // 如果還有剩餘的數字沒有分配到獎項，標記為無獎項
        while (numberIndex < numbers.length) {
            results.push({
                number: numbers[numberIndex],
                prize: '無獎項',
                timestamp: new Date()
            });
            numberIndex++;
        }
        
        return results;
    }

    displayMultipleResults(numbers, results) {
        if (numbers.length === 1) {
            // 單個結果的顯示方式
            this.numberDisplay.textContent = numbers[0];
            this.numberDisplay.classList.remove('multiple');
            this.prizeDisplay.textContent = results[0].prize !== '無獎項' ? `🎉 ${results[0].prize} 🎉` : '沒有獎項';
        } else {
            // 多個結果的顯示方式
            this.numberDisplay.textContent = numbers.join(', ');
            this.numberDisplay.classList.add('multiple');
            
            // 統計獎項分配情況
            const prizeStats = this.getPrizeStats(results);
            if (prizeStats.length > 0) {
                this.prizeDisplay.textContent = `🎉 中獎獎項: ${prizeStats.join(', ')} 🎉`;
            } else {
                this.prizeDisplay.textContent = '沒有獎項';
            }
        }
    }

    getPrizeStats(results) {
        const stats = {};
        results.forEach(result => {
            if (result.prize !== '無獎項') {
                stats[result.prize] = (stats[result.prize] || 0) + 1;
            }
        });
        
        return Object.entries(stats).map(([prize, count]) => 
            count > 1 ? `${prize}(${count}個)` : prize
        );
    }


    updateResultsDisplay() {
        this.resultsList.innerHTML = '';
        
        this.results.slice().reverse().forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div>
                    <div class="result-number">#${result.number}</div>
                    <div class="result-prize">${result.prize}</div>
                </div>
                <div style="color: #6c757d; font-size: 0.9em;">
                    ${result.timestamp.toLocaleTimeString()}
                </div>
            `;
            this.resultsList.appendChild(resultItem);
        });
    }

    clearResults() {
        this.results = [];
        this.updateResultsDisplay();
        this.numberDisplay.textContent = '準備開始';
        this.prizeDisplay.textContent = '';
    }

    // 作弊功能方法
    toggleCheatPanel() {
        this.cheatPanel.classList.toggle('show');
    }

    addCheatItem() {
        const cheatItem = document.createElement('div');
        cheatItem.className = 'cheat-item';
        cheatItem.innerHTML = `
            <input type="number" placeholder="號碼" class="cheat-number" min="1">
            <input type="text" placeholder="獎項名稱" class="cheat-prize">
            <button class="remove-cheat" onclick="lotterySystem.removeCheatItem(this)">刪除</button>
        `;
        this.cheatInputs.appendChild(cheatItem);
    }

    removeCheatItem(button) {
        button.parentElement.remove();
        this.updateCheatItems();
    }

    updateCheatItems() {
        this.cheatItems = [];
        const cheatItems = this.cheatInputs.querySelectorAll('.cheat-item');
        
        cheatItems.forEach(item => {
            const number = parseInt(item.querySelector('.cheat-number').value);
            const prize = item.querySelector('.cheat-prize').value.trim();
            
            if (number && prize) {
                this.cheatItems.push({ number, prize });
            }
        });
    }

    enableCheat() {
        this.cheatMode = true;
        this.enableCheatBtn.classList.add('disabled');
        this.disableCheatBtn.classList.remove('disabled');
        this.cheatStatus.textContent = '作弊模式：已啟用';
        this.cheatStatus.style.color = '#28a745';
    }

    disableCheat() {
        this.cheatMode = false;
        this.enableCheatBtn.classList.remove('disabled');
        this.disableCheatBtn.classList.add('disabled');
        this.cheatStatus.textContent = '作弊模式：已停用';
        this.cheatStatus.style.color = '#6c757d';
    }

    clearCheat() {
        this.cheatInputs.innerHTML = '';
        this.cheatItems = [];
        this.disableCheat();
    }
}

// 初始化抽獎系統
const lotterySystem = new LotterySystem();

// 添加一些預設獎項
document.addEventListener('DOMContentLoaded', () => {
    // 預設添加一個獎項
    lotterySystem.addPrize();
    const firstPrize = document.querySelector('.prize-name');
    const firstQuantity = document.querySelector('.prize-quantity');
    if (firstPrize) firstPrize.value = '特等獎';
    if (firstQuantity) firstQuantity.value = '1';
    
    // 再添加一個獎項
    lotterySystem.addPrize();
    const secondPrize = document.querySelectorAll('.prize-name')[1];
    const secondQuantity = document.querySelectorAll('.prize-quantity')[1];
    if (secondPrize) secondPrize.value = '一等獎';
    if (secondQuantity) secondQuantity.value = '3';
    
    // 初始化時更新總抽取數量
    lotterySystem.updateTotalDrawCount();
    
    // 隱藏的作弊功能快捷鍵
    let cheatSequence = [];
    const cheatCode = ['c', 'h', 'e', 'a', 't']; // 輸入 "cheat" 來開啟作弊面板
    
    document.addEventListener('keydown', (e) => {
        // 主要快捷鍵：Ctrl+Q
        if (e.ctrlKey && (e.keyCode === 81 || e.key === 'q' || e.key === 'Q')) {
            e.preventDefault();
            e.stopPropagation();
            lotterySystem.toggleCheatPanel();
            return;
        }
        
        // 備用快捷鍵：Ctrl+Shift+Q
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 81 || e.key === 'q' || e.key === 'Q')) {
            e.preventDefault();
            e.stopPropagation();
            lotterySystem.toggleCheatPanel();
            return;
        }
        
        // 隱藏序列：輸入 "cheat" 來開啟作弊面板
        cheatSequence.push(e.key.toLowerCase());
        if (cheatSequence.length > cheatCode.length) {
            cheatSequence.shift();
        }
        
        if (cheatSequence.join('') === cheatCode.join('')) {
            lotterySystem.toggleCheatPanel();
            cheatSequence = []; // 重置序列
        }
    });
    
    // 測試按鈕已移除 - 作弊功能完全隱藏
});
