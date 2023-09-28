// App
var refreshNotes = () => {}
var setNotes = (notes) => {}
var setActiveNote = (note) => {}
var onNoteSelect = noteId => {}
var onNoteAdd = () => {}
var onNoteEdit = (title, body) => {}
var onNoteDelete = noteId => {}
// NoteAPI
var getAllNotes = () => {}
var saveNote = (noteToSave) => {}
var deleteNote = (id) => {}
// NoteView
var createListItemHTML = (id, title, body, updated) => {}
var updateNoteList = (notes) => {}
var updateActiveNote = (note) => {}
var updateNotePreviewVisibility = (visible) => {}

let notes = []
let activeNote = null
const btnAddNote = document.querySelector(".notes__add");
const inpTitle = document.querySelector(".notes__title");
const inpBody = document.querySelector(".notes__body");

btnAddNote.addEventListener("click", () => {
    onNoteAdd();
});

[inpTitle, inpBody].forEach(inputField => {
    inputField.addEventListener("blur", () => {
        const updatedTitle = inpTitle.value.trim();
        const updatedBody = inpBody.value.trim();

        onNoteEdit(updatedTitle, updatedBody);
    });
});

updateNotePreviewVisibility(false);

// App
refreshNotes = () => {
    const notes = getAllNotes();

    setNotes(notes);

    if (notes.length > 0) {
        setActiveNote(notes[0]);
    }
}

setNotes = (notes) => {
    notes = notes;
    updateNoteList(notes);
    updateNotePreviewVisibility(notes.length > 0);
}

setActiveNote = (note) => {
    activeNote = note;
    updateActiveNote(note);
}

onNoteSelect = noteId => {
    const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");
    const selectedNote = notes.find(note => note.id == noteId);
    setActiveNote(selectedNote);
}

onNoteAdd = () => {
    const newNote = {
        title: "New Note",
        body: "Take note..."
    };

    saveNote(newNote);
    refreshNotes();
}

onNoteEdit = (title, body) => {
    saveNote({
        id: activeNote.id,
        title,
        body
    });

    refreshNotes();
}

onNoteDelete = noteId => {
    deleteNote(noteId);
    refreshNotes();
}

// NoteAPI
getAllNotes = () => {
    const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");

    return notes.sort((a, b) => {
        return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
    });
}

saveNote = (noteToSave) => {
    const notes = getAllNotes();
    const existing = notes.find(note => note.id == noteToSave.id);

    // Edit/Update
    if (existing) {
        existing.title = noteToSave.title;
        existing.body = noteToSave.body;
        existing.updated = new Date().toISOString();
    } else {
        noteToSave.id = Math.floor(Math.random() * 1000000);
        noteToSave.updated = new Date().toISOString();
        notes.push(noteToSave);
    }

    localStorage.setItem("notesapp-notes", JSON.stringify(notes));
}

deleteNote = (id) => {
    const notes = getAllNotes();
    const newNotes = notes.filter(note => note.id != id);

    localStorage.setItem("notesapp-notes", JSON.stringify(newNotes));
}

// NoteView
createListItemHTML = (id, title, body, updated) => {
    const MAX_BODY_LENGTH = 60;

    return `
        <div class="notes__list-item" data-note-id="${id}">
            <div class="notes__small-title">${title}</div>
            <div class="notes__small-body">
                ${body.substring(0, MAX_BODY_LENGTH)}
                ${body.length > MAX_BODY_LENGTH ? "..." : ""}
            </div>
            <div class="notes__small-updated">
                ${updated.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
            </div>
        </div>
    `;
}

updateNoteList = (notes) => {
    const notesListContainer = document.querySelector(".notes__list");

    // Empty list
    notesListContainer.innerHTML = "";

    for (const note of notes) {
        const html = createListItemHTML(note.id, note.title, note.body, new Date(note.updated));

        notesListContainer.insertAdjacentHTML("beforeend", html);
    }

    // Add select/delete events for each list item
    notesListContainer.querySelectorAll(".notes__list-item").forEach(noteListItem => {
        noteListItem.addEventListener("click", () => {
            onNoteSelect(noteListItem.dataset.noteId);
        });

        noteListItem.addEventListener("dblclick", () => {
            const doDelete = confirm("Are you sure you want to delete this note?");

            if (doDelete) {
                onNoteDelete(noteListItem.dataset.noteId);
            }
        });
    });
}

updateActiveNote = (note) => {
    document.querySelector(".notes__title").value = note.title;
    document.querySelector(".notes__body").value = note.body;

    document.querySelectorAll(".notes__list-item").forEach(noteListItem => {
        noteListItem.classList.remove("notes__list-item--selected");
    });

    document.querySelector(`.notes__list-item[data-note-id="${note.id}"]`).classList.add("notes__list-item--selected");
}

updateNotePreviewVisibility = (visible) => {
    document.querySelector(".notes__preview").style.visibility = visible ? "visible" : "hidden";
}

window.onload = refreshNotes()