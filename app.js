// Access createClient from the Supabase CDN
const createClient = window.supabase.createClient;

// Initialize Supabase client
const SUPABASE_URL = 'OMG_SO_SO_SECRET'; // Replace with your Supabase URL
const SUPABASE_KEY = 'eyyyyyyy_itsASecret'; // Replace with your Supabase API key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sign up a new user
async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error("Sign-up error:", error.message);
    } else if (data.user) {
        console.log("User signed up:", data.user);
    } else {
        console.log("Sign-up successful, but no user data returned.");
    }
}
// Log in an existing user
async function logIn(email, password) {
    const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error("Login error:", error);
    } else {
        console.log("User logged in:", session.user); // Access the user from the session object
        // Change UI to logged in state
        document.getElementById('task-submitter').style.display = 'block';
        document.getElementById('task-viewer').style.display = 'block';
        document.getElementById('login-box').style.display = 'none';
        populateTasksDropdown();
    }
}
// Log out the current user
async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    else {
        console.log("User logged out");
        location.reload();
    };
}

// Check for an existing session on page load
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error fetching session:", error);
    } else if (session) {
        console.log("User is already logged in:", session.user);
        // Change UI to logged in state
        document.getElementById('task-submitter').style.display = 'block';
        document.getElementById('task-viewer').style.display = 'block';
        document.getElementById('login-box').style.display = 'none';
    } else {
        console.log("No active session found.");
        // Change UI to logged out state
        document.getElementById('task-submitter').style.display = 'none';
        document.getElementById('task-viewer').style.display = 'none';
        document.getElementById('login-box').style.display = 'block';
    }
}

// Listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("User signed in:", session.user);
    } else if (event === "SIGNED_OUT") {
        console.log("User signed out.");
    }
});

// Call checkSession on page load
checkSession();




// Function to create a task
async function createTask(name, details, dueDate) {
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user; // Access the user from the data object

    if (userError || !user) {
        console.error("User not logged in:", userError);
        return;
    }

    const { data: taskData, error } = await supabase
        .from('tasks')
        .insert([{ name, details, due_date: dueDate, user_id: user.id }]); // Use user.id for user_id

    if (error) {
        console.error('Error creating task:', error);
    } else {
        console.log('Task created:', taskData);
    }
}


// Function to read tasks
async function getTasks() {
    const { data, error: userError } = await supabase.auth.getUser();
    console.log("User data:", data);
    const user = data?.user; // Access the user from the data object

    if (userError || !user) {
        console.error("Error fetching user or user not logged in:", userError);
        return [];
    }

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id); // Filter tasks by the logged-in user's ID

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    } else {
        console.log('Tasks fetched:', tasks);
        return tasks;
    }
}

// Function to update a task
async function updateTask(id, updates) {
    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating task:', error);
    } else {
        console.log('Task updated:', data);
    }
}

// Function to delete a task
async function deleteTask(id) {
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting task:', error);
    } else {
        console.log('Task deleted:', data);
    }
}
// Function to populate the dropdown with tasks
async function populateTasksDropdown() {
    const tasks = await getTasks();
    const dropdown = document.getElementById('taskDropdown');
    dropdown.innerHTML = '<option value="">Select a task</option>';
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.name;
        dropdown.appendChild(option);
    });
}

async function displayTaskDetails() {
    const dropdown = document.getElementById('taskDropdown');
    const taskId = dropdown.value;
    if (!taskId) return;

    const tasks = await getTasks();
    const task = tasks.find(t => t.id == taskId);
    const detailsDiv = document.getElementById('taskDetails');
    detailsDiv.innerHTML = `
        <h3>${task.name}</h3>
        <p>${task.details}</p>
        <p>Due Date: ${task.due_date}</p>
        <button onclick="deleteTask(${task.id})">Delete</button>
        <button onclick="updateTask(${task.id}, { name: 'Updated Task Name' })">Update</button>
    `;
}



// Attach event listener to dropdown
const dropdown = document.getElementById('taskDropdown');
dropdown.addEventListener('change', displayTaskDetails);


document.getElementById('taskForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const details = document.getElementById('details').value;
    const dueDate = document.getElementById('dueDate').value;
    await createTask(name, details, dueDate);

    location.reload();
});



// Attach functions to the window object to make them globally accessible
window.createTask = createTask;
window.getTasks = getTasks;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.populateTasksDropdown = populateTasksDropdown;
window.displayTaskDetails = displayTaskDetails;
window.signUp = signUp;
window.logIn = logIn;
window.logOut = logOut;
