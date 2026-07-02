let vinyls = JSON.parse(localStorage.getItem("vinyls")) || [
    {
        id: crypto.randomUUID(),
        title: "Rumours",
        artist: "Fleetwood Mac",
        status: "wishlist"
    },
    {
        id: crypto.randomUUID(),
        title: "The Wall",
        artist: "Pink Floyd",
        status: "wishlist"
    },
    {
        id: crypto.randomUUID(),
        title: "Man on the Moon",
        artist: "Kid Cudi",
        status: "wishlist"
    }
   
    ];

const wishlist = document.getElementById("wishlist");
const form = document.getElementById("vinyl-form");
const titleInput = document.getElementById("title-input");
const artistInput = document.getElementById("artist-input");
const ownedList = document.getElementById("owned-list");
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

let editingId = null;


form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (titleInput.value.trim() === "" || artistInput.value.trim() === "") {
        alert("Please enter both a title and artist.");
        return;
    }

    if (editingId) {

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

    filteredVinyls.forEach((vinyl) => {

        //create list item
        const li = document.createElement("li");

        //li.textContent = `${vinyl.title} - ${vinyl.artist}`;
        const title = document.createElement("h3");
        title.textContent = vinyl.title;

        const artist = document.createElement("p");
        artist.textContent = vinyl.artist;

        li.appendChild(title);
        li.appendChild(artist);


        //render album cover
        const cover = document.createElement("img");
        cover.src = vinyl.cover;
        cover.alt = `${vinyl.title} album cover`;
        cover.classList.add("album-cover");

        li.appendChild(cover);

        //render priority
        const priority = document.createElement("span");
        priority.textContent = vinyl.priority;
        priority.classList.add("priority", vinyl.priority);

        li.appendChild(priority);

        const editBtn = document.createElement("button");
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

        const toggleBtn = document.createElement("button");

        if (vinyl.status === "wishlist") {
            toggleBtn.textContent = "Mark as Owned";
        } else {
            toggleBtn.textContent = "Move to Wishlist";
        }

        toggleBtn.addEventListener("click", () => {
            if (vinyl.status === "wishlist") {
                vinyl.status = "owned";
            } else {
                vinyl.status = "wishlist";
            }

            saveVinyls();
            renderVinyls();
        });

        //create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        //delete logic
        deleteBtn.addEventListener("click", () => {
            vinyls = vinyls.filter((item) => item.id !== vinyl.id);
            
            saveVinyls();
            renderVinyls();
        });

       //put button INSIDe the li
       const buttonGroup = document.createElement("div");
       buttonGroup.classList.add("button-group");

       buttonGroup.appendChild(toggleBtn);
       buttonGroup.appendChild(editBtn);
       buttonGroup.appendChild(deleteBtn);
       

       li.appendChild(buttonGroup);

       //conditional rendering
       if (vinyl.status === "wishlist") {
        wishlist.appendChild(li);
       } else {
       ownedList.appendChild(li);
       }
    });

    if (wishlist.children.length === 0) {
        wishlist.innerHTML = "<li>No wishlist records found.</li>";
    }

    if (ownedList.children.length === 0) {
        ownedList.innerHTML = "<li>No owned records found.</li>";
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


renderVinyls();



