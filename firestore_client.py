import firebase_admin
from firebase_admin import credentials, firestore, auth
import os

class FirestoreClient:
    def __init__(self):
        """
        Initializes the connection to the Firebase Firestore database.
        """
        # SECURITY WARNING: This service account key file contains sensitive credentials.
        # DO NOT COMMIT THIS FILE to version control (e.g., Git).
        # It is strongly recommended to use environment variables to store the path to this file.

        # Option 1: Use an environment variable (Recommended for production)
        SERVICE_ACCOUNT_KEY_PATH = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')

        # Option 2: Place the file in the same directory (for local development)
        DEFAULT_KEY_PATH = 'serviceAccountKey.json'

        if SERVICE_ACCOUNT_KEY_PATH:
            key_path = SERVICE_ACCOUNT_KEY_PATH
        elif os.path.exists(DEFAULT_KEY_PATH):
            key_path = DEFAULT_KEY_PATH
        else:
            key_path = None

        if not firebase_admin._apps:
            if key_path:
                try:
                    cred = credentials.Certificate(key_path)
                    firebase_admin.initialize_app(cred)
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

        self.db = firestore.client()

    def get_procedures(self):
        """Lists all procedures in the database, ordered by title."""
        docs = self.db.collection('procedures').order_by('title').stream()
        return [{'id': doc.id, **doc.to_dict()} for doc in docs]

    def add_procedure(self, title, content, category):
        """Adds a new procedure to the database."""
        try:
            self.db.collection('procedures').add({
                'title': title,
                'content': content,
                'category': category
            })
            print(f'Successfully added procedure: {title}')
            return True
        except Exception as e:
            print(f"Error adding procedure: {e}")
            return False

    def update_procedure(self, doc_id, title=None, content=None, category=None):
        """Updates an existing procedure in the database."""
        update_data = {}
        if title is not None:
            update_data['title'] = title
        if content is not None:
            update_data['content'] = content
        if category is not None:
            update_data['category'] = category

        if update_data:
            try:
                self.db.collection('procedures').document(doc_id).update(update_data)
                print(f'Successfully updated procedure: {doc_id}')
                return True
            except Exception as e:
                print(f"Error updating procedure: {e}")
                return False
        else:
            print('No fields to update.')
            return False

    def delete_procedure(self, doc_id):
        """Deletes a procedure from the database."""
        try:
            self.db.collection('procedures').document(doc_id).delete()
            print(f'Successfully deleted procedure: {doc_id}')
            return True
        except Exception as e:
            print(f"Error deleting procedure: {e}")
            return False

    def create_user(self, email, password):
        """Creates a new user in Firebase Authentication."""
        try:
            user = auth.create_user(
                email=email,
                password=password
            )
            print(f'Successfully created new user: {user.uid}')
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False

# Example of how to use the client
if __name__ == '__main__':
    client = FirestoreClient()
    print("\nListing procedures:")
    procedures = client.get_procedures()
    for p in procedures:
        print(f"  - {p['id']}: {p['title']}")
