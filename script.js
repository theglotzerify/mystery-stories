// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTE ---
    const storyCard = document.getElementById('storyCard');
    const storyTitleElem = document.getElementById('storyTitle');
    const storyDifficultyElem = document.getElementById('storyDifficulty');
    const storyRiddleElem = document.getElementById('storyRiddle');
    const solutionTitleElem = document.getElementById('solutionTitle');
    const storySolutionElem = document.getElementById('storySolution');
    const solvedCheckbox = document.getElementById('solvedCheckbox');
    const solvedIndicatorFront = document.getElementById('solvedIndicatorFront');
    const editStoryButtonCard = document.getElementById('editStoryButtonCard'); 

    const prevStoryButton = document.getElementById('prevStoryButton');
    const nextStoryButton = document.getElementById('nextStoryButton');

    // View Container
    const cardView = document.getElementById('cardView');
    const filterView = document.getElementById('filterView');
    const editorView = document.getElementById('editorView');
    const managementView = document.getElementById('managementView');
    const allViews = [cardView, filterView, editorView, managementView];

    // Navigations-Tabs
    const navShowCardButton = document.getElementById('navShowCardButton');
    const navShowFilterButton = document.getElementById('navShowFilterButton');
    const navShowEditorButton = document.getElementById('navShowEditorButton');
    const navShowManagementButton = document.getElementById('navShowManagementButton');
    const navTabButtons = [navShowCardButton, navShowFilterButton, navShowEditorButton, navShowManagementButton];

    // Filter Elemente
    const difficultyFilterSelect = document.getElementById('difficultyFilter');
    const solvedFilterSelect = document.getElementById('solvedFilter');
    const applyFilterButton = document.getElementById('applyFilterButton');

    // Editor Elemente
    const editorStoryIdInput = document.getElementById('editorStoryId');
    const editorTitleInput = document.getElementById('editorTitle');
    const editorDifficultySelect = document.getElementById('editorDifficulty');
    const editorRiddleTextarea = document.getElementById('editorRiddle');
    const editorSolutionTextarea = document.getElementById('editorSolution');
    const saveStoryButton = document.getElementById('saveStoryButton');
    const clearEditorButton = document.getElementById('clearEditorButton');
    const deleteStoryButton = document.getElementById('deleteStoryButton'); 

    // Management Elemente
    const exportStoriesButton = document.getElementById('exportStoriesButton');
    const importFileInput = document.getElementById('importFile');
    const importMessageElem = document.getElementById('importMessage');

    const closeViewButtons = document.querySelectorAll('.close-view-button');

    // --- APP-STATUS VARIABLEN ---
    let allStories = []; 
    let currentFilteredStories = []; 
    let currentStoryIndex = 0;
    let solvedStates = {}; 
    const SOLVED_STATES_STORAGE_KEY = 'blackstoriesSolvedStates';
    const ALL_STORIES_STORAGE_KEY = 'blackstoriesAllStories'; 

    let activeDifficultyFilter = 'all';
    let activeSolvedFilter = 'all';

    // --- UUID GENERATOR (FALLBACK) ---
    function generateUUID() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') { // Prüfe ob crypto.randomUUID eine Funktion ist
            return crypto.randomUUID();
        }
        // Fallback, wenn crypto.randomUUID nicht verfügbar ist
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // --- LOCAL STORAGE FUNKTIONEN ---
    function loadAllStoriesFromStorage() {
        const storedStories = localStorage.getItem(ALL_STORIES_STORAGE_KEY);
        if (storedStories) {
            allStories = JSON.parse(storedStories);
        } else {
            allStories = initialStoriesData.map(story => ({ 
                ...story, 
                id: generateUUID() // Fallback-UUID verwenden
            }));
            saveAllStoriesToStorage(); 
        }
    }

    function saveAllStoriesToStorage() {
        localStorage.setItem(ALL_STORIES_STORAGE_KEY, JSON.stringify(allStories));
    }
    
    function loadSolvedStates() {
        const storedStates = localStorage.getItem(SOLVED_STATES_STORAGE_KEY);
        if (storedStates) solvedStates = JSON.parse(storedStates);
        else solvedStates = {};
    }

    function saveSolvedStates() {
        localStorage.setItem(SOLVED_STATES_STORAGE_KEY, JSON.stringify(solvedStates));
    }

    // --- VIEW MANAGEMENT ---
    function setActiveView(viewToShowId) {
        allViews.forEach(view => view.classList.toggle('active-view', view.id === viewToShowId));
        navTabButtons.forEach(button => {
            const targetViewForButton = button.id.replace('navShow', '').replace('Button', '').toLowerCase() + 'View';
            button.classList.toggle('active', targetViewForButton === viewToShowId);
        });
    }

    navShowCardButton.addEventListener('click', () => setActiveView('cardView'));
    navShowFilterButton.addEventListener('click', () => setActiveView('filterView'));
    navShowEditorButton.addEventListener('click', () => {
        prepareEditorForNewStory(); 
        setActiveView('editorView');
    });
    navShowManagementButton.addEventListener('click', () => {
        importMessageElem.textContent = ''; 
        setActiveView('managementView');
    });

    closeViewButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (editorView.classList.contains('active-view')) prepareEditorForNewStory();
            setActiveView('cardView');
        });
    });
    
    // --- FILTER LOGIK ---
    function applyFiltersAndDisplay() {
        activeDifficultyFilter = difficultyFilterSelect.value;
        activeSolvedFilter = solvedFilterSelect.value;
        currentFilteredStories = allStories.filter(story => {
            const matchesDifficulty = (activeDifficultyFilter === 'all') || (story.difficulty === activeDifficultyFilter);
            const storyIsSolved = solvedStates[story.id] || false;
            let matchesSolvedStatus = false;
            if (activeSolvedFilter === 'all') matchesSolvedStatus = true;
            else if (activeSolvedFilter === 'solved') matchesSolvedStatus = storyIsSolved;
            else if (activeSolvedFilter === 'unsolved') matchesSolvedStatus = !storyIsSolved;
            return matchesDifficulty && matchesSolvedStatus;
        });
        currentStoryIndex = 0; 
        if (currentFilteredStories.length > 0) displayStory(currentStoryIndex);
        else displayNoStoriesMessage();
    }

    applyFilterButton.addEventListener('click', () => {
        applyFiltersAndDisplay();
        setActiveView('cardView'); 
    });

    // --- EDITOR FUNKTIONEN ---
    function prepareEditorForNewStory() {
        editorStoryIdInput.value = ''; 
        editorTitleInput.value = '';
        editorDifficultySelect.value = 'Mittel'; 
        editorRiddleTextarea.value = '';
        editorSolutionTextarea.value = '';
        saveStoryButton.textContent = 'Neues Rätsel speichern';
        deleteStoryButton.style.display = 'none'; 
        editorTitleInput.focus(); 
    }
    
    function populateEditorForEdit(storyId) {
        const storyToEdit = allStories.find(s => s.id === storyId);
        if (!storyToEdit) {
            console.error("Zu bearbeitendes Rätsel nicht gefunden:", storyId);
            prepareEditorForNewStory(); return;
        }
        editorStoryIdInput.value = storyToEdit.id;
        editorTitleInput.value = storyToEdit.title;
        editorDifficultySelect.value = storyToEdit.difficulty;
        editorRiddleTextarea.value = storyToEdit.riddle;
        editorSolutionTextarea.value = storyToEdit.solution;
        saveStoryButton.textContent = 'Änderungen speichern';
        deleteStoryButton.style.display = 'inline-block'; 
        deleteStoryButton.dataset.storyIdToDelete = storyToEdit.id; 
        setActiveView('editorView');
        editorTitleInput.focus();
    }

    editStoryButtonCard.addEventListener('click', (event) => {
        event.stopPropagation(); 
        if (currentFilteredStories.length > 0 && currentStoryIndex < currentFilteredStories.length) {
            const storyIdToEdit = currentFilteredStories[currentStoryIndex].id;
            populateEditorForEdit(storyIdToEdit);
        }
    });

    clearEditorButton.addEventListener('click', () => prepareEditorForNewStory());

    saveStoryButton.addEventListener('click', () => {
        const title = editorTitleInput.value.trim();
        const difficulty = editorDifficultySelect.value;
        const riddle = editorRiddleTextarea.value.trim();
        const solution = editorSolutionTextarea.value.trim();
        const storyId = editorStoryIdInput.value; 

        if (!title || !riddle || !solution) {
            alert("Bitte fülle Titel, Rätsel und Lösung aus!"); return;
        }

        let savedStoryId = storyId; 
        let alertMessage = "";

        if (storyId) { 
            const existingStoryIndex = allStories.findIndex(s => s.id === storyId);
            if (existingStoryIndex > -1) {
                allStories[existingStoryIndex] = { ...allStories[existingStoryIndex], title, difficulty, riddle, solution };
                alertMessage = "Rätsel aktualisiert!";
            } else {
                alert("Fehler: Zu bearbeitendes Rätsel nicht gefunden."); return;
            }
        } else { 
            const newStory = { 
                id: generateUUID(), // Fallback-UUID verwenden
                title, 
                difficulty, 
                riddle, 
                solution 
            };
            allStories.push(newStory);
            savedStoryId = newStory.id; 
            alertMessage = "Neues Rätsel gespeichert!";
        }

        saveAllStoriesToStorage(); 
        applyFiltersAndDisplay();  
        
        const targetStoryIndex = currentFilteredStories.findIndex(s => s.id === savedStoryId);
        if (targetStoryIndex > -1) currentStoryIndex = targetStoryIndex;
        else if (currentFilteredStories.length > 0) currentStoryIndex = 0;
        
        if (currentFilteredStories.length > 0) displayStory(currentStoryIndex);
        else displayNoStoriesMessage();
        
        prepareEditorForNewStory(); 
        setActiveView('cardView');    
        alert(alertMessage);
    });

    deleteStoryButton.addEventListener('click', () => {
        const storyIdToDelete = deleteStoryButton.dataset.storyIdToDelete;
        if (!storyIdToDelete) return;

        if (confirm(`Möchtest du das Rätsel "${allStories.find(s=>s.id === storyIdToDelete)?.title || 'dieses Rätsel'}" wirklich löschen?`)) {
            allStories = allStories.filter(story => story.id !== storyIdToDelete);
            if (solvedStates.hasOwnProperty(storyIdToDelete)) {
                delete solvedStates[storyIdToDelete];
                saveSolvedStates();
            }
            saveAllStoriesToStorage();
            applyFiltersAndDisplay();
            prepareEditorForNewStory();
            setActiveView('cardView');
            alert("Rätsel gelöscht.");
        }
    });

    // --- KARTENFUNKTIONEN ---
    function flipCard(event) { 
        if (event && (event.target.id === 'solvedCheckbox' || event.target.id === 'editStoryButtonCard' || event.target.closest('.card-action-button'))) return; 
        storyCard.classList.toggle('is-flipped');
    }
    storyCard.addEventListener('click', flipCard);

    solvedCheckbox.addEventListener('change', () => {
        if (currentFilteredStories.length === 0 && allStories.length > 0) return;
        if (currentFilteredStories.length === 0 && allStories.length === 0) return;
        const storyIdToUpdate = currentFilteredStories[currentStoryIndex]?.id;
        if (!storyIdToUpdate) return;

        const isNowSolved = solvedCheckbox.checked;
        solvedStates[storyIdToUpdate] = isNowSolved;
        saveSolvedStates();
        updateSolvedIndicator(storyIdToUpdate); 

        const filterAffected = (isNowSolved && activeSolvedFilter === 'unsolved') || (!isNowSolved && activeSolvedFilter === 'solved');

        if (filterAffected) {
            applyFiltersAndDisplay();
            if (!cardView.classList.contains('active-view')) setActiveView('cardView');
        } else {
            if (isNowSolved) {
                setTimeout(() => {
                    if (currentStoryIndex < currentFilteredStories.length - 1) {
                        currentStoryIndex++;
                        displayStory(currentStoryIndex);
                    } else if (storyCard.classList.contains('is-flipped')) {
                        storyCard.classList.remove('is-flipped');
                    }
                }, 300); 
            }
        }
    });

    function updateSolvedIndicator(storyId) {
        if (!storyId && currentFilteredStories.length > 0 && currentStoryIndex < currentFilteredStories.length) {
            storyId = currentFilteredStories[currentStoryIndex].id;
        }
        if (storyId && solvedStates[storyId]) {
            solvedIndicatorFront.textContent = '✔'; 
            solvedIndicatorFront.style.display = 'inline';
        } else {
            solvedIndicatorFront.textContent = '';
            solvedIndicatorFront.style.display = 'none';
        }
        editStoryButtonCard.style.display = (currentFilteredStories.length > 0) ? 'inline-block' : 'none';
    }

    // --- RÄTSEL LADEN UND ANZEIGEN ---
    function loadAndDisplayInitialData() {
        loadAllStoriesFromStorage(); 
        loadSolvedStates();
        difficultyFilterSelect.value = activeDifficultyFilter; 
        solvedFilterSelect.value = activeSolvedFilter;     
        applyFiltersAndDisplay(); 
        if (currentFilteredStories.length > 0) {
            if (!allViews.some(v => v.classList.contains('active-view'))) setActiveView('cardView');
        } else if (allStories.length > 0) { 
            setActiveView('filterView'); 
        } else { 
            setActiveView('editorView'); 
        }
    }
    
    function displayNoStoriesMessage() {
        storyTitleElem.textContent = "Keine Rätsel gefunden";
        storyRiddleElem.textContent = "Es gibt keine Rätsel, die deinen aktuellen Filterkriterien entsprechen. Versuche, die Filter anzupassen, Rätsel im Editor hinzuzufügen oder welche zu importieren.";
        storyDifficultyElem.textContent = "";
        storySolutionElem.textContent = "";
        solutionTitleElem.textContent = "Lösung";
        solvedCheckbox.checked = false;
        solvedCheckbox.disabled = true;
        updateSolvedIndicator(null); 
        prevStoryButton.disabled = true;
        nextStoryButton.disabled = true;
        if (storyCard.classList.contains('is-flipped')) storyCard.classList.remove('is-flipped');
    }

    function displayStory(index) {
        if (index < 0 || index >= currentFilteredStories.length) {
            if(currentFilteredStories.length === 0) displayNoStoriesMessage(); 
            else console.error("Ungültiger Story-Index in displayStory:", index);
            return;
        }
        const story = currentFilteredStories[index];
        storyTitleElem.textContent = story.title;
        storyDifficultyElem.textContent = `Schwierigkeit: ${story.difficulty}`;
        storyRiddleElem.textContent = story.riddle;
        solutionTitleElem.textContent = `Lösung zu: ${story.title}`;
        storySolutionElem.textContent = story.solution;

        solvedCheckbox.disabled = false;
        solvedCheckbox.checked = solvedStates[story.id] || false; 
        updateSolvedIndicator(story.id); 

        if (storyCard.classList.contains('is-flipped')) storyCard.classList.remove('is-flipped');
        updateNavigationButtons();
    }

    // --- NAVIGATION (Vor/Zurück für Rätsel) ---
    function updateNavigationButtons() {
        if (currentFilteredStories.length === 0) {
            prevStoryButton.disabled = true;
            nextStoryButton.disabled = true;
        } else {
            prevStoryButton.disabled = currentStoryIndex === 0;
            nextStoryButton.disabled = currentStoryIndex === currentFilteredStories.length - 1;
        }
    }

    prevStoryButton.addEventListener('click', () => {
        if (currentStoryIndex > 0) currentStoryIndex--; displayStory(currentStoryIndex);
    });
    nextStoryButton.addEventListener('click', () => {
        if (currentStoryIndex < currentFilteredStories.length - 1) currentStoryIndex++; displayStory(currentStoryIndex);
    });
    

    // --- MANAGEMENT: IMPORT / EXPORT ---
    exportStoriesButton.addEventListener('click', () => {
        if (allStories.length === 0) {
            alert("Keine Rätsel zum Exportieren vorhanden.");
            return;
        }
        const jsonData = JSON.stringify(allStories, null, 2); 
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 10); 
        a.download = `black_stories_export_${timestamp}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`${allStories.length} Rätsel exportiert!`);
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedStoriesRaw = JSON.parse(e.target.result);
                if (!Array.isArray(importedStoriesRaw)) {
                    throw new Error("Importierte Datei ist kein gültiges Array.");
                }

                let importedCount = 0;
                let duplicateCount = 0;
                let invalidCount = 0;

                importedStoriesRaw.forEach(importedStory => {
                    if (typeof importedStory === 'object' && importedStory !== null &&
                        importedStory.hasOwnProperty('title') && typeof importedStory.title === 'string' &&
                        importedStory.hasOwnProperty('riddle') && typeof importedStory.riddle === 'string' &&
                        importedStory.hasOwnProperty('solution') && typeof importedStory.solution === 'string' &&
                        importedStory.hasOwnProperty('difficulty') && typeof importedStory.difficulty === 'string') {

                        const isDuplicate = allStories.some(existingStory => 
                            existingStory.title.trim().toLowerCase() === importedStory.title.trim().toLowerCase() &&
                            existingStory.riddle.trim().toLowerCase() === importedStory.riddle.trim().toLowerCase() &&
                            existingStory.solution.trim().toLowerCase() === importedStory.solution.trim().toLowerCase()
                        );

                        if (!isDuplicate) {
                            allStories.push({
                                id: generateUUID(), // Fallback-UUID verwenden
                                title: importedStory.title.trim(),
                                difficulty: importedStory.difficulty,
                                riddle: importedStory.riddle.trim(),
                                solution: importedStory.solution.trim()
                            });
                            importedCount++;
                        } else {
                            duplicateCount++;
                        }
                    } else {
                        invalidCount++;
                    }
                });

                if (importedCount > 0) saveAllStoriesToStorage();
                applyFiltersAndDisplay();
                setActiveView('cardView');
                
                let message = `${importedCount} Rätsel erfolgreich importiert.`;
                if (duplicateCount > 0) message += ` ${duplicateCount} Duplikate wurden übersprungen.`;
                if (invalidCount > 0) message += ` ${invalidCount} ungültige Einträge wurden ignoriert.`;
                importMessageElem.textContent = message;
                alert(message);

            } catch (error) {
                console.error("Fehler beim Importieren der Datei:", error);
                importMessageElem.textContent = `Fehler beim Import: ${error.message}`;
                alert(`Fehler beim Importieren der Datei: ${error.message}`);
            } finally {
                importFileInput.value = ''; 
            }
        };
        reader.readAsText(file);
    });

    // --- INITIALISIERUNG ---
    loadAndDisplayInitialData();
}); // Ende von DOMContentLoaded


// --- PWA SERVICE WORKER REGISTRIERUNG ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js') // <--- ACHTE AUF DIESEN PFAD!
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
} else { // Hinzugefügt für Debugging
    console.log('Service Worker not supported in this browser.');
}