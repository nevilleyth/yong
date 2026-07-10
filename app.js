const categoryIcons = {
    '餐饮': '🍔',
    '交通': '🚗',
    '购物': '🛒',
    '娱乐': '🎮',
    '医疗': '🏥',
    '其他': '📦'
};

const categoryNames = {
    '餐饮': 'อาหาร',
    '交通': 'ค่าเดินทาง',
    '购物': 'ช้อปปิ้ง',
    '娱乐': 'บันเทิง',
    '医疗': 'การแพทย์',
    '其他': 'อื่นๆ'
};

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function loadData() {
    const data = localStorage.getItem('expenseTracker');
    if (data) {
        return JSON.parse(data);
    }
    return {
        budget: 1000,
        expenses: []
    };
}

function saveData(data) {
    localStorage.setItem('expenseTracker', JSON.stringify(data));
}

function formatCurrency(amount) {
    return '¥' + amount.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function updateBudgetDisplay() {
    const data = loadData();
    const today = getToday();
    const todayExpenses = data.expenses.filter(e => e.date === today);
    const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = data.budget - todaySpent;

    document.getElementById('budget-display').textContent = formatCurrency(data.budget);
    document.getElementById('today-spent').textContent = formatCurrency(todaySpent);
    document.getElementById('remaining-budget').textContent = formatCurrency(Math.max(0, remaining));

    const progressFill = document.getElementById('progress-fill');
    const percentage = Math.min((todaySpent / data.budget) * 100, 100);
    progressFill.style.width = percentage + '%';

    progressFill.classList.remove('warning', 'danger');
    if (percentage >= 100) {
        progressFill.classList.add('danger');
    } else if (percentage >= 80) {
        progressFill.classList.add('warning');
    }
}

function renderExpenseItem(expense) {
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.innerHTML = `
        <div class="expense-left">
            <span class="expense-icon">${categoryIcons[expense.category] || '📦'}</span>
            <div class="expense-details">
                <span class="expense-category">${categoryNames[expense.category] || expense.category}</span>
                <span class="expense-description">${expense.description || ''}</span>
            </div>
        </div>
        <div class="expense-right">
            <div class="expense-date">${expense.date}</div>
            <div class="expense-amount">-${formatCurrency(expense.amount)}</div>
        </div>
        <button class="delete-btn" data-id="${expense.id}" title="ลบ">🗑️</button>
    `;
    return div;
}

function renderTodayExpenses() {
    const data = loadData();
    const today = getToday();
    const todayExpenses = data.expenses.filter(e => e.date === today).reverse();
    const listEl = document.getElementById('today-expenses-list');
    const emptyEl = document.getElementById('today-empty');

    listEl.innerHTML = '';

    if (todayExpenses.length === 0) {
        emptyEl.style.display = 'block';
    } else {
        emptyEl.style.display = 'none';
        todayExpenses.forEach(expense => {
            listEl.appendChild(renderExpenseItem(expense));
        });
    }
}

function renderHistoryExpenses() {
    const data = loadData();
    const historyExpenses = [...data.expenses].reverse();
    const listEl = document.getElementById('history-expenses-list');
    const emptyEl = document.getElementById('history-empty');

    listEl.innerHTML = '';

    if (historyExpenses.length === 0) {
        emptyEl.style.display = 'block';
    } else {
        emptyEl.style.display = 'none';
        historyExpenses.forEach(expense => {
            listEl.appendChild(renderExpenseItem(expense));
        });
    }
}

function renderStats() {
    const data = loadData();
    const totalSpent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = data.expenses.length;

    document.getElementById('total-spent').textContent = formatCurrency(totalSpent);
    document.getElementById('total-count').textContent = count.toString();

    const uniqueDates = new Set(data.expenses.map(e => e.date));
    const avgDaily = uniqueDates.size > 0 ? totalSpent / uniqueDates.size : 0;
    document.getElementById('avg-daily').textContent = formatCurrency(avgDaily);

    const categoryStats = {};
    data.expenses.forEach(expense => {
        if (!categoryStats[expense.category]) {
            categoryStats[expense.category] = 0;
        }
        categoryStats[expense.category] += expense.amount;
    });

    const categoryStatsEl = document.getElementById('category-stats');
    categoryStatsEl.innerHTML = '';

    const sortedCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a);

    const maxAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

    sortedCategories.forEach(([category, amount]) => {
        const div = document.createElement('div');
        div.className = 'category-item';
        const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
        div.innerHTML = `
            <div class="category-left">
                <span class="expense-icon">${categoryIcons[category] || '📦'}</span>
                <span>${categoryNames[category] || category}</span>
            </div>
            <div class="category-bar">
                <div class="category-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <span>${formatCurrency(amount)}</span>
        `;
        categoryStatsEl.appendChild(div);
    });
}

function updateAll() {
    updateBudgetDisplay();
    renderTodayExpenses();
    renderHistoryExpenses();
    renderStats();
}

function addExpense(category, amount, description) {
    const data = loadData();
    const expense = {
        id: generateId(),
        date: getToday(),
        category: category,
        amount: parseFloat(amount),
        description: description
    };
    data.expenses.push(expense);
    saveData(data);
    updateAll();

    const todaySpent = data.expenses
        .filter(e => e.date === getToday())
        .reduce((sum, e) => sum + e.amount, 0);
    
    if (todaySpent > data.budget) {
        alert('⚠️ คำเตือน: รายจ่ายของคุณวันนี้เกินงบประมาณแล้ว!');
    }
}

function deleteExpense(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าจะลบรายการนี้?')) {
        const data = loadData();
        data.expenses = data.expenses.filter(e => e.id !== id);
        saveData(data);
        updateAll();
    }
}

function setupEventListeners() {
    document.getElementById('expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        
        if (category && amount) {
            addExpense(category, amount, description);
            e.target.reset();
        }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tab + '-tab').style.display = 'block';
        });
    });

    document.getElementById('today-expenses-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteExpense(e.target.dataset.id);
        }
    });

    document.getElementById('history-expenses-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            deleteExpense(e.target.dataset.id);
        }
    });

    document.getElementById('edit-budget-btn').addEventListener('click', () => {
        const data = loadData();
        document.getElementById('new-budget').value = data.budget;
        document.getElementById('budget-modal').classList.add('show');
    });

    document.getElementById('cancel-budget').addEventListener('click', () => {
        document.getElementById('budget-modal').classList.remove('show');
    });

    document.getElementById('save-budget').addEventListener('click', () => {
        const newBudget = parseFloat(document.getElementById('new-budget').value);
        if (newBudget > 0) {
            const data = loadData();
            data.budget = newBudget;
            saveData(data);
            updateAll();
            document.getElementById('budget-modal').classList.remove('show');
        }
    });

    document.getElementById('budget-modal').addEventListener('click', (e) => {
        if (e.target.id === 'budget-modal') {
            document.getElementById('budget-modal').classList.remove('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateAll();
});
