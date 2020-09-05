// Load Modules
// ================================================================
const express = require("express");
const fs = require("fs");
const path = require("path");



// Server Setup
// ================================================================

// Create consts
const app = express();
const PORT = process.env.PORT || 3090;

// Configure settings for the server
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


// Methods
// ================================================================

/** Sync reads the db.json and returns the contents */
function readDB(){
    console.log(fs.readFileSync(path.join(__dirname, "/db/db.json"), "utf-8", () => {}));
    return JSON.parse(fs.readFileSync(path.join(__dirname, "/db/db.json"), "utf-8", () => {}));
}


// API Handlers
// ================================================================

/** Retrieves the notes from db.json */
function getNotes(arg_request, arg_response){
    return arg_response.send(readDB());
}

/** Saves a note to the db.json */
function postNote(arg_request, arg_response){
    console.log("Called post method");
    // Grab DB info
    let notes = readDB();
    console.log("Read database");
    // If the request body has the appropriate fields
    if( arg_request.body["id"] && arg_request.body["title"] && arg_request.body["text"] ){
        console.log("Request had correct arguments");
        // Grab the information from the request body
        let t_add = {
            "id": arg_request.body.id,
            "title": arg_request.body.title,
            "text": arg_request.body.text
        };
        
        // Add a note to the array
        notes.push(t_add);
        console.log("Pushed data");
        // Write to DB.json
        fs.writeFileSync(path.join(__dirname, "/db/db.json"), JSON.stringify(notes));

        // Send ocnfirmation
        arg_response.send("Note was added: " + JSON.stringify(t_add));
        return;
    }
    // Else console log error message
    else{
        console.log("ERROR: Response body to POST /api/notes doesn't have the required data" + JSON.stringify(arg_request.body));
        return;
    }
}

/** Deletes a note using a passed id */
function deleteNote(arg_request, arg_response){
    // Grab DB info
    let notes = readDB();

    // If the request body has the appropriate fields
    if( arg_request.params["id"]){
        const t_index = notes.findIndex( (arg_element) => { return arg_element.id == arg_request.params.id; });
        notes.splice(t_index,1);
        fs.writeFileSync(path.join(__dirname, "/db/db.json"), JSON.stringify(notes));
    }
    // Else console log error
    else{
        console.log("ERROR: Response body to DELETE did not include an ID: " + JSON.stringify(arg_request.body));
        return;
    }

    return arg_response.send("Note with id " + arg_request.params["id"] + "was deleted");
}


// Define Routes
// ================================================================

// API Routes
app.get("/api/notes", getNotes);
app.post("/api/notes", postNote);
app.delete("/api/notes/:id", deleteNote);

// Index Page
app.get("/", (arg_request, arg_response) => {
    arg_response.sendFile(path.join(__dirname, "public/index.html"));
});

// Note Added Page
app.get("*", (arg_request, arg_response) => {
    arg_response.sendFile(path.join(__dirname, "public/notes.html"));
});



// Listen on the port
app.listen(PORT, () => { console.log("NoteTaker listening on port " + PORT); });