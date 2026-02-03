import tkinter as tk
from tkinter import messagebox, Text, Scrollbar
from firestore_client import FirestoreClient

class ProcedureManager(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Procedure Manager")
        self.geometry("1024x768")

        try:
            self.client = FirestoreClient()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to connect to Firebase: {e}")
            self.destroy()
            return

        self.selected_procedure_id = None
        self.procedures_cache = []

        self.create_menu()
        self.create_widgets()
        self.load_procedures()

    def create_menu(self):
        menubar = tk.Menu(self)
        self.config(menu=menubar)

        auth_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Authentication", menu=auth_menu)
        auth_menu.add_command(label="Create Admin User", command=self.open_create_user_dialog)

    def create_widgets(self):
        main_frame = tk.Frame(self)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        left_frame = tk.Frame(main_frame, bd=2, relief=tk.GROOVE)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))

        right_frame = tk.Frame(main_frame, bd=2, relief=tk.GROOVE)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))

        tk.Label(left_frame, text="Procedures", font=("Arial", 14, "bold")).pack(pady=5)

        list_frame = tk.Frame(left_frame)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.procedures_list = tk.Listbox(list_frame, font=("Arial", 12))
        self.procedures_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = tk.Scrollbar(list_frame, orient="vertical", command=self.procedures_list.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.procedures_list.config(yscrollcommand=scrollbar.set)

        self.procedures_list.bind('<<ListboxSelect>>', self.on_procedure_select)

        details_frame = tk.Frame(right_frame)
        details_frame.pack(fill=tk.X, padx=10, pady=10)

        tk.Label(details_frame, text="Title:", font=("Arial", 12)).grid(row=0, column=0, sticky="w", pady=2)
        self.title_entry = tk.Entry(details_frame, font=("Arial", 12))
        self.title_entry.grid(row=0, column=1, sticky="ew", pady=2)

        tk.Label(details_frame, text="Category:", font=("Arial", 12)).grid(row=1, column=0, sticky="w", pady=2)
        self.category_entry = tk.Entry(details_frame, font=("Arial", 12))
        self.category_entry.grid(row=1, column=1, sticky="ew", pady=2)

        details_frame.grid_columnconfigure(1, weight=1)

        tk.Label(right_frame, text="Content:", font=("Arial", 12)).pack(padx=10, anchor="w")

        content_frame = tk.Frame(right_frame)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))

        self.content_text = Text(content_frame, wrap=tk.WORD, font=("Arial", 11))
        content_scrollbar = Scrollbar(content_frame, command=self.content_text.yview)
        self.content_text.config(yscrollcommand=content_scrollbar.set)

        self.content_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        content_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        buttons_frame = tk.Frame(right_frame)
        buttons_frame.pack(fill=tk.X, padx=10, pady=(0, 10))

        self.add_button = tk.Button(buttons_frame, text="Add New", command=self.add_procedure)
        self.add_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.update_button = tk.Button(buttons_frame, text="Update Selected", command=self.update_procedure)
        self.update_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.delete_button = tk.Button(buttons_frame, text="Delete Selected", command=self.delete_procedure)
        self.delete_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

        self.clear_button = tk.Button(buttons_frame, text="Clear Fields", command=self.clear_fields)
        self.clear_button.pack(side=tk.LEFT, expand=True, fill=tk.X, padx=2)

    def load_procedures(self):
        self.procedures_list.delete(0, tk.END)
        self.procedures_cache = self.client.get_procedures()
        for proc in self.procedures_cache:
            self.procedures_list.insert(tk.END, proc['title'])
        self.clear_fields()

    def on_procedure_select(self, event):
        selected_indices = self.procedures_list.curselection()
        if not selected_indices:
            return

        selected_index = selected_indices[0]
        procedure = self.procedures_cache[selected_index]
        self.selected_procedure_id = procedure['id']

        self.title_entry.delete(0, tk.END)
        self.title_entry.insert(0, procedure.get('title', ''))

        self.category_entry.delete(0, tk.END)
        self.category_entry.insert(0, procedure.get('category', ''))

        self.content_text.delete('1.0', tk.END)
        self.content_text.insert('1.0', procedure.get('content', ''))

    def add_procedure(self):
        title = self.title_entry.get()
        category = self.category_entry.get()
        content = self.content_text.get('1.0', 'end-1c') # Fix: Avoid trailing newline

        if not title or not content or not category:
            messagebox.showwarning("Warning", "Title, Category, and Content fields are required.")
            return

        if self.client.add_procedure(title, content, category):
            messagebox.showinfo("Success", "Procedure added successfully.")
            self.load_procedures()
        else:
            messagebox.showerror("Error", "Failed to add procedure.")

    def update_procedure(self):
        if not self.selected_procedure_id:
            messagebox.showwarning("Warning", "Please select a procedure to update.")
            return

        title = self.title_entry.get()
        category = self.category_entry.get()
        content = self.content_text.get('1.0', 'end-1c') # Fix: Avoid trailing newline

        # Allow partial updates (e.g., empty fields)
        if self.client.update_procedure(self.selected_procedure_id, title, content, category):
            messagebox.showinfo("Success", "Procedure updated successfully.")
            self.load_procedures()
        else:
            messagebox.showerror("Error", "Failed to update procedure.")

    def delete_procedure(self):
        if not self.selected_procedure_id:
            messagebox.showwarning("Warning", "Please select a procedure to delete.")
            return

        if messagebox.askyesno("Confirm", "Are you sure you want to delete this procedure?"):
            if self.client.delete_procedure(self.selected_procedure_id):
                messagebox.showinfo("Success", "Procedure deleted successfully.")
                self.load_procedures()
            else:
                messagebox.showerror("Error", "Failed to delete procedure.")

    def clear_fields(self):
        self.selected_procedure_id = None
        self.title_entry.delete(0, tk.END)
        self.category_entry.delete(0, tk.END)
        self.content_text.delete('1.0', tk.END)
        self.procedures_list.selection_clear(0, tk.END)

    def open_create_user_dialog(self):
        dialog = tk.Toplevel(self)
        dialog.title("Create Admin User")
        dialog.geometry("300x200")
        dialog.resizable(False, False)

        tk.Label(dialog, text="Email:").pack(pady=(10, 0))
        email_entry = tk.Entry(dialog, width=30)
        email_entry.pack(pady=5)

        tk.Label(dialog, text="Password:").pack(pady=(10, 0))
        pass_entry = tk.Entry(dialog, width=30, show="*")
        pass_entry.pack(pady=5)

        def create():
            email = email_entry.get()
            password = pass_entry.get()
            if not email or not password:
                messagebox.showwarning("Warning", "Both fields are required.", parent=dialog)
                return
            
            if self.client.create_user(email, password):
                messagebox.showinfo("Success", "User created successfully!", parent=dialog)
                dialog.destroy()
            else:
                messagebox.showerror("Error", "Failed to create user. Check terminal for details.", parent=dialog)

        tk.Button(dialog, text="Create User", command=create).pack(pady=20)

if __name__ == "__main__":
    app = ProcedureManager()
    app.mainloop()
