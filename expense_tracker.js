const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'expenses.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function loadExpenses() {
  if (!fs.existsSync(DATA_FILE)) {
    return { budget: 1000, expenses: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveExpenses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

async function addExpense() {
  const data = loadExpenses();
  const today = getToday();

  console.log('\n--- 输入今日开销 ---');
  const category = (await question('请输入开销类别（如：餐饮、交通、购物）：')).trim();
  const amount = parseFloat(await question('请输入金额：'));
  const description = (await question('请输入备注（可选）：')).trim();

  const expense = {
    date: today,
    category,
    amount,
    description
  };

  data.expenses.push(expense);
  saveExpenses(data);

  const totalToday = data.expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
  console.log(`\n✅ 已添加！今日总开销：¥${totalToday.toFixed(2)}`);

  checkBudget(data);
}

function viewTotal() {
  const data = loadExpenses();

  if (data.expenses.length === 0) {
    console.log('\n📭 暂无开销记录');
    return;
  }

  const totalAll = data.expenses.reduce((sum, e) => sum + e.amount, 0);

  console.log('\n--- 历史账目总和 ---');
  console.log(`总支出：¥${totalAll.toFixed(2)}`);
  console.log(`记录条数：${data.expenses.length}`);

  const expensesByDate = {};
  for (const expense of data.expenses) {
    if (!expensesByDate[expense.date]) {
      expensesByDate[expense.date] = [];
    }
    expensesByDate[expense.date].push(expense);
  }

  console.log('\n按日期统计：');
  Object.keys(expensesByDate).sort().forEach(date => {
    const totalDate = expensesByDate[date].reduce((sum, e) => sum + e.amount, 0);
    console.log(`  ${date}: ¥${totalDate.toFixed(2)}`);
  });
}

function checkBudget(data = null) {
  if (!data) data = loadExpenses();
  const today = getToday();
  const totalToday = data.expenses
    .filter(e => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);
  const budget = data.budget;

  if (totalToday > budget) {
    console.log(`\n⚠️  预算超支提醒！今日已花费 ¥${totalToday.toFixed(2)}，预算为 ¥${budget.toFixed(2)}，超支 ¥${(totalToday - budget).toFixed(2)}`);
  } else {
    console.log(`\n💰 今日已花费 ¥${totalToday.toFixed(2)}，剩余预算 ¥${(budget - totalToday).toFixed(2)}`);
  }
}

async function setBudget() {
  const data = loadExpenses();
  console.log(`\n当前预算：¥${data.budget.toFixed(2)}`);
  const newBudget = parseFloat(await question('请输入新的预算：'));
  data.budget = newBudget;
  saveExpenses(data);
  console.log(`✅ 预算已更新为 ¥${newBudget.toFixed(2)}`);
}

async function main() {
  console.log('='.repeat(40));
  console.log('       💰 记账小工具 💰');
  console.log('='.repeat(40));

  while (true) {
    console.log('\n请选择功能：');
    console.log('1. 输入今日开销');
    console.log('2. 查看历史账目总和');
    console.log('3. 查看预算和今日花费');
    console.log('4. 设置预算');
    console.log('5. 退出');

    const choice = (await question('\n请输入选项（1-5）：')).trim();

    if (choice === '1') {
      await addExpense();
    } else if (choice === '2') {
      viewTotal();
    } else if (choice === '3') {
      checkBudget();
    } else if (choice === '4') {
      await setBudget();
    } else if (choice === '5') {
      console.log('\n👋 再见！');
      rl.close();
      break;
    } else {
      console.log('\n❌ 无效选项，请重新选择');
    }
  }
}

main();
