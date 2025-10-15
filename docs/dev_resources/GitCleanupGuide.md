# 🧹 Cleaning up Tracked `bin/` and `obj/` Folders in Git

When .NET build output folders (`bin` and `obj`) appear as modified files in your **Source Control** tab—even though they’re ignored in your `.gitignore`—it usually means they were committed **before** the ignore rule existed.  
This guide shows how to clean them up safely.

---

## 🚨 Problem
Git is tracking `bin/` and `obj/` directories even though they’re listed in `.gitignore`.  
You’ll see something like:

> “These files are included in your .gitignore”  
> (Commit or Discard?)

---

## ✅ Solution: Remove Them from Git Tracking (Not from Disk)

Run these commands from your repo root:

```bash
# Remove all tracked bin/ and obj/ directories from Git's index (cache)
git rm -r --cached bin obj
```

If your repo contains multiple projects (e.g., backend, frontend, etc.):

```bash
git rm -r --cached **/bin **/obj
```

Then commit the cleanup:

```bash
git commit -m "Clean up accidentally tracked build output (bin/obj)"
```

This removes the compiled files from the repository history **without deleting them locally**, and ensures future builds stay ignored.

---

## 🧪 Verify `.gitignore` Rules
Check if a file is being ignored properly:

```bash
git check-ignore -v bin/Debug/net9.0/yourfile.dll
```

Expected output (example):

```
.gitignore:5:bin/  bin/Debug/net9.0/yourfile.dll
```

If you see that, your `.gitignore` is configured correctly.

---

## 🚫 What Not to Do
- **Don’t “Commit Anyway”** — you’ll bloat the repo with compiled files.  
- **Don’t “Discard Changes”** — it will just delete local binaries (safe, but unnecessary).

---

## 🧭 Summary of Commands

| Command | Description |
|----------|--------------|
| `git rm -r --cached bin obj` | Untrack existing `bin` and `obj` directories while keeping them locally |
| `git rm -r --cached **/bin **/obj` | Untrack `bin` and `obj` folders recursively across all projects |
| `git commit -m "Clean up accidentally tracked build output (bin/obj)"` | Record the cleanup in version control |
| `git check-ignore -v <file>` | Verify which `.gitignore` rule ignores a specific file |
