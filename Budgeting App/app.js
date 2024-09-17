document.addEventListener('DOMContentLoaded', () => {
    const budgetForm = document.getElementById('budgetForm');
    const dateInput = document.getElementById('date');
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('newCategory');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const amountInput = document.getElementById('amount');
    const budgetTableBody = document.getElementById('budgetTable').querySelector('tbody');
    const sortBySelect = document.getElementById('sortBy');
    const removeSelectedButton = document.getElementById('removeSelected');
    const totalDisplay = document.getElementById('totalDisplay');
    const selectAllCheckbox = document.getElementById('selectAll');
    let categories = [];

    // Initial setup: hide new category input and button
    newCategoryInput.classList.add('d-none');
    addCategoryBtn.classList.add('d-none');

    // Add event listener to form submission
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateValue = dateInput.value;
        const categoryValue = categorySelect.value;
        const amountValue = amountInput.value;

        // Validate category
        if (categoryValue === 'add') {
            alert("Select or Add a new Category");
            return;
        }

        // Check if all fields are filled out
        if (dateValue && categoryValue && amountValue) {
            addRow(dateValue, categoryValue, amountValue);
            dateInput.value = '';
            categorySelect.value = '';
            amountInput.value = '';
            updateTotal(); // Update the total after adding a new row
        } else {
            alert('Please fill out all fields.');
        }
    });

    // Add event listener to category select change
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'add') {
            newCategoryInput.classList.remove('d-none');
            addCategoryBtn.classList.remove('d-none');
        } else {
            newCategoryInput.classList.add('d-none');
            addCategoryBtn.classList.add('d-none');
            newCategoryInput.value = ''; // Reset input field when not adding a new category
        }
    });

    // Add event listener to add new category button
    addCategoryBtn.addEventListener('click', () => {
        const newCategory = newCategoryInput.value.trim();
        if (newCategory) {
            // Add new category to the list
            if (!categories.includes(newCategory)) {
                categories.push(newCategory);
                updateCategorySelect();
                // Reset the input and hide the new category input field
                newCategoryInput.value = '';
                newCategoryInput.classList.add('d-none');
                addCategoryBtn.classList.add('d-none');
            } else {
                alert('This category already exists.');
            }
        } else {
            alert('Please enter a category name.');
        }
    });

    // Function to update category select options
    function updateCategorySelect() {
        categorySelect.innerHTML = `<option value="" disabled selected>Select Category</option>`;
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
        // Always add the "Add New Category" option
        const addOption = document.createElement('option');
        addOption.value = 'add';
        addOption.textContent = '+ Add New Category';
        categorySelect.appendChild(addOption);
    }

    // Function to add a row to the table
    function addRow(date, category, amount) {
        const amountFloat = parseFloat(amount).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="row-select"></td>
            <td>${date}</td>
            <td>${category}</td>
            <td>$${amountFloat}</td>
        `;
        budgetTableBody.appendChild(row);
    }

    // Function to update the total amount display based on selected rows
    function updateTotal() {
        let total = 0;
        const selectedCheckboxes = budgetTableBody.querySelectorAll('tr .row-select:checked');
        if (selectedCheckboxes.length > 0) {
            selectedCheckboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                const amountText = row.cells[3].textContent;
                const amount = parseFloat(amountText.replace('$', ''));
                total += amount;
            });
        } else {
            total = 0; // Set to zero or choose another way to handle no selection
        }
        totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Add event listener to remove selected rows
    removeSelectedButton.addEventListener('click', () => {
        const rows = budgetTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const checkbox = row.querySelector('.row-select');
            if (checkbox.checked) {
                row.remove();
            }
        });
        updateTotal(); // Update the total after removing rows
    });

    // Add event listener to "Select All" checkbox
    selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const checkboxes = budgetTableBody.querySelectorAll('.row-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateTotal(); // Update total when "Select All" is toggled
    });

    // Add event listener to individual row checkboxes
    budgetTableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('row-select')) {
            updateTotal(); // Update total when an individual checkbox is toggled
        }
    });

    // Add event listener to sort by select
    sortBySelect.addEventListener('change', () => {
        const sortBy = sortBySelect.value;
        const rows = Array.from(budgetTableBody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const aValue = a.cells[sortBy === 'date' ? 1 : sortBy === 'category' ? 2 : 3].textContent;
            const bValue = b.cells[sortBy === 'date' ? 1 : sortBy === 'category' ? 2 : 3].textContent;

            if (sortBy === 'amount') {
                return parseFloat(aValue.replace('$', '')) - parseFloat(bValue.replace('$', ''));
            } else {
                return aValue.localeCompare(bValue);
            }
        });

        // Clear table and re-add rows in sorted order
        budgetTableBody.innerHTML = '';
        rows.forEach(row => {
            budgetTableBody.appendChild(row);
        });
        updateTotal(); // Ensure total is updated after sorting
    });

    // Add event listener to download CSV button
    document.getElementById('downloadCsv').addEventListener('click', () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Category,Amount\n";

        const rows = budgetTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const date = row.cells[1].textContent;
            const category = row.cells[2].textContent;
            const amount = row.cells[3].textContent;
            csvContent += `${date},${category},${amount.replace('$', '')}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'budget.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initialize the category select menu
    updateCategorySelect(); // Ensure categories are added to the select menu on page load
});