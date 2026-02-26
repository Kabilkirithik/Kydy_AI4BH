from database.app.repositories.notebook_repository import NotebookRepository

repo = NotebookRepository()

# Ensure notebook exists
repo.ensure_notebook("nivi007", "python101")

# Autosave content
repo.autosave_notebook(
    "nivi007",
    "python101",
    "# Variables\n\nVariable na oru container...\n\n# Loops\nFor loop na..."
)

# Fetch
notebook = repo.get_notebook("nivi007", "python101")

print("Notebook Content:\n")
print(notebook["content"])