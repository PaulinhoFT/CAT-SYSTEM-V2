from firestore_client import FirestoreClient
import argparse

def main():
    """
    A command-line tool to manage the Firestore database for procedures.
    """
    client = FirestoreClient()
    parser = argparse.ArgumentParser(description='A command-line tool to manage the Firestore database.')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # --- List Command ---
    list_parser = subparsers.add_parser('list', help='List all procedures.')

    # --- Add Command ---
    add_parser = subparsers.add_parser('add', help='Add a new procedure.')
    add_parser.add_argument('--title', required=True, help='The title of the procedure.')
    add_parser.add_argument('--content', required=True, help='The content of the procedure.')
    add_parser.add_argument('--category', required=True, help='The category of the procedure.')

    # --- Update Command ---
    update_parser = subparsers.add_parser('update', help='Update an existing procedure.')
    update_parser.add_argument('--id', required=True, help='The ID of the procedure to update.')
    update_parser.add_argument('--title', help='The new title of the procedure.')
    update_parser.add_argument('--content', help='The new content of the procedure.')
    update_parser.add_argument('--category', help='The new category of the procedure.')

    # --- Delete Command ---
    delete_parser = subparsers.add_parser('delete', help='Delete a procedure.')
    delete_parser.add_argument('--id', required=True, help='The ID of the procedure to delete.')

    # --- Create User Command ---
    user_parser = subparsers.add_parser('create-user', help='Create a new admin user.')
    user_parser.add_argument('--email', required=True, help='User email.')
    user_parser.add_argument('--password', required=True, help='User password.')

    args = parser.parse_args()

    if args.command == 'list':
        procedures = client.get_procedures()
        if procedures:
            print("--- Procedures ---")
            for proc in procedures:
                print(f"ID: {proc['id']}, Title: {proc['title']}, Category: {proc['category']}")
            print("------------------")
        else:
            print("No procedures found.")

    elif args.command == 'add':
        client.add_procedure(args.title, args.content, args.category)

    elif args.command == 'update':
        client.update_procedure(
            doc_id=args.id,
            title=args.title,
            content=args.content,
            category=args.category
        )

    elif args.command == 'delete':
        client.delete_procedure(args.id)

    elif args.command == 'create-user':
        client.create_user(args.email, args.password)

    else:
        parser.print_help()

if __name__ == '__main__':
    main()
