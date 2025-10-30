import firebase_admin
from firebase_admin import credentials, firestore
import argparse
import os

# --- Firebase Initialization ---
# SECURITY WARNING: This service account key file contains sensitive credentials.
# DO NOT COMMIT THIS FILE to version control (e.g., Git).
# It is strongly recommended to use environment variables to store the path to this file.

# 1. Download your service account key file from the Firebase console.
# 2. Save it as 'serviceAccountKey.json' in the same directory as this script,
#    OR save it in a secure location and set the path in an environment variable.

# Option 1: Use an environment variable (Recommended for production)
# Example: export FIREBASE_SERVICE_ACCOUNT_KEY_PATH="/path/to/your/secure/key.json"
SERVICE_ACCOUNT_KEY_PATH = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')

# Option 2: Place the file in the same directory (for local development)
DEFAULT_KEY_PATH = 'serviceAccountKey.json'

if SERVICE_ACCOUNT_KEY_PATH:
    key_path = SERVICE_ACCOUNT_KEY_PATH
elif os.path.exists(DEFAULT_KEY_PATH):
    key_path = DEFAULT_KEY_PATH
else:
    key_path = None

if key_path:
    try:
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Successfully connected to Firebase.")
    except Exception as e:
        print(f"Error connecting to Firebase using key at '{key_path}': {e}")
        print("Please ensure your service account key is valid.")
        exit(1)
else:
    print("Firebase credentials not found.")
    print("Please either set the 'FIREBASE_SERVICE_ACCOUNT_KEY_PATH' environment variable")
    print(f"or place your service account key file at '{DEFAULT_KEY_PATH}'.")
    exit(1)

def list_procedures():
    """Lists all procedures in the database."""
    docs = db.collection('procedures').stream()
    for doc in docs:
        print(f'{doc.id} => {doc.to_dict()}')

def add_procedure(title, content, category):
    """Adds a new procedure to the database."""
    db.collection('procedures').add({
        'title': title,
        'content': content,
        'category': category
    })
    print(f'Successfully added procedure: {title}')

def update_procedure(doc_id, title=None, content=None, category=None):
    """Updates an existing procedure in the database."""
    update_data = {}
    if title:
        update_data['title'] = title
    if content:
        update_data['content'] = content
    if category:
        update_data['category'] = category

    if update_data:
        db.collection('procedures').document(doc_id).update(update_data)
        print(f'Successfully updated procedure: {doc_id}')
    else:
        print('No fields to update.')

def delete_procedure(doc_id):
    """Deletes a procedure from the database."""
    db.collection('procedures').document(doc_id).delete()
    print(f'Successfully deleted procedure: {doc_id}')

def main():
    parser = argparse.ArgumentParser(description='A command-line tool to manage the Firestore database.')
    subparsers = parser.add_subparsers(dest='command')

    # List command
    list_parser = subparsers.add_parser('list', help='List all procedures.')

    # Add command
    add_parser = subparsers.add_parser('add', help='Add a new procedure.')
    add_parser.add_argument('--title', required=True, help='The title of the procedure.')
    add_parser.add_argument('--content', required=True, help='The content of the procedure.')
    add_parser.add_argument('--category', required=True, help='The category of the procedure.')

    # Update command
    update_parser = subparsers.add_parser('update', help='Update an existing procedure.')
    update_parser.add_argument('--id', required=True, help='The ID of the procedure to update.')
    update_parser.add_argument('--title', help='The new title of the procedure.')
    update_parser.add_argument('--content', help='The new content of the procedure.')
    update_parser.add_argument('--category', help='The new category of the procedure.')

    # Delete command
    delete_parser = subparsers.add_parser('delete', help='Delete a procedure.')
    delete_parser.add_argument('--id', required=True, help='The ID of the procedure to delete.')

    args = parser.parse_args()

    if args.command == 'list':
        list_procedures()
    elif args.command == 'add':
        add_procedure(args.title, args.content, args.category)
    elif args.command == 'update':
        update_procedure(args.id, args.title, args.content, args.category)
    elif args.command == 'delete':
        delete_procedure(args.id)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
