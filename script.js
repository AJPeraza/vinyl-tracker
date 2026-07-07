let vinyls = JSON.parse(localStorage.getItem("vinyl-tracker-records")) || [];

const wishlist = document.getElementById("wishlist");
const form = document.getElementById("vinyl-form");
const ownedList = document.getElementById("owned-list");
const titleInput = document.getElementById("title-input");
const artistInput = document.getElementById("artist-input");
const statusInput = document.getElementById("status-input");
const coverInput = document.getElementById("cover-input");
const priorityInput = document.getElementById("priority-input");
const searchInput = document.getElementById("search-input");
const priorityFilter = document.getElementById("priority-filter");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const submitBtn = document.getElementById("submit-btn");
const totalCount = document.getElementById("total-count");
const wishlistCount = document.getElementById("wishlist-count");
const ownedCount = document.getElementById("owned-count");
const sortFilter = document.getElementById("sort-filter");
const toast = document.getElementById("toast");

let editingId = null;


form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (titleInput.value.trim() === "" || artistInput.value.trim() === "") {
        alert("Please enter both a title and artist.");
        return;
    }

    if (editingId !== null) {

        //UPDATE EXISTING VINYL
        vinyls = vinyls.map((vinyl) => {

            if (vinyl.id === editingId) {
                return {
                    ...vinyl,
                    title: titleInput.value,
                    artist: artistInput.value,
                    status: statusInput.value,
                    cover: coverInput.value,
                    priority: priorityInput.value
                };
            }

            return vinyl;
        });

        editingId = null;

        showToast("✏️ Vinyl Updated!");

    } else {
        //CREATE NEW VINYL
        const newVinyl = {
            id: crypto.randomUUID(),
            title: titleInput.value,
            artist: artistInput.value,
            status: statusInput.value,
            cover: coverInput.value,
            priority: priorityInput.value
        };

        vinyls.push(newVinyl);

        showToast("✅ Vinyl added!");

    }

    //CLEAR FORM
    resetForm();

    saveVinyls();
    renderVinyls();

    console.log(vinyls);
});

searchInput.addEventListener("input", () => {
    renderVinyls();
});

priorityFilter.addEventListener("change", () => {
    renderVinyls();
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

sortFilter.addEventListener("change", () => {
    renderVinyls();
})

function renderVinyls() {
    wishlist.innerHTML = "";
    ownedList.innerHTML = "";

    renderStats();

    //SEARCH VALUE
    const searchTerm = searchInput.value.toLowerCase();

    //PRIORITY VALUE
    const selectedPriority = priorityFilter.value;

    //FILTER ARRAY
    const filteredVinyls = vinyls.filter((vinyl) => {

        const matchesSearch =
            vinyl.title.toLowerCase().includes(searchTerm) ||
            vinyl.artist.toLowerCase().includes(searchTerm);

        const matchesPriority =
            selectedPriority === "all" ||
            vinyl.priority === selectedPriority;

        return matchesSearch && matchesPriority;
        
    });

    const selectedSort = sortFilter.value;

    filteredVinyls.sort((a, b) => {
        if (selectedSort === "title") {
            return a.title.localeCompare(b.title);
        }

        if (selectedSort === "artist") {
            return a.artist.localeCompare(b.artist);
        }

        if (selectedSort === "priority") {
            const priorityOrder = {
                high: 1,
                medium: 2,
                low: 3
            };

            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        return 0;
    });

    filteredVinyls.forEach((vinyl) => {
        //create list item
        const li = createVinylCard(vinyl);

        //conditional rendering
        if (vinyl.status === "wishlist") {
        wishlist.appendChild(li);
        } else {
        ownedList.appendChild(li);
        }
    });

    if (wishlist.children.length === 0) {
        wishlist.innerHTML = `
            <li class="empty-state">
                <h3>📀 Wishlist is empty</h3>
                <p>Add a record above to start your wishlist.</p>
            </li>
        `;
    }

    if (ownedList.children.length === 0) {
        ownedList.innerHTML = `
            <li class="empty-state">
                <h3>🎵 No owned records yet</h3>
                <p>Mark records as owned to build your collection.</p>
            </li>
        `;
    }

};

function resetForm() {
    titleInput.value = "";
    artistInput.value = "";
    coverInput.value = "";
    statusInput.value = "wishlist";
    priorityInput.value = "medium";
    editingId = null;
    submitBtn.textContent = "Add Vinyl";
}

function saveVinyls() {
    localStorage.setItem("vinyls", JSON.stringify(vinyls));
}

function renderStats() {
    totalCount.textContent = `Total Records: ${vinyls.length}`;

    wishlistCount.textContent = `Wishlist: ${
        vinyls.filter((vinyl) => vinyl.status === "wishlist").length
    }`;

    ownedCount.textContent = `Owned: ${
        vinyls.filter((vinyl) => vinyl.status === "owned").length
    }`;
}

function createBadgeRow(vinyl) {
    const badgeRow = document.createElement("div");
    badgeRow.classList.add("badge-row");

    const priority = document.createElement("span");
    priority.textContent = vinyl.priority;
    priority.classList.add("priority", vinyl.priority);

    const status = document.createElement("span");
    status.textContent = vinyl.status;
    status.classList.add("status", vinyl.status);

    badgeRow.appendChild(priority);
    badgeRow.appendChild(status);

    return badgeRow;
}

function createButtonGroup(vinyl) {
    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group"); 

    const toggleBtn = document.createElement("button");
    toggleBtn.classList.add("toggle-btn");

    if (vinyl.status === "wishlist") {
        toggleBtn.textContent = "Mark as Owned";
    } else {
        toggleBtn.textContent = "Move to Wishlist";
    }

    toggleBtn.addEventListener("click", () => {
        if (vinyl.status === "wishlist") {
            vinyl.status = "owned";
            showToast("📀 Marked as owned!");
        } else {
            vinyl.status = "wishlist";
            showToast("📝 Moved to wishlist!");
        }

        saveVinyls();
        renderVinyls();
    });

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.textContent = "Edit";

    editBtn.addEventListener("click", () => {
        console.log("Editing:", vinyl);

        editingId = vinyl.id;

        titleInput.value = vinyl.title;
        artistInput.value = vinyl.artist;
        coverInput.value = vinyl.cover || "";
        statusInput.value = vinyl.status;
        priorityInput.value = vinyl.priority || "medium";

        submitBtn.textContent = "Save Changes";

        form.scrollIntoView({ behavior: "smooth" });
    });
    
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";

    //delete logic
    deleteBtn.addEventListener("click", () => {
        const confirmed = confirm(`Delete "${vinyl.title}" by ${vinyl.artist}?`);

        if (!confirmed) {
            return;
        }

        vinyls = vinyls.filter((item) => item.id !== vinyl.id);
        showToast("🗑️ Vinyl deleted!");
        
        saveVinyls();
        renderVinyls();
    });

    buttonGroup.appendChild(toggleBtn);
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    return buttonGroup;
}

function createVinylInfo(vinyl) {
    const info = document.createElement("div");
    info.classList.add("vinyl-info");

    const title = document.createElement("h3");
    title.textContent = vinyl.title;

    const artist = document.createElement("p");
    artist.textContent = vinyl.artist;

    info.appendChild(title);
    info.appendChild(artist);

    return info;
}

function createAlbumCover(vinyl) {
    const cover = document.createElement("img");
        
    if (vinyl.cover) {
        cover.src = vinyl.cover;
    } else {
        cover.src = "https://placehold.co/400x400?text=No+Cover"; 
    }

    cover.alt = `${vinyl.title} album cover`;
    cover.classList.add("album-cover");

    return cover;
}

function createVinylCard(vinyl) {
    const li = document.createElement("li");

    const info = createVinylInfo(vinyl);
    const cover = createAlbumCover(vinyl);
    const badgeRow = createBadgeRow(vinyl);
    const buttonGroup = createButtonGroup(vinyl);

    li.appendChild(info);
    li.appendChild(cover);
    li.appendChild(badgeRow);
    li.appendChild(buttonGroup);

    return li;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

renderVinyls();



