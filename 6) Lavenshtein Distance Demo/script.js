
/**********  LEVENSHTEIN ALGORITHM IMPLEMENTATION *******************/

// Function to calculate minimum edit distance between two strings (Tabulation)
var minDistance = function (str1, str2) {
    // dpStorage[row][col] will store the edit distance for substrings
    dpStorage = new Array(str1.length + 1);
    for (let row = 0; row < dpStorage.length; row++) {
        dpStorage[row] = new Array(str2.length).fill(0);
    }

    // Fill last row and last column (base cases)
    for (let col = 0; col <= str2.length; col++)
        dpStorage[str1.length][col] = str2.length - col; // insert remaining chars
    for (let row = 0; row <= str1.length; row++)
        dpStorage[row][str2.length] = str1.length - row; // delete remaining chars

    // Fill the dpStorage table from bottom-right to top-left
    for (let row = str1.length - 1; row >= 0; row--) {
        for (let col = str2.length - 1; col >= 0; col--) {
            let minCost = Infinity;
            if (str1[row] == str2[col]) {
                // chars match, move diagonally
                minCost = dpStorage[row + 1][col + 1];
            }
            else {
                // try delete, insert, replace
                let deletionCost = 1 + dpStorage[row + 1][col];
                let insertionCost = 1 + dpStorage[row][col + 1];
                let replacementCost = 1 + dpStorage[row + 1][col + 1];
                minCost = Math.min(deletionCost, Math.min(insertionCost, replacementCost));
            }
            dpStorage[row][col] = minCost;
        }
    }

    return [dpStorage[0][0], dpStorage];
}

// Space optimized version (uses only two 1D arrays)
var minDistance2 = function (str1, str2) {
    // nextRow stores the results for the next row (row+1)
    nextRow = Array(str2.length + 1).fill(0);
    // Fill base case for last row
    for (let col = 0; col <= str2.length; col++)
        nextRow[col] = str2.length - col;

    currRow = Array(str2.length + 1).fill(0);
    let temp = 0;

    // Fill from bottom to top (reverse order)
    for (let row = str1.length - 1; row >= 0; row--) {
        temp = str1.length - row; // base case for last column
        currRow[str2.length] = temp;
        for (let col = str2.length - 1; col >= 0; col--) {
            let minCost = Infinity;
            if (str1[row] == str2[col]) {
                // chars match, take diagonal value
                minCost = nextRow[col + 1];
            }
            else {
                // try delete, insert, replace
                let deletionCost = 1 + nextRow[col];
                let insertionCost = 1 + temp;
                let replacementCost = 1 + nextRow[col + 1];
                minCost = Math.min(deletionCost, Math.min(insertionCost, replacementCost));
            }
            temp = minCost;
            currRow[col] = minCost;
        }
        nextRow = currRow.slice(); // move to next row
    }

    return nextRow[0]; //return the answer
};


/********** ANIMATION LOGIC *******************/

async function sleep(millisecond) {
    return new Promise(resolve => setTimeout(resolve, millisecond));
}

// Animate filling the remaining DP Matrix (DP Table)
async function fill_dp_table(actual_dp_table, visual_dp_node) {
    await sleep(2000)

    for (let row = actual_dp_table.length - 2; row >= 0; row--) {
        for (let col = actual_dp_table[0].length - 2; col >= 0; col--) {

            // Highlight the cells being used to calculate current DP state
            let highlightCells = [
                visual_dp_node.querySelector(`[data-grid-row="${row + 1}"][data-grid-col="${col + 1}"]`),
                visual_dp_node.querySelector(`[data-grid-row="${row + 1}"][data-grid-col="${col}"]`),
                visual_dp_node.querySelector(`[data-grid-row="${row}"][data-grid-col="${col + 1}"]`)
            ];

            // Store original cell colors to reinstate later
            let originalBackgroundColors = highlightCells.map(cell => cell ? cell.style.backgroundColor : "");
            highlightCells.forEach(cell => {
                cell.style.backgroundColor = "#ff8258";
            });
            let gridBox = visual_dp_node.querySelector(`[data-grid-row="${row}"][data-grid-col="${col}"]`);
            gridBox.textContent = actual_dp_table[row][col];

            await sleep(1000); // Simulate slowly filling the DP table

            // Restore original cell colors
            highlightCells.forEach(cell => {
                cell.style.backgroundColor = originalBackgroundColors.shift() || "";
            });
        }
    }

    //Highlight final answer at dp[0][0]
    let ansBox = visual_dp_node.querySelector(`[data-grid-row="${0}"][data-grid-col="${0}"]`);
    ansBox.style.backgroundColor = "red";
}

async function animate(str1, str2, dp) {

    // Reset page before starting animation
    let main_element = document.getElementsByClassName("main")[0]
    main_element.innerHTML = `
    
        <div class="input-area ">
            <input type="text" class="input-strings" placeholder="car"></input>
            <input type="text" class="input-strings" placeholder="bat"></input>
        </div>
        <div class="compute-button-container">
            <span class="compute-button">Compute Levenshtein Distance</span>
            <div class="dp-animation-container">
                <div class="row1"></div>
                <div class="row2">
                    <div class="str2-container"></div>
                    <div class="dp-grid"></div>
                    <div class="right-border"></div>
                </div>
                <div class="bottom-border"></div>
            </div>
            <h1 id="output">Levenshtein Distance: </h1>
        </div>

    `

    // Re-attach the event listener to the new button
    document.getElementsByClassName("compute-button")[0].addEventListener("click", async () => {
        let str1_text = document.getElementsByClassName("input-strings")[0].value.trim();
        let str2_text = document.getElementsByClassName("input-strings")[1].value.trim();
        let [lavenshtein_dist, dpStorage] = minDistance(str1_text, str2_text);
        await animate(str1_text, str2_text, dpStorage);
        document.getElementById("output").innerText = `Levenshtein Distance: ${lavenshtein_dist}`;
    });

    // Basic configurations needed for rendering Edit Distance Visualization
    let display_unit = 50;
    str1_len = str1.length;
    str2_len = str2.length;

    // Get referencces to all DOM nodes required
    let dp_animation_container = document.getElementsByClassName("dp-animation-container")[0];
    let row1 = document.getElementsByClassName("row1")[0];
    let row2 = document.getElementsByClassName("row2")[0];
    let str2_container = document.getElementsByClassName("str2-container")[0];
    let dp_grid = document.getElementsByClassName("dp-grid")[0];
    let right_border = document.getElementsByClassName("right-border")[0];
    let bottom_border = document.getElementsByClassName("bottom-border")[0];

    // Set height and width according to string lengths
    dp_animation_container.style.height = `${(str1_len + 3) * display_unit}px`;
    dp_animation_container.style.width = `${(str2_len + 3) * display_unit}px`;

    row1.style.height = `${1 * display_unit}px`;
    row1.style.width = `${(str2_len + 2) * display_unit}px`;

    row2.style.height = `${(str1_len + 1) * display_unit}px`;
    row2.style.width = `${(str2_len + 2) * display_unit}px`;

    str2_container.style.width = `${1 * display_unit}px`;
    str2_container.style.height = `${(str2_len + 2) * display_unit}px`;

    dp_grid.style.gridTemplateRows = `repeat(${str1_len + 1}, ${display_unit}px)`;
    dp_grid.style.gridTemplateColumns = `repeat(${str2_len + 1}, ${display_unit}px)`;

    // Animate borders growing
    right_border.style.height = "0px"; //initial height
    void right_border.offsetHeight; //forced reflow
    right_border.style.height = `${(str1_len + 3) * display_unit}px`; //final height

    bottom_border.style.width = "0px";
    void bottom_border.offsetHeight; //forced reflow
    bottom_border.style.width = `${(str2_len + 3) * display_unit}px`;

    // Animate the DP Matrix Structure, Initial (Base Case Data) and the Strings being compared 
    let highlight_flag = 1; // Used to make a chess board style grid 
    for (let row = 0; row < dp.length; row++) {
        let temp_highlight_flag = highlight_flag;
        for (let col = 0; col < dp[0].length; col++) {
            let grid_box = document.createElement("div");
            grid_box.className = "grid-box";
            grid_box.setAttribute("data-grid-row", row);
            grid_box.setAttribute("data-grid-col", col);
            grid_box.style.height = `${display_unit}px`;
            grid_box.style.width = `${display_unit}px`;
            grid_box.style.display = "flex";
            grid_box.style.alignItems = "center";
            grid_box.style.justifyContent = "center";

            if (temp_highlight_flag) {
                grid_box.style.backgroundColor = "#3c3c3c";
            }
            temp_highlight_flag = !temp_highlight_flag;

            grid_box.style.transition = "background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            if (row == dp.length - 1 || col == dp[0].length - 1) grid_box.textContent = dp[row][col]; // Set base case values inside the div
            dp_grid.appendChild(grid_box);
        };
        highlight_flag = !highlight_flag;
    };

    for (const char of str1) {
        let str2_container_box = document.createElement("div");
        str2_container_box.className = "str2-container-box";
        str2_container_box.style.height = `${display_unit}px`;
        str2_container_box.style.width = `${display_unit}px`;
        str2_container_box.style.display = "flex";
        str2_container_box.style.alignItems = "center";
        str2_container_box.style.justifyContent = "center";
        str2_container_box.innerText = char;
        str2_container.appendChild(str2_container_box);
    };

    for (const char of str2) {
        let str2_container_box = document.createElement("div");
        str2_container_box.style.height = `${display_unit}px`;
        str2_container_box.style.width = `${display_unit}px`;
        str2_container_box.style.display = "flex";
        str2_container_box.style.alignItems = "center";
        str2_container_box.style.justifyContent = "center";
        str2_container_box.innerText = char;
        row1.appendChild(str2_container_box);
    };

    row1.style.opacity = "100%"
    row2.style.opacity = "100%"

    fill_dp_table(dp, dp_grid)
}


// Initial event listener for 1st render
document.getElementsByClassName("compute-button")[0].addEventListener("click", async () => {
    let str1_text = document.getElementsByClassName("input-strings")[0].value.trim();
    let str2_text = document.getElementsByClassName("input-strings")[1].value.trim();
    let str1 = str1_text;
    let str2 = str2_text;
    let [lavenshtein_dist, dpStorage] = minDistance(str1, str2);
    await animate(str1_text, str2_text, dpStorage);
    document.getElementById("output").innerText = `Levenshtein Distance: ${lavenshtein_dist}`
});

let dp = minDistance("car", "bat")[1];
// animate("car", "bat", dp);