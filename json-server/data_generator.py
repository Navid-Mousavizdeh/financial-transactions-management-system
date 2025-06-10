
import json
import uuid
import random
from datetime import datetime, timedelta
import os

# Preset values for generating meaningful data
merchant_names = [
    "Example Store", "Streaming Service", "Hotel Plaza", "Fresh Market",
    "Tech Gadgets", "Coffee Haven", "Book Nook", "Fitness Club",
    "Clothing Boutique", "Electronics Hub"
]
merchant_ids = [f"mcht_{random.randint(100000, 999999)}" for _ in range(10)]
payment_methods = [
    {"type": "credit_card", "last4": "4242", "brand": "visa"},
    {"type": "credit_card", "last4": "1111", "brand": "mastercard"},
    {"type": "debit_card", "last4": "5678", "brand": "visa"},
    {"type": "paypal", "last4": "", "brand": ""},
    {"type": "credit_card", "last4": "9999", "brand": "amex"}
]
statuses = ["completed", "pending", "failed"]
currencies = ["USD", "EUR", "GBP"]
sender_names = [
    "John Doe", "Alice Smith", "Robert Johnson", "Emma Wilson",
    "Michael Brown", "Sarah Davis", "David Lee", "Laura Martinez",
    "James Taylor", "Emily Clark"
]
descriptions = [
    "Online Purchase", "Subscription Renewal", "Hotel Booking", "Grocery Store Purchase",
    "Electronics Purchase", "Coffee Shop Order", "Book Purchase", "Gym Membership",
    "Clothing Purchase", "Restaurant Order"
]

# Load the existing db.json file
def load_existing_data(file_path="db.json"):
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                data = json.load(file)
                if not isinstance(data, dict) or "transactions" not in data:
                    print(f"Warning: {file_path} does not have the expected structure. Initializing with empty transactions.")
                    return {"transactions": []}
                return data
        else:
            print(f"File {file_path} not found. Creating a new one with empty transactions.")
            return {"transactions": []}
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse {file_path}. JSON is invalid: {e}")
        return {"transactions": []}
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return {"transactions": []}

# Generate a random timestamp between May 1, 2025, and June 30, 2025
def random_timestamp():
    start_date = datetime(2025, 5, 1)
    end_date = datetime(2025, 6, 30)
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    random_seconds = random.randint(0, 86400)
    random_time = start_date + timedelta(days=random_days, seconds=random_seconds)
    return random_time.strftime("%Y-%m-%dT%H:%M:%SZ")

# Generate a single transaction
def generate_transaction():
    amount = round(random.uniform(10.0, 500.0), 2)
    currency = random.choice(currencies)
    return {
        "id": f"txn_{uuid.uuid4().hex[:8]}",
        "amount": amount,
        "currency": currency,
        "status": random.choice(statuses),
        "timestamp": random_timestamp(),
        "description": random.choice(descriptions),
        "merchant": {
            "name": random.choice(merchant_names),
            "id": random.choice(merchant_ids)
        },
        "payment_method": random.choice(payment_methods),
        "sender": {
            "name": random.choice(sender_names),
            "account_id": f"acc_{random.randint(10000, 99999)}"
        },
        "receiver": {
            "name": random.choice(merchant_names),
            "account_id": f"acc_{random.randint(10000, 99999)}"
        },
        "fees": {
            "processing_fee": round(amount * random.uniform(0.01, 0.03), 2),
            "currency": currency
        },
        "metadata": {
            "order_id": f"ord_{random.randint(10000, 99999)}",
            "customer_id": f"cust_{random.randint(10000, 99999)}"
        }
    }

# Generate approximately 500 transactions
def generate_transactions(target_count=500, file_path="db.json"):
    try:
        data = load_existing_data(file_path)
        existing_transactions = data["transactions"]
        transactions_needed = max(0, target_count - len(existing_transactions))
        
        print(f"Found {len(existing_transactions)} existing transactions. Generating {transactions_needed} new transactions.")
        
        new_transactions = [generate_transaction() for _ in range(transactions_needed)]
        data["transactions"].extend(new_transactions)
        
        # Save the updated data back to db.json
        try:
            with open(file_path, 'w') as file:
                json.dump(data, file, indent=2)
            print(f"Successfully saved {len(data['transactions'])} transactions to {file_path}")
        except PermissionError:
            print(f"Error: Permission denied when writing to {file_path}. Please check file permissions.")
        except Exception as e:
            print(f"Error saving to {file_path}: {e}")
        
        return len(data["transactions"])
    except Exception as e:
        print(f"Error in generate_transactions: {e}")
        return 0

# Run the script
if __name__ == "__main__":
    file_path = "db.json"
    total_transactions = generate_transactions(500, file_path)
    if total_transactions > 0:
        print(f"Generated {total_transactions} total transactions in {file_path}")
    else:
        print("Failed to generate transactions. Check error messages above.")
