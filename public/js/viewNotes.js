let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html';
    };
  });
};

// const getNotes = (userId) => {
//   const notesRef = firebase.database().ref(`users/${userId}`).orderByChild("title");
//   notesRef.on('value', (snapshot) => {
//     const data = snapshot.val();
//     renderDataAsHtml(data);
//   });
// };

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`).orderByChild("title");
  notesRef.on('value', (snapshot) => {
    let cards = ``;
    let archivedCards = ``;
    snapshot.forEach((child) => {
      let noteId = child.key
      let note = child.val()
      if (note.isArchived) {
        archivedCards += createCard(note, noteId, true)
      }
      else {
        cards += createCard(note, noteId, false)
      }
    })
    // Inject our string of HTML into our viewNotes.html page
    document.querySelector('#app').innerHTML = cards
    document.querySelector('#archive').innerHTML = archivedCards
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  let archivedCards = ``;
  for (const noteItem in data) {
    const note = data[noteItem];
    // For each note create an HTML card
    const noteId = noteItem
    if (note.isArchived) {
      archivedCards += createCard(note, noteId, true)
    }
    else {
      cards += createCard(note, noteId, false)
    }
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards
  document.querySelector('#archive').innerHTML = archivedCards
};

const createCard = (note, noteId, isArchived) => {
  return `
    <div class="column is-one-quarter">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">${note.title}</p>
        </header>
        <div class="card-content">
          <div class="content">${note.text}</div>
        </div>
        <footer class="card-footer">
          <a href="#" class="card-footer-item" onclick="editNote('${noteId}')">
            Edit
          </a>
          <a href="#" class="card-footer-item" onclick="toggleArchiveNote('${noteId}', ${isArchived})">
            ${isArchived ? "UnArchive" : "Archive"}
          </a>
          <a href="#" class="card-footer-item" onclick="deleteNote('${noteId}')">
            Delete
          </a>
        </footer>
      </div>
    </div>
  `;
}

const toggleArchiveNote = (noteId, isArchived) => {
  if (confirm("Are you sure you want to archive this note?")) {
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update({ isArchived: !isArchived });
  }
}

const deleteNote = (noteId) => {
  if (confirm("Are you sure you want to delete this note?")) {
    firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
  }
}

const editNote = (noteId) => {
  const editNoteModal = document.querySelector('#editNoteModal');
  editNoteModal.classList.toggle('is-active')
  const notesRef = firebase.database().ref(`users/${googleUserId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const note = data[noteId];
    document.querySelector('#editNoteId').value = noteId;
    document.querySelector('#editTitleInput').value = note.title;
    document.querySelector('#editTextInput').value = note.text;
  })
}

const closeEditModal = () => {
  const editNoteModal = document.querySelector('#editNoteModal');
  editNoteModal.classList.toggle('is-active');
}

const saveEditedNote = () => {
  const noteId = document.querySelector('#editNoteId').value;
  const noteTitle = document.querySelector('#editTitleInput').value;
  const noteText = document.querySelector('#editTextInput').value;
  const noteEdits = {
    title: noteTitle,
    text: noteText
  };
  firebase.database().ref(`users/${googleUserId}/${noteId}`).update(noteEdits);
  closeEditModal();
}