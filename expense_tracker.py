import json
import os
from datetime import datetime

DATA_FILE = "expenses.json"


def load_expenses():
    if not os.path.exists(DATA_FILE):
        return {"budget": 1000, "expenses": []}
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_expenses(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def add_expense():
    data = load_expenses()
    today = datetime.now().strftime("%Y-%m-%d")
    
    print("\n--- 输入今日开销 ---")
    category = input("请输入开销类别（如：餐饮、交通、购物）：").strip()
    amount = float(input("请输入金额："))
    description = input("请输入备注（可选）：").strip()
    
    expense = {
        "date": today,
        "category": category,
        "amount": amount,
        "description": description
    }
    
    data["expenses"].append(expense)
    save_expenses(data)
    
    total_today = sum(e["amount"] for e in data["expenses"] if e["date"] == today)
    print(f"\n✅ 已添加！今日总开销：¥{total_today:.2f}")
    
    check_budget(data)


def view_total():
    data = load_expenses()
    
    if not data["expenses"]:
        print("\n📭 暂无开销记录")
        return
    
    total_all = sum(e["amount"] for e in data["expenses"])
    
    print(f"\n--- 历史账目总和 ---")
    print(f"总支出：¥{total_all:.2f}")
    print(f"记录条数：{len(data['expenses'])}")
    
    expenses_by_date = {}
    for expense in data["expenses"]:
        if expense["date"] not in expenses_by_date:
            expenses_by_date[expense["date"]] = []
        expenses_by_date[expense["date"]].append(expense)
    
    print("\n按日期统计：")
    for date in sorted(expenses_by_date.keys()):
        total_date = sum(e["amount"] for e in expenses_by_date[date])
        print(f"  {date}: ¥{total_date:.2f}")


def check_budget(data=None):
    if data is None:
        data = load_expenses()
    
    today = datetime.now().strftime("%Y-%m-%d")
    total_today = sum(e["amount"] for e in data["expenses"] if e["date"] == today)
    budget = data["budget"]
    
    if total_today > budget:
        print(f"\n⚠️  预算超支提醒！今日已花费 ¥{total_today:.2f}，预算为 ¥{budget:.2f}，超支 ¥{total_today - budget:.2f}")
    else:
        print(f"\n💰 今日已花费 ¥{total_today:.2f}，剩余预算 ¥{budget - total_today:.2f}")


def set_budget():
    data = load_expenses()
    print(f"\n当前预算：¥{data['budget']:.2f}")
    new_budget = float(input("请输入新的预算："))
    data["budget"] = new_budget
    save_expenses(data)
    print(f"✅ 预算已更新为 ¥{new_budget:.2f}")


def main():
    print("=" * 40)
    print("       💰 记账小工具 💰")
    print("=" * 40)
    
    while True:
        print("\n请选择功能：")
        print("1. 输入今日开销")
        print("2. 查看历史账目总和")
        print("3. 查看预算和今日花费")
        print("4. 设置预算")
        print("5. 退出")
        
        choice = input("\n请输入选项（1-5）：").strip()
        
        if choice == "1":
            add_expense()
        elif choice == "2":
            view_total()
        elif choice == "3":
            check_budget()
        elif choice == "4":
            set_budget()
        elif choice == "5":
            print("\n👋 再见！")
            break
        else:
            print("\n❌ 无效选项，请重新选择")


if __name__ == "__main__":
    main()
